import mongoose from 'mongoose';
import { env } from '../config/env';
import { ChatSessionModel } from '../chat/models/ChatSession.model';
import { ChatMessageModel } from '../chat/models/ChatMessage.model';

async function bulkMigrate() {
  console.log('--- BULK PREVIEW MIGRATION ---');
  await mongoose.connect(env.MONGODB_URI);

  const sessions = await ChatSessionModel.find({ 
    $or: [
      { 'metadata.lastMessagePreview': { $exists: false } },
      { 'metadata.lastMessagePreview': '' }
    ]
  }).limit(500);

  console.log(`Processing ${sessions.length} sessions in bulk...`);

  const updates = await Promise.all(sessions.map(async (session) => {
    const lastMessage = await ChatMessageModel.findOne({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .select('content.text')
      .lean();
    
    if (lastMessage && lastMessage.content?.text) {
      return {
        updateOne: {
          filter: { _id: session._id },
          update: { $set: { 'metadata.lastMessagePreview': lastMessage.content.text } }
        }
      };
    }
    return null;
  }));

  const bulkOps = updates.filter(op => op !== null);
  if (bulkOps.length > 0) {
    const result = await ChatSessionModel.bulkWrite(bulkOps as any);
    console.log(`Successfully updated ${result.modifiedCount} sessions.`);
  } else {
    console.log('No updates needed.');
  }

  await mongoose.disconnect();
}

bulkMigrate().catch(console.error);
