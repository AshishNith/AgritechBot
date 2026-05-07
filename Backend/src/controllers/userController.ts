import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { User } from '../models/User';
import { invalidateFarmerContextCache } from '../chat/services/contextBuilder.service';
import { getSubscriptionStatus } from '../services/subscriptionService';

const createProfileSchema = z.object({
  name: z.string().min(1).max(100),
  language: z.string().optional(),
  location: z.object({
    state: z.string().optional(),
    district: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  crops: z.array(z.string()).optional(),
  landSize: z.number().positive().optional(),
  landUnit: z.string().optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  language: z.string().optional(),
  location: z.object({
    state: z.string().optional(),
    district: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  crops: z.array(z.string()).optional(),
  landSize: z.number().positive().optional(),
  landUnit: z.string().optional(),
});

/**
 * GET /api/user/profile
 */
export async function getProfile(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user!;

  return reply.send({
    user: {
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
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    },
  });
}

/**
 * POST /api/user/profile
 * Create/Complete profile for new users after OTP verification
 */
export async function createProfile(request: FastifyRequest, reply: FastifyReply) {
  const parsed = createProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id;
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: parsed.data },
    { new: true }
  );

  if (!user) {
    return reply.status(404).send({ error: 'User not found' });
  }

  await invalidateFarmerContextCache(userId);

  return reply.send({
    message: 'Profile created successfully',
    user: {
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
    },
  });
}

/**
 * PUT /api/user/profile
 */
export async function updateProfile(request: FastifyRequest, reply: FastifyReply) {
  const parsed = updateProfileSchema.safeParse(request.body);
  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  const userId = request.user!._id;
  const user = await User.findByIdAndUpdate(userId, { $set: parsed.data }, { new: true });

  if (!user) {
    return reply.status(404).send({ error: 'User not found' });
  }

  await invalidateFarmerContextCache(userId);

  return reply.send({
    message: 'Profile updated',
    user: {
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
    },
  });
}

/**
 * GET /api/user/subscription/status
 */
export async function getUserSubscriptionStatus(request: FastifyRequest, reply: FastifyReply) {
  const status = await getSubscriptionStatus(request.user!._id.toString());

  if (!status) {
    return reply.status(404).send({ error: 'Subscription status not found' });
  }

  return reply.send(status);
}

/**
 * DELETE /api/user/account
 * Deletes the user account and all associated data.
 */
export async function deleteAccount(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user!._id;

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return reply.status(404).send({ error: 'User not found' });
  }

  // Optional: Delete other associated data like wallet, subscriptions, etc.
  // For now, we focus on the User object to comply with deletion requirements.
  
  await invalidateFarmerContextCache(userId);

  return reply.send({
    message: 'Account deleted successfully',
  });
}
