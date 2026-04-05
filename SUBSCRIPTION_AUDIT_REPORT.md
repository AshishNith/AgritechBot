# Subscription System - Comprehensive Audit Report

**Generated:** 2026-04-05  
**Scope:** End-to-End Backend, Frontend, and Integration Analysis

---

## Executive Summary

This audit covers the complete subscription and wallet-based credit system across the AgritechBot application, including backend APIs, frontend mobile app integration, payment processing, usage enforcement, and data flow.

### System Architecture Overview

The application uses a **dual-model system**:
1. **Legacy Subscription Model** (Subscription collection) - Still partially active
2. **Modern Wallet-Based Credit System** (Wallet collection) - Primary implementation

**Status:** ⚠️ **CRITICAL** - System has redundant implementations that could lead to inconsistencies.

---

## 1. Backend Analysis

### 1.1 Database Models

#### ✅ Wallet Model (`Backend/src/models/Wallet.ts`)
**Status:** Well-implemented

**Schema:**
- `userId`: Unique user reference
- `chatCredits`: Plan-based chat credits (resets monthly)
- `imageCredits`: Plan-based scan credits (resets monthly)
- `topupCredits`: Persistent topup chat credits (never expire)
- `topupImageCredits`: Persistent topup scan credits (never expire)
- `plan`: Enum ['free', 'basic', 'pro']
- `planExpiry`: Date when plan expires
- `totalChatsUsed`: Lifetime usage counter
- `totalScansUsed`: Lifetime usage counter
- `lastReset`: Last monthly reset timestamp

**Plan Limits:**
```javascript
free: { chatCredits: 10, imageCredits: 1, topupAllowed: false }
basic: { chatCredits: 50, imageCredits: 3, topupAllowed: true }
pro: { chatCredits: 100, imageCredits: 10, topupAllowed: true, rolloverDays: 7 }
```

**Methods:**
- `ensureForUser()`: Creates wallet if not exists
- `deduct(type)`: Deducts credits (topup first, then plan credits)

**Issues Found:**
- ✅ **Correct priority:** Topup credits consumed before plan credits
- ✅ **Pro rollover:** 25% of unused credits rollover (max 7 days)
- ⚠️ **No automatic expiry check:** Plan expiry requires manual cron job

---

#### ⚠️ Subscription Model (`Backend/src/models/Subscription.ts`)
**Status:** Legacy model still active - creates confusion

**Schema:**
- `userId`: User reference
- `tier`: Enum ['free', 'basic', 'premium'] ⚠️ **Note:** Uses 'premium' instead of 'pro'
- `status`: Enum ['active', 'expired', 'cancelled']
- `queriesUsed`: Chat usage counter
- `scansUsed`: Scan usage counter
- `features`: Object with limits

**Tier Features:**
```javascript
free: { chatLimit: 20, scanLimit: 2 }    // ❌ INCONSISTENT with Wallet
basic: { chatLimit: 100, scanLimit: 10 } // ❌ INCONSISTENT with Wallet
premium: { chatLimit: 300, scanLimit: 30 } // ❌ Different naming
```

**Critical Issues:**
1. ❌ **Naming inconsistency:** Uses 'premium' instead of 'pro'
2. ❌ **Different limits:** Subscription limits don't match Wallet limits
3. ❌ **Dual tracking:** Both Subscription and Wallet track usage separately
4. ⚠️ **Still used in chat middleware:** `queryLimitCheck.middleware.ts` uses Subscription model

---

#### ✅ PaymentAttempt Model (`Backend/src/models/PaymentAttempt.ts`)
**Status:** Not fully utilized

**Schema:**
- Tracks payment lifecycle (created → verified → failed/expired)
- Stores order/subscription drafts
- Links to Razorpay payment IDs

**Issue:**
- ⚠️ Payment flow bypasses this model in current implementation
- Orders created directly without PaymentAttempt tracking

---

### 1.2 Services Layer

#### ✅ Wallet Service (`Backend/src/services/walletService.ts`)
**Status:** Well-implemented

**Functions:**
- `getWallet(userId)`: Ensures wallet exists, returns it
- `deductCredit(userId, type)`: Deducts chat/scan credit
- `addPlanCredits(userId, plan)`: Activates paid plan with 30-day expiry
- `addTopupCredits(userId, type, amount)`: Adds topup credits
- `resetPlanCredits(userId)`: Monthly reset of plan credits
- `runMonthlyReset()`: Batch reset for all eligible wallets

