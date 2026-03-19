import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, IUser } from '../models/User';
import { logger } from '../utils/logger';

export interface JwtPayload {
  userId: string;
  role: 'user' | 'admin';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: IUser;
    jwtPayload?: JwtPayload;
  }
}

function getRoute(request: FastifyRequest): string {
  return request.routeOptions.url || request.url;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;
  const route = getRoute(request);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(
      { reqId: request.id, route, ip: request.ip },
      'Authentication failed: missing or malformed bearer token'
    );
    return reply.status(401).send({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof (decoded as { userId?: unknown }).userId !== 'string' ||
      (((decoded as { role?: unknown }).role !== 'user') &&
        ((decoded as { role?: unknown }).role !== 'admin'))
    ) {
      logger.warn(
        { reqId: request.id, route, ip: request.ip },
        'Authentication failed: invalid JWT payload shape'
      );
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    const jwtPayload = decoded as JwtPayload;
    request.jwtPayload = jwtPayload;

    const user = await User.findById(jwtPayload.userId);
    if (!user) {
      logger.warn(
        { reqId: request.id, route, ip: request.ip, userId: jwtPayload.userId },
        'Authentication failed: user from token not found'
      );
      return reply.status(401).send({ error: 'User not found' });
    }

    if (user.role !== jwtPayload.role) {
      logger.warn(
        {
          reqId: request.id,
          route,
          ip: request.ip,
          userId: jwtPayload.userId,
          tokenRole: jwtPayload.role,
          dbRole: user.role,
        },
        'Authentication failed: role mismatch between token and database'
      );
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }

    request.user = user;
  } catch (err) {
    logger.warn(
      { reqId: request.id, route, ip: request.ip, err },
      'Authentication failed: token verification error'
    );
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

export async function adminMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const route = getRoute(request);

  if (!request.user || !request.jwtPayload) {
    await authMiddleware(request, reply);
    if (reply.sent) return;
  }

  if (!request.user || !request.jwtPayload) {
    logger.error(
      { reqId: request.id, route, ip: request.ip },
      'Admin guard failed: auth middleware did not attach user context'
    );
    return reply.status(401).send({ error: 'Authentication required' });
  }

  if (request.user.role !== 'admin') {
    logger.warn(
      { reqId: request.id, route, ip: request.ip, userId: String(request.user._id), role: request.user.role },
      'Forbidden admin route access attempt'
    );
    return reply.status(403).send({ error: 'Admin access required' });
  }

  logger.info(
    { reqId: request.id, route, ip: request.ip, userId: String(request.user._id) },
    'Admin access granted'
  );
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload as object, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}
