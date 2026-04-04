# Anaaj AI — Subscription System Implementation Prompts
# Step-by-step. Ek step complete karo, tab agla karo.
# Har prompt ek AI session ke liye complete aur self-contained hai.

---

## CONTEXT (Har prompt ke saath yeh info share karo)

**Tech Stack:**
- Backend: Node.js + Fastify + TypeScript + MongoDB (Mongoose) + Redis
- Mobile App: React Native + Expo + TypeScript + Zustand + TanStack Query
- Payments: Razorpay (India)

**Current codebase structure:**
```
AgritechBot/
├── Backend/src/
│   ├── models/Subscription.ts     ← tier: free|basic|premium, queriesUsed, scansUsed
│   ├── models/User.ts             ← subscriptionTier, usageLimits.chatCount/scanCount
│   ├── services/subscriptionService.ts  ← checkLimit(), incrementUsage()
│   ├── middlewares/usageEnforcement.middleware.ts
│   ├── controllers/paymentController.ts ← processDummyPayment() exists
│   ├── services/payments/razorpay.ts    ← createRazorpayOrder(), verifyRazorpaySignature()
│   └── routes/paymentRoutes.ts          ← currently all commented out
│
└── Mobile App/src/
    ├── store/useWalletStore.ts     ← NEW (already created, has PLAN_CONFIGS, CHAT/SCAN_TOPUP_PACKS)
    ├── hooks/useWallet.ts          ← NEW (already created)
    ├── components/PaywallBottomSheet.tsx  ← NEW (already created)
    ├── components/WalletCreditBadge.tsx   ← NEW (already created)
    ├── screens/SubscriptionScreen.tsx     ← UPDATED (Plans tab + Topup tab)
    ├── api/services.ts             ← getWallet(), deductChatCredit(), etc. added
    └── types/api.ts                ← Wallet, TopupPack, PlanConfig types added
```

**New Plans (from design doc):**
- Free: 10 chats, 1 scan, no topup, no rollover
- Kisan Basic (₹149): 50 chats, 3 scans, topup allowed, no rollover
- Kisan Pro (₹199): 100 chats, 10 scans, topup allowed, 7-day rollover, mandi alerts

**Topup packs:**
- Chat: 10@₹49, 25@₹99, 60@₹199
- Scan: 1@₹29, 3@₹69, 10@₹179

**Credit priority rule:** Topup credits pehle katenge, phir plan credits.

---

---

# STEP 1 — Backend: Wallet Model banana

**Yeh karo:** Ek naya `Wallet` Mongoose model banao jo design doc ke anusaar sab fields store kare.

**AI ko do yeh files:**
- `Backend/src/models/Subscription.ts` (existing — reference ke liye)
- `Backend/src/models/User.ts` (existing — reference ke liye)
- `Backend/src/config/db.ts` (existing — DB connection)

**Prompt:**

```
I am building a subscription + wallet system for Anaaj AI (an agritech app for Indian farmers).

Here are the existing files for context:
[paste Subscription.ts]
[paste User.ts]

Task: Create a NEW file `Backend/src/models/Wallet.ts` with a Mongoose schema.

The Wallet model must have these exact fields:
- userId: ObjectId (ref: 'User', unique, required, indexed)
- chatCredits: number (plan chat credits remaining, default 10)
- imageCredits: number (plan scan credits remaining, default 1)
- topupCredits: number (extra chat credits from topup packs, never expire, default 0)
- topupImageCredits: number (extra scan credits from topup packs, default 0)
- plan: string enum ['free', 'basic', 'pro'] (default 'free')
- planExpiry: Date (null for free plan)
- razorpaySubId: string (optional, Razorpay subscription ID)
- totalChatsUsed: number (lifetime total, default 0)
- totalScansUsed: number (lifetime total, default 0)
- lastReset: Date (when plan credits were last reset)

Add a static method `Wallet.ensureForUser(userId)` that:
- Finds existing wallet OR creates a new one with free plan defaults
- Returns the wallet document

Add an instance method `wallet.deduct(type: 'chat' | 'scan')` that:
- IMPORTANT: deduct from topupCredits/topupImageCredits FIRST, then chatCredits/imageCredits
- Increments totalChatsUsed or totalScansUsed
- Throws Error('NO_CREDITS') if both topup AND plan credits are 0
- Saves and returns updated wallet

Export: `Wallet` model and `IWallet` interface.

Also export a const `PLAN_LIMITS` object:
{
  free:  { chatCredits: 10,  imageCredits: 1,  topupAllowed: false, rolloverDays: 0 },
  basic: { chatCredits: 50,  imageCredits: 3,  topupAllowed: true,  rolloverDays: 0 },
  pro:   { chatCredits: 100, imageCredits: 10, topupAllowed: true,  rolloverDays: 7 },
}

Use TypeScript. Use Mongoose v8 patterns (same as existing code).
```

