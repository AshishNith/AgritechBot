import axios from 'axios';
import { logger } from '../utils/logger';

interface TelegramMessageData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Send a notification message to a Telegram chat when a contact form is submitted.
 */
export async function sendTelegramContactNotification(data: TelegramMessageData): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    logger.warn('Telegram notification not sent — TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID missing');
    return;
  }

  const { name, email, subject, message } = data;

  const telegramMessage = `
📩 *New Contact Inquiry*

👤 *Name:* ${name}
📧 *Email:* ${email}
📝 *Subject:* ${subject}

💬 *Message:*
${message}
  `.trim();

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, {
      chat_id: chatId,
      text: telegramMessage,
      parse_mode: 'Markdown',
    });

    logger.info('Contact notification sent to Telegram');
  } catch (error: any) {
    const errorMessage = error.response?.data?.description || error.message;
    logger.error({ error: errorMessage }, 'Failed to send contact notification to Telegram');
  }
}
