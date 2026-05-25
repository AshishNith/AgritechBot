import mongoose from 'mongoose';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product';
import { logger } from '../utils/logger';

async function seedProductsInventory() {
  await connectDB();
  logger.info('Connected to MongoDB for product inventory seeding...');

  try {
    const mdPath = path.join(__dirname, '..', '..', 'knowledge', 'New Data', 'products.md');
    if (!fs.existsSync(mdPath)) {
      throw new Error(`Markdown file not found at: ${mdPath}`);
    }

    const content = fs.readFileSync(mdPath, 'utf8');
    const lines = content.split('\n');
    
    let isTable2 = false;
    let seededCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line.startsWith('|')) continue;

      const parts = line.split('|').map(p => p.trim());
      // parts[0] is empty because of leading '|'
      // parts[1] is S.No.
      // parts[2] is Title / Product Name

      const serialStr = parts[1];
      const productName = parts[2];

      // Skip header rows and formatting rows
      if (!serialStr || !productName) continue;
      if (serialStr.includes('S.No.') || serialStr.includes('---')) continue;
      if (productName.includes('Title') || productName.includes('Product Name') || productName.includes('---')) {
        continue;
      }

      // Check if we have transitioned to Table 2
      if (line.includes('Product Name') || line.includes('Sub-Category')) {
        isTable2 = true;
        continue;
      }

      let category = 'General';
      let brand = 'Generic';
      let subCategory = '';

      if (!isTable2) {
        // Table 1 Format:
        // parts[2] = Title
        // parts[4] = Company
        // parts[5] = Category
        brand = parts[4] || 'Generic';
        category = parts[5] || 'General';
      } else {
        // Table 2 Format:
        // parts[2] = Product Name
        // parts[3] = Category
        // parts[4] = Sub-Category
        category = parts[3] || 'General';
        subCategory = parts[4] || '';
        
        // Parse company name from product name if possible, e.g. "0:52:34 ( 25 X 1 KG )- DAYAL"
        const dashIndex = productName.lastIndexOf('-');
        if (dashIndex !== -1) {
          brand = productName.substring(dashIndex + 1).trim();
        }
      }

      // Normalize category (capitalize first letter)
      category = category.trim();
      if (category.toLowerCase() === 'insecticide') category = 'Pesticide';
      if (category.toLowerCase() === 'weedicide') category = 'Herbicide';
      category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

      const slug = productName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      // Parse unit and size from product name if possible
      let unit = 'unit';
      const sizeMatch = productName.match(/(\d+(?:\.\d+)?\s*(?:ml|kg|gm|ltr|ltrs|pcs|pc|g|mg))/i);
      if (sizeMatch) {
        unit = sizeMatch[1].toLowerCase();
      }

      const updateDoc = {
        name: productName,
        slug: slug + '-' + Math.floor(Math.random() * 1000), // Append random ID to prevent unique slug collisions
        brand: brand,
        description: `A premium agricultural ${category} product: ${productName}. Brand: ${brand}.`,
        category: category,
        subCategory: subCategory || undefined,
        pricing: {
          price: 0,
          currency: 'INR',
          unit: unit,
          stock: 100,
          minOrderQty: 1,
        },
        price: 0,
        unit: unit,
        images: [],
        ratings: {
          average: 4.5,
          count: 5,
        },
        inventory: {
          available: true,
          warehouseLocation: 'Main Warehouse',
          deliveryTime: '2-3 days',
        },
        seller: {
          name: 'Anaaj.ai Partner',
          location: 'Punjab',
        },
        inStock: true,
        quantity: 100,
      };

      await Product.findOneAndUpdate(
        { name: productName },
        { $set: updateDoc },
        { upsert: true, new: true }
      );
      seededCount++;
    }

    logger.info({ seededCount }, 'Seeding completed for all product inventory items!');
  } catch (error: any) {
    logger.error({ err: error.message }, 'Failed to seed product inventory items');
  } finally {
    await disconnectDB();
  }
}

seedProductsInventory();
