# 🚀 AnaajAI Deployment Guide

## Prerequisites

- **Node.js** 20+ (LTS)
- **Docker** & **Docker Compose** (for containerized deployment)
- **MongoDB** 7+
- **Redis** 7+
- **ChromaDB** (optional, for RAG features)

---

## Backend Deployment

### Option 1: Docker (Recommended)

```bash
cd Backend

# 1. Configure production environment
cp .env.example .env
# Edit .env with production values (see checklist below)

# 2. Deploy with Docker Compose
docker compose -f docker-compose.prod.yml up -d

# 3. Check health
curl http://localhost:4000/health
```

### Option 2: Manual Deployment

```bash
cd Backend

# 1. Install dependencies
npm ci --omit=dev

# 2. Build TypeScript
npm run build

# 3. Start with cluster mode
NODE_ENV=production node dist/cluster.js
```

### Production Environment Checklist

| Variable | Action | Critical? |
|---|---|---|
| `NODE_ENV` | Set to `production` | ✅ YES |
| `JWT_SECRET` | Generate strong random string (32+ chars) | ✅ YES |
| `CORS_ORIGINS` | Set to your frontend domain(s) | ✅ YES |
| `MONGODB_URI` | Use production MongoDB URI | ✅ YES |
| `REDIS_PASSWORD` | Set a strong Redis password | ✅ YES |
| `GEMINI_API_KEY` | Use production API key | ✅ YES |
| `SARVAM_API_KEY` | Use production API key | ✅ YES |
| `CLUSTER_WORKERS` | Set to `0` (auto) or specific count | Recommended |
| `QUEUE_CONCURRENCY` | Set to `25-50` for production | Recommended |
| `RATE_LIMIT_MAX` | Tune based on expected traffic | Optional |

### Generate a Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Website Deployment

### Build for Production

```bash
cd Website

# Install dependencies
npm ci

# Build production bundle
npm run build

# Preview locally
npm run preview
```

### Deploy to Static Hosting

The `dist/` folder can be deployed to any static hosting service:

- **Vercel**: `npx vercel --prod`
- **Netlify**: Connect your Git repo
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket
- **Firebase Hosting**: `firebase deploy`

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐
│   Mobile App    │     │    Website        │
│   (React Native)│     │    (React/Vite)   │
└────────┬────────┘     └────────┬──────────┘
         │                       │
         └───────────┬───────────┘
                     │
            ┌────────▼────────┐
            │  Fastify API    │
            │  (Cluster Mode) │
            └───┬──────┬──────┘
                │      │
     ┌──────────┘      └──────────┐
     │                            │
┌────▼────┐                ┌──────▼─────┐
│ MongoDB │                │   Redis    │
│ (Data)  │                │ (Cache/Queue)
└─────────┘                └──────┬─────┘
                                  │
                           ┌──────▼─────┐
                           │  BullMQ    │
                           │  Workers   │
                           └──────┬─────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │             │              │
              ┌─────▼────┐ ┌─────▼────┐  ┌──────▼─────┐
              │ Gemini   │ │ Sarvam   │  │  ChromaDB  │
              │ (LLM)   │ │ (Voice)  │  │  (RAG)     │
              └──────────┘ └──────────┘  └────────────┘
```

---

## Monitoring

### Health Check
```
GET /health
```

### Metrics
```
GET /metrics
```

### API Documentation (Dev Only)
```
GET /docs
```

---

## Security Notes

1. **Never commit `.env` files** — they are gitignored
2. **Rotate API keys regularly** — especially after any exposure
3. **CORS is restrictive in production** — set `CORS_ORIGINS` explicitly
4. **OTP is never returned in production API responses**
5. **Stack traces are hidden in production error responses**
6. **Swagger docs are disabled in production**
