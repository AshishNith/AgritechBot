import mongoose, { Document, Schema } from 'mongoose';

export interface ICrop extends Document {
  name: string;
  soilType: string;
  climate: string;
  growthStages: string[];
  schedule: string[];
  createdAt: Date;
  updatedAt: Date;
}

const cropSchema = new Schema<ICrop>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    soilType: { type: String, required: true, trim: true },
    climate: { type: String, required: true, trim: true },
    growthStages: [{ type: String, trim: true }],
    schedule: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

cropSchema.index({ name: 1 });

export const Crop = mongoose.model<ICrop>('Crop', cropSchema);

