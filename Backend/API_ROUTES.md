# Anaaj AI - API Reference & Testing Guide

This document provides the raw JSON structures and headers required to test the backend APIs using Postman, Insomnia, or cURL.

## 🌍 Base Configuration
- **Local Development**: `http://localhost:4000`
- **Production**: `https://api.anaajai.com` (or VPS IP)
- **Default Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json`

---

## 🔐 1. Authentication & Identity

### Send OTP
Generates a 6-digit code for login/signup.
- **Method**: `POST`
- **Route**: `/api/auth/send-otp`
- **Auth Required**: No
- **Body**:
```json
{
  "phone": "+919876543210"
}
```

### Verify OTP
Exchanges the code for a JWT session token.
- **Method**: `POST`
- **Route**: `/api/auth/verify-otp`
- **Auth Required**: No
- **Body**:
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

---

## 👤 2. User Profile & Wallet
*All routes below require `Authorization: Bearer <token>` header.*

### Get Profile
- **Method**: `GET`
- **Route**: `/api/user/profile`

### Create/Complete Profile
- **Method**: `POST`
- **Route**: `/api/user/profile`
- **Body**:
```json
{
  "name": "Arjun Singh",
  "language": "Hindi",
  "location": {
    "state": "Punjab",
    "district": "Ludhiana",
    "latitude": 30.901,
    "longitude": 75.857,
    "address": "Village Road 12"
  },
  "crops": ["Wheat", "Potato"],
  "landSize": 10.5,
  "landUnit": "Acre"
}
```

### Update Profile
- **Method**: `PUT`
- **Route**: `/api/user/profile`
- **Body**: (Same as above, all fields optional)

### Get Wallet (Credits)
- **Method**: `GET`
- **Route**: `/api/user/wallet`

---

## 💬 3. AI Chat System (V1)
*All routes require `Authorization: Bearer <token>` header.*

### Create New Session
- **Method**: `POST`
- **Route**: `/api/v1/chat/sessions`

### List All Sessions
- **Method**: `GET`
- **Method**: `POST`
- **Route**: `/api/v1/chat/sessions/:sessionId/message`
- **Body**:
```json
{
  "text": "How much urea should I use for 5 acres of wheat?",
  "language": "English",
  "imageBase64": "data:image/jpeg;base64,...",
  "imageMimeType": "image/jpeg"
}
```

### Voice Message (File Upload)
- **Method**: `POST`
- **Route**: `/api/v1/chat/sessions/:sessionId/voice`
- **Headers**: `Content-Type: multipart/form-data`
- **Form Data**:
  - `file`: (Audio binary)
  - `language`: "Hindi" (Optional)

---

## 📸 4. Image Analysis (Crop Diagnosis)
*Requires `Authorization: Bearer <token>` header.*

### Analyze Crop Image
- **Method**: `POST`
- **Route**: `/api/v1/image-analysis/analyze`
- **Body**:
```json
{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJR...",
  "imageMimeType": "image/jpeg",
  "language": "Hindi"
}
```

### Analysis History
- **Method**: `GET`
- **Route**: `/api/v1/image-analysis/history`

---

## 🚜 5. Farming Assistant
*Requires `Authorization: Bearer <token>` header.*

### Get Dashboard
- **Method**: `GET`
- **Route**: `/api/v1/farming-assistant/dashboard`

### Add New Crop
- **Method**: `POST`
- **Route**: `/api/v1/farming-assistant/crops`
- **Body**:
```json
{
  "cropType": "Wheat",
  "variety": "HD-2967",
  "plantingDate": "2024-11-15",
  "soilType": "Loamy",
  "currentStage": "growing",
  "location": {
    "latitude": 30.9,
    "longitude": 75.8
  }
}
```

### Update Task Status
- **Method**: `PATCH`
- **Route**: `/api/v1/farming-assistant/tasks/:taskId`
- **Body**:
```json
{
  "status": "completed"
}
```

---

## 🛒 6. Marketplace & Orders

### List Products
- **Method**: `GET`
- **Route**: `/api/products?page=1&limit=10&category=Fertilizer&search=Urea`

### Create Order (Draft)
- **Method**: `POST`
- **Route**: `/api/orders`
- **Auth**: Yes
- **Body**:
```json
{
  "items": [
    { "productId": "65ab123...", "quantity": 2 }
  ],
  "deliveryAddress": {
    "line1": "Farm House 4",
    "city": "Ludhiana",
    "state": "Punjab",
    "pincode": "141001"
  }
}
```

---

## 💳 7. Payments (Razorpay)

### Create Subscription Order
- **Method**: `POST`
- **Route**: `/api/payment/subscription-order`
- **Auth**: Yes
- **Body**:
```json
{
  "tier": "basic"
}
```

### Create Topup Order
- **Method**: `POST`
- **Route**: `/api/payment/topup-order`
- **Auth**: Yes
- **Body**:
```json
{
  "packId": "chat_25"
}
```
*(Valid Pack IDs: `chat_10`, `chat_25`, `chat_60`, `scan_1`, `scan_3`, `scan_10`)*

### Verify Payment
- **Method**: `POST`
- **Route**: `/api/payment/verify`
- **Auth**: Yes
- **Body**:
```json
{
  "razorpayOrderId": "order_Ok123...",
  "razorpayPaymentId": "pay_Pl987...",
  "razorpaySignature": "abc123signature...",
  "purpose": "subscription",
  "tier": "basic"
}
```

---

## 🛠️ 8. System & Maintenance

### Health Check (Public)
- **Method**: `GET`
- **Route**: `/health`

### Admin Stats
- **Method**: `GET`
- **Route**: `/api/admin/stats`
- **Auth**: Yes (Admin only)