**Strengths:**
- ✅ Topup credits persist through resets
- ✅ Pro plan rollover implemented (25% of unused, up to 7 days)
- ✅ Atomic operations using `findOneAndUpdate`

**Issues:**
- ⚠️ `runMonthlyReset()` must be called manually (no automatic scheduler)
- ⚠️ No automated plan expiry handling

---

#### ⚠️ Subscription Service (`Backend/src/services/subscriptionService.ts`)
**Status:** Legacy service still active

**Functions:**
- `checkLimit(userId, type)`: Checks subscription limits
- `incrementUsage(userId, type)`: Increments usage counter
- `getSubscriptionStatus(userId)`: Returns subscription info

**Issues:**
1. ❌ **Parallel implementation:** Duplicates wallet functionality
2. ⚠️ **Still used:** `queryLimitCheck.middleware.ts` depends on this
3. ❌ **Inconsistent data:** Subscription and Wallet can have different states

---

### 1.3 Controllers

#### ✅ Payment Controller (`Backend/src/controllers/paymentController.ts`)
**Status:** Functional with mock support

**Endpoints:**
- `POST /api/payment/subscription-order`: Creates Razorpay order for subscription
- `POST /api/payment/topup-order`: Creates Razorpay order for topup
- `POST /api/payment/verify`: Verifies payment and credits wallet

**Pricing:**
```javascript
Subscriptions:
  basic: ₹149/month (14900 paise)
  pro: ₹199/month (19900 paise)

Topups:
  chat_10: ₹49, chat_25: ₹99, chat_60: ₹199
  scan_1: ₹29, scan_3: ₹69, scan_10: ₹179
```

**Strengths:**
- ✅ Mock payment support for development
- ✅ Signature verification implemented
- ✅ Atomic wallet updates on payment success

**Issues:**
- ⚠️ No webhook handler for Razorpay callbacks
- ⚠️ PaymentAttempt model not used
- ⚠️ No payment failure retry mechanism

---

#### ⚠️ Subscription Controller (`Backend/src/controllers/subscriptionController.ts`)
**Status:** Outdated, conflicts with wallet system

**Issues:**
1. ❌ `createSubscription()` disabled when `PAYMENTS_ENABLED=true`
2. ❌ Updates legacy Subscription model instead of Wallet
3. ⚠️ `testUpgrade()` endpoint still uses Subscription model

---

### 1.4 Middleware & Usage Enforcement

#### ✅ Usage Enforcement Middleware (`Backend/src/middlewares/usageEnforcement.middleware.ts`)
**Status:** Primary enforcement - works with Wallet

**Flow:**
1. Check wallet credits first
2. If wallet fails, fallback to subscription limits
3. Return 402 (Payment Required) if no credits

**Applied to:**
- ✅ Image scan endpoint (`/api/v1/image-analysis/analyze`)
- ✅ Legacy chat endpoints

**Strengths:**
- ✅ Wallet-first approach
- ✅ Graceful fallback to subscription
- ✅ Proper HTTP status codes (402 for no credits, 403 for limits)

---

#### ⚠️ Query Limit Check Middleware (`Backend/src/chat/middleware/queryLimitCheck.middleware.ts`)
**Status:** Uses legacy Subscription model

**Issues:**
1. ❌ Checks `Subscription` model instead of `Wallet`
2. ❌ Counts messages per day instead of using credit system
3. ⚠️ Applied to v1 chat routes:
   - `/api/v1/chat/sessions/:sessionId/message`
   - `/api/v1/chat/sessions/:sessionId/voice`
   - `/api/v1/chat/sessions/:sessionId/message/stream`

**Critical:** This creates inconsistency where v1 routes use subscription limits while image analysis uses wallet credits.

---

### 1.5 Routes Configuration

#### Backend Routes Summary

| Route | Middleware | Credit Check |
|-------|-----------|--------------|
| `/api/v1/image-analysis/analyze` | `usageEnforcement` (scan) | ✅ Wallet |
| `/api/v1/chat/sessions/:id/message` | `queryLimitCheck` | ❌ Subscription |
| `/api/v1/chat/sessions/:id/voice` | `queryLimitCheck` | ❌ Subscription |
| `/api/payment/subscription-order` | Auth | N/A |
| `/api/payment/topup-order` | Auth | N/A |
| `/api/payment/verify` | Auth | N/A |
| `/api/user/wallet` | Auth | N/A |
| `/api/subscription/status` | Auth | ❌ Legacy |

