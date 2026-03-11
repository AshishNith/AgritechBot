import 'dotenv/config';
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import fs from 'fs';
import path from 'path';

let vectorStore: Chroma | null = null;
const CHROMA_COLLECTION = 'agritech_knowledge';

export async function initializeVectorStore() {
    try {
        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: process.env.GEMINI_API_KEY,
            model: "embedding-001",
        });

        // Use in-memory Chroma setup if possible, or remote. 
        // For local development MVP, Langchain's Chroma client connects to a local Chroma server running on port 8000 by default.
        vectorStore = new Chroma(embeddings, {
            collectionName: CHROMA_COLLECTION,
            url: "http://localhost:8000", // requires Chroma docker running locally, or use MemoryVectorStore if Chrome is not present
        });

        // To make this MVP self-contained when Chroma might not be running, we can load documents during init.
        // We will mock populating if it's empty.

        console.log("Vector store initialized.");
        await populateSampleData();
    } catch (error) {
        console.error("Vector store initialization error:", error);
    }
}

export async function populateSampleData() {
    if (!vectorStore) return;

    // Sample documents 
    const docsDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
        // Create sample files
        fs.writeFileSync(path.join(docsDir, 'wheat_disease.txt'), "Wheat rust is a fungal disease. Treat it using fungicides like Propiconazole. Spray early in the morning.");
        fs.writeFileSync(path.join(docsDir, 'fertilizer_guide.txt'), "For tomatoes, use NPK 19:19:19. Apply 5 grams per plant during the flowering stage.");
        fs.writeFileSync(path.join(docsDir, 'pest_control.txt'), "Whiteflies on tomato plants (Safed keede) can be controlled by spraying Neem oil (10000 ppm) mixed with liquid soap, 5ml per liter of water.");
        fs.writeFileSync(path.join(docsDir, 'irrigation_methods.txt'), "Drip irrigation saves 40% water. Turn on drip for 2 hours every morning for vegetable crops.");
    }

    // In a real scenario, you'd check if the collection already has docs. 
    // Since Chroma persists, we wrap adding docs in a simple try-block and assume we ingest if we want to.
    try {
        const existingDocs = await vectorStore.collection?.count();
        if (existingDocs === 0) {
            console.log("Adding sample documents to Vector Store...");
            const files = fs.readdirSync(docsDir);
            const documents: Document[] = [];

            for (const file of files) {
                if (file.endsWith('.txt')) {
                    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
                    documents.push(new Document({ pageContent: content, metadata: { source: file } }));
                }
            }

            await vectorStore.addDocuments(documents);
            console.log("Sample documents added successfully.");
        }
    } catch (err) {
        console.warn("Could not check/add documents to Chroma. Ensure Chroma DB is running on localhost:8000.", err);
    }
}

export async function retrieveContext(query: string): Promise<string> {
    if (!vectorStore) {
        console.log("Vector store not initialized.");
        return "";
    }

    try {
        const results = await vectorStore.similaritySearch(query, 2);
        return results.map((r: Document) => r.pageContent).join('\n---\n');
    } catch (error) {
        console.error("Vector Search failed:", error);
        return "";
    }
}
