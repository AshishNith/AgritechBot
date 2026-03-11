import { motion } from 'framer-motion';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className={`bg-white rounded-xl shadow-sm border border-slate-100 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
        >
            {children}
        </motion.div>
    );
}
