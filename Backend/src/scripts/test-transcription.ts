import { speechToText } from '../services/voice/sarvamSTT';
import dotenv from 'dotenv';
import path from 'path';
import { logger } from '../utils/logger';

async function main() {
  // Load local .env
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  
  console.log('--- Sarvam STT Isolation Test ---');
  
  // Create a minimal 1-second silent WAV buffer if possible, or just a small buffer
  // Most APIs will error with empty body, so we provide a tiny "fake" audio buffer
  // Note: This might still get a 400 if the format is invalid, but we'll see the error body.
  const dummyAudioBase64 = 'UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='; 
  
  try {
    const result = await speechToText(dummyAudioBase64, 'English', 'audio/wav', 'test.wav');
    console.log('--- SUCCESS ---');
    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('--- FAILED ---');
    console.error('Message:', err.message);
    if (err.stack) console.error('Stack trace included in logs');
  }
}

main().catch(console.error);
