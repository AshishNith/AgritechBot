import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function LiveChat() {
  const { t } = useTranslation();
  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-32 bg-surface"
    >
      <div className="max-w-7xl mx-auto px-8 editorial-grid">
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary">{t('liveChat.title')}</h2>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            {t('liveChat.description')}
          </p>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold">{t('liveChat.languages.hindi')}</span>
            <span className="px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold">{t('liveChat.languages.gujarati')}</span>
            <span className="px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold">{t('liveChat.languages.punjabi')}</span>
            <span className="px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold">{t('liveChat.languages.english')}</span>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-7 bg-surface-container-low rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-12 relative overflow-hidden mt-8 lg:mt-0">
          <div className="space-y-8 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-3xl rounded-tl-none shadow-sm max-w-md">
                <p className="text-on-surface font-medium italic">"{t('liveChat.chat.user.message')}" {t('liveChat.chat.user.translation')}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 flex-row-reverse">
              <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <div className="bg-primary-container text-on-primary p-6 rounded-3xl rounded-tr-none shadow-xl max-w-md">
                <p className="leading-relaxed">{t('liveChat.chat.ai.message')}</p>
                <div className="mt-4 flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed"></div>
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed opacity-60"></div>
                  <div className="w-2 h-2 rounded-full bg-tertiary-fixed opacity-30"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 opacity-10">
            <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'wght' 100" }}>graphic_eq</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
