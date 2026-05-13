import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { logger } from '../utils/logger';

async function upgradeUser() {
  await connectDB();
  const phone = '+919829479052';
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      console.log(`❌ User with phone ${phone} not found`);
      return;
    }

    // 1. Update User model
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          subscriptionTier: 'pro',
          'usageLimits.chatCount': 0,
          'usageLimits.scanCount': 0,
          'usageLimits.lastReset': new Date()
        } 
      }
    );

    // 2. Update Subscription model using findOneAndUpdate to bypass the pre('save') hook
    // The pre('save') hook in Subscription.ts resets features to defaults if 'tier' is modified.
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 10);

    const subUpdate = {
      tier: 'pro',
      status: 'active',
      endDate: endDate,
      queriesUsed: 0,
      scansUsed: 0,
      features: {
        chatLimit: 500,
        scanLimit: 100,
        voiceEnabled: true,
        prioritySupport: true,
        marketplaceAccess: true
      }
    };

    await Subscription.findOneAndUpdate(
      { userId: user._id },
      { $set: subUpdate },
      { upsert: true, new: true }
    );

    console.log(`✅ User ${phone} upgraded successfully (Bypassed pre-save hook)`);
    console.log(`📊 Custom Limits set: 500 chats, 100 scans.`);
  } catch (error) {
    console.error('❌ Upgrade failed:', error);
  } finally {
    await disconnectDB();
  }
}

upgradeUser();
