/**
 * In-memory conversation history store.
 * Stores per-session chat history so the LLM can reference past turns.
 * Sessions auto-expire after 1 hour of inactivity.
 */

interface ChatTurn {
    role: 'farmer' | 'assistant';
    content: string;
}

interface Session {
    history: ChatTurn[];
    lastAccessed: number;
}

const sessions = new Map<string, Session>();
const MAX_TURNS = 20;           // Keep last 20 messages (10 exchanges)
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

/** Get conversation history for a session */
export function getHistory(sessionId: string): ChatTurn[] {
    const session = sessions.get(sessionId);
    if (!session) return [];
    session.lastAccessed = Date.now();
    return session.history;
}

/** Add a farmer question + assistant answer to the session */
export function addToHistory(sessionId: string, question: string, answer: string): void {
    let session = sessions.get(sessionId);
    if (!session) {
        session = { history: [], lastAccessed: Date.now() };
        sessions.set(sessionId, session);
    }

    session.history.push({ role: 'farmer', content: question });
    session.history.push({ role: 'assistant', content: answer });

    // Trim to keep only the most recent turns
    if (session.history.length > MAX_TURNS) {
        session.history = session.history.slice(-MAX_TURNS);
    }

    session.lastAccessed = Date.now();
}

/** Format history into a string the LLM prompt can consume */
export function formatHistory(sessionId: string): string {
    const history = getHistory(sessionId);
    if (history.length === 0) return '';

    return history
        .map(turn => `${turn.role === 'farmer' ? 'Farmer' : 'You'}: ${turn.content}`)
        .join('\n');
}

// Cleanup expired sessions every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
        if (now - session.lastAccessed > SESSION_TTL_MS) {
            sessions.delete(id);
        }
    }
}, 10 * 60 * 1000);
