import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import { AdminAccount } from '../models/AdminAccount';
import { logger } from '../utils/logger';

export async function seedDefaultAdmin(): Promise<void> {
  if (!env.ADMIN_SEED_ENABLED) return;

  const email = env.ADMIN_EMAIL.trim().toLowerCase();
  const existing = await AdminAccount.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);
  await AdminAccount.create({
    name: 'Anaaj Admin',
    email,
    passwordHash,
    role: 'super_admin',
    isActive: true
  });

  logger.info({ email }, 'Default admin account seeded');
}