---

## 2. Frontend Analysis (Mobile App)

### 2.1 State Management

#### ✅ Wallet Store (`Mobile App/src/store/useWalletStore.ts`)
**Status:** Well-designed Zustand store

**State:**
```typescript
{
  wallet: Wallet | null
  isLoading: boolean
  lastFetched: number | null
}
```

**Actions:**
- `setWallet()`: Updates wallet state
- `totalChatCredits()`: topupCredits + chatCredits
- `totalScanCredits()`: topupImageCredits + imageCredits
- `canChat()`: Returns if user has chat credits
- `canScan()`: Returns if user has scan credits
- `deductChatCredit()`: Optimistic deduction (topup first)
- `deductScanCredit()`: Optimistic deduction

**Strengths:**
- ✅ Persisted to AsyncStorage
- ✅ Correct credit priority (topup → plan)
- ✅ Optimistic updates for better UX

**Constants:**
```javascript
PLAN_CONFIGS: [
  { tier: 'free', chatCredits: 10, imageCredits: 1 }
  { tier: 'basic', chatCredits: 50, imageCredits: 3, price: 149 }
  { tier: 'pro', chatCredits: 100, imageCredits: 10, price: 199, rollover: true }
]
```

✅ **Aligned with backend Wallet model**

---

#### ✅ useWallet Hook (`Mobile App/src/hooks/useWallet.ts`)
**Status:** Excellent abstraction

**API:**
- `wallet`: Current wallet state
- `canChat`, `canScan`: Boolean flags
- `requireChat()`: Returns false + shows paywall if 0 credits
- `requireScan()`: Returns false + shows paywall if 0 credits
- `deductChat()`, `deductScan()`: Optimistic deductions
- `refetchWallet()`: Server sync

**Paywall State:**
- `chatPaywallVisible`, `dismissChatPaywall()`
- `scanPaywallVisible`, `dismissScanPaywall()`

**Strengths:**
- ✅ Centralized credit gating
- ✅ Auto-refetch on screen focus
- ✅ Stale-time optimization (60s)

---

### 2.2 API Services

#### ✅ API Service (`Mobile App/src/api/services.ts`)
**Status:** Comprehensive implementation

**Subscription/Payment Methods:**
```typescript
createSubscriptionOrder(tier)      // Creates Razorpay order
createTopupOrder(packId)           // Creates topup order
verifyWalletPayment(payload)       // Verifies and credits wallet
getWallet()                        // Fetches current wallet state
```

**Issues:**
- ⚠️ Still includes legacy methods:
  - `testUpgradeSubscription()` - Uses old subscription model
  - `processDummyPayment()` - Not used

---

### 2.3 User Flows

#### ✅ Subscription Screen (`Mobile App/src/screens/SubscriptionScreen.tsx`)
**Status:** Feature-complete

**Features:**
- Two tabs: Monthly Plans | Top-ups
- Plan selection (Basic ₹149, Pro ₹199)
- Topup pack selection (chat/scan packs)
- Mock Razorpay payment flow
- Current plan display with progress bars

**Payment Flow:**
1. User selects plan/topup
2. Creates order → `createSubscriptionOrder()` or `createTopupOrder()`
3. Mock Razorpay payment (generates mock signature)
4. Verifies payment → `verifyWalletPayment()`
5. Wallet updated, user redirected

**Strengths:**
- ✅ Clean UI/UX
- ✅ Mock payment for development
- ✅ Real payment integration ready

**Issues:**
- ⚠️ Mock payment always succeeds (no failure testing)

---

#### ✅ Chat Screen (`Mobile App/src/screens/ChatScreen.tsx`)
**Status:** Proper credit gating

**Credit Flow:**
```javascript
const handleSend = () => {
  if (!requireChat()) return;  // Shows paywall if 0 credits
  deductChat();                // Optimistic deduction
  await apiService.askChat(...);
  refetchWallet();             // Sync on error
}
```

**Strengths:**
- ✅ Pre-flight credit check
- ✅ Optimistic updates
- ✅ Error recovery with wallet sync

**Issues:**
- ⚠️ No rollback if backend returns 402 (already deducted client-side)

---

#### ✅ Image Scan Screen (`Mobile App/src/screens/ImageScanScreen.tsx`)
**Status:** Proper credit gating

**Credit Flow:**
```javascript
const handleAnalyze = async () => {
  if (!requireScan()) return;  // Shows paywall
  deductScan();                // Optimistic
  await apiService.analyzeCrop(...);
  refetchWallet();
}
```