**Verify karo ki step complete hua:**
- [ ] `Backend/src/models/Wallet.ts` file bani
- [ ] `ensureForUser()` static method hai
- [ ] `deduct()` method topup-first logic follow karta hai
- [ ] `PLAN_LIMITS` export hai

---

---

# STEP 2 — Backend: Wallet Service + API endpoints

**Yeh karo:** Wallet ke liye service layer aur 3 API endpoints banao.

**AI ko do yeh files:**
- `Backend/src/models/Wallet.ts` (step 1 se)
- `Backend/src/services/subscriptionService.ts` (existing)
- `Backend/src/middlewares/authMiddleware.ts` (existing)
- `Backend/src/routes/userRoutes.ts` (existing)

**Prompt:**

```
I am adding a Wallet system to Anaaj AI backend (Fastify + TypeScript + MongoDB).

Existing files for context:
[paste Wallet.ts from Step 1]
[paste subscriptionService.ts]
[paste authMiddleware.ts]
[paste userRoutes.ts]

Task 1: Create `Backend/src/services/walletService.ts` with these functions:

1. `getWallet(userId: string): Promise<IWallet>`
   - Calls Wallet.ensureForUser(userId)
   - Returns the wallet

2. `deductCredit(userId: string, type: 'chat' | 'scan'): Promise<IWallet>`
   - Gets wallet, calls wallet.deduct(type)
   - If throws NO_CREDITS: re-throw as { code: 'NO_CREDITS', type }
   - Returns updated wallet

3. `addPlanCredits(userId: string, plan: 'basic' | 'pro'): Promise<IWallet>`
   - Updates wallet: set plan, set chatCredits and imageCredits from PLAN_LIMITS
   - Set planExpiry = 30 days from now
   - Set lastReset = now
   - Does NOT touch topupCredits (they are safe)
   - Returns updated wallet

4. `addTopupCredits(userId: string, type: 'chat' | 'scan', amount: number): Promise<IWallet>`
   - Increments topupCredits OR topupImageCredits
   - Returns updated wallet

5. `resetPlanCredits(userId: string): Promise<IWallet>`
   - Only resets chatCredits + imageCredits from PLAN_LIMITS[wallet.plan]
   - topupCredits untouched
   - Updates lastReset = now
   - Returns updated wallet

Task 2: Create `Backend/src/controllers/walletController.ts` with:

1. `getWalletHandler` — GET handler
   - Calls getWallet(userId)
   - Returns { wallet }

2. `deductCreditHandler` — POST handler
   - Body: { type: 'chat' | 'scan' }
   - Validates type
   - Calls deductCredit()
   - On NO_CREDITS: return 402 with { error: 'NO_CREDITS', upgradeRequired: true }
   - Returns { wallet }

Task 3: Add these routes to `Backend/src/routes/userRoutes.ts`:
- GET  /api/user/wallet          → getWalletHandler
- POST /api/user/wallet/deduct   → deductCreditHandler

Both routes must use existing authMiddleware (already applied as hook in userRoutes).

Use TypeScript. Follow same patterns as existing controllers (FastifyRequest, FastifyReply).
```

