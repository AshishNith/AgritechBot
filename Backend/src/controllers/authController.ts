import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../models/User';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { Wallet } from '../models/Wallet';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import axios from 'axios';
import { firebaseAuth } from '../config/firebase';
/**
 * We use our own JWT for internal API sessions 
 * to maintain our payload structure.
 */
function generateInternalToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

const sendOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  otp: z.string().regex(/^\d{6}$/, 'Invalid OTP'),
});

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function buildUserPayload(user: any) {
  return {
    id: user._id,
    phone: user.phone,
    name: user.name,
    role: user.role,
    language: user.language,
    location: user.location,
    crops: user.crops,
    landSize: user.landSize,
    landUnit: user.landUnit,
    subscriptionTier: user.subscriptionTier,
  };
}

/**
 * POST /api/auth/send-otp
 * Generates OTP and stores hashed OTP in DB. Returns OTP in response
 */
export async function sendOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = sendOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { phone } = parsed.data;
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  let user = await User.findOne({ phone });

  if (!user) {
    user = new User({
      phone,
      isVerified: false,
      subscriptionTier: 'free',
      otp,
      otpExpiresAt: expiresAt,
    });
  } else {
    user.otp = otp;
    user.otpExpiresAt = expiresAt;
  }

  await user.save();

  logger.info({ phone }, 'OTP generated successfully');
  if (env.NODE_ENV !== 'production') {
    logger.info({ phone, otp }, 'DEVELOPMENT: OTP is');
  }

  const response: Record<string, unknown> = {
    message: 'OTP sent successfully',
    expiresInSeconds: env.OTP_EXPIRY_MINUTES * 60,
  };

  if (env.OTP_PREVIEW_ENABLED) {
    response.otp = otp;
  }

  return reply.send(response);
}

/**
 * POST /api/auth/verify-otp
 * Verifies the provided OTP and returns local session token.
 */
export async function verifyOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { phone, otp } = parsed.data;

  const user = await User.findOne({ phone }).select('+otp +otpExpiresAt');

  if (!user || !user.otp || !user.otpExpiresAt) {
    throw AppError.unauthorized('errInvalidOtpSession');
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    throw AppError.unauthorized('errOtpExpired');
  }

  const isValid = await user.compareOtp(otp);
  if (!isValid) {
    throw AppError.unauthorized('errInvalidOtp');
  }

  const isNewUser = !user.isVerified;
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  const existingSub = await Subscription.findOne({ userId: user._id });
  if (!existingSub) {
    await Subscription.create({
      userId: user._id,
      tier: 'free',
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      features: TIER_FEATURES.free,
    });
  }

  if (isNewUser) {
    try {
      await Wallet.ensureForUser(user._id.toString());
    } catch (error) {
      logger.warn({ userId: user._id, error }, 'Failed to create initial wallet');
    }
  }

  const internalToken = generateInternalToken(String(user._id), user.role);

  return reply.send({
    message: 'Login successful',
    token: internalToken,
    user: buildUserPayload(user),
  });
}

// --- 2Factor.in SMS OTP Integration ---
const twoFactorSessions = new Map<string, string>(); // Maps phone -> sessionId
const TWO_FACTOR_API_KEY = process.env.TWO_FACTOR_API_KEY || 'YOUR_2FACTOR_API_KEY';

