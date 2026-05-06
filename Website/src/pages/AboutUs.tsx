import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Founders from '../components/Founders';

export default function AboutUs() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const y1 = useTransform(smoothProgress, [0, 1], [0, -100]);
  const rotate = useTransform(smoothProgress, [0, 1], [0, 3]);

  return (
    <div ref={containerRef} className="bg-surface min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Helmet>
        <title>{t('pages.about.title')}</title>
        <meta name="description" content={t('pages.about.metaDesc')} />
      </Helmet>

      <main className="relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_20%,rgba(var(--primary-rgb),0.02)_0%,transparent_50%)]"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_90%_80%,rgba(var(--tertiary-rgb),0.02)_0%,transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.01] mix-blend-overlay"></div>
        </div>

        {/* Premium Split Hero */}
        <section className="relative min-h-[90vh] flex items-center pt-32 pb-24 px-6 md:px-12 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
            <div className="order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/20 border border-primary/10 text-primary mb-6 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-label">{t('aboutUs.hero.established')}</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl md:text-6xl lg:text-7xl font-headline font-bold text-primary tracking-tighter leading-[1.4] mb-6"
              >
                {t('aboutUs.hero.titleLine1')} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient-flow italic">
                  {t('aboutUs.hero.titleLine2')}
                </span>
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="text-base md:text-lg text-on-surface-variant font-body leading-[1.6] max-w-xl mb-10"
              >
                {t('aboutUs.hero.description')}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-wrap items-center gap-6"
              >
                <div className="flex flex-col">
                   <span className="text-3xl font-headline font-bold text-primary">{t('aboutUs.hero.trustedFarmers')}</span>
                   <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-on-surface-variant/70">{t('aboutUs.hero.trustedFarmersLabel')}</span>
                </div>
                <div className="hidden sm:block h-10 w-px bg-outline-variant/30"></div>
                <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="w-9 h-9 rounded-full border-2 border-surface bg-primary-container flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Farmer" className="w-full h-full object-cover" />
                     </div>
                   ))}
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative aspect-square md:aspect-video lg:aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl group bg-primary-container/10">
                <img 
                  src="/assets/Team.png" 
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  alt="Anaaj AI Team"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-30"></div>
                
                <motion.div 
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 left-6 bg-white/10 backdrop-blur-lg border border-white/20 p-3 rounded-2xl shadow-xl"
                >
                  <span className="material-symbols-outlined text-white text-2xl">hub</span>
                </motion.div>
              </div>
              
              <div className="absolute -z-10 -top-10 -right-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            </motion.div>
          </div>
        </section>

        {/* The Mission Journey */}
        <section className="bg-primary-container text-white py-24 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10rem] md:text-[20rem] font-headline font-bold whitespace-nowrap rotate-3">
              MISSION
            </span>
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
            <motion.div 
              style={{ y: y1, rotate }}
              className="relative aspect-[4/5] rounded-[3rem] overflow-hidden border-[8px] border-white/10 shadow-2xl hidden lg:block bg-black/10"
            >
              <img 
                src="/assets/empowered_farmer.png" 
                alt="Empowered Farmer" 
                className="w-full h-full object-cover grayscale-[10%] hover:grayscale-0 transition-all duration-700"
              />
            </motion.div>

            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-tertiary-fixed font-bold uppercase tracking-[0.3em] text-[10px] mb-4 block opacity-80">{t('aboutUs.mission.label')}</span>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold mb-6 leading-[1.4]">
                  {t('aboutUs.mission.title')} <br />
                  <span className="italic text-primary-fixed">{t('aboutUs.mission.titleItalic')}</span>
                </h2>
              </motion.div>

              <div className="space-y-6 text-lg opacity-90 leading-[1.7] font-body">
                <p>{t('aboutUs.mission.p1')}</p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="p-8 border-l-4 border-tertiary-fixed bg-white/5 backdrop-blur-sm italic rounded-r-3xl shadow-lg relative overflow-hidden group"
                >
                  <p className="relative z-10 text-xl md:text-2xl font-headline leading-[1.5]">
                    {t('aboutUs.mission.quote')}
                  </p>
                </motion.div>

                <p>{t('aboutUs.mission.p2')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* The DNA (Values) */}
        <section className="py-24 bg-surface relative">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="mb-20 flex flex-col items-center text-center">
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tighter mb-6 leading-[1.4]">{t('aboutUs.dna.title')}</h2>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-secondary rounded-full mb-6"></div>
              <p className="text-base md:text-lg text-on-surface-variant max-w-2xl font-body leading-[1.6]">{t('aboutUs.dna.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Multilingual */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-8 md:row-span-2 min-h-[300px] bg-secondary-container rounded-[2.5rem] p-8 md:p-12 flex flex-col justify-end relative overflow-hidden group border border-primary/5 shadow-md"
              >
                <div className="absolute top-8 right-8 w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <span className="material-symbols-outlined text-4xl text-primary/20">translate</span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-headline font-bold text-primary mb-3 leading-[1.3]">{t('aboutUs.dna.multilingual.title')}</h3>
                  <p className="text-lg text-primary/70 max-w-sm leading-[1.6]">{t('aboutUs.dna.multilingual.desc')}</p>
                </div>
              </motion.div>

              {/* Data Driven */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-4 bg-tertiary-container/30 text-tertiary-fixed rounded-[2.5rem] p-8 flex flex-col justify-between group shadow-md border border-tertiary/10"
              >
                <span className="material-symbols-outlined text-3xl opacity-40 group-hover:rotate-12 transition-transform">science</span>
                <div className="mt-4">
                  <h3 className="text-xl font-headline font-bold mb-2 leading-[1.3]">{t('aboutUs.dna.scientific.title')}</h3>
                  <p className="text-xs opacity-80 leading-[1.6]">{t('aboutUs.dna.scientific.desc')}</p>
                </div>
              </motion.div>

              {/* Sustainable */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-4 bg-surface-container-high rounded-[2.5rem] p-8 flex flex-col justify-between group shadow-md border border-outline-variant/10"
              >
                <span className="material-symbols-outlined text-3xl text-primary opacity-40 group-hover:scale-110 transition-transform">eco</span>
                <div className="mt-4">
                  <h3 className="text-xl font-headline font-bold text-primary mb-2 leading-[1.3]">{t('aboutUs.dna.sustainable.title')}</h3>
                  <p className="text-xs text-on-surface-variant leading-[1.6]">{t('aboutUs.dna.sustainable.desc')}</p>
                </div>
              </motion.div>

              {/* Scalable Impact */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-12 bg-primary text-white rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-lg group mt-4"
              >
                <div className="relative z-10 max-w-xl text-center md:text-left">
                   <h3 className="text-3xl font-headline font-bold mb-3 leading-[1.3]">{t('aboutUs.dna.builtForScale.title')}</h3>
                   <p className="opacity-80 text-lg leading-[1.6]">{t('aboutUs.dna.builtForScale.desc')}</p>
                </div>
                <div className="mt-6 md:mt-0 relative z-10">
                   <div className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 font-bold tracking-widest text-[10px] uppercase">
                     {t('aboutUs.impact.statLabel')}
                   </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 blur-3xl rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founders Section */}
        <section className="bg-surface relative z-10 pb-16">
           <Founders />
        </section>

        {/* Impact Visualizer */}
        <section className="py-24 bg-surface relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(var(--primary-rgb),0.03),transparent_70%)] pointer-events-none"></div>
           
           <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
              <div className="bg-surface-container rounded-[3.5rem] p-8 md:p-16 border border-outline-variant/10 shadow-lg overflow-hidden relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  <div>
                    <h2 className="text-4xl md:text-6xl font-headline font-bold text-primary tracking-tighter mb-6 leading-[1.3]">
                      {t('aboutUs.impact.title')} <br/> 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">{t('aboutUs.impact.titleAudible')}</span>
                    </h2>
                    <p className="text-base md:text-lg text-on-surface-variant font-body leading-[1.6] mb-10 max-w-md">
                      {t('aboutUs.impact.description')}
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-10 py-5 rounded-full bg-primary text-white font-bold text-lg shadow-xl flex items-center gap-3 group relative overflow-hidden w-fit"
                    >
                      <span className="relative z-10">{t('aboutUs.impact.cta')}</span>
                      <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform relative z-10">arrow_forward</span>
                    </motion.button>
                  </div>

                  <div className="relative flex justify-center">
                     <div className="relative z-10 w-[260px] h-[260px] md:w-[360px] md:h-[360px] rounded-full bg-gradient-to-br from-primary via-secondary to-tertiary p-1">
                        <div className="w-full h-full rounded-full bg-surface-container-highest flex flex-col items-center justify-center text-center p-8">
                           <motion.h4 
                             initial={{ scale: 0.8, opacity: 0 }}
                             whileInView={{ scale: 1, opacity: 1 }}
                             className="text-6xl md:text-8xl font-headline font-bold text-primary mb-1"
                           >
                             {t('aboutUs.impact.statValue')}
                           </motion.h4>
                           <p className="uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs text-on-surface-variant/80">{t('aboutUs.impact.statLabel')}</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
