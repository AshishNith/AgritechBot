# AnaajAI Production Runbook

## 1. Launch Scope

Day-one launch covers:
- Android app
- Public website
- Backend API
- Verified order and subscription payments through Razorpay-backed checkout

## 2. Required Secrets And Env

### Backend
- `NODE_ENV=production`
- `CORS_ORIGINS=<website-domain>,<optional-admin-domain>`
- `JWT_SECRET=<32+ char random secret>`
- `MONGODB_URI=<production MongoDB URI>`
- `REDIS_ENABLED=true|false`
- `REDIS_HOST=<managed redis host if enabled>`
- `REDIS_PASSWORD=<redis password if enabled>`
- `GEMINI_API_KEY=<live key>`
- `SARVAM_API_KEY=<live key>`
- `SARVAM_STT_URL=<live url>`
- `SARVAM_TTS_URL=<live url>`
- `PAYMENTS_ENABLED=true`
- `RAZORPAY_KEY_ID=<live key id>`
- `RAZORPAY_KEY_SECRET=<live key secret>`
- `RAZORPAY_WEBHOOK_SECRET=<live webhook secret>`
- `PUBLIC_WEBSITE_URL=https://your-website-domain`
- `OTP_PREVIEW_ENABLED=false`
- `NOTIFICATION_SEEDING_ENABLED=false`

### Website
- `VITE_API_BASE_URL=https://your-backend-domain`
- `VITE_ANDROID_APP_URL=<signed android artifact url when available>`

### Mobile build
- `EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain`
- `EXPO_PUBLIC_PAYMENT_WEB_BASE_URL=https://your-website-domain`
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=<maps key injected via build secret>`
- Android signing secrets:
  - `ANAJ_RELEASE_STORE_FILE`
  - `ANAJ_RELEASE_STORE_PASSWORD`
  - `ANAJ_RELEASE_KEY_ALIAS`
  - `ANAJ_RELEASE_KEY_PASSWORD`

## 3. Backend Deployment

### Docker path
1. Copy `Backend/.env.example` to `Backend/.env`.
2. Fill in production values.
3. Deploy:
   `docker compose -f docker-compose.prod.yml up -d --build`
4. Verify:
   `curl http://localhost:4000/health`
5. Optional initial content tasks:
   `docker compose -f docker-compose.prod.yml exec app npm run seed`
   `docker compose -f docker-compose.prod.yml exec app npm run kb:ingest`

### Post-deploy checks
- `GET /health`
- `GET /metrics`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `GET /api/products`
- `POST /api/payment/orders` with auth
- `GET /api/payment/checkout/:paymentOrderId?token=...`

## 4. Website Deployment

1. Set `VITE_API_BASE_URL`.
2. Set `VITE_ANDROID_APP_URL` only when a signed public Android build exists.
3. Run:
   `npm ci`
   `npm run build`
4. Deploy `Website/dist` to Vercel or another static host.
5. Verify:
- `/`
- `/download`
- `/contact`
- `/chat`
- `/checkout/:paymentOrderId?token=...` from a real payment session

## 5. Android Release Build

1. Set Expo public env variables and signing secrets.
2. Confirm `Mobile App/eas.json` production profile outputs an app bundle.
3. Run:
   `npm run typecheck`
   `eas build --platform android --profile production`
4. Install the build on a real device and verify:
- login with OTP
- profile completion
- chat and voice
- marketplace browse and cart
- browser checkout for order
- browser checkout for subscription
- order history sync from backend

## 6. Payment Smoke Test

Run one full staging transaction before going live:
1. Sign in on Android.
2. Create an order payment session from checkout.
3. Complete payment on website hosted checkout.
4. Verify backend marks payment as verified and creates an order.
5. Refresh payment status in app.
6. Confirm order appears in order history.
7. Repeat for subscription purchase.

## 7. Launch Gate

Do not launch until all are true:
- backend build passes
- website build passes
- mobile typecheck passes
- production health endpoint is green
- OTP preview is disabled
- fake notification seeding is disabled
- payments are enabled with live Razorpay keys
- website does not expose fake chatbot or dead forms
- android build is release-signed
- at least one full staging payment succeeds end-to-end

## 8. Rollback

If launch fails:
- disable `PAYMENTS_ENABLED`
- roll back website deploy to prior stable static build
- roll back backend container image
- remove public Android download link from website until issue is fixed
