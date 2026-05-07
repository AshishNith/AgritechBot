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
    from: `"Anaaj.ai Notifications" <${process.env.SMTP_EMAIL}>`,
    to: process.env.CONTACT_NOTIFICATION_EMAIL || process.env.SMTP_EMAIL,
    replyTo: email,
    subject: `📩 [Contact] ${subject} - ${name}`,
    html: `
      <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
        <!-- Header with Logo -->
        <div style="background-color: #f0fdf4; padding: 32px 40px; text-align: center; border-bottom: 1px solid #dcfce7;">
          <img src="https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773932879/Full_Logo_dt1pqi.png" alt="Anaaj.ai Logo" style="height: 48px; width: auto; margin-bottom: 16px;">
          <h1 style="color: #166534; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">New Inquiry Received</h1>
          <p style="color: #15803d; margin: 8px 0 0 0; font-size: 14px; font-weight: 500;">Submission from Anaaj.ai Website</p>
        </div>
        
        <div style="padding: 40px;">
          <!-- User Details -->
          <div style="margin-bottom: 32px; background-color: #f9fafb; border-radius: 12px; padding: 24px;">
            <div style="margin-bottom: 16px;">
              <span style="color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">From</span>
              <span style="color: #111827; font-size: 16px; font-weight: 600;">${name} &lt;${email}&gt;</span>
            </div>
            <div>
              <span style="color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 4px;">Subject</span>
              <span style="color: #111827; font-size: 16px; font-weight: 600;">${subject}</span>
            </div>
          </div>

          <!-- Message Body -->
          <div style="margin-bottom: 32px;">
            <span style="color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 12px;">Message</span>
            <div style="color: #374151; font-size: 16px; line-height: 1.6; background-color: #ffffff; border: 1px solid #f3f4f6; padding: 20px; border-radius: 12px; white-space: pre-wrap;">${message}</div>
          </div>

          <!-- Action Button -->
          <div style="text-align: center;">
            <a href="mailto:${email}" style="display: inline-block; background-color: #16a34a; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 700; text-decoration: none;">Reply Directly to ${name.split(' ')[0]}</a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #f3f4f6;">
          <p style="color: #9ca3af; margin: 0; font-size: 12px;">&copy; ${new Date().getFullYear()} Anaaj.ai System Notification. All rights reserved.</p>
          <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 11px;">This is an automated message sent from your website contact form.</p>
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
