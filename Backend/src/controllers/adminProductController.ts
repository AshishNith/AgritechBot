import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { Product } from '../models/Product';
import { AppError } from '../utils/AppError';
import { buildPagination } from '../utils/pagination';
import { createAdminLog } from '../services/adminLogService';

const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100000).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  stockStatus: z.enum(['all', 'inStock', 'outOfStock']).default('all')
});

const productBodySchema = z.object({
  name: z.string().min(1).max(120),
  brand: z.string().optional(),
  nameHi: z.string().optional(),
  nameGu: z.string().optional(),
  namePa: z.string().optional(),
  description: z.string().min(1),
  descriptionHi: z.string().optional(),
  descriptionGu: z.string().optional(),
  descriptionPa: z.string().optional(),
  category: z.string().min(1),
  categoryHi: z.string().optional(),
  categoryGu: z.string().optional(),
  categoryPa: z.string().optional(),
  subCategory: z.string().optional(),
  subCategoryHi: z.string().optional(),
  subCategoryGu: z.string().optional(),
  subCategoryPa: z.string().optional(),
  price: z.coerce.number().min(0),
  unit: z.string().min(1).default('kg'),
  unitHi: z.string().optional(),
  unitGu: z.string().optional(),
  unitPa: z.string().optional(),
  images: z.array(z.string()).default([]),
  inStock: z.boolean().default(true),
  quantity: z.coerce.number().int().min(0).default(0),
  seller: z.object({
    name: z.string().min(1),
    phone: z.string().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    location: z.string().optional()
  })
});

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listAdminProducts(request: FastifyRequest, reply: FastifyReply) {
  const parsed = listProductsQuerySchema.safeParse(request.query);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const { page, limit, search, category, stockStatus } = parsed.data;
  const filters: Record<string, unknown>[] = [];

  if (search?.trim()) {
    const searchRegex = { $regex: escapeRegex(search.trim()), $options: 'i' };
    filters.push({
      $or: [
        { name: searchRegex },
        { nameHi: searchRegex },
        { nameGu: searchRegex },
        { namePa: searchRegex },
        { brand: searchRegex },
        { description: searchRegex }
      ]
    });
  }

  if (category?.trim() && category !== 'all') {
    filters.push({ category: new RegExp(`^${escapeRegex(category.trim())}$`, 'i') });
  }

  if (stockStatus === 'inStock') {
    filters.push({ inStock: true });
  } else if (stockStatus === 'outOfStock') {
    filters.push({ inStock: false });
  }

  const where = filters.length ? { $and: filters } : {};
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(where).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(where)
  ]);

  return reply.send({
    items: products.map((product) => ({
      id: String(product._id),
      name: product.name,
      brand: product.brand ?? '',
      nameHi: product.nameHi ?? '',
      nameGu: product.nameGu ?? '',
      namePa: product.namePa ?? '',
      description: product.description,
      descriptionHi: product.descriptionHi ?? '',
      descriptionGu: product.descriptionGu ?? '',
      descriptionPa: product.descriptionPa ?? '',
      category: product.category,
      categoryHi: product.categoryHi ?? '',
      categoryGu: product.categoryGu ?? '',
      categoryPa: product.categoryPa ?? '',
      subCategory: product.subCategory ?? '',
      subCategoryHi: product.subCategoryHi ?? '',
      subCategoryGu: product.subCategoryGu ?? '',
      subCategoryPa: product.subCategoryPa ?? '',
      price: product.price,
      unit: product.unit,
      unitHi: product.unitHi ?? '',
      unitGu: product.unitGu ?? '',
      unitPa: product.unitPa ?? '',
      images: product.images ?? [],
      inStock: product.inStock ?? true,
      quantity: product.quantity ?? 0,
      seller: product.seller ?? { name: 'Unknown' },
      createdAt: new Date(product.createdAt).toISOString()
    })),
    pagination: buildPagination(page, limit, total)
  });
}

export async function getAdminProductById(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply
) {
  const product = await Product.findById(request.params.productId).lean();
  if (!product) {
    throw AppError.notFound('errNotFound', 'Product not found');
  }

  return reply.send({
    id: String(product._id),
    name: product.name,
    brand: product.brand ?? '',
    nameHi: product.nameHi ?? '',
    nameGu: product.nameGu ?? '',
    namePa: product.namePa ?? '',
    description: product.description,
    descriptionHi: product.descriptionHi ?? '',
    descriptionGu: product.descriptionGu ?? '',
    descriptionPa: product.descriptionPa ?? '',
    category: product.category,
    categoryHi: product.categoryHi ?? '',
    categoryGu: product.categoryGu ?? '',
    categoryPa: product.categoryPa ?? '',
    subCategory: product.subCategory ?? '',
    subCategoryHi: product.subCategoryHi ?? '',
    subCategoryGu: product.subCategoryGu ?? '',
    subCategoryPa: product.subCategoryPa ?? '',
    price: product.price,
    unit: product.unit,
    unitHi: product.unitHi ?? '',
    unitGu: product.unitGu ?? '',
    unitPa: product.unitPa ?? '',
    images: product.images ?? [],
    inStock: product.inStock ?? true,
    quantity: product.quantity ?? 0,
    seller: product.seller ?? { name: 'Unknown' },
    createdAt: new Date(product.createdAt).toISOString()
  });
}

export async function createAdminProduct(request: FastifyRequest, reply: FastifyReply) {
  const parsed = productBodySchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const slug = parsed.data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now();

  const productData = {
    ...parsed.data,
    slug,
    pricing: {
      price: parsed.data.price,
      unit: parsed.data.unit,
      stock: parsed.data.quantity
    }
  };

  const product = await Product.create(productData);

  await createAdminLog('system', 'Marketplace product created by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    productId: String(product._id),
    productName: product.name
  });

  return reply.status(201).send({
    message: 'Product created successfully',
    product: {
      id: String(product._id),
      name: product.name,
      price: product.price,
      inStock: product.inStock,
      category: product.category
    }
  });
}

export async function updateAdminProduct(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply
) {
  const parsed = productBodySchema.safeParse(request.body);
  if (!parsed.success) {
    throw AppError.badRequest('errInvalidInput', JSON.stringify(parsed.error.flatten().fieldErrors));
  }

  const productData = {
    ...parsed.data,
    pricing: {
      price: parsed.data.price,
      unit: parsed.data.unit,
      stock: parsed.data.quantity
    }
  };

  const product = await Product.findByIdAndUpdate(request.params.productId, productData, { new: true });
  if (!product) {
    throw AppError.notFound('errNotFound', 'Product not found');
  }

  await createAdminLog('system', 'Marketplace product updated by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    productId: String(product._id)
  });

  return reply.send({
    message: 'Product updated successfully',
    product: {
      id: String(product._id),
      name: product.name,
      price: product.price,
      inStock: product.inStock,
      category: product.category
    }
  });
}

export async function deleteAdminProduct(
  request: FastifyRequest<{ Params: { productId: string } }>,
  reply: FastifyReply
) {
  const product = await Product.findByIdAndDelete(request.params.productId);
  if (!product) {
    throw AppError.notFound('errNotFound', 'Product not found');
  }

  await createAdminLog('system', 'Marketplace product deleted by admin', {
    adminId: request.adminUser ? String(request.adminUser._id) : null,
    productId: String(product._id),
    productName: product.name
  });

  return reply.send({ message: 'Product deleted successfully' });
}
