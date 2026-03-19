import { FastifyInstance } from 'fastify';
import { sendOtp, verifyOtp } from '../controllers/authController';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post('/api/auth/send-otp', sendOtp);
  app.post('/api/auth/verify-otp', verifyOtp);
}
