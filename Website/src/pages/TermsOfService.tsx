import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// Sections 1-5 are the original terms; 6-17 cover accounts, marketplace orders, payments,
// credits, refunds, permissions, liability, governing law and business/contact details.
const SECTION_COUNT = 17;
const SECTIONS = Array.from({ length: SECTION_COUNT }, (_, i) => i + 1);

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <Helmet>
        <title>{t('pages.terms.title')}</title>
        <meta name="description" content={t('pages.terms.metaDesc')} />
        <link rel="canonical" href="https://anaaj.ai/terms" />
        <meta property="og:title" content={t('pages.terms.title')} />
        <meta property="og:description" content={t('pages.terms.metaDesc')} />
        <meta property="og:url" content="https://anaaj.ai/terms" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-headline font-bold text-primary mb-4">{t('termsOfService.title')}</h1>
          <p className="text-on-surface-variant font-medium uppercase tracking-widest text-sm">{t('termsOfService.effectiveDate')}</p>
        </motion.div>

        <div className="space-y-12 text-on-surface font-body leading-relaxed">
          {SECTIONS.map((n) => {
            const items = t(`termsOfService.section${n}.items`, { returnObjects: true, defaultValue: [] }) as unknown;
            const itemList = Array.isArray(items) ? (items as string[]) : [];
            return (
              <section key={n}>
                <h2 className="text-2xl font-headline font-bold text-primary mb-4 underline decoration-tertiary-fixed decoration-4 underline-offset-4">
                  {t(`termsOfService.section${n}.title`)}
                </h2>
                <p>{t(`termsOfService.section${n}.text`)}</p>
                {itemList.length > 0 && (
                  <ul className="list-disc pl-6 mt-3 space-y-2">
                    {itemList.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}

          <div className="mt-16 pt-8 border-t border-outline-variant/10 text-on-surface-variant text-sm text-center">
            <p>{t('termsOfService.copyright')}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
