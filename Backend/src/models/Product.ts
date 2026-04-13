import mongoose, { Schema, Document } from 'mongoose';

export interface IProductReview {
  user: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface IProduct extends Document {
  slug?: string;
  brand?: string;
  nameHi?: string;
  nameGu?: string;
  namePa?: string;
  description: string;
  descriptionHi?: string;
  descriptionGu?: string;
  descriptionPa?: string;
  category: string;
  categoryHi?: string;
  categoryGu?: string;
  categoryPa?: string;
  subCategory?: string;
  subCategoryHi?: string;
  subCategoryGu?: string;
  subCategoryPa?: string;
  farmerFriendlyInfo?: {
    whyUse?: string;
    whyUseHi?: string;
    whyUseGu?: string;
    whyUsePa?: string;
    howToUse?: string;
    howToUseHi?: string;
    howToUseGu?: string;
    howToUsePa?: string;
    bestForCrops?: string[];
    resultTime?: string;
    resultTimeHi?: string;
    resultTimeGu?: string;
    resultTimePa?: string;
    safety?: string;
    safetyHi?: string;
    safetyGu?: string;
    safetyPa?: string;
  };
  pricing?: {
    price: number;
    discountPrice?: number;
    currency?: string;
    unit?: string;
    stock?: number;
    minOrderQty?: number;
  };
  price: number;
  unit: string;
  unitHi?: string;
  unitGu?: string;
  unitPa?: string;
  images: string[];
  ratings?: {
    average?: number;
    count?: number;
  };
  reviews?: IProductReview[];
    available?: boolean;
    warehouseLocation?: string;
    deliveryTime?: string;
    deliveryTimeHi?: string;
    deliveryTimeGu?: string;
    deliveryTimePa?: string;
  };
  aiMetadata?: {
    tags?: string[];
    useCases?: string[];
    recommendedWith?: string[];
    season?: string[];
    soilType?: string[];
  };
  seller: {
    name: string;
    phone?: string;
    rating?: number;
    location?: string;
  };
  inStock: boolean;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, trim: true, index: true, sparse: true, unique: true },
    brand: { type: String, trim: true },
    nameHi: { type: String, trim: true },
    nameGu: { type: String, trim: true },
    namePa: { type: String, trim: true },
    description: { type: String, required: true },
    descriptionHi: { type: String },
    descriptionGu: { type: String },
    descriptionPa: { type: String },
    category: {
      type: String,
      required: true,
      index: true,
    },
    categoryHi: { type: String },
    categoryGu: { type: String },
    categoryPa: { type: String },
    subCategory: { type: String, trim: true, index: true },
    subCategoryHi: { type: String },
    subCategoryGu: { type: String },
    subCategoryPa: { type: String },
    farmerFriendlyInfo: {
      whyUse: { type: String },
      whyUseHi: { type: String },
      whyUseGu: { type: String },
      whyUsePa: { type: String },
      howToUse: { type: String },
      howToUseHi: { type: String },
      howToUseGu: { type: String },
      howToUsePa: { type: String },
      bestForCrops: [{ type: String }],
      resultTime: { type: String },
      resultTimeHi: { type: String },
      resultTimeGu: { type: String },
      resultTimePa: { type: String },
      safety: { type: String },
      safetyHi: { type: String },
      safetyGu: { type: String },
      safetyPa: { type: String },
    },
    pricing: {
      price: { type: Number, min: 0 },
      discountPrice: { type: Number, min: 0 },
      currency: { type: String, default: 'INR' },
      unit: { type: String },
      stock: { type: Number, min: 0 },
      minOrderQty: { type: Number, min: 1, default: 1 },
    },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, default: 'kg' },
    unitHi: { type: String },
    unitGu: { type: String },
    unitPa: { type: String },
    images: [String],
    ratings: {
      average: { type: Number, min: 0, max: 5, default: 0 },
      count: { type: Number, min: 0, default: 0 },
    },
    reviews: [
      {
        user: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        date: { type: Date, required: true },
      },
    ],
    inventory: {
      available: { type: Boolean, default: true },
      warehouseLocation: { type: String },
      deliveryTime: { type: String },
      deliveryTimeHi: { type: String },
      deliveryTimeGu: { type: String },
      deliveryTimePa: { type: String },
    },
    aiMetadata: {
      tags: [{ type: String }],
      useCases: [{ type: String }],
      recommendedWith: [{ type: String }],
      season: [{ type: String }],
      soilType: [{ type: String }],
    },
    seller: {
      name: { type: String, required: true },
      phone: { type: String },
      rating: { type: Number, min: 0, max: 5 },
      location: String,
    },
    inStock: { type: Boolean, default: true },
    quantity: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, subCategory: 1, inStock: 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