**Error Handling:**
- ✅ 402 response → refetch wallet + show paywall
- ✅ 403 response → show limit modal
- ✅ 429 response → rate limit alert

---

#### ✅ Paywall Bottom Sheet (`Mobile App/src/components/PaywallBottomSheet.tsx`)
**Status:** Well-designed

**Options:**
1. **Subscribe** → Navigate to SubscriptionScreen (plans tab)
2. **Topup** → Navigate to SubscriptionScreen (topup tab)
3. **Share** → Share app for referral credits

**Strengths:**
- ✅ Clear CTA buttons
- ✅ Shows remaining credits
- ✅ Contextual (chat vs scan)

**Issues:**
- ⚠️ Referral system not implemented (just shares link)

---

## 3. Integration Analysis

### 3.1 End-to-End Flow: Subscription Purchase

#### ✅ Happy Path
1. **Frontend:** User selects "Pro" plan
2. **Frontend:** `apiService.createSubscriptionOrder('pro')`
3. **Backend:** `POST /api/payment/subscription-order`
   - Creates Razorpay order (or mock)
   - Returns `{ orderId, amount, keyId }`
4. **Frontend:** Simulates Razorpay payment
   - Generates mock `paymentId` and `signature`
5. **Frontend:** `apiService.verifyWalletPayment({ orderId, paymentId, signature, purpose: 'subscription', tier: 'pro' })`
6. **Backend:** `POST /api/payment/verify`
   - Verifies signature
   - Calls `addPlanCredits(userId, 'pro')`
   - Returns updated wallet
7. **Frontend:** Updates wallet state, shows success

**Status:** ✅ Works end-to-end

---

### 3.2 End-to-End Flow: Chat Message

#### Current Implementation (Mixed)

**V1 Chat Route:**
1. Frontend: User sends chat
2. Frontend: `requireChat()` → checks wallet
3. Frontend: `deductChat()` → optimistic deduction
4. Backend: `POST /api/v1/chat/sessions/:id/message`
   - ❌ Middleware: `queryLimitCheck` (uses Subscription model)
   - Counts messages per day instead of deducting credits
5. Backend: Returns AI response
6. Frontend: Shows message

**Issue:** ❌ Backend doesn't actually deduct wallet credits, only checks subscription limits

---

### 3.3 End-to-End Flow: Image Scan

#### ✅ Correct Implementation

1. Frontend: User uploads image
2. Frontend: `requireScan()` → checks wallet
3. Frontend: `deductScan()` → optimistic deduction
4. Backend: `POST /api/v1/image-analysis/analyze`
   - ✅ Middleware: `usageEnforcement('scan')` checks wallet
   - If no credits, returns 402
5. Backend: Processes image, returns diagnosis
6. Frontend: Shows result

**Status:** ✅ Properly integrated

---

## 4. Critical Issues & Risks

### 🔴 High Priority

#### 1. **Dual Subscription Models - Data Inconsistency Risk**
- **Impact:** HIGH
- **Description:** Wallet and Subscription models track credits separately
- **Evidence:**
  - Wallet: `chatCredits: 100` for Pro
  - Subscription: `chatLimit: 300` for Premium
- **Risk:** User state can diverge; one model shows credits while other doesn't
- **Recommendation:** Deprecate Subscription model entirely, migrate all to Wallet

#### 2. **Chat Routes Don't Deduct Wallet Credits**
- **Impact:** HIGH
- **Description:** V1 chat routes use `queryLimitCheck` which reads Subscription, not Wallet
- **Evidence:** `Backend/src/chat/middleware/queryLimitCheck.middleware.ts:10`
- **Risk:** Users get unlimited chats if Subscription is not enforced
- **Recommendation:** Replace with `usageEnforcementMiddleware('chat')`

#### 3. **No Backend Credit Deduction on Chat**
- **Impact:** HIGH
- **Description:** Frontend optimistically deducts, but backend never confirms
- **Evidence:** Chat controller doesn't call `deductCredit()`
- **Risk:** Credits only decrease on frontend; backend state unchanged
- **Recommendation:** Call `walletService.deductCredit()` after successful AI response

#### 4. **Naming Inconsistency: 'premium' vs 'pro'**
- **Impact:** MEDIUM
- **Description:** Subscription model uses 'premium', Wallet uses 'pro'
- **Evidence:** 
  - `Subscription.ts:6` → tier: ['free', 'basic', 'premium']
  - `Wallet.ts:59` → plan: ['free', 'basic', 'pro']
