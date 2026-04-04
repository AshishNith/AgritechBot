import { FastifyReply, FastifyRequest } from 'fastify';
import { Subscription, TIER_FEATURES } from '../../models/Subscription';
import { ChatMessageModel } from '../models/ChatMessage.model';

export async function queryLimitCheckMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const farmerId = String(request.user!._id);
  const subscription = await Subscription.findOne({ userId: farmerId }).lean();
  const tier = subscription?.tier || 'free';
  const status = subscription?.status || 'active';
  const chatLimit = subscription?.features?.chatLimit ?? TIER_FEATURES[tier].chatLimit;

  if (status !== 'active') {
    return reply.status(403).send({ error: 'Subscription is not active.' });
  }

  if (chatLimit === -1) {
    return;
  }

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);

  const queriesUsedToday = await ChatMessageModel.countDocuments({
    farmerId,
    role: 'user',
    createdAt: { $gte: dayStart },
  });

  if (queriesUsedToday >= chatLimit) {
    return reply.status(403).send({
      error: `Daily chat limit of ${chatLimit} messages reached for the ${tier} plan.`,
    });
  }
}
