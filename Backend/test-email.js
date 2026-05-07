// Quick test to verify Gmail SMTP credentials
const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('--- Email Config Debug ---');
console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);
console.log('SMTP_APP_PASSWORD:', process.env.SMTP_APP_PASSWORD ? `${process.env.SMTP_APP_PASSWORD.substring(0, 4)}****` : 'NOT SET');
console.log('Password length:', process.env.SMTP_APP_PASSWORD?.length);
console.log('--------------------------');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

transporter.verify()
  .then(() => {
    console.log('✅ SUCCESS — Gmail SMTP connection verified!');
    // Try sending a test email
    return transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: process.env.SMTP_EMAIL,
      subject: 'Test Email from Anaaj.ai',
      text: 'If you received this, your contact form email is working!',
    });
  })
  .then((info) => {
    console.log('✅ Test email sent! Message ID:', info.messageId);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ FAILED:', err.message);
    console.log('\n--- Troubleshooting ---');
    console.log('1. Go to: https://myaccount.google.com/apppasswords');
    console.log('2. Make sure you are logged in as:', process.env.SMTP_EMAIL);
    console.log('3. Delete any existing app passwords and create a NEW one');
    console.log('4. Copy the 16-char password (no spaces) into .env');
    process.exit(1);
  });
