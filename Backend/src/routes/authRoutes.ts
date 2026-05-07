import { FastifyInstance } from 'fastify';
import { sendOtp, verifyOtp, send2FactorOtp, verify2FactorOtp, sendFast2SmsOtp, verifyFast2SmsOtp, verifyFirebaseOtp } from '../controllers/authController';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const otpRateLimit = {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: 15 * 60 * 1000 // 15 mins
      }
    }
  };

  const fast2SmsRateLimit = {
    config: {
      rateLimit: {
        max: 3, // 3 requests per 15 minutes as requested
        timeWindow: 15 * 60 * 1000
      }
    }
  };

  const firebaseRateLimit = {
    config: {
      rateLimit: {
        max: 10, // Firebase verify is lightweight; slightly higher limit
        timeWindow: 15 * 60 * 1000
      }
    }
  };

  // Legacy endpoints (kept for backward compatibility)
  app.post('/auth/send-otp', otpRateLimit, sendOtp);
  app.post('/auth/verify-otp', otpRateLimit, verifyOtp);

  // 2Factor.in SMS OTP Integration Routes
  app.post('/auth/2factor/send', otpRateLimit, send2FactorOtp);
  app.post('/auth/2factor/verify', otpRateLimit, verify2FactorOtp);

  // Fast2SMS OTP Integration Routes
  app.post('/auth/fast2sms/send', fast2SmsRateLimit, sendFast2SmsOtp);
  app.post('/auth/fast2sms/verify', fast2SmsRateLimit, verifyFast2SmsOtp);

  // Firebase Phone Auth (active endpoint used by mobile app)
  app.post('/auth/firebase/verify', firebaseRateLimit, verifyFirebaseOtp);
}
