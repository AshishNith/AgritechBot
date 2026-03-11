import { useState, useRef } from 'react';
import { FiSend, FiImage, FiMic } from 'react-icons/fi';

interface ChatInputProps {
    onSendText: (text: string) => void;
    onSendImage: (file: File) => void;
    onVoiceClick: () => void;
    disabled?: boolean;
}

export default function ChatInput({ onSendText, onSendImage, onVoiceClick, disabled }: ChatInputProps) {
    const [text, setText] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || disabled) return;
        onSendText(text.trim());
        setText('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onSendImage(file);
        e.target.value = '';
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-background-light rounded-full border border-primary/20 px-4 py-2">
                <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="text-primary/60 hover:text-primary mr-2"
                >
                    <FiImage size={20} />
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                />
                <input
                    type="text"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Ask about your crops..."
                    disabled={disabled}
                    className="bg-transparent border-none focus:ring-0 text-sm flex-1 outline-none placeholder:text-slate-400"
                />
                <button
                    type="submit"
                    disabled={disabled || !text.trim()}
                    className="text-primary hover:text-primary-light ml-2 disabled:opacity-40"
                >
                    <FiSend size={20} />
                </button>
            </div>
            <button
                type="button"
                onClick={onVoiceClick}
                className="bg-primary w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
                <FiMic size={20} />
            </button>
        </form>
    );
}
