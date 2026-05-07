import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <Helmet>
        <title>{t('pages.privacy.title')}</title>
        <meta name="description" content={t('pages.privacy.metaDesc')} />
        <link rel="canonical" href="https://anaaj.ai/privacy" />
        <meta property="og:title" content={t('pages.privacy.title')} />
        <meta property="og:description" content={t('pages.privacy.metaDesc')} />
        <meta property="og:url" content="https://anaaj.ai/privacy" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-headline font-bold text-primary mb-4">{t('privacyPolicy.title')}</h1>
          <p className="text-on-surface-variant font-medium uppercase tracking-widest text-sm">{t('privacyPolicy.lastUpdated')}</p>
        </motion.div>

        <div className="space-y-12 text-on-surface font-body leading-relaxed prose prose-headings:font-headline prose-headings:text-primary">
          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section1.title')}</h2>
            <p>
              <Trans i18nKey="privacyPolicy.section1.text">
                At Anaaj.ai, we operate on a fundamental principle: <strong>Your data belongs to you.</strong> We do not sell your personal information or agricultural data to third-party marketers. Your soil history, crop data, and voice recordings are used solely to provide more accurate agricultural advice to you.
              </Trans>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section2.title')}</h2>
            <p>{t('privacyPolicy.section2.text')}</p>
            <ul className="list-disc pl-6 space-y-2">
              {(t('privacyPolicy.section2.items', { returnObjects: true }) as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section3.title')}</h2>
            <p>{t('privacyPolicy.section3.text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section4.title')}</h2>
            <p>{t('privacyPolicy.section4.text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section5.title')}</h2>
            <p>{t('privacyPolicy.section5.text')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t('privacyPolicy.section6.title')}</h2>
            <p>{t('privacyPolicy.section6.text')}</p>
          </section>

          <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/10 mt-12">
            <h3 className="font-bold text-primary mb-2">{t('privacyPolicy.questions.title')}</h3>
            <p className="text-sm text-on-surface-variant">
              {t('privacyPolicy.questions.text')} <span className="font-bold">{t('privacyPolicy.questions.email')}</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
