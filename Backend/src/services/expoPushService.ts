import axios from 'axios';
import { logger } from '../utils/logger';

export async function sendExpoPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  // Filter out invalid/empty tokens, ensuring they match Expo push token pattern
  const validTokens = tokens.filter(
    (t) => typeof t === 'string' && t.startsWith('ExponentPushToken[')
  );

  if (validTokens.length === 0) {
    return;
  }

  // Chunk tokens into batches of 100
  const batchSize = 100;
  const batches: string[][] = [];
  for (let i = 0; i < validTokens.length; i += batchSize) {
    batches.push(validTokens.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const messages = batch.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
    }));

    try {
      logger.info({ count: messages.length }, 'Dispatching push notification batch to Expo');
      const response = await axios.post('https://exp.host/--/api/v2/push/send', messages, {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
      });

      // Expo response may contain error lists
      if (response.data && response.data.data) {
        const results = response.data.data;
        results.forEach((res: any, idx: number) => {
          if (res.status === 'error') {
            logger.warn({ token: batch[idx], error: res.message }, 'Expo push delivery failed for token');
          }
        });
      }
    } catch (error: any) {
      logger.error(
        { error: error.message || String(error) },
        'HTTP error communicating with Expo Push API'
      );
    }
  }
}