- **Risk:** API mismatches, frontend sends 'pro', backend expects 'premium'
- **Recommendation:** Standardize on 'pro' everywhere

---

### 🟡 Medium Priority

#### 5. **No Automated Monthly Reset**
- **Impact:** MEDIUM
- **Description:** `runMonthlyReset()` must be manually triggered
- **Risk:** Users never get credit refresh if cron job not set up
- **Recommendation:** Implement cron job or scheduled task

#### 6. **No Plan Expiry Auto-Handling**
- **Impact:** MEDIUM
- **Description:** Expired plans remain active until user tries to use app
- **Risk:** Users get free usage past expiry date
- **Recommendation:** Add expiry check in middleware or cron job

#### 7. **PaymentAttempt Model Not Used**
- **Impact:** MEDIUM
- **Description:** Payment flow bypasses PaymentAttempt tracking
- **Risk:** No audit trail for payment failures, can't retry failed payments
- **Recommendation:** Integrate PaymentAttempt into payment flow

#### 8. **No Razorpay Webhook Handler**
- **Impact:** MEDIUM
- **Description:** No webhook endpoint for async payment notifications
- **Risk:** If payment succeeds but app crashes, wallet never updated
- **Recommendation:** Implement `/webhooks/razorpay` endpoint

---

### 🟢 Low Priority

#### 9. **Mock Payment Always Succeeds**
- **Impact:** LOW
- **Description:** No failure testing in development
- **Risk:** Production payment failures not tested
- **Recommendation:** Add mock failure scenarios

#### 10. **Referral System Not Implemented**
- **Impact:** LOW
- **Description:** Paywall shows "Share for credits" but no backend support
- **Risk:** User confusion
- **Recommendation:** Implement referral tracking or remove the option

---

## 5. Data Flow Diagrams

### Current Subscription Purchase Flow

```
┌─────────────┐
│   User      │
│ (Frontend)  │
└──────┬──────┘
       │ 1. Select Pro Plan
       ▼
┌──────────────────────┐
│ SubscriptionScreen   │
│ createSubscriptionOrder('pro') │
└──────┬───────────────┘
       │ POST /api/payment/subscription-order
       ▼
┌──────────────────────┐
│  Payment Controller  │
│  Creates Razorpay    │
│  Order (mock)        │
└──────┬───────────────┘
       │ Returns { orderId, amount }
       ▼
┌──────────────────────┐
│  Frontend Simulates  │
│  Razorpay Payment    │
│  (mock signature)    │
└──────┬───────────────┘
       │ POST /api/payment/verify
       ▼
┌──────────────────────┐
│  Payment Controller  │
│  verifySignature()   │
└──────┬───────────────┘
       │ Valid?
       ▼ YES
┌──────────────────────┐
│  Wallet Service      │
│  addPlanCredits()    │
│  - Set plan='pro'    │
│  - chatCredits=100   │
│  - imageCredits=10   │
│  - planExpiry=+30d   │
└──────┬───────────────┘
       │ Returns updated wallet
       ▼
┌──────────────────────┐
│  Frontend Updates    │
│  Wallet Store        │
│  Shows Success       │
└──────────────────────┘
```

**Status:** ✅ Works correctly

---

### Current Chat Message Flow (BROKEN)

```
┌─────────────┐
│   User      │
│ (Frontend)  │
└──────┬──────┘
       │ 1. Types message
       ▼
┌──────────────────────┐
│  ChatScreen          │
│  requireChat()       │ ← Checks wallet.canChat()
└──────┬───────────────┘
       │ Has credits?
       ▼ YES
┌──────────────────────┐
│  ChatScreen          │
│  deductChat()        │ ← Optimistic: wallet.chatCredits--
└──────┬───────────────┘
       │ POST /api/v1/chat/sessions/:id/message
       ▼
┌──────────────────────┐
│  Auth Middleware     │
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│  queryLimitCheck     │ ← ❌ WRONG: Checks Subscription model
│  Middleware          │    (not Wallet)
└──────┬───────────────┘
       │ Subscription active?
       ▼ YES (but not relevant)
┌──────────────────────┐
│  Message Controller  │
│  AI processes msg    │
│  ❌ NO DEDUCTION     │ ← Backend doesn't deduct wallet
└──────┬───────────────┘
       │ Returns AI response
       ▼
┌──────────────────────┐
│  Frontend Shows      │
│  Response            │
│  (wallet out of sync)│
└──────────────────────┘
```