export async function send2FactorOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = sendOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput');
  }

  const { phone } = parsed.data;

  try {
    const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/${encodeURIComponent(phone)}/AUTOGEN`;
    const res = await fetch(url);
    const data = await res.json() as Record<string, string>;

    if (data.Status === 'Success') {
      twoFactorSessions.set(phone, data.Details); // Store sessionId
      return reply.send({ success: true, message: 'OTP sent successfully' });
    } else {
      throw AppError.badRequest('errSmsProvider', data.Details);
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ error }, 'Send 2Factor OTP failed');
    throw AppError.internal();
  }
}

export async function verify2FactorOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput');
  }

  const { phone, otp } = parsed.data;
  const sessionId = twoFactorSessions.get(phone);

  if (!sessionId) {
    throw AppError.unauthorized('errInvalidOtpSession');
  }

  try {
    const url = `https://2factor.in/API/V1/${TWO_FACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`;
    const res = await fetch(url);
    const data = await res.json() as Record<string, string>;

    if (data.Details === 'OTP Matched') {
      twoFactorSessions.delete(phone); // Clean up session

      let isNewUser = false;
      let user = await User.findOne({ phone });
      if (!user) {
        isNewUser = true;
        user = new User({ phone, isVerified: true, subscriptionTier: 'free' });
        await user.save();
      } else if (!user.isVerified) {
        isNewUser = true;
        user.isVerified = true;
        await user.save();
      }

      const existingSub = await Subscription.findOne({ userId: user._id });
      if (!existingSub) {
        await Subscription.create({
          userId: user._id,
          tier: 'free',
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          features: TIER_FEATURES.free,
        });
      }

      if (isNewUser) {
        try {
          await Wallet.ensureForUser(user._id.toString());
        } catch (error) {
          logger.warn({ userId: user._id, error }, 'Failed to create initial wallet');
        }
      }

      const internalToken = generateInternalToken(String(user._id), user.role);

      return reply.send({
        success: true,
        message: 'Login successful',
        token: internalToken,
        user: buildUserPayload(user),
      });
    } else {
      throw AppError.unauthorized('errInvalidOtp');
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ error }, 'Verify 2Factor OTP failed');
    throw AppError.internal();
  }
}

// --- Fast2SMS OTP Integration ---
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || process.env.FAST2SMS_KEY || 'YOUR_FAST2SMS_API_KEY';
const fast2SmsStore = new Map<string, { otp: string, expires: number }>();

export async function sendFast2SmsOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = sendOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput');
  }

  const { phone } = parsed.data;
  // Convert +919999999999 to 9999999999 for Fast2SMS
  const numericPhone = phone.replace(/^\+?\d{2}/, ''); 
  
  if (!/^\d{10}$/.test(numericPhone)) {
      throw AppError.badRequest('errInvalidInput', 'Phone number must be exactly 10 digits for Fast2SMS');
  }

  const otp = generateOtp(); // Generates 6-digit OTP matching the verification schema

  try {
    // Only call Fast2SMS API if we have a real key and are not bypassing it
    if (env.NODE_ENV === 'production' || FAST2SMS_API_KEY !== 'YOUR_FAST2SMS_API_KEY') {
      try {
        const response = await axios({
          method: 'post',
          url: 'https://www.fast2sms.com/dev/bulkV2',
          headers: {
            "authorization": FAST2SMS_API_KEY,
            "Content-Type": "application/json"
          },
          data: {
            "message": `Your Anaaj AI verification code is ${otp}. It will expire in 5 minutes.`,
            "language": "english",
            "route": "q",
            "numbers": numericPhone,
          }
        });

        if (!response.data.return) {
          throw new Error(response.data.message);
        }
      } catch (smsError: any) {
        logger.error({ error: smsError.response?.data || smsError.message }, 'Fast2SMS API Error');
        // In production, we MUST fail if SMS fails. In dev, we can continue to allow OTP preview
        if (env.NODE_ENV === 'production') {
          throw AppError.badRequest('errSmsProvider', 'Failed to send SMS');
        } else {
          logger.warn('Continuing in development mode despite SMS failure.');
        }
      }
    }

    fast2SmsStore.set(phone, {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    });

    if (env.NODE_ENV !== 'production') {
      logger.info({ phone, otp }, 'DEVELOPMENT: OTP is');
    }

    const responsePayload: Record<string, unknown> = { 
      success: true, 
      message: "OTP sent successfully" 
    };

    if (env.OTP_PREVIEW_ENABLED) {
      responsePayload.otp = otp;
    }

    return reply.send(responsePayload);
  } catch (error: any) {
    logger.error({ error: error.message }, 'Send Fast2SMS OTP failed');
    throw AppError.internal('Failed to send OTP');
  }
}

