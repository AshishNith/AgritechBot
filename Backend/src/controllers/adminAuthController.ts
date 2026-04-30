import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { AdminAccount } from '../models/AdminAccount';
import { AppError } from '../utils/AppError';
import { createAdminLog } from '../services/adminLogService';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const toAdminPayload = (admin: { _id: unknown; name: string; email: string; role: string }) => ({
  id: String(admin._id),
  name: admin.name,
  email: admin.email,
  role: admin.role
});

function createAdminToken(adminId: string, role: string): string {
  return jwt.sign(
    {
      adminId,
      role,
      tokenType: 'admin'
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as any }
  );
}

export async function adminLogin(request: FastifyRequest, reply: FastifyReply) {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const email = parsed.data.email.trim().toLowerCase();
  const admin = await AdminAccount.findOne({ email });
  if (!admin) {
    await createAdminLog('error', 'Admin login failed: account not found', { email });
    throw AppError.unauthorized('errAuth', 'Invalid credentials');
  }
  if (!admin.isActive) {
    await createAdminLog('error', 'Admin login failed: inactive account', { email, adminId: String(admin._id) });
    throw AppError.unauthorized('errAuth', 'Admin account is inactive');
  }

  const isValid = await admin.comparePassword(parsed.data.password);
  if (!isValid) {
    await createAdminLog('error', 'Admin login failed: invalid password', { email, adminId: String(admin._id) });
    throw AppError.unauthorized('errAuth', 'Invalid credentials');
  }

  const token = createAdminToken(String(admin._id), admin.role);
  await createAdminLog('system', 'Admin login successful', { adminId: String(admin._id), role: admin.role });

  return reply.send({
    token,
    admin: toAdminPayload(admin)
  });
}

export async function adminMe(request: FastifyRequest, reply: FastifyReply) {
  const admin = request.adminUser;
  if (!admin) {
    throw AppError.unauthorized('errAuth', 'Admin authentication required');
  }

  return reply.send({
    admin: toAdminPayload(admin)
  });
}