**Issues:**
1. ❌ Backend uses wrong middleware
2. ❌ Backend never deducts wallet credits
3. ⚠️ Frontend and backend states diverge

---

### Correct Image Scan Flow ✅

```
┌─────────────┐
│   User      │
│ (Frontend)  │
└──────┬──────┘
       │ 1. Uploads image
       ▼
┌──────────────────────┐
│  ImageScanScreen     │
│  requireScan()       │ ← Checks wallet.canScan()
└──────┬───────────────┘
       │ Has credits?
       ▼ YES
┌──────────────────────┐
│  ImageScanScreen     │
│  deductScan()        │ ← Optimistic: wallet.imageCredits--
└──────┬───────────────┘
       │ POST /api/v1/image-analysis/analyze
       ▼
┌──────────────────────┐
│  Auth Middleware     │
└──────┬───────────────┘
       ▼
┌──────────────────────┐
│  usageEnforcement    │ ← ✅ CORRECT: Checks Wallet
│  Middleware ('scan') │    (topupImageCredits + imageCredits)
└──────┬───────────────┘
       │ Credits > 0?
       ▼ YES
┌──────────────────────┐
│  Image Controller    │
│  AI analyzes image   │
│  Returns diagnosis   │
└──────┬───────────────┘
       │ Success
       ▼
┌──────────────────────┐
│  Frontend Shows      │
│  Result              │
│  refetchWallet()     │ ← Syncs backend state
└──────────────────────┘
```

**Status:** ✅ Correct implementation

---

## 6. Recommendations

### Immediate Actions (Week 1)

1. **✅ Standardize on Wallet Model**
   - Remove all references to Subscription model in middleware
   - Update `queryLimitCheck` to use Wallet instead of Subscription
   - Migrate any existing subscription data to Wallet

2. **✅ Fix Chat Credit Deduction**
   - Replace `queryLimitCheckMiddleware` with `usageEnforcementMiddleware('chat')`
   - Add `deductCredit(userId, 'chat')` call in chat controller after AI response
   - Add `incrementUsage()` call after successful message

3. **✅ Standardize Naming**
   - Replace all 'premium' references with 'pro'
   - Update API types and schemas
   - Add migration script if needed

---

### Short-term Improvements (Week 2-4)

4. **Implement Automated Monthly Reset**
   - Add cron job to call `runMonthlyReset()` on 1st of month
   - Send notification to users when credits reset
   - Log reset operations for audit

5. **Add Plan Expiry Handling**
   - Create middleware to check `planExpiry` on each request
   - Auto-downgrade to 'free' tier when expired
   - Send expiry warning notifications 7 days before

6. **Implement Razorpay Webhooks**
   - Create `/webhooks/razorpay` endpoint
   - Verify webhook signature
   - Handle payment success/failure events
   - Integrate with PaymentAttempt model

7. **Add Payment Audit Trail**
   - Use PaymentAttempt model for all payments
   - Track payment lifecycle (created → verified → completed/failed)
   - Store order drafts for recovery

---

### Medium-term Enhancements (Month 2-3)

8. **Implement Referral System**
   - Add Referral model (referrer, referee, status, credits_awarded)
   - Create `/api/referral/generate-code` endpoint
   - Award credits on successful signup
   - Add referral tracking in frontend

9. **Add Payment Retry Mechanism**
   - Allow retry for failed payments
   - Store PaymentAttempt with failure reason
   - Show retry option in UI

10. **Implement Usage Analytics**
    - Add daily/monthly usage reports
    - Track credit consumption patterns
    - Send usage alerts (e.g., "80% credits used")

11. **Add Admin Dashboard**
    - View all user subscriptions
    - Manual credit adjustment
    - Payment reconciliation
    - Usage statistics

---

### Long-term Features (Month 4+)

12. **Subscription Management**
    - Auto-renewal with Razorpay subscriptions
    - Cancel subscription
    - Upgrade/downgrade mid-cycle with proration

13. **Dynamic Pricing**
    - A/B test different price points
    - Regional pricing (different states)
    - Seasonal discounts

14. **Advanced Credit System**
    - Gift credits to other users
    - Credit expiry warnings
    - Bulk purchase discounts

---

## 7. Security Audit

### ✅ Strengths