**Verify:**
- [ ] `walletService.ts` bani with all 5 functions
- [ ] `walletController.ts` bani with 2 handlers
- [ ] Routes added to `userRoutes.ts`
- [ ] `GET /api/user/wallet` kaam karta hai (Postman se test karo)

---

---

# STEP 3 — Backend: Wallet auto-create on registration

**Yeh karo:** Jab naya user register kare (OTP verify), automatically wallet create ho.

**AI ko do yeh files:**
- `Backend/src/controllers/authController.ts` (existing)
- `Backend/src/models/Wallet.ts` (step 1 se)
- `Backend/src/services/walletService.ts` (step 2 se)

**Prompt:**

```
In Anaaj AI backend, when a new user registers (OTP verification), I need to automatically create a Wallet for them with free plan defaults.

Existing files:
[paste authController.ts]
[paste Wallet.ts]
[paste walletService.ts]

Task: In `authController.ts`, find the OTP verification handler (verifyOtp or similar).
After the user is created or found for the first time, add:

  await Wallet.ensureForUser(userId.toString());

This should:
- Only run if it's a NEW user (first login / registration)
- Be wrapped in try/catch — if wallet creation fails, DON'T block the auth response
- Log a warning if it fails: logger.warn({ userId }, 'Failed to create initial wallet')

Also check: if there's an existing `Subscription.create()` call for new users in authController or subscriptionService, make sure the wallet creation happens alongside it (not instead of it — keep Subscription model for backwards compatibility for now).

Show me the minimal diff / the updated section of authController.ts only.
```

**Verify:**
- [ ] New user register karo → wallet document MongoDB mein bana
- [ ] `GET /api/user/wallet` se free plan wallet milta hai

---

---

# STEP 4 — Backend: Razorpay Subscription Order endpoint

**Yeh karo:** Real Razorpay order create karne ka endpoint banao (subscription ke liye).

**AI ko do yeh files:**
- `Backend/src/services/payments/razorpay.ts` (existing — has createRazorpayOrder, verifyRazorpaySignature)
- `Backend/src/controllers/paymentController.ts` (existing)
- `Backend/src/routes/paymentRoutes.ts` (existing — all commented)
- `Backend/src/config/env.ts` (existing)

**Prompt:**

```
I am implementing real Razorpay payments for Anaaj AI subscription system.

Existing files:
[paste razorpay.ts]
[paste paymentController.ts]
[paste paymentRoutes.ts]
[paste env.ts]

Plan prices:
- basic: ₹149/month  → 14900 paise
- pro:   ₹199/month  → 19900 paise

Topup pack prices:
- chat_10: ₹49   → 4900 paise
- chat_25: ₹99   → 9900 paise  
- chat_60: ₹199  → 19900 paise
- scan_1:  ₹29   → 2900 paise
- scan_3:  ₹69   → 6900 paise
- scan_10: ₹179  → 17900 paise

Task 1: Add to `paymentController.ts`:

Handler `createSubscriptionOrderHandler`:
- Auth required (userId from request.user)
- Body: { tier: 'basic' | 'pro' }
- Validates tier
- Calls createRazorpayOrder({ amount: tierPrice, currency: 'INR', receipt: `sub_${userId}_${Date.now()}`, notes: { userId, tier } })
- Returns { orderId: order.id, amount: order.amount, currency: 'INR', keyId: env.RAZORPAY_KEY_ID }

Handler `createTopupOrderHandler`:
- Body: { packId: string }
- Validate packId against known packs
- Call createRazorpayOrder with correct amount
- Returns same shape as above + { packId, packType: 'chat'|'scan', credits: number }

Handler `verifyPaymentHandler`:
- Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, purpose: 'subscription'|'topup', tier?, packId? }
- Call verifyRazorpaySignature() — if false: return 400 { error: 'INVALID_SIGNATURE' }
- If purpose === 'subscription': call walletService.addPlanCredits(userId, tier)
- If purpose === 'topup': call walletService.addTopupCredits(userId, packType, credits)
- Returns { success: true, wallet: updatedWallet }

Task 2: Uncomment and update `paymentRoutes.ts`:
- POST /api/payment/subscription-order  → createSubscriptionOrderHandler (auth required)
- POST /api/payment/topup-order         → createTopupOrderHandler (auth required)
- POST /api/payment/verify              → verifyPaymentHandler (auth required)

Use TypeScript. Handle errors with try/catch and proper HTTP status codes.
IMPORTANT: If env.PAYMENTS_ENABLED is false, createSubscriptionOrderHandler and createTopupOrderHandler should return 503 { error: 'Payments not enabled' }.
```

