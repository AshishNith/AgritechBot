import mongoose, { ClientSession } from 'mongoose';
import { Product } from '../../models/Product';
import { Order } from '../../models/Order';

export interface OrderDraftPayload {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export async function calculateDraftAmount(draft: OrderDraftPayload): Promise<number> {
  const productIds = draft.items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds }, inStock: true }).lean();

  if (products.length !== draft.items.length) {
    throw new Error('One or more products not found or out of stock');
  }

  return draft.items.reduce((sum, item) => {
    const product = products.find((candidate) => String(candidate._id) === item.productId);
    if (!product) {
      throw new Error('One or more products not found or out of stock');
    }

    const effectivePrice =
      product.pricing?.discountPrice ?? product.pricing?.price ?? product.price;
    return sum + effectivePrice * item.quantity;
  }, 0);
}

export async function createConfirmedOrderFromDraft(params: {
  userId: string;
  draft: OrderDraftPayload;
  paymentId: string;
  session?: ClientSession;
}) {
  const ownSession = params.session ?? (await mongoose.startSession());
  const shouldClose = !params.session;

  try {
    let createdOrder: unknown;

    await ownSession.withTransaction(async () => {
      const productIds = params.draft.items.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds }, inStock: true }).session(ownSession);

      if (products.length !== params.draft.items.length) {
        throw new Error('One or more products not found or out of stock');
      }

      const orderItems = params.draft.items.map((item) => {
        const product = products.find((candidate) => String(candidate._id) === item.productId);
        if (!product) {
          throw new Error('One or more products not found or out of stock');
        }

        const effectivePrice =
          product.pricing?.discountPrice ?? product.pricing?.price ?? product.price;
        return {
          productId: product._id,
          name: product.name,
          quantity: item.quantity,
          price: effectivePrice,
        };
      });

      for (const item of params.draft.items) {
        const product = products.find((candidate) => String(candidate._id) === item.productId);
        if (!product) {
          throw new Error('One or more products not found or out of stock');
        }

        const quantityStock = typeof product.quantity === 'number' ? product.quantity : 0;
        const pricingStock = typeof product.pricing?.stock === 'number' ? product.pricing.stock : undefined;

        const stockSource: 'quantity' | 'pricing.stock' | null =
          quantityStock > 0 ? 'quantity' : typeof pricingStock === 'number' ? 'pricing.stock' : null;

        if (!stockSource) {
          throw new Error(`Product ${product.name} is out of stock`);
        }

        const query =
          stockSource === 'quantity'
            ? { _id: product._id, quantity: { $gte: item.quantity } }
            : { _id: product._id, 'pricing.stock': { $gte: item.quantity } };

        const update =
          stockSource === 'quantity'
            ? { $inc: { quantity: -item.quantity } }
            : { $inc: { 'pricing.stock': -item.quantity } };

        const updated = await Product.findOneAndUpdate(query, update, {
          new: true,
          session: ownSession,
        });

        if (!updated) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        const remaining = stockSource === 'quantity' ? updated.quantity : (updated.pricing?.stock ?? 0);
        if (remaining <= 0) {
          await Product.updateOne(
            { _id: product._id },
            { $set: { inStock: false, 'inventory.available': false } },
            { session: ownSession }
          );
        }
      }

      const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const [order] = await Order.create(
        [
          {
            userId: params.userId,
            items: orderItems,
            totalAmount,
            deliveryAddress: params.draft.deliveryAddress,
            paymentId: params.paymentId,
            status: 'confirmed',
          },
        ],
        { session: ownSession }
      );

      createdOrder = order;
    });

    return createdOrder;
  } finally {
    if (shouldClose) {
      await ownSession.endSession();
    }
  }
}
