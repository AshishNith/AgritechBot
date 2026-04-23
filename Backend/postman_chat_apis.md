# AgritechBot Chat API - Postman Testing Guide

For testing in Postman, **every request must include the Authentication header**:
* **Header:** `Authorization: Bearer <YOUR_JWT_TOKEN>`

---

## 0. Authentication (Getting your Token)
Before testing any chat features, you must log in to get a JWT token.

### Step 1: Request OTP
* **Method:** `POST`
* **Route:** `/api/auth/send-otp`
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "phone": "+918888888888" 
}
```
*(If you have `.env` variable `OTP_PREVIEW_ENABLED=true`, the returned JSON will contain the actual 6-digit OTP code)*

### Step 2: Verify OTP
* **Method:** `POST`
* **Route:** `/api/auth/verify-otp`
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "phone": "+918888888888",
  "otp": "123456" 
}
```
* **Response:** The system will return a `token`. Copy this exact `token` inside your Postman Collection variables or paste it inside the `Authorization: Bearer <token>` header for all the Chat APIs.

---

## 1. List All Chat Sessions
* **Method:** `GET`
* **Route:** `/api/v1/chat/sessions`
* **Query Params (Optional):**
  * `page` (default: 1)
  * `limit` (default: 20)

---

## 2. Create a New Chat Session
* **Method:** `POST`
* **Route:** `/api/v1/chat/sessions`
* **Body:** None required. It automatically generates a session using your logged-in profile coordinates.

---

## 3. Get Chat History (Messages) for a Session
* **Method:** `GET`
* **Route:** `/api/v1/chat/sessions/:sessionId/messages`
* **Query Params (Optional):**
  * `limit` (default: 50)
  * `before` (date string)

---

## 4. Send a Text Message (The Main AI Engine)
* **Method:** `POST`
* **Route:** `/api/v1/chat/sessions/:sessionId/message`
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "text": "How do I protect my wheat from pests?",
  "language": "English", 
  "imageBase64": "", 
  "imageMimeType": "image/jpeg" 
}
```
*(Valid Languages: "English", "Hindi", "Gujarati", "Punjabi". `imageBase64` and `imageMimeType` are optional.)*

---

## 5. Send a Voice Message (STT → AI → TTS)
* **Method:** `POST`
* **Route:** `/api/v1/chat/sessions/:sessionId/voice`
* **Headers:** `Content-Type: multipart/form-data`
* **Body (Form-Data):**
  * **Key:** `file` | **Type:** File | **Value:** *Select your `.m4a` or `.mp3` audio file*
  * **Key:** `language` | **Type:** Text | **Value:** `Hindi` (Optional)

---

## 6. Voice Input (Speech-to-Text Only)
*This is used when a farmer hits the microphone to type text without triggering the AI yet.*
* **Method:** `POST`
* **Route:** `/api/v1/chat/voice-input`
* **Headers:** `Content-Type: multipart/form-data`
* **Body (Form-Data):**
  * **Key:** `file` | **Type:** File | **Value:** *Select your audio file*
  * **Key:** `language` | **Type:** Text | **Value:** `Gujarati` (Optional)

---

## 7. Rename a Chat Session
* **Method:** `PUT`
* **Route:** `/api/v1/chat/sessions/:sessionId`
* **Headers:** `Content-Type: application/json`
* **Body:**
```json
{
  "title": "My Wheat Crop Discussion"
}
```

---

## 8. Fetch Farmer Context 
*Test to see what localization and crop data the AI sees during generation.*
* **Method:** `GET`
* **Route:** `/api/v1/chat/context`

---

## 9. Delete/Archive an Entire Session
* **Method:** `DELETE`
* **Route:** `/api/v1/chat/sessions/:sessionId`

---

## 10. Clear Chat History inside a Session
* **Method:** `DELETE`
* **Route:** `/api/v1/chat/sessions/:sessionId/history`

---

### Testing Strategy
1. Call **`POST /api/v1/chat/sessions`** to get a new session ID (`_id`).
2. Replace `:sessionId` in the URL with that `_id`.
3. Call **`POST /api/v1/chat/sessions/:sessionId/message`** to converse with the AI.
4. Call **`GET /api/v1/chat/sessions/:sessionId/messages`** and you should see both your query and the AI's response perfectly mapped!