**Verify:**
- [ ] `POST /api/payment/subscription-order` Razorpay order return karta hai
- [ ] `POST /api/payment/verify` signature check karta hai + wallet update karta hai
- [ ] Agar `PAYMENTS_ENABLED=false` toh 503 milta hai

---

---

# STEP 5 — Backend: Usage enforcement middleware update

**Yeh karo:** Existing middleware ko Wallet model se connect karo (currently Subscription model use karta hai).

**AI ko do yeh files:**
- `Backend/src/middlewares/usageEnforcement.middleware.ts` (existing)
- `Backend/src/services/walletService.ts` (step 2 se)
- `Backend/src/models/Wallet.ts` (step 1 se)

**Prompt:**

```
I need to update the usage enforcement middleware in Anaaj AI to use the new Wallet model instead of (or alongside) the old Subscription model.

Existing middleware:
[paste usageEnforcement.middleware.ts]

New wallet service:
[paste walletService.ts]

Current behavior: checks Subscription model for queriesUsed/scansUsed.
New behavior: check Wallet model total credits (chatCredits + topupCredits for chat, imageCredits + topupImageCredits for scan).

Task: Update `usageEnforcement.middleware.ts`:

1. Import walletService
2. In the middleware, after getting userId:
   - Call walletService.getWallet(userId)
   - For type 'chat': totalCredits = wallet.chatCredits + wallet.topupCredits
   - For type 'scan': totalCredits = wallet.imageCredits + wallet.topupImageCredits
   - If totalCredits <= 0: return 402 (not 403) with:
     {
       error: 'NO_CREDITS',
       message: 'Aapke credits khatam ho gaye. Topup ya subscribe karo.',
       code: 'NO_CREDITS',
       upgradeRequired: true,
       limitType: type,
     }
   - If totalCredits > 0: call next() (allow the request)

3. Keep the old Subscription check as a fallback (if wallet not found, fall back to old behavior).

4. DO NOT increment usage here — that happens separately in walletController.deductCreditHandler.

Show the complete updated middleware file.
```

**Verify:**
- [ ] Chat karne ki koshish karo jab wallet empty ho → 402 milna chahiye
- [ ] Normal user chat kare → request pass ho

---

---

# STEP 6 — Backend: Monthly reset Cron job

**Yeh karo:** Har 1 tarikh ko subscription credits reset karne ka cron job banao.

**AI ko do yeh files:**
- `Backend/src/services/walletService.ts` (step 2 se)
- `Backend/src/models/Wallet.ts` (step 1 se)
- `Backend/src/server.ts` ya `app.ts` (existing — server startup file)

**Prompt:**

```
I need a monthly credit reset job for Anaaj AI wallet system.

Reset logic:
- Run every day at midnight (check which wallets need reset)
- A wallet needs reset if: plan is 'basic' or 'pro' AND planExpiry > now (still active) AND lastReset was > 28 days ago
- Reset = set chatCredits and imageCredits back to PLAN_LIMITS[plan] values
- DO NOT touch topupCredits or topupImageCredits
- Update lastReset = now
- For 'pro' plan with rollover (7 days): if remaining chatCredits > 0, carry over up to 7 days worth (but cap at plan limit). Simplification: rollover = min(remaining, planLimit * 0.25) added to new credits, capped at planLimit.

Existing files:
[paste walletService.ts]
[paste Wallet.ts]
[paste server.ts or app.ts]

Task 1: Add to `walletService.ts`:

`async function runMonthlyReset(): Promise<{ resetCount: number }>`
- Find all wallets where plan != 'free' AND planExpiry > now AND lastReset < (now - 28 days)
- For each: call resetPlanCredits(userId)  [already exists from Step 2]
- For 'pro' plan: add rollover credits (max 25% of plan limit, capped at plan limit)
- Log each reset: logger.info({ userId, plan }, 'Monthly credits reset')
- Return count of wallets reset

Task 2: In `server.ts` (or wherever server starts), add a simple setInterval:
- Run every 24 hours (24 * 60 * 60 * 1000 ms)
- Call runMonthlyReset()
- Log results or errors
- NOTE: For production, use a proper cron library or BullMQ. This is a simple version.

Show complete updated files.
```

