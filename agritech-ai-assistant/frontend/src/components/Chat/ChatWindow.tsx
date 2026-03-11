import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';

export interface ChatMessage {
    role: 'user' | 'assistant';
    message: string;
    audio?: string;      // base64 from backend
    audioUrl?: string;  // static file URL
    inputType?: 'text' | 'voice';
}

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: ChatWindowProps) {
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="p-4 space-y-4 min-h-full flex flex-col">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-primary text-3xl">🌾</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">How can Anaaj AI help?</h3>
                    <p className="text-sm text-slate-500 max-w-xs">
                        Ask me about crop diseases, pest control, fertilizer, weather — anything about your farm.
                    </p>
                </div>
            )}

            <AnimatePresence>
                {messages.map((msg, i) => (
                    <MessageBubble
                        key={i}
                        role={msg.role}
                        message={msg.message}
                        audio={msg.audio}
                        audioUrl={msg.audioUrl}
                        inputType={msg.inputType}
                    />
                ))}
            </AnimatePresence>

            {isLoading && <MessageBubble role="assistant" message="" isTyping />}
            <div ref={endRef} />
        </div>
    );
}
