import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.resolve('f:/Agency CLients works/AgritechBot/Backend/.env') });

async function testSTT(modelToTest: string) {
  const apiKey = process.env.SARVAM_API_KEY;
  const url = process.env.SARVAM_STT_URL;

  console.log(`\n--- Testing Model: ${modelToTest} ---`);
  
  const form = new FormData();
  // Using a slightly more valid-looking dummy buffer for "file" (tiny WAV)
  const dummyBuffer = Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45, 0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00, 0x64, 0x61, 0x74, 0x61, 0x00, 0x00, 0x00, 0x00]);
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

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

async function main() {
  await testSTT('saaras:v3');
  await testSTT('saarika:v2.5');
}

main();
