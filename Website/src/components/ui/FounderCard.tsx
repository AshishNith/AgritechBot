import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FounderCardProps {
  name: string;
  role: string;
  description: string;
  image: string;
  profilePath: string;
  color: string;
}

export const FounderCard: React.FC<FounderCardProps> = ({
  name,
  role,
  description,
  image,
  profilePath,
  color,
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="relative h-[520px] w-full rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-2xl transition-all duration-300 group"
    >
      {/* Background Glow */}
      <div 
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl"
        style={{ backgroundColor: color }}
      />

      <div
        style={{
          transform: 'translateZ(75px)',
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full w-full overflow-hidden rounded-[1.5rem] border border-white/20 bg-surface shadow-lg"
      >
        {/* Image Container */}
        <div className="relative h-2/3 w-full overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60" />
          
          {/* Tag */}
          <div 
            className="absolute top-6 right-6 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg z-10"
            style={{ backgroundColor: `${color}80` }}
          >
            {role}
          </div>
        </div>

        {/* Content Container */}
        <div className="flex h-1/3 flex-col justify-between p-8">
          <div>
            <h3 className="mb-2 text-2xl font-headline font-bold text-primary">
              {name}
            </h3>
            <p className="line-clamp-2 text-sm font-body italic leading-relaxed text-on-surface-variant">
              "{description}"
            </p>
          </div>

          <div className="mt-4 flex items-center justify-end">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group/btn"
            >
              <Link
                to={profilePath}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-bold uppercase tracking-wider text-secondary transition-colors hover:bg-primary/10"
              >
                View Profile
                <span className="material-symbols-outlined text-sm transition-transform group-hover/btn:translate-x-1">
                  arrow_forward
                </span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-tr from-transparent via-white to-transparent" />
      </div>
    </motion.div>
  );
};
