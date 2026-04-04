import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { deductCredit, getWallet } from '../services/walletService';

const deductCreditSchema = z.object({
  type: z.enum(['chat', 'scan']),
});

export async function getWalletHandler(request: FastifyRequest, reply: FastifyReply) {
  const wallet = await getWallet(request.user!._id.toString());
  return reply.send({ wallet });
}

export async function deductCreditHandler(request: FastifyRequest, reply: FastifyReply) {
  const parsed = deductCreditSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten().fieldErrors });
  }

  try {
    const wallet = await deductCredit(request.user!._id.toString(), parsed.data.type);
    return reply.send({ wallet });
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'NO_CREDITS'
    ) {
      return reply.status(402).send({ error: 'NO_CREDITS', upgradeRequired: true });
    }

    throw error;
  }
}
