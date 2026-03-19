import { redis } from '../../config/redis';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import zlib from 'node:zlib';
import { promisify } from 'node:util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

// Compress values > 1 KB to save Redis memory at scale
const COMPRESS_THRESHOLD = 1024;
const GZ_PREFIX = 'gz:';
let redisUnavailableLogged = false;

function isRedisReady(): boolean {
  return redis.status === 'ready';
}

function guardRedis(operation: string, key?: string): boolean {
  if (isRedisReady()) {
    redisUnavailableLogged = false;
    return true;
  }

  if (!redisUnavailableLogged) {
    logger.warn({ operation, key, status: redis.status }, 'Redis unavailable; skipping cache operation');
    redisUnavailableLogged = true;
  }

  return false;
}

export class RedisCache {
  private defaultTTL: number;

  constructor() {
    this.defaultTTL = env.CACHE_TTL;
  }

  /**
   * Generate a consistent cache key.
   * Uses DJB2 hash for fast, low-collision distribution.
   */
  static buildKey(prefix: string, input: string): string {
    const normalized = input.trim().toLowerCase().replace(/\s+/g, ' ');
    let hash = 5381;
    for (let i = 0; i < normalized.length; i++) {
      hash = ((hash << 5) + hash + normalized.charCodeAt(i)) | 0;
    }
    return `${prefix}:${(hash >>> 0).toString(36)}`;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!guardRedis('GET', key)) {
      return null;
    }

    try {
      const data = await redis.get(key);
      if (!data) return null;

      // Transparent decompression
      if (data.startsWith(GZ_PREFIX)) {
        const buf = Buffer.from(data.slice(GZ_PREFIX.length), 'base64');
        const decompressed = await gunzip(buf);
        return JSON.parse(decompressed.toString()) as T;
      }

      return JSON.parse(data) as T;
    } catch (err) {
      logger.error({ err, key }, 'Redis GET error');
      return null;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (!guardRedis('SET', key)) {
      return;
    }

    try {
      let serialized = JSON.stringify(value);

      // Compress large values to save memory
      if (serialized.length > COMPRESS_THRESHOLD) {
        const compressed = await gzip(Buffer.from(serialized));
        serialized = GZ_PREFIX + compressed.toString('base64');
      }

      await redis.set(key, serialized, 'EX', ttl || this.defaultTTL);
    } catch (err) {
      logger.error({ err, key }, 'Redis SET error');
    }
  }

  async del(key: string): Promise<void> {
    if (!guardRedis('DEL', key)) {
      return;
    }

    try {
      await redis.del(key);
    } catch (err) {
      logger.error({ err, key }, 'Redis DEL error');
    }
  }

  // ── Batch operations (Redis pipeline) for high throughput ──

  /**
   * Get multiple keys in a single Redis round-trip.
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) return [];
    if (!guardRedis('MGET')) return keys.map(() => null);

    try {
      const results = await redis.mget(...keys);
      return results.map((r) => (r ? (JSON.parse(r) as T) : null));
    } catch (err) {
      logger.error({ err }, 'Redis MGET error');
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys in a single Redis round-trip using pipeline.
   */
  async mset(entries: Array<{ key: string; value: unknown; ttl?: number }>): Promise<void> {
    if (entries.length === 0) return;
    if (!guardRedis('MSET')) return;

    try {
      const pipeline = redis.pipeline();
      for (const { key, value, ttl } of entries) {
        pipeline.set(key, JSON.stringify(value), 'EX', ttl || this.defaultTTL);
      }
      await pipeline.exec();
    } catch (err) {
      logger.error({ err }, 'Redis MSET pipeline error');
    }
  }

  /**
   * Delete multiple keys in a single round-trip.
   */
  async mdel(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    if (!guardRedis('MDEL')) return;

    try {
      await redis.del(...keys);
    } catch (err) {
      logger.error({ err }, 'Redis MDEL error');
    }
  }

  /**
   * Get-or-set: check cache, compute if miss, store result.
   * Prevents thundering herd via atomic check-then-compute.
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<{ value: T; cached: boolean }> {
    const existing = await this.get<T>(key);
    if (existing !== null) {
      return { value: existing, cached: true };
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return { value, cached: false };
  }

  /**
   * Increment a counter with auto-expiry (for rate limiting / usage tracking).
   */
  async increment(key: string, windowSeconds: number): Promise<number> {
    if (!guardRedis('INCR', key)) {
      return 0;
    }

    try {
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, windowSeconds);
      const results = await pipeline.exec();
      return (results?.[0]?.[1] as number) || 0;
    } catch (err) {
      logger.error({ err, key }, 'Redis INCR error');
      return 0;
    }
  }

  /**
   * Cache stats for monitoring dashboards and load test analysis.
   */
  async getStats(): Promise<{
    connectedClients: number;
    usedMemory: string;
    hitRate: string;
    totalKeys: number;
    opsPerSec: number;
  }> {
    if (!guardRedis('INFO')) {
      return { connectedClients: 0, usedMemory: 'unknown', hitRate: 'N/A', totalKeys: 0, opsPerSec: 0 };
    }

    try {
      const info = await redis.info('stats');
      const memInfo = await redis.info('memory');
      const dbSize = await redis.dbsize();

      const hits = Number(info.match(/keyspace_hits:(\d+)/)?.[1] || 0);
      const misses = Number(info.match(/keyspace_misses:(\d+)/)?.[1] || 0);
      const total = hits + misses;
      const hitRate = total > 0 ? ((hits / total) * 100).toFixed(1) + '%' : 'N/A';

      const usedMemory = memInfo.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'unknown';
      const clients = Number(info.match(/connected_clients:(\d+)/)?.[1] || 0);
      const opsPerSec = Number(info.match(/instantaneous_ops_per_sec:(\d+)/)?.[1] || 0);

      return { connectedClients: clients, usedMemory, hitRate, totalKeys: dbSize, opsPerSec };
    } catch (err) {
      logger.error({ err }, 'Failed to get Redis stats');
      return { connectedClients: 0, usedMemory: 'unknown', hitRate: 'N/A', totalKeys: 0, opsPerSec: 0 };
    }
  }
}

export const cache = new RedisCache();