**Verify:**
- [ ] `runMonthlyReset()` manually call karo → wallets reset hoti hain
- [ ] topupCredits reset NAHI hoti

---

---

# STEP 7 — Mobile App: ChatScreen mein credit gate lagao

**Yeh karo:** ChatScreen mein message send karne se pehle credit check karo. 0 credits par PaywallBottomSheet dikhao.

**AI ko do yeh files:**
- `Mobile App/src/screens/ChatScreen.tsx` (existing — full file)
- `Mobile App/src/hooks/useWallet.ts` (already created)
- `Mobile App/src/components/PaywallBottomSheet.tsx` (already created)
- `Mobile App/src/api/services.ts` (has deductChatCredit())

**Prompt:**

```
I need to add credit gating to the ChatScreen in Anaaj AI React Native app.

Existing files:
[paste ChatScreen.tsx — FULL FILE]
[paste useWallet.ts]
[paste PaywallBottomSheet.tsx]

The app has a wallet system where users get limited chat credits.
I have already created useWallet hook and PaywallBottomSheet component.

Task: Modify ChatScreen.tsx to:

1. Import and use `useWallet` hook:
   const { requireChat, deductChat, chatPaywallVisible, dismissChatPaywall, refetchWallet } = useWallet();

2. Find the function that sends a message (probably handleSend or sendMessage).
   BEFORE the API call, add:
   ```
   if (!requireChat()) return; // shows paywall if 0 credits
   deductChat(); // optimistic UI deduction
   ```

3. If the API call returns a 402 error (NO_CREDITS from server):
   - Call refetchWallet() to sync real state
   - Show the paywall (set chatPaywallVisible via requireChat())

4. Add PaywallBottomSheet at the bottom of the JSX tree:
   ```
   <PaywallBottomSheet
     visible={chatPaywallVisible}
     onClose={dismissChatPaywall}
     type="chat"
   />
   ```

5. DO NOT change any other logic — just add the credit check.

IMPORTANT:
- Keep all existing logic intact
- Only show minimal diff / the changed sections
- The deductChat() is OPTIMISTIC — server will confirm via middleware
- If send fails for non-credit reasons, call refetchWallet() to reconcile
```

**Verify:**
- [ ] Ek user ko 0 credits de ke chat karne ki koshish karo → PaywallBottomSheet dikhe
- [ ] Normal credits mein message send ho
- [ ] Message fail hone par wallet sync ho

---

---

# STEP 8 — Mobile App: ImageScanScreen mein credit gate lagao

**Yeh karo:** Image scan karne se pehle scan credit check karo.

**AI ko do yeh files:**
- `Mobile App/src/screens/ImageScanScreen.tsx` (existing — full file)
- `Mobile App/src/hooks/useWallet.ts` (already created)
- `Mobile App/src/components/PaywallBottomSheet.tsx` (already created)

**Prompt:**

