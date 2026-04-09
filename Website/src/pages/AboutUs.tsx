import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Founders from '../components/Founders';

export default function AboutUs() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <div ref={containerRef} className="bg-surface min-h-screen selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
      <Helmet>
        <title>{t('aboutUs.pages.about.title') || t('pages.about.title')}</title>
        <meta name="description" content={t('aboutUs.pages.about.metaDesc') || t('pages.about.metaDesc')} />
      </Helmet>

      <Navbar />

      <main className="overflow-hidden">
        {/* Cinematic Hero */}
        <section className="relative min-h-[90vh] flex items-center pt-32 pb-24 px-8 overflow-hidden">
          <div className="absolute inset-0 z-0 scale-110">
            <img 
              src="/about_hero_cinematic_1775669897657.png" 
              className="w-full h-full object-cover opacity-60 grayscale-[20%] brightness-90 shadow-inner"
              alt="Cinematic wheat field"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-surface via-transparent to-surface opacity-90"></div>
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white w-fit mb-10 shadow-lg"
              >
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] font-label">{t('aboutUs.hero.established')}</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-7xl md:text-[10rem] font-headline font-bold text-primary tracking-tighter leading-[0.85] mb-12"
              >
                {t('aboutUs.hero.titleLine1')} <br />
                <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t('aboutUs.hero.titleLine2')}</span>
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="flex flex-col md:flex-row gap-12 items-start"
              >
                <p className="text-xl md:text-2xl text-on-surface-variant font-body leading-relaxed max-w-xl">
                  {t('aboutUs.hero.description')}
                </p>
                <div className="flex flex-col pt-2">
                   <span className="text-4xl font-headline font-bold text-primary">{t('aboutUs.hero.trustedFarmers')}</span>
                   <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{t('aboutUs.hero.trustedFarmersLabel')}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Narrative Contrast */}
        <section className="bg-primary-container text-white py-40 relative">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              style={{ y: y1 }}
              className="relative aspect-[3/4] rounded-[4rem] overflow-hidden border-8 border-white/5 shadow-2xl"
            >
              <img 
                src="/about_narrative_farmer_1775669919705.png" 
                alt="Empowered Farmer" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div>
              <span className="text-tertiary-fixed font-bold uppercase tracking-[0.2em] text-xs mb-6 block">{t('aboutUs.mission.label')}</span>
              <h2 className="text-5xl md:text-7xl font-headline font-bold mb-10 leading-tight">{t('aboutUs.mission.title')} <span className="italic text-primary-fixed">{t('aboutUs.mission.titleItalic')}</span></h2>
              <div className="space-y-8 text-xl opacity-90 leading-relaxed font-body font-light">
                <p>
                  {t('aboutUs.mission.p1')}
                </p>
                <p className="p-8 border-l-4 border-tertiary-fixed bg-white/5 italic rounded-r-3xl">
                  {t('aboutUs.mission.quote')}
                </p>
                <p>
                  {t('aboutUs.mission.p2')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Values */}
        <section className="py-40 bg-surface">
          <div className="max-w-7xl mx-auto px-8">
            <div className="mb-24 flex flex-col items-center text-center">
              <h2 className="text-5xl md:text-8xl font-headline font-bold text-primary tracking-tighter mb-8">{t('aboutUs.dna.title')}</h2>
              <p className="text-xl text-on-surface-variant max-w-xl">{t('aboutUs.dna.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 grid-rows-3 gap-6 h-[1000px] md:h-[800px]">
              {/* Multilingual */}
              <motion.div whileHover={{ y: -10 }} className="md:col-span-3 md:row-span-2 bg-secondary-container rounded-[3rem] p-12 flex flex-col justify-end relative overflow-hidden group">
                <span className="material-symbols-outlined text-7xl text-primary/10 absolute top-10 right-10 group-hover:scale-125 transition-transform duration-500">translate</span>
                <h3 className="text-4xl font-headline font-bold text-primary mb-4">{t('aboutUs.dna.multilingual.title')}</h3>
                <p className="text-lg text-primary/70">{t('aboutUs.dna.multilingual.desc')}</p>
              </motion.div>

              {/* Data Driven */}
              <motion.div whileHover={{ y: -10 }} className="md:col-span-3 md:row-span-1 bg-tertiary-container text-tertiary-fixed rounded-[3rem] p-12 flex items-center gap-10">
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-4xl">science</span>
                </div>
                <div>
                  <h3 className="text-3xl font-headline font-bold mb-2">{t('aboutUs.dna.scientific.title')}</h3>
                  <p className="opacity-80">{t('aboutUs.dna.scientific.desc')}</p>
                </div>
              </motion.div>

              {/* Sustainable */}
              <motion.div whileHover={{ y: -10 }} className="md:col-span-3 md:row-span-1 bg-surface-container-high rounded-[3rem] p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-headline font-bold text-primary mb-2">{t('aboutUs.dna.sustainable.title')}</h3>
                <p className="text-on-surface-variant">{t('aboutUs.dna.sustainable.desc')}</p>
              </motion.div>

              {/* Scalable Impact */}
              <motion.div whileHover={{ y: -10 }} className="md:col-span-4 md:row-span-1 bg-primary text-white rounded-[3rem] p-12 flex items-center justify-between overflow-hidden relative">
                <div className="relative z-10">
                   <h3 className="text-4xl font-headline font-bold mb-2">{t('aboutUs.dna.builtForScale.title')}</h3>
                   <p className="opacity-70 text-lg">{t('aboutUs.dna.builtForScale.desc')}</p>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/5 blur-3xl rounded-full"></div>
              </motion.div>

              {/* Secure */}
              <motion.div whileHover={{ y: -10 }} className="md:col-span-2 md:row-span-1 bg-surface-container rounded-[3rem] p-12 flex flex-col justify-center items-center text-center">
                 <span className="material-symbols-outlined text-4xl text-primary mb-4">verified_user</span>
                 <h3 className="text-xl font-bold text-primary">{t('aboutUs.dna.privacy.title')}</h3>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Founders */}
        <section className="bg-surface relative z-10">
           <Founders />
        </section>

        {/* Impact Visualizer */}
        <section className="py-40 bg-surface relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(190,245,0,0.1),transparent)] pointer-events-none"></div>
           <div className="max-w-7xl mx-auto px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                <div>
                  <h2 className="text-6xl md:text-8xl font-headline font-bold text-primary tracking-tighter mb-10 leading-none">{t('aboutUs.impact.title')} <br/> <span className="text-tertiary-fixed-variant">{t('aboutUs.impact.titleAudible')}</span></h2>
                  <p className="text-xl text-on-surface-variant font-body leading-relaxed mb-12">
                    {t('aboutUs.impact.description')}
                  </p>
                  <button className="px-10 py-5 rounded-full bg-primary text-white font-bold text-lg hover:scale-105 transition-transform shadow-2xl flex items-center gap-4 group">
                    {t('aboutUs.impact.cta')}
                    <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
                  </button>
                </div>
                <div className="relative">
                   <div className="w-[500px] h-[500px] rounded-full border border-primary/5 absolute -top-20 -left-20 animate-pulse"></div>
                   <div className="w-[400px] h-[400px] rounded-full bg-gradient-to-br from-tertiary-fixed to-primary shadow-2xl flex items-center justify-center p-20 text-center">
                      <div className="text-white">
                         <h4 className="text-8xl font-headline font-bold mb-4">{t('aboutUs.impact.statValue')}</h4>
                         <p className="uppercase tracking-[0.3em] font-bold text-sm opacity-80">{t('aboutUs.impact.statLabel')}</p>
                      </div>
                   </div>
                </div>
              </div>
           </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}
