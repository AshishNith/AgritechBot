import * as fs from 'node:fs';
import * as path from 'node:path';
import { Product, IProduct } from '../models/Product';
import { logger } from '../utils/logger';

export interface ProductSearchFilters {
  category?: string;
  subCategory?: string;
  crops?: string[];
  season?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  tags?: string[];
  useCases?: string[];
  query?: string;
}

export interface ProductSearchResult {
  products: IProduct[];
  total: number;
  hasMore: boolean;
}

/**
 * Intelligent product search service for AI recommendations
 */
export class ProductSearchService {
  /**
   * Search products with multiple filters and relevance scoring
   */
  static async searchProducts(
    filters: ProductSearchFilters,
    limit: number = 10,
    offset: number = 0
  ): Promise<ProductSearchResult> {
    const query: Record<string, unknown> = {};

    // Stock filter
    if (filters.inStockOnly !== false) {
      query.inStock = true;
      query['inventory.available'] = { $ne: false };
    }

    // Category filters
    if (filters.category) {
      query.category = new RegExp(filters.category, 'i');
    }

    if (filters.subCategory) {
      query.subCategory = new RegExp(filters.subCategory, 'i');
    }

    // Crop-based filtering (only enforce if not a specific product name query search)
    if (filters.crops && filters.crops.length > 0 && !filters.query) {
      query['farmerFriendlyInfo.bestForCrops'] = {
        $in: filters.crops.map((crop) => new RegExp(crop, 'i')),
      };
    }

    // Season filtering
    if (filters.season && filters.season.length > 0) {
      query['aiMetadata.season'] = {
        $in: filters.season.map((s) => new RegExp(s, 'i')),
      };
    }

    // Price range
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) {
        (query.price as Record<string, unknown>).$gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        (query.price as Record<string, unknown>).$lte = filters.maxPrice;
      }
    }

    // Tags filtering (AI metadata)
    if (filters.tags && filters.tags.length > 0) {
      query['aiMetadata.tags'] = {
        $in: filters.tags.map((tag) => new RegExp(tag, 'i')),
      };
    }

    // Use cases filtering
    if (filters.useCases && filters.useCases.length > 0) {
      query['aiMetadata.useCases'] = {
        $in: filters.useCases.map((uc) => new RegExp(uc, 'i')),
      };
    }

    // Text search (name, description)
    if (filters.query) {
      query.$text = { $search: filters.query };
    }

    try {
      // Execute query with sorting and pagination
      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(filters.query ? { score: { $meta: 'textScore' } } : { 'ratings.average': -1, price: 1 })
          .skip(offset)
          .limit(limit)
          .select('-reviews -__v')
          .lean(),
        Product.countDocuments(query),
      ]);

      return {
        products: products as unknown as IProduct[],
        total,
        hasMore: total > offset + limit,
      };
    } catch (error) {
      logger.error({ err: error, filters }, 'Product search failed');
      return { products: [], total: 0, hasMore: false };
    }
  }

  /**
   * Get product recommendations based on farmer context and query
   */
  static async getRecommendations(params: {
    crops?: string[];
    season?: string;
    problem?: string;
    category?: string;
    query?: string;
    limit?: number;
  }): Promise<IProduct[]> {
    const filters: ProductSearchFilters = {
      inStockOnly: true,
    };

    const limit = params.limit || 5;

    // 1. Check if the query matches a product in the static knowledge base
    const staticProducts: any[] = [];
    if (params.query) {
      try {
        const kbPath = path.join(__dirname, '..', 'chat', 'data', 'knowledgeBase.json');
        const fileContent = fs.readFileSync(kbPath, 'utf8');
        const kb = JSON.parse(fileContent);
        const queryLower = params.query.toLowerCase();

        // Check in mayJuneProductGuide
        if (kb && Array.isArray(kb.mayJuneProductGuide)) {
          const match = kb.mayJuneProductGuide.find((p: any) => 
            p.product_name.toLowerCase().includes(queryLower) ||
            queryLower.includes(p.product_name.toLowerCase())
          );
          if (match) {
            staticProducts.push({
              _id: `mock-kb-${match.product_name.replace(/\s+/g, '-').toLowerCase()}`,
              name: match.product_name,
              brand: 'Anaaj.ai Verified',
              category: match.type.split(' ')[0],
              description: `${match.purpose}. Dosage: ${match.dose}. Method: ${match.application_method}. Timing: ${match.application_time}. PHI: ${match.safety_interval_phi}.`,
              price: 0,
              unit: 'Pack',
              inStock: true,
              ratings: { average: 5, count: 1 },
              farmerFriendlyInfo: {
                whyUse: match.purpose,
                howToUse: `Dose: ${match.dose}. Method: ${match.application_method}. PHI: ${match.safety_interval_phi}.`,
                bestForCrops: match.target_crops,
              },
              seller: { name: 'Anaaj.ai Partner', location: 'Punjab' },
            });
          }
        }

        // Check in biostadtProducts if no match yet
        if (staticProducts.length === 0 && kb && Array.isArray(kb.biostadtProducts)) {
          const match = kb.biostadtProducts.find((p: any) => 
            p.product_name.toLowerCase().includes(queryLower) ||
            queryLower.includes(p.product_name.toLowerCase())
          );
          if (match) {
            const cropsInfo = Array.isArray(match.crops_pests)
              ? match.crops_pests.map((cp: any) => `${cp.crop} (${cp.pest || 'all'}: ${cp.dose_gm_ha || cp.dose_ml_ha || ''} gm/ml per ha)`).join(', ')
              : '';
            const targetCropsList = Array.isArray(match.crops_pests)
              ? Array.from(new Set(match.crops_pests.map((cp: any) => cp.crop)))
              : (match.crops ? [match.crops] : []);

            staticProducts.push({
              _id: `mock-kb-${match.product_name.replace(/\s+/g, '-').toLowerCase()}`,
              name: match.product_name,
              brand: 'Biostadt',
              category: match.category,
              description: `${match.key_feature || ''}. Active: ${match.active_ingredient || ''}. Targets: ${cropsInfo}. Benefits: ${(match.benefits || []).join(', ')}.`,
              price: 0,
              unit: match.form || 'Pack',
              inStock: true,
              ratings: { average: 5, count: 1 },
              farmerFriendlyInfo: {
                whyUse: match.key_feature || '',
                howToUse: `Active: ${match.active_ingredient || ''}. Targets & Dosing: ${cropsInfo}. Dosing: ${match.dose || ''}. Method: ${match.application_method || 'foliar spray'}.`,
                bestForCrops: targetCropsList,
              },
              seller: { name: 'Biostadt Partner', location: 'Punjab' },
            });
          }
        }
      } catch (err) {
        logger.error({ err, query: params.query }, 'Failed to read/search knowledgeBase.json in recommendations');
      }
    }

    // Map problem to category/tags
    if (params.problem) {
      const problemLower = params.problem.toLowerCase();

      if (problemLower.includes('disease') || problemLower.includes('pest') || problemLower.includes('insect')) {
        filters.category = 'Pesticide';
        filters.tags = ['disease control', 'pest management'];
      } else if (problemLower.includes('fertilizer') || problemLower.includes('nutrition') || problemLower.includes('growth')) {
        filters.category = 'Fertilizer';
        filters.tags = ['nutrition', 'growth'];
      } else if (problemLower.includes('weed') || problemLower.includes('herbicide')) {
        filters.category = 'Herbicide';
        filters.tags = ['weed control'];
      } else if (problemLower.includes('seed')) {
        filters.category = 'Seed';
      }
    }

    // Override with specific category if provided
    if (params.category) {
      filters.category = params.category;
    }

    // Filter by crops
    if (params.crops && params.crops.length > 0) {
      filters.crops = params.crops;
    }

    // Filter by season
    if (params.season) {
      filters.season = [params.season];
    }

    if (params.query) {
      filters.query = params.query;
    }

    const result = await this.searchProducts(filters, limit);
    
    // Combine static products and DB search results (deduplicating by name)
    const combined = [...staticProducts];
    for (const p of result.products) {
      if (combined.length >= limit) break;
      if (!combined.some(cp => cp.name.toLowerCase() === p.name.toLowerCase())) {
        combined.push(p);
      }
    }

    return combined as unknown as IProduct[];
  }

  /**
   * Get related/complementary products
   */
  static async getRelatedProducts(productId: string, limit: number = 5): Promise<IProduct[]> {
    try {
      const product = await Product.findById(productId).lean();
      if (!product) return [];

      const filters: ProductSearchFilters = {
        category: product.category,
        inStockOnly: true,
      };

      // Use recommended products if available
      if (product.aiMetadata?.recommendedWith && product.aiMetadata.recommendedWith.length > 0) {
        const related = await Product.find({
          _id: { $ne: productId },
          $or: [
            { _id: { $in: product.aiMetadata.recommendedWith } },
            { name: { $in: product.aiMetadata.recommendedWith } },
          ],
          inStock: true,
        })
          .limit(limit)
          .select('-reviews -__v')
          .lean();

        if (related.length > 0) return related as unknown as IProduct[];
      }

      // Fallback to same category
      const result = await this.searchProducts(filters, limit);
      return result.products.filter((p) => p._id.toString() !== productId);
    } catch (error) {
      logger.error({ err: error, productId }, 'Related products fetch failed');
      return [];
    }
  }

  /**
   * Get top-rated products by category
   */
  static async getTopRated(category: string, limit: number = 10): Promise<IProduct[]> {
    try {
      const products = await Product.find({
        category: new RegExp(category, 'i'),
        inStock: true,
        'ratings.count': { $gte: 5 }, // At least 5 reviews
      })
        .sort({ 'ratings.average': -1 })
        .limit(limit)
        .select('-reviews -__v')
        .lean();

      return products as unknown as IProduct[];
    } catch (error) {
      logger.error({ err: error, category }, 'Top rated products fetch failed');
      return [];
    }
  }
}
