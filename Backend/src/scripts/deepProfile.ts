import mongoose from 'mongoose';
import { env } from '../config/env';
import { ChatSessionModel } from '../chat/models/ChatSession.model';

async function deepProfile() {
  console.log('--- DEEP PROFILING ---');
  await mongoose.connect(env.MONGODB_URI);

  const TEST_FARMER_ID = '69bcec5152cb8c9cb79490f9';
  const farmerObjectId = new mongoose.Types.ObjectId(TEST_FARMER_ID);

  const totalCount = await ChatSessionModel.countDocuments({ farmerId: farmerObjectId });
  console.log(`Total sessions for user ${TEST_FARMER_ID}: ${totalCount}`);

  const activeCount = await ChatSessionModel.countDocuments({ farmerId: farmerObjectId, status: 'active' });
  console.log(`Active sessions for user: ${activeCount}`);

  // 1. Test query WITHOUT $or
  console.log('\n--- Test 1: Simple indexed query (No $or) ---');
  const start1 = Date.now();
  await ChatSessionModel.find({ farmerId: farmerObjectId, status: 'active' })
    .sort({ lastMessageAt: -1 })
    .limit(20)
    .lean();
  console.log(`Time: ${Date.now() - start1}ms`);

  // 2. Test query WITH $or (Original)
  console.log('\n--- Test 2: Query WITH $or ---');
  const query = {
    farmerId: farmerObjectId,
    status: 'active',
    $or: [
      { 'metadata.type': 'chat' },
      { 'metadata.type': { $exists: false } }
    ]
  };
  const start2 = Date.now();
  await ChatSessionModel.find(query)
    .sort({ lastMessageAt: -1 })
    .limit(20)
    .lean();
  console.log(`Time: ${Date.now() - start2}ms`);

  await mongoose.disconnect();
}

deepProfile().catch(console.error);
