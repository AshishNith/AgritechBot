import mongoose, { Schema, Document } from 'mongoose';

export interface IUserCrop extends Document {
  userId: mongoose.Types.ObjectId;
  cropType: string;
  variety?: string;
  plantingDate: Date;
  landSize?: number;
  landUnit?: string;
  soilType?: string;
  currentStage: 'seedling' | 'growing' | 'flowering' | 'fruiting' | 'harvesting' | 'dormant';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isActive: boolean;
  assistantEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userCropSchema = new Schema<IUserCrop>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    cropType: { type: String, required: true },
    variety: { type: String },
    plantingDate: { type: Date, required: true },
    landSize: { type: Number },
    landUnit: { type: String, default: 'Acre' },
    soilType: { type: String },
    currentStage: {
      type: String,
      enum: ['seedling', 'growing', 'flowering', 'fruiting', 'harvesting', 'dormant'],
      default: 'seedling',
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
    },
    isActive: { type: Boolean, default: true },
    assistantEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

userCropSchema.index({ userId: 1, isActive: 1 });

export const UserCrop = mongoose.model<IUserCrop>('UserCrop', userCropSchema);
