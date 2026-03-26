# AnaajAI Production Audit

This audit reflects the current codebase after the launch-hardening pass completed on 2026-03-26.

## Critical Bugs And Runtime Failures

### 1. OTP disclosure in auth flow
- Severity: `critical`
- Surface: `backend`, `mobile`
- Repro or evidence: `POST /api/auth/send-otp` previously returned the OTP and the mobile `Otp` screen rendered it directly.
- User impact: anyone with app access could bypass the intended verification step.
- Fix recommendation: never return OTP in production and remove in-app OTP preview UI.
- Launch blocking status: `fixed in this pass`

### 2. Order and subscription flows depended on mock payment IDs
- Severity: `critical`
- Surface: `mobile`, `backend`
- Repro or evidence: subscription flow used `mock_pay_*`; direct order creation allowed placeholder payment values.
- User impact: users could appear to complete paid actions without verified payment.
- Fix recommendation: create provider-backed payment intents and verify signatures before activating subscriptions or confirming orders.
- Launch blocking status: `fixed in this pass`

### 3. Website exposed fake chatbot and dead contact form
- Severity: `critical`
- Surface: `website`
- Repro or evidence: `/chat` produced scripted mock answers and `/contact` had a non-submitting form.
- User impact: public site behavior was misleading and not trustworthy for launch.
- Fix recommendation: replace with truthful availability/support surfaces or wire to real APIs.
- Launch blocking status: `fixed in this pass`

## Security And Privacy Risks

### 4. Committed mobile Maps API key
- Severity: `high`
- Surface: `mobile`, `infra`
- Repro or evidence: Android Google Maps key was committed in app config.
- User impact: exposed key could be abused or throttled.
- Fix recommendation: remove from committed config, inject via build env, and rotate the previously committed key if it was real.
- Launch blocking status: `partially fixed`

### 5. Fake notifications seeded for real users
- Severity: `high`
- Surface: `backend`
- Repro or evidence: notification controller auto-seeded sample alerts when a user had none.
- User impact: live users could receive fabricated agricultural guidance.
- Fix recommendation: gate demo seeding behind explicit non-production env flags only.
- Launch blocking status: `fixed in this pass`

### 6. Release signing used debug credentials
- Severity: `high`
- Surface: `mobile`, `infra`
- Repro or evidence: Android release build previously pointed to debug signing config.
- User impact: release artifacts were not production-safe for store distribution.
- Fix recommendation: require release keystore configuration and allow debug signing only via explicit override.
- Launch blocking status: `fixed in this pass`

## UX Inconsistencies And Broken Flows

### 7. Logout returned users to first-run onboarding
- Severity: `high`
- Surface: `mobile`
- Repro or evidence: splash routing only checked `token`, while sign-out reset onboarding state.
- User impact: returning users were sent back through onboarding instead of login.
- Fix recommendation: preserve onboarding completion and route signed-out returning users to login.
- Launch blocking status: `fixed in this pass`

### 8. Order history relied on local persisted state
- Severity: `high`
- Surface: `mobile`
- Repro or evidence: order history screen used Zustand-persisted orders instead of backend order truth.
- User impact: app history could drift from real backend order status.
- Fix recommendation: fetch order history from backend and treat local cart only as draft state.
- Launch blocking status: `fixed in this pass`

### 9. Demo crop scan feature implied real diagnosis
- Severity: `high`
- Surface: `mobile`
- Repro or evidence: `ImageScanScreen` showed a diagnosis/treatment flow without backend analysis.
- User impact: users could mistake demo UI for real agronomy output.
- Fix recommendation: hide it from launch or replace with an explicit unavailable state.
- Launch blocking status: `fixed in this pass`

## Missing Production Features

### 10. Razorpay credentials and website checkout base URL still need real deployment values
- Severity: `high`
- Surface: `backend`, `website`, `infra`
- Repro or evidence: the new payment flow depends on `PAYMENTS_ENABLED`, Razorpay keys, and `PUBLIC_WEBSITE_URL`.
- User impact: payments remain unavailable until secrets and public URLs are configured in production.
- Fix recommendation: set live keys, enable payments, and run one real staging transaction before launch.
- Launch blocking status: `remaining`

### 11. Mobile checkout returns from browser manually
- Severity: `medium`
- Surface: `mobile`, `website`
- Repro or evidence: payment flow opens hosted checkout in browser and asks the user to refresh status in-app.
- User impact: flow is functional but not yet as smooth as app deep linking.
- Fix recommendation: add verified deep-link return from checkout page back into the app.
- Launch blocking status: `not blocking for day one`

### 12. Marketplace still uses placeholder product imagery in some components
- Severity: `medium`
- Surface: `mobile`
- Repro or evidence: fallback `via.placeholder.com` URLs remain in marketplace item components.
- User impact: production UI can still show generic placeholders if catalog images are missing.
- Fix recommendation: replace with bundled branded fallback assets or guarantee seeded product imagery.
- Launch blocking status: `remaining`

### 13. Some user-facing copy is still hardcoded in English
- Severity: `medium`
- Surface: `mobile`, `website`
- Repro or evidence: several payment, error, and support messages remain outside localization tables.
- User impact: language consistency is incomplete for Hindi, Gujarati, and Punjabi users.
- Fix recommendation: move new payment/support/status copy into localization resources.
- Launch blocking status: `remaining`

## Infrastructure And Deployment Gaps

### 14. Production release still depends on external credential setup
- Severity: `high`
- Surface: `mobile`, `infra`
- Repro or evidence: Android release signing now requires explicit keystore env/properties; EAS production now targets app bundle output.
- User impact: release builds will fail until credentials are configured correctly, which is safer than shipping debug-signed releases.
- Fix recommendation: configure EAS secrets/credentials and run one signed release build before launch.
- Launch blocking status: `remaining`

### 15. Launch verification steps were not previously codified around payments
- Severity: `medium`
- Surface: `infra`
- Repro or evidence: earlier runbooks focused on auth/chat/voice but not verified payment checkout.
- User impact: rollout risk remained high even after code changes.
- Fix recommendation: use the new production runbook and require real payment smoke checks before public release.
- Launch blocking status: `fixed in docs this pass`

## Nice-To-Have Post-Launch Improvements

### 16. Add Razorpay webhook reconciliation
- Severity: `low`
- Surface: `backend`
- Repro or evidence: current launch flow verifies on client/browser callback rather than webhook reconciliation.
- User impact: callback verification works, but webhook reconciliation would improve resilience and support edge cases.
- Fix recommendation: add signed webhook endpoint plus idempotent payment reconciliation jobs.
- Launch blocking status: `post-launch`

### 17. Add dedicated order detail and payment receipt screens
- Severity: `low`
- Surface: `mobile`
- Repro or evidence: users can view order history but not a dedicated order detail/payment receipt screen.
- User impact: order support and post-purchase clarity are more limited than ideal.
- Fix recommendation: add order detail view with payment metadata and delivery milestones.
- Launch blocking status: `post-launch`

### 18. Complete copy/legal review against live voice and payment behavior
- Severity: `low`
- Surface: `website`, `backend`
- Repro or evidence: legal pages were not fully rewritten during this code pass.
- User impact: small risk of mismatch between documentation and final live operational policy.
- Fix recommendation: legal/content review before public launch announcement.
- Launch blocking status: `remaining but non-code`

## Verification Snapshot

- Backend build: passed
- Website build: passed
- Mobile typecheck: passed
