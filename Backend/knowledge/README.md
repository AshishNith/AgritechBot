Knowledge Base Folder

Purpose
- Put agriculture documents here to feed the chatbot RAG system.

Supported file types
- .md
- .txt
- .json

How to ingest
1. Ensure MongoDB and ChromaDB are running.
2. From Backend folder run: npm run kb:ingest
3. Optional custom directory: npm run kb:ingest -- ./knowledge

Notes
- Ingestion is idempotent (upsert) using content-hashed IDs.
- Large files are chunked automatically for better retrieval.
