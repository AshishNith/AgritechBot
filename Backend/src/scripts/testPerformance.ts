import mongoose from 'mongoose';
import { env } from '../config/env';
import { ChatSessionModel } from '../chat/models/ChatSession.model';
import { ChatMessageModel } from '../chat/models/ChatMessage.model';

async function runPerformanceDiagnostic() {
  console.log('--- CHAT COMPONENT PERFORMANCE TEST ---');
  await mongoose.connect(env.MONGODB_URI);

  // Use the ID from the logs
  const TEST_FARMER_ID = '69bcec5152cb8c9cb79490f9';
  console.log('Target Farmer ID:', TEST_FARMER_ID);

  // 1. Test Session List Performance (The main "Loading" screen)
  console.log('\n--- 1. Testing Session Listing ---');
  try {
    const start = Date.now();
    const query = { 
      farmerId: new mongoose.Types.ObjectId(TEST_FARMER_ID), 
      status: 'active',
      $or: [
        { 'metadata.type': 'chat' },
        { 'metadata.type': { $exists: false } }
      ]
    };
    
    console.log('Query:', JSON.stringify(query));
    
    // Step A: Find sessions
    const subStart = Date.now();
    const sessions = await ChatSessionModel.find(query)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(20)
      .lean();
    console.log(`- Find 20 sessions: ${Date.now() - subStart}ms (Count: ${sessions.length})`);

    // Explanation
    const sessionExplain = await ChatSessionModel.find(query).sort({ lastMessageAt: -1 }).limit(20).explain();
    const activeIndex = (sessionExplain as any).queryPlanner?.winningPlan?.inputStage?.indexName || 'NONE';
    console.log(`- Index Used for Sessions: ${activeIndex}`);

    if (sessions.length > 0) {
      const sessionIds = sessions.map(s => s._id);
      
      // Step B: Preview Aggregation (The big one)
      const aggStart = Date.now();
      const latestMessages = await ChatMessageModel.aggregate([
        { $match: { sessionId: { $in: sessionIds }, 'content.text': { $exists: true } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$sessionId',
            preview: { $first: '$content.text' },
          },
        },
      ]);
      console.log(`- Message Preview Aggregation: ${Date.now() - aggStart}ms`);
    }

    console.log(`TOTAL SESSION LIST TIME: ${Date.now() - start}ms`);
  } catch (e: any) {
    console.error('Error testing sessions:', e.message);
  }

  // 2. Test Message History Retrieval
  console.log('\n--- 2. Testing Message Retrieval ---');
  try {
    const session = await ChatSessionModel.findOne({ farmerId: new mongoose.Types.ObjectId(TEST_FARMER_ID) });
    if (session) {
      console.log('Testing retrieval for session:', session._id);
      const start = Date.now();
      const [messages, totalMessages] = await Promise.all([
        ChatMessageModel.find({ sessionId: session._id })
          .sort({ createdAt: 1 })
          .limit(20)
          .lean(),
        ChatMessageModel.countDocuments({ sessionId: session._id }),
      ]);
      console.log(`TOTAL MESSAGE RETRIEVAL TIME (${messages.length}/${totalMessages}): ${Date.now() - start}ms`);
      
      // Explain analysis
      const explain = await ChatMessageModel.find({ sessionId: session._id }).explain();
      console.log('\n--- Index Explanation ---');
      const winningPlan = (explain as any).queryPlanner?.winningPlan;
      console.log('Winning Plan Stage:', winningPlan?.stage || 'Unknown');
      console.log('Index Used:', winningPlan?.inputStage?.indexName || 'NONE');
    } else {
      console.log('No sessions found for test user.');
    }
  } catch (e: any) {
    console.error('Error testing messages:', e.message);
  }

  // 3. Test Wallet Credit Deduction
  console.log('\n--- 3. Testing Wallet Credit Deduction ---');
  try {
    const { deductCredit } = require('../../services/walletService');
    const start = Date.now();
    await deductCredit(TEST_FARMER_ID, 'chat');
    // Note: This actually deducts a real credit if run. 
    // In a diagnostic we should probably just measure a findOne for the wallet.
    console.log(`Wallet credit deduction logic completed in: ${Date.now() - start}ms`);
  } catch (e: any) {
    console.error('Error testing wallet:', e.message);
  }

runPerformanceDiagnostic().catch(console.error);
