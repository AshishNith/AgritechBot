import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFarmerContext extends Document {
  farmerId: Types.ObjectId;
  contextString: string;
  lastBuiltAt: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const farmerContextSchema = new Schema<IFarmerContext>(
  {
    farmerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    contextString: {
      type: String,
      required: true,
    },
    lastBuiltAt: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

export const FarmerContextModel = mongoose.model<IFarmerContext>('FarmerContext', farmerContextSchema);
