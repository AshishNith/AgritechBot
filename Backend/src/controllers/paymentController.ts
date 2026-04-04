import { FastifyReply, FastifyRequest } from 'fastify';
import { Subscription } from '../models/Subscription';
import { logger } from '../utils/logger';

export const processDummyPayment = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user!._id;
  const { tier } = request.body as { tier: 'free' | 'basic' | 'premium' };

  if (!['basic', 'premium'].includes(tier)) {
    return reply.status(400).send({ error: 'Invalid tier for payment' });
  }

  try {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + 30); // 30-day subscription

    // Update or create subscription
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        $set: {
          tier,
          status: 'active',
          startDate: now,
          endDate: endDate,
          queriesUsed: 0,
          scansUsed: 0,
          paymentId: `DUMMY_PAY_${Date.now()}`,
        }
      },
      { upsert: true, new: true }
    );

    logger.info({ userId, tier }, 'Dummy payment processed successfully');

    return reply.send({
      success: true,
      subscriptionTier: subscription.tier,
      expiresAt: subscription.endDate,
    });
  } catch (error) {
    logger.error({ error, userId }, 'Error processing dummy payment');
    return reply.status(500).send({ error: 'Failed to process payment' });
  }
};
