# 🌾 AgritechBot Backend: The Digital Brain Walkthrough

Welcome to the **AgritechBot Backend**! This document is designed for developers who want to understand how this system works, from the ground up. We've kept the language simple but the technical concepts intact.

---

## 🏗️ 1. The Big Picture (Architecture)

Think of the backend as the **central nervous system** of the application. It receives requests from the Mobile App (the "senses"), processes them using AI (the "brain"), and saves important info in the database (the "memory").

### The Tech Stack:
*   **Node.js & Fastify**: Our engine. We used **Fastify** instead of the traditional Express because it's significantly faster and handles many more connections at once – perfect for thousands of farmers!
*   **TypeScript**: Every piece of data has a "type." This prevents 90% of common coding bugs by catching errors while you write the code.
*   **MongoDB (Mongoose)**: Our permanent memory. It stores user profiles, chat history, and marketplace products.
*   **Redis**: Our short-term "sticky note" memory. It's super fast and used for things like caching recent chats and managing background jobs.
*   **Google Gemini AI**: The actual "AI" that talks to farmers and diagnoses crop diseases.
*   **Sarvam AI**: Our multilingual translator. It turns voice into text (Hindi, Gujarati, Punjabi) and back into speech.

---

## 📂 2. Folder Structure: Where is everything?

The code is organized under the `src/` (source) folder:

*   **`server.ts`**: The starting point. This file connects to the database, sets up Redis, and "ignites" the server.
*   **`app.ts`**: The configuration room. This is where we set up security rules (CORS, Helmet), rate limits (to prevent spam), and register all our API routes.
*   **`routes/`**: The "Post Office." This folder defines all the URL endpoints (like `/api/auth/send-otp`). It tells the server where to send a request when it arrives.
*   **`controllers/`**: The "Project Managers." These files contain the logic. For example, when you request to login, the `authController` decides if your OTP is correct and gives you a key (JWT).
*   **`models/`**: The "Blueprints." They define what a User, a Product, or a Chat Message should look like in the database.
*   **`services/`**: The "Specialists." These are small helpers that do one job very well – like talking to Cloudinary (for images) or Sarvam (for voice).
*   **`chat/`**: The AI Department. This is a mini-app inside our backend dedicated entirely to the Gemini AI conversation logic.

---

## 🔐 3. Authentication: How do we know who you are?

We use a **Phone-Number based Login**. No passwords needed!

1.  **Request OTP**: You send your phone number to `/api/auth/send-otp`.
2.  **Generate & Hash**: The backend creates a 6-digit code, "hashes" it (scrambles it for safety), and saves it in MongoDB.
3.  **Verify**: You send the code back. If it matches, the backend gives you a **JWT (JSON Web Token)**.
4.  **Session**: The Mobile App sends this JWT with every future request. It's like a VIP pass that proves who you are without you having to log in again.

---

## 🤖 4. The AI Assistant (Gemini + RAG)

This is the most advanced part of the app. It's not just "chatting"; it's **Personalized AI**.

### How a Chat Message Works:
1.  **Context Building**: When a farmer asks "How is my crop?", the backend doesn't just ask Gemini. It first looks up the farmer's profile (their location, what they've planted, their land size).
2.  **RAG (Retrieval-Augmented Generation)**: We combine the farmer's info + the latest agricultural data + the farmer's past questions = A massive "Context String."
3.  **The Prompt**: We send this context + the farmer's question to **Gemini**.
4.  **Tool Use**: Gemini is so smart it can decide to "use tools." For example, it might decide to look up specific product recommendations from our database to help the farmer.

---

## 📸 5. Image Analysis (The Doctor for Crops)

Farmers can take a photo of a leaf, and the backend tells them the disease.

1.  **Image Upload**: The image is sent to the backend as a base64 string.
2.  **Storage**: We save the image in **Cloudinary** so we don't clog up our own server.
3.  **AI Diagnosis**: The image is sent to **Gemini Vision**. Our custom "Diagnosis Prompt" tells the AI to behave like a senior agronomist.
4.  **Credits**: Every time a farmer scans an image, a credit is deducted from their **Wallet**. This is how we manage free vs. premium users.

---

## ⚙️ 6. Performance & Scale

Because we want this bot to work for millions of farmers, we've implemented:
*   **Queues (BullMQ)**: Heavy tasks (like sending thousands of weather alerts) happen in the background using Redis workers, so the main API stays snappy.
*   **Cluster Mode**: The backend can run on multiple "cores" of a CPU simultaneously.
*   **Rate Limiting**: If someone tries to attack the server by sending 1,000 requests per second, the backend automatically blocks them to protect other users.

---

## 🛑 7. Error Handling (Safety First)

We use a custom `AppError` system. Instead of the server "crashing" when something goes wrong, it sends a neat, readable error message to the mobile app (like "Insufficient Credits" or "Invalid OTP"), allowing the app to show a helpful message to the farmer.

---

### 💡 Beginner Tip:
If you want to understand a specific feature, start with the **Route** file (e.g., `marketplaceRoutes.ts`), see which **Controller** it calls, and then look at the **Model** it uses. That's the flow of data!
