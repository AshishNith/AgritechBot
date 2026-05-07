import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../models/User';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { Wallet } from '../models/Wallet';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

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