```
I need to add scan credit gating to ImageScanScreen in Anaaj AI React Native app.

Existing files:
[paste ImageScanScreen.tsx — FULL FILE]
[paste useWallet.ts]
[paste PaywallBottomSheet.tsx]

Task: Modify ImageScanScreen.tsx to:

1. Import useWallet:
   const { requireScan, deductScan, scanPaywallVisible, dismissScanPaywall, refetchWallet } = useWallet();

2. Find the function that triggers the crop analysis API call.
   BEFORE the API call, add:
   ```
   if (!requireScan()) return;
   deductScan(); // optimistic
   ```

3. If API returns 402 error: call refetchWallet()

4. Add PaywallBottomSheet at the bottom of the JSX:
   ```
   <PaywallBottomSheet
     visible={scanPaywallVisible}
     onClose={dismissScanPaywall}
     type="scan"
   />
   ```

5. Optionally: Add a WalletCreditBadge in the screen header showing remaining scan credits:
   import { WalletCreditBadge } from '../components/WalletCreditBadge';
   <WalletCreditBadge type="scan" />

Show minimal diff — only changed sections.
```

**Verify:**
- [ ] 0 scan credits hone par PaywallBottomSheet dikhe
- [ ] Scan credits badge header mein dikhe

---

---

# STEP 9 — Mobile App: HomeScreen mein WalletCreditBadge lagao

**Yeh karo:** HomeScreen pe credits badge lagao taaki user hamesha baaki credits dekh sake.

**AI ko do yeh files:**
- `Mobile App/src/screens/HomeScreen.tsx` (existing — full file)
- `Mobile App/src/components/WalletCreditBadge.tsx` (already created)
- `Mobile App/src/hooks/useWallet.ts` (already created)

**Prompt:**

```
I need to show remaining credits on the HomeScreen of Anaaj AI app.

Existing files:
[paste HomeScreen.tsx — FULL FILE]
[paste WalletCreditBadge.tsx]

Task: In HomeScreen.tsx:

1. Import WalletCreditBadge:
   import { WalletCreditBadge } from '../components/WalletCreditBadge';

2. Import useWallet and fetch wallet on mount:
   const { refetchWallet } = useWallet();
   useEffect(() => { refetchWallet(); }, []); // fetch fresh wallet on home screen load

3. Find the header section of HomeScreen.
   Add two badges side by side (chat + scan):
   ```
   <View style={{ flexDirection: 'row', gap: 8 }}>
     <WalletCreditBadge type="chat" />
     <WalletCreditBadge type="scan" />
   </View>
   ```
   Place this in the header row, near the notification bell or user greeting.

4. DO NOT break any existing layout — only add the badges.

Show minimal diff.
```

**Verify:**
- [ ] HomeScreen open karo → chat aur scan credits dono dikhein
- [ ] Credits low hone par badge yellow ho jaye, 0 par red

---

---

# STEP 10 — Mobile App: ProfileScreen mein wallet info aur manage subscription

**Yeh karo:** ProfileScreen mein user ka plan, credits, aur "Manage Subscription" button lagao.

**AI ko do yeh files:**
- `Mobile App/src/screens/ProfileScreen.tsx` (existing — full file)
- `Mobile App/src/store/useWalletStore.ts` (already created)
- `Mobile App/src/hooks/useWallet.ts` (already created)

**Prompt:**

```
I need to add wallet/subscription info to the ProfileScreen of Anaaj AI app.

Existing files:
[paste ProfileScreen.tsx — FULL FILE]
[paste useWalletStore.ts]

Task: In ProfileScreen.tsx:

1. Import wallet store:
   import { useWalletStore } from '../store/useWalletStore';
   const wallet = useWalletStore(s => s.wallet);
   const totalChatCredits = useWalletStore(s => s.totalChatCredits);
   const totalScanCredits = useWalletStore(s => s.totalScanCredits);

2. Find the section where user info is displayed.
   Add a "My Plan" card with:
   - Plan name (wallet?.plan.toUpperCase() → "FREE" / "BASIC" / "PRO")
   - Remaining credits: "{totalChatCredits()} chats · {totalScanCredits()} scans baaki"
   - Plan expiry if applicable: wallet?.planExpiry
   - A button: "Manage Plan →" that navigates to Subscription screen

3. Style it like a card consistent with the rest of the ProfileScreen.
   Use colors.primary for the plan name and button.

4. If wallet is null (still loading): show a small ActivityIndicator placeholder.

Show minimal diff — only the new card section + import changes.
```

