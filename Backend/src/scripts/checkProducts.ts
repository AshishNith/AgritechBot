import mongoose from 'mongoose';
import { env } from '../config/env';
import { Product } from '../models/Product';

async function check() {
  await mongoose.connect(env.MONGODB_URI);
  
  const totalCount = await Product.countDocuments();
  console.log(`\n=== DATABASE PRODUCT AUDIT ===`);
  console.log(`Total Products in DB: ${totalCount}\n`);

  const categories = ['Fertilizers', 'Seeds', 'Tools', 'Pesticides', 'General'];
  
  for (const cat of categories) {
    const count = await Product.countDocuments({ category: cat });
    console.log(`Category "${cat}": ${count} products`);
    
    const samples = await Product.find({ category: cat }).limit(3).lean();
    if (samples.length > 0) {
      console.log(`  Samples:`);
      samples.forEach(p => {
        console.log(`    - ${p.name} (Brand: ${p.brand}, SubCategory: ${p.subCategory ?? 'N/A'})`);
      });
    } else {
      console.log(`  No products in this category.`);
    }
    console.log();
  }

  await mongoose.disconnect();
}
check().catch(console.error);

