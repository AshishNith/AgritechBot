# Agritech AI Assistant MVP

This project is a production-ready MVP for an Agritech AI Assistant for Indian farmers. It features Voice & Text interfaces and integrates with Sarvam AI, OpenAI, Gemini, and Chroma DB.

## Tech Stack
- **Backend:** Node.js, Express.js, TypeScript
- **Machine Learning/AI:** LangChain, ChatGPT / Gemini
- **Database:** Chroma Vector DB (Memory/Local via LangChain)
- **Voice AI:** Sarvam AI (Saaras v3 for STT, Bulbul v3 for TTS)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Rename `.env.example` to `.env` or create a `.env` file based on the structure provided in `.env`:
```
PORT=3000
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
SARVAM_API_KEY=your_sarvam_api_key
```

### 3. Run the Server
For development (using ts-node-dev or nodemon):
```bash
npx nodemon src/server.ts
```

For production build:
```bash
npm run build
npm start
```

## API Endpoints

### 1. `POST /ask`
Submit text questions in supported Indian languages.

**Payload:**
```json
{
  "question": "mere kheton me tomato pe safed keede ho gye hain",
  "language": "Punjabi", 
  "model": "openai" // or "gemini"
}
```

**Response:**
```json
{
  "question": "mere kheton ...",
  "language": "Punjabi",
  "answer": "...",
  "audio": "<base64_encoded_audio_from_sarvam>"
}
```

### 2. `POST /voice`
Upload an audio recording to be transcribed, analyzed via local agritech knowledge + LLM, and answered back with voice.

**FormData:**
- `audio`: The audio file
- `model`: "openai" (default) or "gemini"

**Response:**
```json
{
  "question": "transcribed text",
  "detectedLanguage": "hi-IN",
  "answer": "...",
  "audio": "<base64_encoded_audio_from_sarvam>"
}
```

## Architecture
1. **User Input:** Receives text or voice (Sarvam STT converts voice to text).
2. **Language Detection:** Identifies crop issue language.
3. **Retrieval-Augmented Generation (RAG):**
   - Chroma Vector store retrieves similar crop data based on agricultural documents.
   - Crop Database API provides specific seasonal/soil advisory.
4. **LLM Generation:** ChatGPT or Gemini processes the context + data to compute an answer in simpler language.
5. **Output Delivery:** Sarvam TTS speaks out the solution back to the user alongside text.

## Vector Store Initialization
On the start of the server, sample text knowledge (`data/` folder) is converted to vector embeddings (using OpenAI embeddings) and pushed to an in-memory or remote Chroma instance using Langchain.
