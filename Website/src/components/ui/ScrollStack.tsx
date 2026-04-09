import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import './ScrollStack.css';

interface ScrollStackItemProps {
  children: React.ReactNode;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

const Card: React.FC<ScrollStackItemProps> = ({ children, index, total, progress }) => {
  // Stacking logic: 
  // Card starts to fade/scale only when it's being covered by subsequent cards.
  const startTransition = (index + 1) / total;
  const endTransition = Math.min(startTransition + 0.1, 1);

  const scale = useTransform(progress, [startTransition, endTransition], [1, 0.93], { clamp: true });
  const opacity = useTransform(progress, [startTransition, endTransition], [1, 0.8], { clamp: true });
  const blur = useTransform(progress, [startTransition, endTransition], [0, 5], { clamp: true });

  return (
    <motion.div
      style={{
        scale,
        opacity,
        filter: useTransform(blur, (v) => v > 0 ? `blur(${v}px)` : 'none'),
        top: `calc(10vh + ${index * 25}px)`, // Dynamic overlap
        zIndex: index + 10
      }}
      className="scroll-stack-card-sticky"
    >
      {children}
    </motion.div>
  );
};

interface ScrollStackProps {
  children: React.ReactNode[];
  className?: string;
}

const ScrollStack: React.FC<ScrollStackProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className={`scroll-stack-wrapper ${className}`}>
      {children.map((child, i) => (
        <Card 
          key={i} 
          index={i} 
          total={children.length} 
          progress={scrollYProgress}
        >
          {child}
        </Card>
      ))}
    </div>
  );
};

export default ScrollStack;

// Exporting item as a simple passthrough for backward compatibility if needed,
// though the new structure maps children directly.
export const ScrollStackItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);