export async function verifyFast2SmsOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = verifyOtpSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput');
  }

  const { phone, otp } = parsed.data;
  const record = fast2SmsStore.get(phone);

  if (!record) {
    throw AppError.unauthorized('errInvalidOtpSession', 'OTP not found or expired');
  }
  
  if (Date.now() > record.expires) {
    fast2SmsStore.delete(phone);
    throw AppError.unauthorized('errOtpExpired', 'OTP expired');
  }

  if (record.otp === otp) {
    fast2SmsStore.delete(phone); // Clean up session

    let isNewUser = false;
    let user = await User.findOne({ phone });
    if (!user) {
      isNewUser = true;
      user = new User({ phone, isVerified: true, subscriptionTier: 'free' });
      await user.save();
    } else if (!user.isVerified) {
      isNewUser = true;
      user.isVerified = true;
      await user.save();
    }

    const existingSub = await Subscription.findOne({ userId: user._id });
    if (!existingSub) {
      await Subscription.create({
        userId: user._id,
        tier: 'free',
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        features: TIER_FEATURES.free,
      });
    }

    if (isNewUser) {
      try {
        await Wallet.ensureForUser(user._id.toString());
      } catch (error) {
        logger.warn({ userId: user._id, error }, 'Failed to create initial wallet');
      }
    }

    const internalToken = generateInternalToken(String(user._id), user.role);

    return reply.send({
      success: true,
      message: 'Login successful',
      token: internalToken,
      user: buildUserPayload(user),
    });
  } else {
    throw AppError.unauthorized('errInvalidOtp', 'Invalid OTP');
  }
}

// --- Firebase Phone Auth Verification ---
const firebaseVerifySchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  firebaseToken: z.string().min(1, 'Firebase token is required'),
});

/**
 * POST /api/auth/firebase/verify
 * Verifies a Firebase ID token and returns a local session token.
 * The mobile app calls this after Firebase Phone Auth succeeds.
 */
export async function verifyFirebaseOtp(request: FastifyRequest, reply: FastifyReply) {
  const parsed = firebaseVerifySchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { phone, firebaseToken } = parsed.data;

  try {
    // Verify the Firebase ID token
    const decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);
    const firebasePhone = decodedToken.phone_number;

    // Security check: ensure the phone from the token matches the claimed phone
    if (firebasePhone !== phone) {
      logger.warn({ claimedPhone: phone, tokenPhone: firebasePhone }, 'Phone number mismatch in Firebase token');
      throw AppError.unauthorized('errPhoneMismatch', 'Phone number does not match token');
    }

    // Find or create the user
    let isNewUser = false;
    let user = await User.findOne({ phone });
    if (!user) {
      isNewUser = true;
      user = new User({ phone, isVerified: true, subscriptionTier: 'free' });
      await user.save();
    } else if (!user.isVerified) {
      isNewUser = true;
      user.isVerified = true;
      await user.save();
    }

    // Ensure subscription exists
    const existingSub = await Subscription.findOne({ userId: user._id });
    if (!existingSub) {
      await Subscription.create({
        userId: user._id,
        tier: 'free',
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        features: TIER_FEATURES.free,
      });
    }

    // Create wallet for new users
    if (isNewUser) {
      try {
        await Wallet.ensureForUser(user._id.toString());
      } catch (error) {
        logger.warn({ userId: user._id, error }, 'Failed to create initial wallet');
      }
    }

    const internalToken = generateInternalToken(String(user._id), user.role);

    logger.info({ phone, isNewUser, firebaseUid: decodedToken.uid }, 'Firebase phone auth verified');

    return reply.send({
      success: true,
      message: 'Login successful',
      token: internalToken,
      user: buildUserPayload(user),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ error }, 'Firebase token verification failed');
    throw AppError.unauthorized('errInvalidToken', 'Invalid or expired Firebase token');
  }
}