**Verify:**
- [ ] ProfileScreen mein plan card dikhe
- [ ] "Manage Plan" button press karne par SubscriptionScreen khule
- [ ] Credits real-time dikhein

---

---

# STEP 11 — Mobile App: SubscriptionScreen mein real Razorpay integrate karo

**Yeh karo:** Dummy payment hata ke real Razorpay RN SDK integrate karo.

**Prerequisites:**
```
npm install react-native-razorpay
```
(Expo managed mein: `npx expo install react-native-razorpay` ya custom dev client chahiye)

**AI ko do yeh files:**
- `Mobile App/src/screens/SubscriptionScreen.tsx` (current version)
- `Mobile App/src/api/services.ts` (has createSubscriptionOrder, verifyAndCreditPayment)
- `Mobile App/src/store/useWalletStore.ts`

**Prompt:**

```
I need to replace the dummy payment in SubscriptionScreen with real Razorpay payment flow.

Existing files:
[paste SubscriptionScreen.tsx]
[paste services.ts — relevant sections]

Razorpay RN SDK is installed: import RazorpayCheckout from 'react-native-razorpay';

Task: Replace the handleSubscribe and handleTopupPurchase functions:

New handleSubscribe flow:
1. Call apiService.createSubscriptionOrder(selectedPlan)
   → gets { orderId, amount, currency, keyId }
2. Open Razorpay:
   ```
   const options = {
     description: `Anaaj AI ${selectedPlan === 'pro' ? 'Kisan Pro' : 'Kisan Basic'}`,
     image: 'https://anaaj.ai/logo.png',
     currency: 'INR',
     key: keyId,
     amount: amount.toString(),
     order_id: orderId,
     name: 'Anaaj AI',
     prefill: { contact: userPhone, email: '' },
     theme: { color: '#4CAF50' }
   };
   const paymentData = await RazorpayCheckout.open(options);
   ```
3. Call apiService.verifyAndCreditPayment({
     razorpayOrderId: orderId,
     razorpayPaymentId: paymentData.razorpay_payment_id,
     razorpaySignature: paymentData.razorpay_signature,
     purpose: 'subscription',
     tier: selectedPlan
   })
4. Call refetchWallet() and show success Alert

Error handling:
- If Razorpay throws (user cancelled): show Alert 'Payment cancel ho gayi'
- If verify fails: show Alert 'Payment verify nahi hui. Support se contact karo.'

New handleTopupPurchase flow — same pattern but:
- Call apiService.createTopupOrder(packId)
- purpose: 'topup', packId in verifyAndCreditPayment

Get userPhone from: useAppStore(s => s.user?.phone)

Show complete updated handleSubscribe and handleTopupPurchase functions only.
```

**Verify:**
- [ ] Subscription button press → Razorpay sheet khule
- [ ] Payment success → wallet credits update ho
- [ ] Payment cancel → graceful error message
- [ ] Topup pack bhi same flow follow kare

---

---

# STEP 12 — Backend: Razorpay Webhook (Production ke liye)

**Yeh karo:** Razorpay webhook endpoint banao taaki payment failures/refunds bhi handle ho.

**AI ko do yeh files:**
- `Backend/src/services/walletService.ts` (step 2 se)
- `Backend/src/services/payments/razorpay.ts` (existing)
- `Backend/src/app.ts` (existing — Fastify app setup)

**Prompt:**

