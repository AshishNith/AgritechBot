const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const BASE_URL = 'https://backend.goran.in';
// const BASE_URL = 'http://localhost:4000';

async function run() {
  try {
    console.log('1. Creating test user...');
    const phone = '+91' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
    
    // We will bypass actual OTP by sending verify directly if static OTP is enabled,
    // or we can use the local JWT secret if we want to hit local server.
    // Wait, let's just use the user's mobile app token if possible, or register via backend endpoints if no OTP verification is enforced.
    // Actually, on production OTP_PREVIEW_ENABLED might be false, so registration might need real OTP.
    console.log('To debug this, please look at PM2 logs on the VPS.');
  } catch (err) {
    console.error(err);
  }
}

run();
