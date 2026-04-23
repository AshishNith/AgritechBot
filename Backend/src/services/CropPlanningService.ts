import { queryLLM } from './ai/llmRouter';
import { logger } from '../utils/logger';

export interface CropPlanInput {
  crop: string;
  location: {
    state: string;
    district: string;
  };
  landSize: string;
  soilType?: string;
  waterAvailability: 'low' | 'medium' | 'high';
  budget?: string;
  farmingType: 'organic' | 'traditional' | 'hybrid';
}

export class CropPlanningService {
  static async generatePlan(input: CropPlanInput) {
    const prompt = `
      You are a senior agricultural consultant and agronomist at Anaaj.ai.
      Generate a professional, structured, and scientifically accurate step-by-step farming plan.
      
      User Inputs:
      - Crop: ${input.crop}
      - Location: ${input.district}, ${input.state}
      - Land Size: ${input.landSize}
      - Soil Type: ${input.soilType || 'Not specified'}
      - Water Availability: ${input.waterAvailability}
      - Budget: ${input.budget || 'Standard'}
      - Farming Type: ${input.farmingType}

      Consider the regional climate of ${input.district}, ${input.state} for the current season.
      
      Return the response in STRICT JSON format:
      {
        "crop": "${input.crop}",
        "total_duration": "e.g., 4 months",
        "stages": [
          {
            "stage_name": "Land Preparation",
            "duration": "1-2 weeks",
            "tasks": [
              {
                "task": "Plowing",
                "details": "Deep plowing to aerate soil...",
                "tools_required": ["Tractor", "Plough"],
                "estimated_cost": "₹2000 per acre",
                "tips": "Ensure soil is dry before plowing."
              }
            ]
          },
          { "stage_name": "Sowing", ... },
          { "stage_name": "Irrigation", ... },
          { "stage_name": "Fertilization", ... },
          { "stage_name": "Pest Control", ... },
          { "stage_name": "Harvesting", ... }
        ],
        "total_estimated_cost": "Total ₹X",
        "expected_yield": "X tons/acre",
        "profit_estimation": "₹Y per acre",
        "risk_alerts": ["Heavy rain during harvest", "Aphid attack risk"],
        "alternative_suggestions": {
          "low_budget": "Use organic manure instead of complex fertilizers",
          "high_budget": "Install drip irrigation and use hybrid high-yield seeds"
        }
      }

      CRITICAL: Ensure the plan is localized to ${input.state} and specific to ${input.farmingType} farming.
      Only return the JSON object. No markdown, no text.
    `;

    try {
      const response = await queryLLM([{ role: 'user', content: prompt }]);
      const cleanedContent = response.content.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedContent);
    } catch (error: any) {
      logger.error({ error: error.message, input }, 'Crop Plan generation failed');
      throw new Error('Failed to generate crop plan. Please try again.');
    }
  }
}
