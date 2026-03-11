import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiX } from 'react-icons/fi';

interface VoiceInputProps {
    onVoiceResult: (audioBlob: Blob) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function VoiceInput({ onVoiceResult, isOpen, onClose }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                stream.getTracks().forEach(t => t.stop());
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                onVoiceResult(audioBlob);
                onClose();
            };

            recorder.start();
            setIsRecording(true);
        } catch {
            alert('Microphone access denied.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-0 z-50 bg-background-light flex flex-col"
                >
                    {/* Header */}
                    <header className="flex items-center justify-between p-4">
                        <button onClick={onClose} className="p-2 text-primary">
                            <FiX size={24} />
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-bold tracking-widest text-primary uppercase">Anaaj AI</span>
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 bg-primary rounded-full" />
                                <span className="text-xs font-medium text-primary">Voice Mode</span>
                            </div>
                        </div>
                        <div className="w-10" />
                    </header>

                    {/* Main */}
                    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                        <h2 className="text-2xl font-bold mb-4 text-slate-900">
                            {isRecording ? 'Listening...' : 'Tap the mic to start speaking'}
                        </h2>

                        <div className="bg-primary/10 rounded-xl p-6 w-full mb-8 min-h-[80px] flex items-center justify-center border border-primary/20">
                            <p className="text-lg italic text-slate-600">
                                {isRecording ? '"Recording your voice..."' : '"Tell me about your crop problem..."'}
                            </p>
                        </div>

                        {/* Waveform */}
                        {isRecording && (
                            <div className="flex items-center justify-center gap-1 h-24 mb-4">
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-1.5 bg-primary rounded-full"
                                        animate={{ height: [12, 40 + Math.random() * 40, 12] }}
                                        transition={{ duration: 0.6 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.08 }}
                                    />
                                ))}
                            </div>
                        )}

                        {isRecording && (
                            <p className="text-primary font-medium tracking-wide animate-pulse mb-8">LISTENING</p>
                        )}

                        {/* Mic Button */}
                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={`rounded-full p-6 shadow-xl transition-transform active:scale-95 ${
                                isRecording
                                    ? 'bg-red-600 text-white shadow-red-600/20'
                                    : 'bg-primary text-white shadow-primary/20'
                            }`}
                        >
                            {isRecording ? <FiMicOff size={32} /> : <FiMic size={32} />}
                        </button>
                        <p className="text-slate-500 text-sm mt-4">
                            {isRecording ? 'Tap to stop & send' : 'Tap to speak'}
                        </p>
                    </main>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
