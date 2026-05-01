const fs = require('fs');

async function test() {
  const audioBlob = new Blob([Buffer.alloc(100)], { type: 'audio/wav' });
  const form = new FormData();
  form.append('file', audioBlob, 'audio.wav');
  form.append('language_code', 'hi-IN');
  form.append('model', 'saaras:v1');
  form.append('with_timestamps', 'false');

  const response = await fetch('https://api.sarvam.ai/speech-to-text', {
    method: 'POST',
    headers: {
      'api-subscription-key': 'sk_6x9vpqec_LeDzCdFNojI6cb8MrIDRs4nJ'
    },
    body: form
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
}

test();
