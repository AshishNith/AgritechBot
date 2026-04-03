import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve('f:/Agency CLients works/AgritechBot/Backend/.env') });

async function testSTT(modelToTest: string) {
  const apiKey = process.env.SARVAM_API_KEY;
  const url = process.env.SARVAM_STT_URL;

  const form = new FormData();
  // Using a 1-second silent WAV-like content
  const dummyBuffer = Buffer.from('RIFF$   WAVEfmt         D\xac  \x88X  \x02 \x10 data    ', 'latin1');
  const dummyBlob = new Blob([dummyBuffer], { type: 'audio/wav' });
  
  form.append('file', dummyBlob, 'test.wav');
  form.append('language_code', 'hi-IN');
  form.append('model', modelToTest);

  try {
    const response = await fetch(url!, {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey || '',
      },
      body: form,
    });

    const text = await response.text();
    console.log(`Model: ${modelToTest}, Status: ${response.status}, Body: ${text}`);
  } catch (err) {
    console.error(`Model: ${modelToTest}, Error:`, err);
  }
}

async function main() {
  await testSTT('saarika:v1');
}

main();
