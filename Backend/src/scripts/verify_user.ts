import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Subscription } from '../models/Subscription';
import { logger } from '../utils/logger';

async function verifyUser() {
  await connectDB();
  const phone = '+919829479052';
  try {
    const user = await User.findOne({ phone });
    if (!user) {
      console.log(`❌ User with phone ${phone} NOT FOUND in User model`);
    } else {
      console.log('--- User Model ---');
      console.log(`Phone: ${user.phone}`);
      console.log(`Tier: ${user.subscriptionTier}`);
      console.log(`Limits: ${JSON.stringify(user.usageLimits, null, 2)}`);
      
      const sub = await Subscription.findOne({ userId: user._id });
      if (!sub) {
        console.log(`❌ Subscription record NOT FOUND for userId ${user._id}`);
      } else {
        console.log('\n--- Subscription Model ---');
        console.log(`Tier: ${sub.tier}`);
        console.log(`Status: ${sub.status}`);
        console.log(`Used: Chat(${sub.queriesUsed}), Scan(${sub.scansUsed})`);
        console.log(`Limits: Chat(${sub.features.chatLimit}), Scan(${sub.features.scanLimit})`);
        console.log(`End Date: ${sub.endDate}`);
      }
    }
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await disconnectDB();
  }
}

verifyUser();
