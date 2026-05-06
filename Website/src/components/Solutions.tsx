import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Solutions() {
  const { t } = useTranslation();

  const solutions = [
    {
      title: t('solutions.cropDoctor.title'),
      desc: t('solutions.cropDoctor.desc'),
      icon: 'medication_liquid',
      color: 'bg-primary/10 text-primary'
    },
    {
      title: t('solutions.cropPlanner.title'),
      desc: t('solutions.cropPlanner.desc'),
      icon: 'event_note',
      color: 'bg-secondary/10 text-secondary'
    },
    {
      title: t('solutions.mandiPrices.title'),
      desc: t('solutions.mandiPrices.desc'),
      icon: 'payments',
      color: 'bg-tertiary/10 text-tertiary'
    },
    {
      title: t('solutions.voiceAssistant.title'),
      desc: t('solutions.voiceAssistant.desc'),
      icon: 'campaign',
      color: 'bg-primary/10 text-primary'
    }
  ];

  return (
    <section className="py-24 bg-surface text-on-surface">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-headline font-bold text-primary mb-6"
          >
            {t('solutions.title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-on-surface-variant leading-relaxed"
          >
            {t('solutions.subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className={`w-16 h-16 ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined text-4xl">{item.icon}</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4">{item.title}</h3>
              <p className="text-on-surface-variant leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
