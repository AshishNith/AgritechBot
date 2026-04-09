import { FastifyInstance } from 'fastify';
import { submitContactForm, getContactMessages } from '../controllers/contactController';

export async function contactRoutes(app: FastifyInstance): Promise<void> {
  const contactRateLimit = {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: 60 * 60 * 1000 // 3 requests per hour to prevent spam
      }
    }
  };

  app.post('/api/contact', contactRateLimit, submitContactForm);
  
  // Potential future admin route
  // app.get('/api/admin/contact-messages', getContactMessages);
}
