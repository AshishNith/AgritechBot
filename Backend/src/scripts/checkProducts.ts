import mongoose from 'mongoose';
import { env } from '../config/env';
import { Product } from '../models/Product';

async function check() {
  await mongoose.connect(env.MONGODB_URI);
  const count = await Product.countDocuments();
  console.log(`--- PRODUCT COUNT IN DB: ${count} ---`);
  if (count > 0) {
    const first = await Product.findOne().lean();
    console.log('First product in DB:', JSON.stringify(first, null, 2));
  }
  await mongoose.disconnect();
}
check().catch(console.error);
