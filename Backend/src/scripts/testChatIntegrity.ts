import mongoose from 'mongoose';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAICacheManager } from '@google/generative-ai/server';
import { env } from '../config/env';
import { SYSTEM_PROMPT } from '../chat/data/systemPrompt';

async function runDeepDiagnostic() {
  console.log('--- ANAAJ AI DEEP DIAGNOSTIC ---');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Model:', env.GEMINI_MODEL);

  // 1. Database Check
  try {
    const start = Date.now();
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ MongoDB: Connected in', Date.now() - start, 'ms');
    await mongoose.disconnect();
  } catch (e) {
    console.error('❌ MongoDB: Connection failed', (e as Error).message);
  }

  // 2. Knowledge Base File Check
  try {
    const kbPath = path.join(__dirname, '..', 'chat', 'data', 'knowledgeBase.json');
    const stats = await fs.stat(kbPath);
    console.log('✅ Knowledge Base: File exists (', Math.round(stats.size/1024), 'KB )');
    const content = await fs.readFile(kbPath, 'utf8');
    JSON.parse(content);
    console.log('✅ Knowledge Base: JSON is valid');
  } catch (e) {
    console.error('❌ Knowledge Base: Failed to read/parse', (e as Error).message);
  }

  // 3. Gemini Connectivity Check
  try {
    const start = Date.now();
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
    const result = await model.generateContent('Ping. Reply with Pong.');
    console.log('✅ Gemini API: Responds (', result.response.text().trim(), ') in', Date.now() - start, 'ms');
  } catch (e) {
    console.error('❌ Gemini API: Request failed', (e as Error).message);
  }

  // 4. Gemini Caching Latency Check
  try {
    console.log('--- Testing Caching Manager ---');
    const start = Date.now();
    const cacheManager = new GoogleAICacheManager(env.GEMINI_API_KEY);
    
    // We try to list caches to see if manager is reachable
    const list = await cacheManager.list();
    console.log('✅ Caching Manager: Reachable. Active caches count:', (Array.isArray(list.cachedContents) ? list.cachedContents.length : 0));
    console.log('Latency:', Date.now() - start, 'ms');
  } catch (e: any) {
    console.log('⚠️ Caching Manager: Request resulted in error (Expected if quota hit or not supported)');
    console.log('Status:', e.status, '| Message:', e.message);
  }

  console.log('\n--- DIAGNOSTIC COMPLETE ---');
}

runDeepDiagnostic().catch(console.error);
