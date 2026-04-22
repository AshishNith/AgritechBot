import mongoose from 'mongoose';
import { env } from '../config/env';
import { ChatSessionModel } from '../chat/models/ChatSession.model';
import { ChatMessageModel } from '../chat/models/ChatMessage.model';

async function migratePreviews() {
  console.log('--- STARTING PREVIEW MIGRATION ---');
  await mongoose.connect(env.MONGODB_URI);

  const sessions = await ChatSessionModel.find({ 
    $or: [
      { 'metadata.lastMessagePreview': { $exists: false } },
      { 'metadata.lastMessagePreview': '' }
    ]
  });

  console.log(`Found ${sessions.length} sessions to update.`);

  for (const session of sessions) {
    const lastMessage = await ChatMessageModel.findOne({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .lean();
    
    if (lastMessage && lastMessage.content?.text) {
      await ChatSessionModel.updateOne(
        { _id: session._id },
        { $set: { 'metadata.lastMessagePreview': lastMessage.content.text } }
      );
    }
  }

  console.log('Migration complete.');
  await mongoose.disconnect();
}

migratePreviews().catch(console.error);
