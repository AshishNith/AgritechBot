import React, { useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import Founders from '../components/Founders';

export default function FoundersPage() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div ref={containerRef} className="bg-surface min-h-screen selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
      <Helmet>
        <title>{t('pages.founders.title') || 'Founders | Anaaj.ai'}</title>
        <meta name="description" content={t('pages.founders.metaDesc') || 'Meet the visionaries behind Anaaj AI, transforming Indian agriculture through intelligence.'} />
      </Helmet>

      <main className="overflow-hidden">
        {/* Modern Hero Section */}
        <section className="relative min-h-[60vh] flex items-center pt-32 pb-24 px-8 overflow-hidden bg-emerald-950">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(163,230,53,0.15),transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400 text-emerald-950 w-fit mb-8 shadow-lg font-bold text-[10px] uppercase tracking-[0.3em]"
            >
              <span className="material-symbols-outlined text-sm">groups</span>
              <span>{t('founders.label')}</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-8xl font-headline font-bold text-white tracking-tighter leading-tight mb-8"
            >
              {t('founders.title')}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-xl md:text-2xl text-stone-300 font-body leading-relaxed max-w-3xl mx-auto"
            >
              {t('founders.desc')}
            </motion.p>
          </div>
        </section>

        {/* Founders Grid Section */}
        <section className="py-24 px-8 bg-surface relative">
            <div className="max-w-7xl mx-auto">
                <Founders />
            </div>
        </section>

        {/* Vision Statement */}
        <section className="py-32 px-8 bg-emerald-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-lime-400/10 blur-[120px] rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full -ml-48 -mb-48"></div>
            
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-lime-400 font-bold uppercase tracking-[0.2em] text-xs mb-8 block">Our Shared Vision</span>
                    <h2 className="text-4xl md:text-6xl font-headline font-bold mb-12 leading-tight italic">
                        "Technology is only as good as the lives it improves. We are here to ensure that every harvest is safer, smarter, and more abundant."
                    </h2>
                    <div className="w-24 h-1 bg-lime-400 mx-auto rounded-full"></div>
                </motion.div>
            </div>
        </section>
      </main>
    </div>
  );
}
