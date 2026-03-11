import { motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';
import { RiRobot2Line } from 'react-icons/ri';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    message: string;
    isTyping?: boolean;
    audio?: string;
    inputType?: 'text' | 'voice';
}

export default function MessageBubble({ role, message, isTyping, audio, inputType }: MessageBubbleProps) {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            {!isUser && (
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white shrink-0 shadow-md">
                    <RiRobot2Line size={18} />
                </div>
            )}
            <div
                className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    isUser
                        ? 'bg-primary text-white rounded-xl rounded-br-none'
                        : 'bg-white border border-primary/5 rounded-xl rounded-tl-none'
                }`}
            >
                {isTyping ? (
                    <TypingDots />
                ) : isUser ? (
                    <span className="whitespace-pre-wrap">{message}</span>
                ) : inputType === 'voice' && audio ? (
                    <div>
                        <div className="text-primary font-medium text-xs mb-1">🎙️ Voice Response</div>
                    </div>
                ) : (
                    <div className="prose prose-sm prose-slate max-w-none [&>p]:m-0 [&>ul]:my-1 [&>ol]:my-1">
                        <ReactMarkdown>{message}</ReactMarkdown>
                    </div>
                )}

                {/* Audio player for AI responses */}
                {audio && !isUser && (
                    <div className="mt-2">
                        <audio
                            controls
                            autoPlay
                            className="w-full h-8 [&::-webkit-media-controls-panel]:bg-primary/5"
                            src={`data:audio/wav;base64,${audio}`}
                        />
                    </div>
                )}
            </div>
            {isUser && (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FiUser size={16} />
                </div>
            )}
        </motion.div>
    );
}

function TypingDots() {
    return (
        <span className="flex gap-1.5 py-1 px-1">
            {[0, 1, 2].map(i => (
                <span
                    key={i}
                    className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </span>
    );
}
