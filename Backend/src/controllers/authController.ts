import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../models/User';
import { Subscription, TIER_FEATURES } from '../models/Subscription';
import { Wallet } from '../models/Wallet';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
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
 * Shared post-verification logic: find/create user, ensure subscription & wallet,
 * generate JWT, and build the response payload.
 */
async function handlePostVerification(phone: string) {
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

  return {
    isNewUser,
    token: internalToken,
    user: buildUserPayload(user),
  };
}

// --- Firebase Phone Auth Verification (Primary Auth Method) ---
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

    const result = await handlePostVerification(phone);

    logger.info({ phone, isNewUser: result.isNewUser, firebaseUid: decodedToken.uid }, 'Firebase phone auth verified');

    return reply.send({
      success: true,
      message: 'Login successful',
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ error }, 'Firebase token verification failed');
    throw AppError.unauthorized('errInvalidToken', 'Invalid or expired Firebase token');
  }
}
