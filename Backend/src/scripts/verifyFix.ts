import mongoose from 'mongoose';
import { env } from '../config/env';
import { ChatSessionModel } from '../chat/models/ChatSession.model';

async function verifyOptimization() {
  console.log('--- VERIFYING SESSION LIST OPTIMIZATION ---');
  await mongoose.connect(env.MONGODB_URI);

  const TEST_FARMER_ID = '69bcec5152cb8c9cb79490f9';
  const farmerObjectId = new mongoose.Types.ObjectId(TEST_FARMER_ID);

  const query = {
    farmerId: farmerObjectId,
    status: 'active',
    $or: [
      { 'metadata.type': 'chat' },
      { 'metadata.type': { $exists: false } }
    ]
  };

  console.log('Running optimized session listing...');
  const start = Date.now();
  const sessions = await ChatSessionModel.find(query)
    .sort({ lastMessageAt: -1 })
    .limit(20)
    .lean();
  const duration = Date.now() - start;

  console.log(`- Find 20 sessions: ${duration}ms (Count: ${sessions.length})`);

  const explain = await ChatSessionModel.find(query).sort({ lastMessageAt: -1 }).limit(20).explain();
  const indexUsed = (explain as any).queryPlanner?.winningPlan?.inputStage?.indexName ||
    (explain as any).queryPlanner?.winningPlan?.inputStage?.inputStage?.indexName || 'NONE';

  console.log(`- Index Used: ${indexUsed}`);

  if (duration < 500) {
    console.log('✅ SUCCESS: Performance within targets.');
  } else {
    console.log('❌ FAILURE: Performance still slow.');
  }

  await mongoose.disconnect();
}

verifyOptimization().catch(console.error);
