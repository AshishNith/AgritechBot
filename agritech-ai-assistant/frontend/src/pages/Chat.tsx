import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { RiPlantLine } from 'react-icons/ri';
import ChatWindow, { type ChatMessage } from '../components/Chat/ChatWindow';
import ChatInput from '../components/Chat/ChatInput';
import VoiceInput from '../components/Chat/VoiceInput';
import { sendChatMessage, sendVoiceMessage } from '../services/api';

const WELCOME_TEXT: Record<string, string> = {
    Hindi: 'नमस्ते किसान भाई! मैं आपका कृषि सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?',
    Punjabi: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਭਰਾ! ਮੈਂ ਤੁਹਾਡਾ ਖੇਤੀ ਸਹਾਇਕ ਹਾਂ।',
    Gujarati: 'નમસ્તે ખેડૂત ભાઈ! હું તમારો કૃષિ સહાયક છું.',
    English: 'Hello Farmer! I am your Agri AI assistant. How can I help you today?',
};

export default function Chat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceOpen, setVoiceOpen] = useState(false);
    const [language, setLanguage] = useState('Hindi');
    const [hasStarted, setHasStarted] = useState(false);
    const sessionId = useRef(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const welcomeAudioRef = useRef<HTMLAudioElement | null>(null);

    const handleStart = () => {
        setHasStarted(true);
        setMessages([{
            role: 'assistant',
            message: WELCOME_TEXT[language] ?? WELCOME_TEXT['Hindi'],
            audioUrl: '/InitialAudio.wav',
            inputType: 'voice',
        }]);
        // Play inside click handler — satisfies browser autoplay policy
        if (welcomeAudioRef.current) {
            welcomeAudioRef.current.play().catch(() => {/* silently ignored if blocked */});
        }
    };

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
            className="flex-1 relative flex flex-col w-full h-full"
        >
            {/* Hidden audio element for the welcome message — played via ref on user click */}
            <audio ref={welcomeAudioRef} src="/InitialAudio.wav" preload="auto" />

            {!hasStarted ? (
                /* ── Start Screen ── */
                <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
                        <RiPlantLine size={40} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">Anaaj AI Assistant</h2>
                        <p className="text-slate-500 text-sm mt-1">Your smart farming companion</p>
                    </div>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-primary/10 text-primary px-5 py-2.5 rounded-full border border-primary/20 font-semibold text-sm"
                    >
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                        <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                        <option value="English">English</option>
                    </select>
                    <button
                        onClick={handleStart}
                        className="rounded-full bg-primary px-10 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-light active:scale-95 transition-all"
                    >
                        Start Assistant 🌱
                    </button>
                    <p className="text-slate-400 text-xs">Tap to initialise voice & chat</p>
                </div>
            ) : (
                <>
                    {/* Mobile header — pinned top */}
                    <div className="lg:hidden shrink-0 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-primary/10 z-10">
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

                    {/* Desktop language selector — pinned top */}
                    <div className="hidden lg:flex shrink-0 items-center justify-end px-4 py-2 bg-background-light border-b border-primary/5">
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

                    {/* Scrollable messages — takes remaining height */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        <div className="max-w-4xl mx-auto w-full h-full">
                            <ChatWindow messages={messages} isLoading={isLoading} />
                        </div>
                    </div>

                    {/* Input bar — pinned bottom */}
                    <div className="shrink-0 px-4 py-3 bg-white/95 backdrop-blur-lg border-t border-primary/10">
                        <div className="max-w-4xl mx-auto">
                            <ChatInput
                                onSendText={handleSend}
                                onSendImage={handleImage}
                                onVoiceClick={() => setVoiceOpen(true)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                </>
            )}

            <VoiceInput
                isOpen={voiceOpen}
                onClose={() => setVoiceOpen(false)}
                onVoiceResult={(audioBlob) => {
                    setVoiceOpen(false);
                    handleVoice(audioBlob);
                }}
            />
        </motion.div>
    );
}
