import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { env } from '../config/env';
import { SYSTEM_PROMPT } from '../chat/data/systemPrompt';

async function testDirect() {
  console.log('--- Loading knowledgeBase.json ---');
  const kbPath = path.join(__dirname, '..', 'chat', 'data', 'knowledgeBase.json');
  const kbContent = await fs.readFile(kbPath, 'utf8');
  
  const systemInstruction = `${SYSTEM_PROMPT}\n\nHere is the agricultural database:\n${kbContent}`;

  console.log('--- Initializing Gemini Direct ---');
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: env.GEMINI_MODEL,
    systemInstruction: systemInstruction,
  });

  const query = 'According to your database, what is the dosage, method of application, and safety interval (PHI) for the herbicide Dhaman in Paddy?';
  console.log(`Query: "${query}"`);
  
  const start = Date.now();
  const response = await model.generateContent(query);
  console.log(`Response received in ${Date.now() - start}ms:`);
  console.log('--------------------------------------------------');
  console.log(response.response.text());
  console.log('--------------------------------------------------');
}

testDirect().catch(console.error);
