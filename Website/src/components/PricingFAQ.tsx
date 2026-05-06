import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function PricingFAQ() {
  const { t } = useTranslation();
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t('faq.q1'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.a1')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.q2'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.a2')
        }
      },
      {
        "@type": "Question",
        "name": t('faq.q3'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('faq.a3')
        }
      }
    ]
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 50 }} 
      whileInView={{ opacity: 1, y: 0 }} 
      viewport={{ once: true, margin: "-100px" }} 
      transition={{ duration: 0.6 }} 
      className="py-24 bg-surface"
    >
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>
      <div className="max-w-7xl mx-auto px-8 editorial-grid">
        
        {/* Pricing */}
        <div className="col-span-12 lg:col-span-4 mb-12">
          <h2 className="text-2xl md:text-3xl font-headline font-bold mb-6 text-primary">{t('pricing.title')}</h2>
          <p className="text-on-surface-variant mb-8">{t('pricing.desc')}</p>
          
          <div className="p-8 bg-primary text-on-primary rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase tracking-tighter">{t('pricing.popular')}</div>
            <h3 className="text-xl font-bold mb-2">{t('pricing.planName')}</h3>
            <div className="text-2xl md:text-3xl font-headline font-bold mb-6">{t('pricing.price')}<span className="text-sm opacity-60 font-body">{t('pricing.perMonth')}</span></div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-sm">check</span>
                {t('pricing.feature1')}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-sm">check</span>
                {t('pricing.feature2')}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-sm">check</span>
                {t('pricing.feature3')}
              </li>
            </ul>
            <Link to="/download" className="w-full bg-tertiary-fixed text-on-tertiary-fixed py-3 rounded-xl font-bold hover:scale-105 transition-transform block text-center">{t('pricing.cta')}</Link>
          </div>
        </div>
        
        {/* FAQ */}
        <div className="col-span-12 lg:col-span-7 lg:col-start-6 text-on-surface">
          <h2 className="text-2xl md:text-3xl font-headline font-bold mb-8 md:mb-12 text-primary">{t('faq.title')}</h2>
          <div className="space-y-4 text-on-surface">
            
            <div className="group border-b border-outline-variant py-6 cursor-pointer">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">{t('faq.q1')}</h4>
                <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">add</span>
              </div>
              <p className="hidden group-hover:block mt-4 text-on-surface-variant leading-relaxed">
                {t('faq.a1')}
              </p>
            </div>
            
            <div className="group border-b border-outline-variant py-6 cursor-pointer">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">{t('faq.q2')}</h4>
                <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">add</span>
              </div>
              <p className="hidden group-hover:block mt-4 text-on-surface-variant leading-relaxed">
                {t('faq.a2')}
              </p>
            </div>
            
            <div className="group border-b border-outline-variant py-6 cursor-pointer">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-bold">{t('faq.q3')}</h4>
                <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">add</span>
              </div>
              <p className="hidden group-hover:block mt-4 text-on-surface-variant leading-relaxed">
                {t('faq.a3')}
              </p>
            </div>

          </div>
        </div>
        
      </div>
    </motion.section>
  );
}
