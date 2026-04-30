import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AdminAccount, type IAdminAccount, type AdminRole } from '../models/AdminAccount';
import { AppError } from '../utils/AppError';

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: IAdminAccount;
  }
}

interface AdminJwtPayload {
  adminId: string;
  role: AdminRole;
  tokenType: 'admin';
  iat: number;
  exp: number;
}

export async function adminAuthMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw AppError.unauthorized('errAuth', 'Admin authentication required');
  }

  const token = authHeader.substring(7);
  let payload: AdminJwtPayload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;
  } catch {
    throw AppError.unauthorized('errAuth', 'Invalid or expired admin token');
  }

  if (!payload?.adminId || payload.tokenType !== 'admin') {
    throw AppError.unauthorized('errAuth', 'Invalid admin token payload');
  }

  const adminUser = await AdminAccount.findById(payload.adminId);
  if (!adminUser || !adminUser.isActive) {
    throw AppError.unauthorized('errAuth', 'Admin account unavailable');
  }

  request.adminUser = adminUser;
}

export function requireAdminRoles(...roles: AdminRole[]) {
  return async function roleGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const role = request.adminUser?.role;
    if (!role || !roles.includes(role)) {
      throw AppError.forbidden('errForbidden', 'Insufficient admin permissions');
    }
  };
}

