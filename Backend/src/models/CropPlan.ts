import mongoose, { Schema, Document } from 'mongoose';

export interface ICropPlan extends Document {
  userId: mongoose.Types.ObjectId;
  crop: string;
  location: {
    state: string;
    district: string;
  };
  inputData: {
    landSize: string;
    soilType?: string;
    waterAvailability: 'low' | 'medium' | 'high';
    budget?: string;
    farmingType: 'organic' | 'traditional' | 'hybrid';
  };
  generatedPlan: {
    crop: string;
    total_duration: string;
    stages: Array<{
      stage_name: string;
      duration: string;
      tasks: Array<{
        task: string;
        details: string;
        tools_required: string[];
        estimated_cost: string;
        tips: string;
      }>;
    }>;
    total_estimated_cost: string;
    expected_yield: string;
    profit_estimation: string;
    risk_alerts: string[];
    alternative_suggestions: {
      low_budget: string;
      high_budget: string;
    };
  };
  prompt?: string;
  responseText?: string;
  feedback?: 'good' | 'bad' | 'unrated';
  tokenUsage?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CropPlanSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    crop: { type: String, required: true },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true }
    },
    inputData: {
      landSize: { type: String, required: true },
      soilType: { type: String },
      waterAvailability: { type: String, enum: ['low', 'medium', 'high'], required: true },
      budget: { type: String },
      farmingType: { type: String, enum: ['organic', 'traditional', 'hybrid'], required: true }
    },
    generatedPlan: { type: Object, required: true },
    prompt: { type: String },
    responseText: { type: String },
    feedback: { type: String, enum: ['good', 'bad', 'unrated'], default: 'unrated' },
    tokenUsage: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

export const CropPlan = mongoose.model<ICropPlan>('CropPlan', CropPlanSchema);