```
I need to add a Razorpay webhook handler to Anaaj AI backend for production reliability.

Existing files:
[paste razorpay.ts]
[paste walletService.ts]
[paste app.ts]

Razorpay sends webhooks for: payment.captured, payment.failed, subscription.activated, subscription.charged, subscription.cancelled.

Task: Create `Backend/src/routes/webhookRoutes.ts`:

Endpoint: POST /api/webhooks/razorpay
- This endpoint must NOT have auth middleware (it's called by Razorpay)
- Must verify webhook signature:
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
  const signature = request.headers['x-razorpay-signature'];
  const body = JSON.stringify(request.body);
  const expectedSig = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
  if (signature !== expectedSig) return 400

- Handle these events:
  
  'payment.captured': 
    - notes.purpose === 'subscription': call addPlanCredits(notes.userId, notes.tier)
    - notes.purpose === 'topup': call addTopupCredits(notes.userId, notes.packType, notes.credits)
    - Log success

  'payment.failed':
    - Log the failure with userId from notes
    - No wallet change needed

  'subscription.cancelled':
    - Find wallet by razorpaySubId, set plan = 'free', chatCredits = 10, imageCredits = 1

- Always return 200 { received: true } (Razorpay needs 200 to stop retrying)

Task 2: Register the webhook route in app.ts BEFORE auth middleware is applied globally.

IMPORTANT: Raw body needed for signature verification. Add:
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    req.rawBody = body;
    done(null, JSON.parse(body));
  });

Use TypeScript. Add rawBody to FastifyRequest types.
```

**Verify:**
- [ ] Razorpay dashboard mein webhook URL set karo → test event bhejo
- [ ] Webhook endpoint 200 return kare
- [ ] Invalid signature pe 400 aaye

---

---

# FINAL TESTING CHECKLIST

Sab steps complete hone ke baad yeh test karo:

## Backend Tests (Postman/Thunder Client)
```
1. POST /api/auth/verify-otp   → New user login
   Expected: wallet document bane MongoDB mein (free, 10 chats, 1 scan)

2. GET /api/user/wallet        → Wallet fetch
   Expected: { wallet: { plan: 'free', chatCredits: 10, ... } }

3. POST /api/user/wallet/deduct { type: 'chat' }
   Expected: chatCredits - 1

4. POST /api/user/wallet/deduct 10 baar (exhaust credits)
   Expected: 402 { error: 'NO_CREDITS' }

5. POST /api/payment/subscription-order { tier: 'pro' }
   Expected: { orderId, amount: 19900, keyId }

6. POST /api/payment/verify (with valid Razorpay test credentials)
   Expected: { success: true, wallet: { plan: 'pro', chatCredits: 100 } }

7. POST /api/user/wallet/deduct after upgrade
   Expected: topupCredits deducted first if any, then planCredits
```

## Mobile App Tests
```
1. Fresh install → register → HomeScreen mein badges dikhe (10 chats, 1 scan)
2. Chat karo → badge decrement ho
3. 0 credits hone par message send → PaywallBottomSheet dikhe
4. SubscriptionScreen → Plans tab → Pro select → Payment karo → badges update ho
5. SubscriptionScreen → Topup tab → Pack select → Payment → credits add ho
6. ProfileScreen → Plan card dikhe with correct info
7. App restart karo → wallet state persist ho (AsyncStorage se)
```

---

## ENVIRONMENT VARIABLES NEEDED

Backend `.env` mein add karo:
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
PAYMENTS_ENABLED=true
```

Mobile App (app.config.js ya .env):
```
EXPO_PUBLIC_API_URL=https://your-backend.com
```

---

## ORDER SUMMARY

| Step | Kya banaya | File(s) |
|------|-----------|---------|
| 1 | Wallet Model | Backend/src/models/Wallet.ts |
| 2 | Wallet Service + API endpoints | walletService.ts, walletController.ts, userRoutes.ts |
| 3 | Auto-create wallet on register | authController.ts |
| 4 | Razorpay order + verify endpoints | paymentController.ts, paymentRoutes.ts |
| 5 | Usage enforcement → Wallet | usageEnforcement.middleware.ts |
| 6 | Monthly reset cron | walletService.ts, server.ts |
| 7 | ChatScreen credit gate | ChatScreen.tsx |
| 8 | ImageScanScreen credit gate | ImageScanScreen.tsx |
| 9 | HomeScreen credit badges | HomeScreen.tsx |
| 10 | ProfileScreen wallet card | ProfileScreen.tsx |
| 11 | Real Razorpay in app | SubscriptionScreen.tsx |
| 12 | Razorpay webhook | webhookRoutes.ts |
