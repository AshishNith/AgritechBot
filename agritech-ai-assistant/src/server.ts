import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import askRoute from './routes/askRoute';
import voiceRoute from './routes/voiceRoute';
import { initializeVectorStore } from './database/vectorStore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://agritech-bot.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Render health checks)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(null, false); // Block other origins gracefully
    },
    credentials: true,
}));
app.use(express.json());

// Routes
app.use('/ask', askRoute);
app.use('/voice', voiceRoute);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Agritech AI Assistant API is running' });
});

async function startServer() {
    try {   
        console.log('Initializing Vector Store for RAG...');
        await initializeVectorStore();
        
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
