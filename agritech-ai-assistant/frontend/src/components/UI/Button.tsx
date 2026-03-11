import { motion, type HTMLMotionProps } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    icon?: React.ReactNode;
    fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
    primary: 'bg-primary text-white shadow-md hover:bg-primary-light',
    secondary: 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20',
    outline: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
};

export default function Button({ children, variant = 'primary', icon, fullWidth, className = '', ...props }: ButtonProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            className={`flex items-center justify-center gap-2 font-bold rounded-xl px-6 py-3 text-sm transition-colors ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            {icon}
            {children}
        </motion.button>
    );
}
