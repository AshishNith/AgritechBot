import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { sendChatMessage } from '../chat/services/geminiChat.service';
import { User } from '../models/User';
import { ChatSessionModel } from '../chat/models/ChatSession.model';
import { initializeKnowledgeBaseCache, stopKnowledgeBaseCacheRefresh } from '../chat/services/knowledgeBase.service';

async function testContext() {
  console.log('--- Connecting to DB ---');
  await connectDB();

  try {
    // 1. Initialize context cache (loads knowledgeBase.json)
    console.log('--- Warming up knowledge base cache ---');
    await initializeKnowledgeBaseCache();

    // 2. Find or create a test user
    console.log('--- Finding or creating test user ---');
    let user = await User.findOne({ phone: '+919999999999' });
    if (!user) {
      user = await User.create({
        phone: '+919999999999',
        name: 'Test Farmer',
        isVerified: true,
        language: 'Hindi',
        location: 'Punjab',
        crops: ['paddy'],
      });
    }
    const farmerId = String(user._id);

    // 3. Create a test session
    console.log('--- Creating test session ---');
    const session = await ChatSessionModel.create({
      farmerId: user._id,
      title: 'Context Test Session',
    });
    const sessionId = String(session._id);

    // 4. Query about the new context
    const query1 = 'What is the dosage and purpose of the fungicide Roko in Paddy?';
    console.log(`\nUser Query 1: "${query1}"`);
    console.log('Sending message to AI assistant...');
    
    let start = Date.now();
    let result = await sendChatMessage({
      farmerId,
      sessionId,
      text: query1,
      preferredLanguage: 'English',
    });
    console.log(`Response 1 received in ${Date.now() - start}ms:`);
    console.log('--------------------------------------------------');
    console.log(result.response);
    console.log('--------------------------------------------------');

    const query2 = 'According to the mayJuneProductGuide, what is the dosage, method of application, and safety interval (PHI) for the herbicide Dhaman?';
    console.log(`\nUser Query 2: "${query2}"`);
    console.log('Sending message to AI assistant...');
    
    start = Date.now();
    result = await sendChatMessage({
      farmerId,
      sessionId,
      text: query2,
      preferredLanguage: 'English',
    });
    console.log(`Response 2 received in ${Date.now() - start}ms:`);
    console.log('--------------------------------------------------');
    console.log(result.response);
    console.log('--------------------------------------------------');
    console.log('Cached Content Used (Context Caching):', result.cached);
    if (result.recommendedProducts) {
      console.log('Recommended Products:', result.recommendedProducts.map(p => p.name));
    }

    const query3 = 'What is the benefit of PM-KISAN government scheme as per the database?';
    console.log(`\nUser Query 3: "${query3}"`);
    console.log('Sending message to AI assistant...');
    
    start = Date.now();
    result = await sendChatMessage({
      farmerId,
      sessionId,
      text: query3,
      preferredLanguage: 'English',
    });
    console.log(`Response 3 received in ${Date.now() - start}ms:`);
    console.log('--------------------------------------------------');
    console.log(result.response);
    console.log('--------------------------------------------------');
    
    // Cleanup the test session to keep the DB clean
    await ChatSessionModel.deleteOne({ _id: session._id });
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    stopKnowledgeBaseCacheRefresh();
    await disconnectDB();
    console.log('--- DB Disconnected ---');
  }
}

testContext();
