import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatWindow, { type ChatMessage } from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import VoiceInput from '../components/Chat/VoiceInput';
import { sendChatMessage, sendVoiceMessage } from '../services/api';

export default function Chat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceOpen, setVoiceOpen] = useState(false);
    const [language, setLanguage] = useState('Hindi');
    const sessionId = useRef(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`);

    const handleSend = useCallback(async (text: string) => {
        const userMsg: ChatMessage = { role: 'user', message: text, inputType: 'text' };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const data = await sendChatMessage(text, language, 'gemini', sessionId.current);
            const aiMsg: ChatMessage = {
                role: 'assistant',
                message: data.answer,
                audio: data.audio,
                inputType: 'text',
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', message: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    }, [language]);

    const handleVoice = useCallback(async (audioBlob: Blob) => {
        setMessages(prev => [...prev, { role: 'user', message: '🎤 [Voice Query]', inputType: 'voice' }]);
        setIsLoading(true);

        try {
            const data = await sendVoiceMessage(audioBlob, 'gemini', sessionId.current);

            // Update the temp user message with the transcribed text
            setMessages(prev => {
                const updated = [...prev];
                for (let i = updated.length - 1; i >= 0; i--) {
                    if (updated[i].role === 'user' && updated[i].message === '🎤 [Voice Query]') {
                        updated[i] = { ...updated[i], message: `🎤 ${data.question}` };
                        break;
                    }
                }
                return updated;
            });

            const aiMsg: ChatMessage = {
                role: 'assistant',
                message: data.answer,
                audio: data.audio,
                inputType: 'voice',
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', message: 'Sorry, I encountered an error processing your voice.' }]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleImage = useCallback(async (file: File) => {
        const userMsg: ChatMessage = { role: 'user', message: `[Image uploaded: ${file.name}]` };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const data = await sendChatMessage(`I uploaded an image of my crop. Please analyze it.`, language, 'gemini', sessionId.current);
            setMessages(prev => [...prev, { role: 'assistant', message: data.answer }]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', message: 'Sorry, could not process the image.' }]);
        } finally {
            setIsLoading(false);
        }
    }, [language]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full"
        >
            {/* Header — mobile only (desktop uses App top nav) */}
            <header className="lg:hidden sticky top-0 z-10 bg-background-light/80 backdrop-blur-md border-b border-primary/10">
                <div className="flex items-center p-4 justify-between">
                    <h1 className="text-xl font-bold tracking-tight">Anaaj AI</h1>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 font-medium"
                    >
                        <option value="Hindi">हिंदी</option>
                        <option value="Punjabi">ਪੰਜਾਬੀ</option>
                        <option value="Gujarati">ગુજરાતી</option>
                        <option value="English">English</option>
                    </select>
                </div>
            </header>

            {/* Desktop language selector */}
            <div className="hidden lg:flex items-center justify-end px-4 py-2">
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full border border-primary/20 font-medium"
                >
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="English">English</option>
                </select>
            </div>

            <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                <ChatWindow messages={messages} isLoading={isLoading} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/90 backdrop-blur-lg border-t border-primary/10">
                <div className="max-w-4xl mx-auto">
                <ChatInput
                    onSendText={handleSend}
                    onSendImage={handleImage}
                    onVoiceClick={() => setVoiceOpen(true)}
                    disabled={isLoading}
                />
                </div>
            </div>

            <VoiceInput
                isOpen={voiceOpen}
                onClose={() => setVoiceOpen(false)}
                