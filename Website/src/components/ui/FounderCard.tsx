import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, ExternalLink } from 'lucide-react';

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

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

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
      className="relative h-[560px] w-full rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-3 shadow-2xl transition-all duration-500 group cursor-pointer perspective-1000"
    >
      {/* Dynamic Background Glow */}
      <div 
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-15 transition-opacity duration-700 blur-[100px]"
        style={{ backgroundColor: color }}
      />

      <div
        style={{
          transform: 'translateZ(50px)',
          transformStyle: 'preserve-3d',
        }}
        className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/20 bg-surface/90 backdrop-blur-xl shadow-2xl"
      >
        {/* Image Section */}
        <div className="relative h-[65%] w-full overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
          />
          
          {/* Advanced Gradient Mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/20 to-transparent opacity-90" />
          
          {/* Floating Socials */}
          <div className="absolute top-6 left-6 flex flex-col gap-3 translate-x-[-100px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 delay-100">
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.1, backgroundColor: color }}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:text-white transition-colors"
            >
              <Linkedin size={18} />
            </motion.a>
            <motion.a 
              href="#" 
              whileHover={{ scale: 1.1, backgroundColor: color }}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl hover:text-white transition-colors"
            >
              <Twitter size={18} />
            </motion.a>
          </div>

          {/* Premium Tag */}
          <div 
            className="absolute top-6 right-6 px-5 py-2 rounded-2xl backdrop-blur-xl border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-2xl z-10 flex items-center gap-2"
            style={{ backgroundColor: `${color}99` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {role}
          </div>
        </div>

        {/* Content Section */}
        <div 
          style={{ transform: 'translateZ(40px)' }}
          className="flex h-[35%] flex-col justify-between p-8 pt-4"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-headline font-bold text-primary tracking-tight">
                {name}
              </h3>
            </div>
            <p className="line-clamp-2 text-sm font-body italic leading-relaxed text-on-surface-variant/80 border-l-2 border-primary/10 pl-4">
              {description}
            </p>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex -space-x-2">
               {/* Decorative dots for visual balance */}
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
               <div className="w-2 h-2 rounded-full opacity-40 ml-1" style={{ backgroundColor: color }} />
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={profilePath}
                className="group/link inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:shadow-primary/20 hover:brightness-110"
              >
                Full Story
                <ExternalLink size={14} className="transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Light Shine */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] duration-[1500ms]" />
      </div>
    </motion.div>
  );
};