1. **JWT Authentication:** All protected routes require valid token
2. **Signature Verification:** Razorpay signatures properly validated
3. **Input Validation:** Zod schemas validate all inputs
4. **Rate Limiting:** Chat rate limit middleware active
5. **Atomic Updates:** Using `findOneAndUpdate` prevents race conditions

### ⚠️ Concerns

1. **No CSRF Protection:** Frontend doesn't send CSRF tokens
2. **Mock Payments Enabled:** `PAYMENTS_ENABLED=false` in production could be risky
3. **No Payment Idempotency:** Duplicate payment verification could credit twice
4. **No User-Facing Payment History:** Users can't see past transactions
5. **Webhook Endpoint Missing:** Vulnerable to missed payment notifications

---

## 8. Performance Analysis

### Backend

| Metric | Status | Notes |
|--------|--------|-------|
| Wallet Query | ✅ Good | Indexed on `userId` |
| Credit Deduction | ✅ Good | Atomic operation |
| Monthly Reset | ⚠️ Manual | Needs cron job |
| Payment Verification | ✅ Good | Fast signature check |
| Subscription Status | ⚠️ Slow | Queries two collections |

**Optimization Needed:**
- Cache wallet state in Redis (60s TTL)
- Index on `planExpiry` for expiry checks
- Remove Subscription queries entirely

---

### Frontend

| Metric | Status | Notes |
|--------|--------|-------|
| Wallet State | ✅ Good | Persisted to AsyncStorage |
| API Calls | ✅ Good | Auto-refetch with stale-time |
| Optimistic Updates | ✅ Good | Instant UI response |
| Error Recovery | ✅ Good | refetchWallet() on errors |

**Well-optimized:** No major issues

---

## 9. Testing Gaps

### Unit Tests Needed

- [ ] Wallet.deduct() method
- [ ] walletService.addPlanCredits()
- [ ] walletService.addTopupCredits()
- [ ] Payment signature verification
- [ ] Monthly reset logic
- [ ] Pro plan rollover calculation

### Integration Tests Needed

- [ ] End-to-end subscription purchase
- [ ] End-to-end topup purchase
- [ ] Credit deduction on chat
- [ ] Credit deduction on scan
- [ ] Payment failure handling
- [ ] Expired plan handling

### Frontend Tests Needed

- [ ] useWallet hook (requireChat, requireScan)
- [ ] Optimistic deduction
- [ ] Paywall display logic
- [ ] API error handling

---

## 10. Migration Plan

### Phase 1: Stabilization (Week 1)
- [ ] Replace `queryLimitCheck` with `usageEnforcement` in chat routes
- [ ] Add wallet credit deduction in chat controller
- [ ] Standardize 'pro' vs 'premium' naming
- [ ] Add automated tests for critical flows

### Phase 2: Cleanup (Week 2)
- [ ] Mark Subscription model as deprecated
- [ ] Create migration script: Subscription → Wallet
- [ ] Remove Subscription queries from codebase
- [ ] Update API documentation

### Phase 3: Enhancement (Week 3-4)
- [ ] Implement monthly reset cron job
- [ ] Add plan expiry checks
- [ ] Implement Razorpay webhooks
- [ ] Add PaymentAttempt tracking

### Phase 4: Production Readiness (Month 2)
- [ ] Enable real Razorpay payments
- [ ] Add monitoring and alerts
- [ ] Load testing
- [ ] Disaster recovery plan

---

## 11. Conclusion

### Summary of Findings

**✅ Working Well:**
- Wallet model is well-designed
- Frontend credit gating works correctly
- Image scan flow is properly integrated
- Payment mock system is functional
- Optimistic updates improve UX

**❌ Critical Issues:**
- Dual subscription models create inconsistency
- Chat routes don't deduct wallet credits
- Naming mismatch ('premium' vs 'pro')
- No backend credit deduction confirmation
- No automated monthly reset

**⚠️ Areas for Improvement:**
- Add Razorpay webhooks
- Implement referral system
- Add payment audit trail
- Automated plan expiry handling
- Better error recovery on payment failures

---

### Risk Assessment

| Risk | Severity | Likelihood | Impact |
|------|----------|------------|--------|
| Credit state divergence | High | High | Users get unlimited usage |
| Payment not recorded | Medium | Low | Revenue loss |
| Monthly reset not run | Medium | Medium | Users never get refresh |
| Plan expiry not enforced | Medium | Medium | Free extended usage |
| Webhook missed | Low | Low | Payment reconciliation needed |

**Overall Risk Level:** 🔴 **HIGH** - Immediate action required on chat credit deduction

