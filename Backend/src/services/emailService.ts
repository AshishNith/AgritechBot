import nodemailer, { Transporter } from 'nodemailer';
import { logger } from '../utils/logger';

// Lazy-initialized transporter (created on first use, after dotenv has loaded)
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;

  const email = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_APP_PASSWORD;

  if (!email || !pass) {
    logger.warn('Email service not configured — SMTP_EMAIL or SMTP_APP_PASSWORD missing');
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: pass,
    },
  });

  // Verify connection asynchronously
  transporter.verify()
    .then(() => logger.info('✅ Email service ready (Gmail SMTP)'))
    .catch((err) => {
      logger.error({ error: err.message }, '❌ Email service verification failed');
      transporter = null; // Reset so it can retry next time
    });

  return transporter;
}

interface ContactEmailData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Send a notification email to the admin when a contact form is submitted.
 */
export async function sendContactNotification(data: ContactEmailData): Promise<void> {
  const { name, email, subject, message } = data;

  const mailer = getTransporter();
  if (!mailer) {
    logger.warn('Email not sent — SMTP not configured or verification failed');
    return;
  }

  const mailOptions = {
    from: `"Anaaj.ai Contact Form" <${process.env.SMTP_EMAIL}>`,
    to: process.env.CONTACT_NOTIFICATION_EMAIL || process.env.SMTP_EMAIL,
    replyTo: email, // so you can directly reply to the sender
    subject: `📩 New Contact Form: ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8faf8; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #166534 0%, #15803d 100%); padding: 24px 32px;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">🌾 New Contact Form Submission</h1>
          <p style="color: #bbf7d0; margin: 8px 0 0 0; font-size: 14px;">Anaaj.ai Website</p>
        </div>
        
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 16px; background: #ffffff; border-radius: 8px; margin-bottom: 8px; display: block; border-left: 4px solid #16a34a;">
                <strong style="color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Name</strong>
                <p style="margin: 4px 0 0 0; color: #111827; font-size: 16px;">${name}</p>
              </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="padding: 12px 16px; background: #ffffff; border-radius: 8px; display: block; border-left: 4px solid #16a34a;">
                <strong style="color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</strong>
                <p style="margin: 4px 0 0 0; color: #111827; font-size: 16px;"><a href="mailto:${email}" style="color: #16a34a;">${email}</a></p>
              </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="padding: 12px 16px; background: #ffffff; border-radius: 8px; display: block; border-left: 4px solid #16a34a;">
                <strong style="color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Subject</strong>
                <p style="margin: 4px 0 0 0; color: #111827; font-size: 16px;">${subject}</p>
              </td>
            </tr>
            <tr><td style="height: 8px;"></td></tr>
            <tr>
              <td style="padding: 12px 16px; background: #ffffff; border-radius: 8px; display: block; border-left: 4px solid #16a34a;">
                <strong style="color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Message</strong>
                <p style="margin: 4px 0 0 0; color: #111827; font-size: 16px; white-space: pre-wrap;">${message}</p>
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #166534; font-size: 13px;">
              💡 You can reply directly to this email to respond to <strong>${name}</strong>
            </p>
          </div>
        </div>
        
        <div style="background: #f3f4f6; padding: 16px 32px; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 12px;">
            Sent from Anaaj.ai Contact Form • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </p>
        </div>
      </div>
    `,
  };

  try {
    const info = await mailer.sendMail(mailOptions);
    logger.info({ messageId: info.messageId }, 'Contact notification email sent');
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to send contact notification email');
    transporter = null; // Reset transporter so it retries fresh next time
  }
}
