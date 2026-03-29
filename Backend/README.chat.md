# Anaaj.ai Chat Module

This repository now includes a production-ready session-based AI chat module under `src/chat/`.

## What it does

- Creates multiple chat sessions per farmer under `/api/v1/chat/sessions`
- Builds persistent farmer-aware context from the existing `User` profile
- Injects curated agriculture knowledge through Gemini Context Caching
- Preserves long conversations with rolling history and automatic summarization
- Supports Gemini function calling with scaffolded weather, crop calendar, and mandi price tools
- Stores every chat message, tool call, tool result, and assistant failure in MongoDB

## Folder layout

```text
src/chat/
  controllers/
  data/
  middleware/
  models/
  routes/
  services/
  tools/
  utils/
```

## Context system

Every AI response is built from three layers:

1. `systemPrompt.txt`
   The stable Krishi advisor behavior and safety instructions.

2. Farmer context
   Built from the existing `User` model and cached in both MongoDB (`FarmerContext`) and Redis (`chat:context:{farmerId}`).

3. Rolling conversation history
   The service keeps recent turns directly and summarizes older turns when the estimated token budget is exceeded.

## Knowledge base cache

The curated knowledge file lives at `src/chat/data/knowledgeBase.json`.

On backend startup:

- the file is formatted into a single knowledge string
- uploaded to Gemini Context Cache with a one-hour TTL
- the cache name is stored in Redis under `gemini:kb:cacheId`
- the cache is refreshed every 55 minutes

If the Redis key is missing, the service rebuilds the cache automatically.

## Adding knowledge

Update `src/chat/data/knowledgeBase.json` and restart the backend. The next cache refresh will publish the new knowledge into Gemini.

Recommended sections:

- `cropDiseases`
- `pests`
- `fertilizers`
- `seasons`
- `governmentSchemes`
- `soilTypes`
- `irrigation`

## Tool activation

The tool registry lives in `src/chat/tools/index.ts`.

Current tools:

- `get_weather`
- `get_crop_calendar`
- `get_mandi_price`

Today:

- weather returns placeholder data
- crop calendar uses curated season data
- mandi price returns a graceful coming-soon response

To activate real tools:

1. replace the stub `execute` logic in the relevant tool file
2. keep the input schema stable unless the client also changes
3. return verified source data only
4. preserve graceful fallback behavior for provider outages

## Routes

All routes are JWT-protected and mounted under `/api/v1/chat`.

- `POST /sessions`
- `GET /sessions`
- `GET /sessions/:sessionId`
- `PUT /sessions/:sessionId`
- `DELETE /sessions/:sessionId`
- `POST /sessions/:sessionId/message`
- `POST /sessions/:sessionId/message/stream`
- `GET /sessions/:sessionId/messages`
- `GET /context`
- `DELETE /sessions/:sessionId/history`

## Rate limits

Chat-specific limits are separate from generic API rate limits:

- max 1 message per 3 seconds per farmer
- max 60 messages per hour per farmer
- daily subscription limit still enforced by plan

## Health metrics

`/health` now includes:

- average AI response time from recent assistant messages
- Gemini cached-content hit rate
- active sessions in the last 24 hours
- failed message rate

## Notes

- The backend is TypeScript/Fastify, so the requested `.js` architecture is implemented as `.ts` files in the same structure.
- The mobile app and website now use the new session-based chat routes.
- Website chat requires a valid farmer JWT because the public website still does not own a user login flow.
