import mongoose from 'mongoose';
import products from './products.json';
import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product';
import { logger } from '../utils/logger';

type SeedProduct = {
  _id: string;
  slug?: string;
  name: string;
  brand?: string;
  category: string;
  subCategory?: string;
  description: string;
  farmerFriendlyInfo?: {
    whyUse?: string;
    howToUse?: string;
    bestForCrops?: string[];
    resultTime?: string;
    safety?: string;
  };
  pricing?: {
    price?: number;
    discountPrice?: number;
    currency?: string;
    unit?: string;
    stock?: number;
    minOrderQty?: number;
  };
  images?: string[];
  ratings?: {
    average?: number;
    count?: number;
  };
  reviews?: Array<{
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
  inventory?: {
    available?: boolean;
    warehouseLocation?: string;
    deliveryTime?: string;
  };
  aiMetadata?: {
    tags?: string[];
    useCases?: string[];
    recommendedWith?: string[];
    season?: string[];
    soilType?: string[];
  };
  seller?: {
    name?: string;
    phone?: string;
    rating?: number;
    location?: string;
  };
};

function toObjectIdOrUndefined(value: string): mongoose.Types.ObjectId | undefined {
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : undefined;
}

async function seedProducts(): Promise<void> {
  await connectDB();

  try {
    for (const entry of products as SeedProduct[]) {
      const basePrice = entry.pricing?.discountPrice ?? entry.pricing?.price ?? 0;
      const baseUnit = entry.pricing?.unit ?? 'unit';
      const stock = entry.pricing?.stock ?? 0;
      const available = entry.inventory?.available ?? stock > 0;

      const objectId = toObjectIdOrUndefined(entry._id);
      const idFilter = objectId ? { _id: objectId } : { slug: entry.slug };
      const slugFilter = entry.slug ? { slug: entry.slug } : {};

      const updateDoc = {
        slug: entry.slug,
        brand: entry.brand,
        name: entry.name,
        description: entry.description,
        category: entry.category,
        subCategory: entry.subCategory,
        farmerFriendlyInfo: entry.farmerFriendlyInfo,
        pricing: {
          price: entry.pricing?.price ?? basePrice,
          discountPrice: entry.pricing?.discountPrice,
          currency: entry.pricing?.currency ?? 'INR',
          unit: baseUnit,
          stock,
          minOrderQty: entry.pricing?.minOrderQty ?? 1,
        },
        price: basePrice,
        unit: baseUnit,
        images: entry.images ?? [],
        ratings: {
          average: entry.ratings?.average ?? 0,
          count: entry.ratings?.count ?? 0,
        },
        reviews: (entry.reviews ?? []).map((review) => ({
          ...review,
          date: new Date(review.date),
        })),
        inventory: {
          available,
          warehouseLocation: entry.inventory?.warehouseLocation,
          deliveryTime: entry.inventory?.deliveryTime,
        },
        aiMetadata: entry.aiMetadata,
        seller: {
          name: entry.seller?.name ?? 'Anaaj Seller',
          phone: entry.seller?.phone,
          rating: entry.seller?.rating,
          location: entry.seller?.location,
        },
        inStock: available,
        quantity: stock,
      };

      await Product.findOneAndUpdate(
        { ...idFilter, ...slugFilter },
        { $set: updateDoc, ...(objectId ? { $setOnInsert: { _id: objectId } } : {}) },
        { upsert: true, new: true }
      );
    }

    logger.info({ count: products.length }, 'Product seed completed successfully');
  } catch (error) {
    logger.error({ err: error }, 'Product seed failed');
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

void seedProducts();
