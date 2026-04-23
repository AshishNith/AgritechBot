import { FastifyInstance } from 'fastify';
import { sendOtp, verifyOtp, send2FactorOtp, verify2FactorOtp } from '../controllers/authController';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const otpRateLimit = {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: 15 * 60 * 1000 // 15 mins
      }
    }
  };

  app.post('/auth/send-otp', otpRateLimit, sendOtp);
  app.post('/auth/verify-otp', otpRateLimit, verifyOtp);

  // 2Factor.in SMS OTP Integration Routes (moved inside auth namespace)
  app.post('/auth/2factor/send', otpRateLimit, send2FactorOtp);
  app.post('/auth/2factor/verify', otpRateLimit, verify2FactorOtp);
}
