import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import mongoose from 'mongoose';
import { Order } from '../models/Order';
import { AppError } from '../utils/AppError';
import { buildPagination } from '../utils/pagination';
import { createAdminLog } from '../services/adminLogService';

const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100000).default(10),
  status: z.enum(['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).default('all'),
  search: z.string().optional()
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'])
});

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listAdminOrders(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listOrdersQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { page, limit, status, search } = parsed.data;
  const filters: Record<string, unknown>[] = [];

  if (status && status !== 'all') {
    filters.push({ status });
  }

  if (search?.trim()) {
    const trimmed = search.trim();
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      filters.push({
        $or: [
          { _id: trimmed },
          { userId: trimmed }
        ]
      });
    } else {
      // Find orders matching item name
      const searchRegex = { $regex: escapeRegex(trimmed), $options: 'i' };
      filters.push({
        $or: [
          { 'items.name': searchRegex },
          { 'deliveryAddress.city': searchRegex },
          { 'deliveryAddress.state': searchRegex }
        ]
      });
    }
  }

  const where = filters.length ? { $and: filters } : {};
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(where)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(where)
  ]);

  return reply.send({
    items: orders.map((order: any) => ({
      id: String(order._id),
      userId: order.userId ? String(order.userId._id) : 'Unknown',
      userName: order.userId?.name ?? 'Unknown',
      userPhone: order.userId?.phone ?? '',
      items: order.items ?? [],
      totalAmount: order.totalAmount,
      paymentId: order.paymentId ?? '',
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      createdAt: new Date(order.createdAt).toISOString()
    })),
    pagination: buildPagination(page, limit, total)
  });
}

export async function getAdminOrderById(
  request: FastifyRequest<{ Params: { orderId: string } }>,
  reply: FastifyReply
) {
  const order: any = await Order.findById(request.params.orderId)
    .populate('userId', 'name phone email')
    .lean();

  if (!order) {
    throw AppError.notFound('errNotFound', 'Order not found');
  }

  return reply.send({
    order: {
      id: String(order._id),
      userId: order.userId ? String(order.userId._id) : 'Unknown',
      userName: order.userId?.name ?? 'Unknown',
      userPhone: order.userId?.phone ?? '',
      userEmail: order.userId?.email ?? '',
      items: order.items ?? [],
      totalAmount: order.totalAmount,
      paymentId: order.paymentId ?? '',
      status: order.status,
      deliveryAddress: order.deliveryAddress,
      createdAt: new Date(order.createdAt).toISOString(),
      updatedAt: new Date(order.updatedAt).toISOString()
    }
  });
}

export async function updateAdminOrderStatus(
  request: FastifyRequest<{ Params: { orderId: string }; Body: { status: string } }>,
  reply: FastifyReply
) {
  const parsed = updateOrderStatusSchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const order = await Order.findById(request.params.orderId);
  if (!order) {
    throw AppError.notFound('errNotFound', 'Order not found');
  }

  const oldStatus = order.status;
  order.status = parsed.data.status;
  await order.save();

  await createAdminLog('system', `Order status transitioned from ${oldStatus} to ${order.status}`, {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    orderId: String(order._id),
    oldStatus,
    newStatus: order.status
  });

  return reply.send({
    message: 'Order status updated successfully',
    order: {
      id: String(order._id),
      status: order.status
    }
  });
}
