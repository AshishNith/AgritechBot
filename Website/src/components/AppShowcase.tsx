import { motion, useScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mic, ShieldCheck, ZapOff, Fingerprint } from 'lucide-react';
import { useRef } from 'react';

export default function AppShowcase() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rotateY = useTransform(scrollYProgress, [0, 1], [-15, 15]);
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <section 
      ref={containerRef}
      className="py-24 md:py-32 bg-surface relative overflow-hidden"
    >
      {/* Premium Studio Lighting Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[140px] rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-[-10%] w-[50%] h-[50%] bg-tertiary-fixed/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Editorial Content Column */}
          <div className="order-2 lg:order-1 space-y-12">
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 text-primary font-bold tracking-[0.2em] uppercase text-[10px]"
              >
                <div className="w-10 h-[1px] bg-primary/30"></div>
                {t('appShowcase.subtitle')}
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tight leading-[1.1]"
              >
                {t('appShowcase.title')}
              </motion.h2>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-on-surface-variant font-body leading-relaxed max-w-xl"
              >
                {t('appShowcase.desc')}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-primary border border-outline-variant/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <ZapOff size={18} />
                  </div>
                  <h4 className="text-base font-bold text-primary">{t('appShowcase.offlineSupport')}</h4>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed pl-14">
                  {t('appShowcase.reliableIntel')}
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-surface-container rounded-xl flex items-center justify-center text-primary border border-outline-variant/10 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="text-base font-bold text-primary">{t('appShowcase.dataPrivacy')}</h4>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed pl-14">
                  {t('appShowcase.enterpriseSecurity')}
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="pt-4 flex items-center gap-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-surface bg-primary/10 flex items-center justify-center overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Farmer" className="w-full h-full object-cover grayscale" />
                  </div>
                ))}
              </div>
              <div className="text-xs">
                <span className="block font-bold text-primary">{t('appShowcase.joinFarmers')}</span>
                <span className="text-on-surface-variant">{t('appShowcase.modernizingAg')}</span>
              </div>
            </motion.div>
          </div>

          {/* 3D Visual Column */}
          <div className="order-1 lg:order-2 flex justify-center items-center relative py-12 lg:py-0">
            {/* The "Center Light Beam" */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[120%] h-[120%] bg-primary/5 blur-[100px] rounded-full scale-110"></div>
            </div>

            <motion.div 
              style={{ rotateY, y }}
              className="relative z-10 perspective-2000"
            >
              <div className="relative group">
                <motion.img
                  initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-[300px] md:max-w-[380px] h-auto object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative z-20 transition-all duration-700 group-hover:drop-shadow-[0_60px_100px_rgba(0,0,0,0.25)]"
                  alt="Anaaj.ai App Interface"
                  src="/assets/AppScreen.png"
                />
                
                {/* Visual Accent: Voice Waveform Hint */}
                <div className="absolute -left-8 top-1/3 z-30 hidden md:block">
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-2xl flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                      <Mic size={16} />
                    </div>
                    <div className="flex gap-1 h-4 items-center">
                      {[1, 2, 3, 2, 1].map((h, i) => (
                        <motion.div 
                          key={i}
                          animate={{ height: [8, 16, 8] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1 bg-primary/40 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Visual Accent: Security Badge */}
                <div className="absolute -right-4 bottom-1/4 z-30 hidden md:block">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    className="bg-tertiary-fixed text-on-tertiary-fixed p-4 rounded-[2rem] shadow-2xl flex items-center gap-3"
                  >
                    <Fingerprint size={20} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t('appShowcase.biometricSecure')}</span>
                  </motion.div>
                </div>
              </div>

              {/* Reflection Layer */}
              <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-primary/20 blur-[40px] rounded-[100%] -z-10 opacity-40"></div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
