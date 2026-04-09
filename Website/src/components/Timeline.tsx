import React from 'react';
import { motion } from 'framer-motion';
import { Timeline as AceternityTimeline } from './ui/timeline';
import { Mic, BrainCircuit, Lightbulb, Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Timeline() {
  const { t } = useTranslation();
  const commonClasses = "rounded-2xl w-full h-40 md:h-56 lg:h-72 shadow-xl ring-1 ring-black/5 transition-all duration-500 ease-out";
  const imageClass = `object-cover hover:scale-105 ${commonClasses}`;
  const iconBaseClass = `relative overflow-hidden flex flex-col items-center justify-center cursor-default group hover:brightness-110 ${commonClasses}`;

  const data = [
    {
      title: t('timeline.step1Title'),
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            {t('timeline.step1Desc')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className={`bg-surface-container text-primary ${iconBaseClass}`}>
              <Mic size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed duration-500" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm text-center px-2">{t('timeline.voiceInput')}</p>
            </div>
            <img
              src="/step1.png"
              alt={t('timeline.step1Title')}
              className={imageClass}
            />
          </div>
        </div>
      ),
    },
    {
      title: t('timeline.step2Title'),
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            {t('timeline.step2Desc')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/step 2.png"
              alt={t('timeline.step2Title')}
              className={imageClass}
            />
             <div className={`bg-primary text-on-primary ${iconBaseClass}`}>
              <BrainCircuit size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed duration-500" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm text-center px-2">{t('timeline.deepProcessing')}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t('timeline.step3Title'),
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            {t('timeline.step3Desc')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className={`bg-surface-container text-primary ${iconBaseClass}`}>
              <Lightbulb size={48} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed duration-500" />
              <p className="mt-4 font-bold uppercase tracking-widest text-sm text-center px-2">{t('timeline.actionableFixes')}</p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800&auto=format&fit=crop"
              alt={t('timeline.step3Title')}
              className={imageClass}
            />
          </div>
        </div>
      ),
    },
    {
      title: t('timeline.step4Title'),
      content: (
        <div>
          <p className="text-on-surface-variant text-lg md:text-xl font-body mb-8">
            {t('timeline.step4Desc')}
          </p>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="/step4.png"
              alt={t('timeline.step4Title')}
              className={imageClass}
            />
             <div className={`bg-surface-container text-primary ${iconBaseClass}`}>
              <Sprout size={64} strokeWidth={1.5} className="group-hover:scale-110 transition-transform text-tertiary-fixed mb-4 duration-500" />
              <p className="text-3xl font-bold font-headline">40%</p>
              <p className="mt-1 font-bold uppercase tracking-widest text-xs text-on-surface-variant text-center">{t('timeline.costReduction')}</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="bg-surface relative overflow-hidden"
    >
      <div className="w-full">
        <AceternityTimeline data={data} />
      </div>
    </motion.section>
  );
}