---

### Next Steps

1. **Immediate (This Week):**
   - Fix chat credit deduction
   - Replace subscription middleware with wallet enforcement
   - Standardize naming

2. **Short-term (Next 2 Weeks):**
   - Set up monthly reset cron job
   - Add plan expiry checks
   - Implement webhook handler

3. **Medium-term (Next Month):**
   - Complete migration from Subscription to Wallet
   - Add comprehensive testing
   - Enable real payments in production

4. **Long-term (Next Quarter):**
   - Advanced subscription features (auto-renewal, proration)
   - Analytics dashboard
   - Referral system

---

## Appendix

### A. File Reference

**Backend Models:**
- `Backend/src/models/Wallet.ts` - Primary credit model ✅
- `Backend/src/models/Subscription.ts` - Legacy, to be deprecated ⚠️
- `Backend/src/models/PaymentAttempt.ts` - Not fully used ⚠️

**Backend Services:**
- `Backend/src/services/walletService.ts` - Credit management ✅
- `Backend/src/services/subscriptionService.ts` - Legacy ⚠️
- `Backend/src/services/payments/razorpay.ts` - Payment gateway ✅

**Backend Controllers:**
- `Backend/src/controllers/paymentController.ts` - Payment endpoints ✅
- `Backend/src/controllers/walletController.ts` - Wallet endpoints ✅
- `Backend/src/controllers/subscriptionController.ts` - Legacy ⚠️

**Backend Middleware:**
- `Backend/src/middlewares/usageEnforcement.middleware.ts` - Wallet enforcement ✅
- `Backend/src/chat/middleware/queryLimitCheck.middleware.ts` - Legacy ❌

**Frontend State:**
- `Mobile App/src/store/useWalletStore.ts` - Wallet Zustand store ✅
- `Mobile App/src/hooks/useWallet.ts` - Wallet hook ✅

**Frontend Screens:**
- `Mobile App/src/screens/SubscriptionScreen.tsx` - Purchase flow ✅
- `Mobile App/src/screens/ChatScreen.tsx` - Chat with credits ⚠️
- `Mobile App/src/screens/ImageScanScreen.tsx` - Scan with credits ✅

**Frontend Components:**
- `Mobile App/src/components/PaywallBottomSheet.tsx` - Credit gate ✅

---

### B. API Endpoints

**Wallet & Payment:**
```
GET    /api/user/wallet                  - Get user wallet
POST   /api/user/wallet/deduct           - Deduct credit (manual)
POST   /api/payment/subscription-order   - Create subscription order
POST   /api/payment/topup-order          - Create topup order
POST   /api/payment/verify               - Verify payment & credit wallet
```

**Legacy Subscription (Deprecate):**
```
POST   /api/subscription                 - Create subscription ⚠️
GET    /api/subscription/status          - Get status ⚠️
POST   /api/subscription/test-upgrade    - Test upgrade ⚠️
```

**Chat (with credit enforcement):**
```
POST   /api/v1/chat/sessions/:id/message - Send message (uses legacy middleware) ❌
POST   /api/v1/chat/sessions/:id/voice   - Send voice (uses legacy middleware) ❌
```

**Image Analysis (with credit enforcement):**
```
POST   /api/v1/image-analysis/analyze    - Analyze image ✅
GET    /api/v1/image-analysis/history    - Get scan history ✅
```

---

### C. Database Schema Comparison

| Field | Wallet Model | Subscription Model | Status |
|-------|--------------|-------------------|--------|
| Plan/Tier | `plan` (free/basic/pro) | `tier` (free/basic/premium) | ❌ Inconsistent |
| Chat Limit | `chatCredits` (10/50/100) | `chatLimit` (20/100/300) | ❌ Different values |
| Scan Limit | `imageCredits` (1/3/10) | `scanLimit` (2/10/30) | ❌ Different values |
| Topup Credits | ✅ `topupCredits`, `topupImageCredits` | ❌ Not supported | Wallet superior |
| Expiry | `planExpiry` (Date) | `endDate` (Date) | ✅ Same concept |
| Usage Counter | `totalChatsUsed`, `totalScansUsed` | `queriesUsed`, `scansUsed` | ⚠️ Duplicated |
| Monthly Reset | `lastReset` (Date) | `startDate` (Date) | ⚠️ Different logic |

**Recommendation:** Fully migrate to Wallet model, drop Subscription collection.

---

**End of Audit Report**
