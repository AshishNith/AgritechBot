import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Sitemap() {
  const { t } = useTranslation();

  const categories = [
    {
      title: t('sitemapPage.categories.navigation'),
      links: [
        { name: t('sitemapPage.links.home'), path: '/' },
        { name: t('sitemapPage.links.blog'), path: '/blog' },
        { name: t('sitemapPage.links.contact'), path: '/contact' },
        { name: t('sitemapPage.links.download'), path: '/download' },
      ]
    },
    {
      title: t('sitemapPage.categories.company'),
      links: [
        { name: t('sitemapPage.links.about'), path: '/about' },
        { name: t('sitemapPage.links.sustainability'), path: '/sustainability' },
        { name: t('sitemapPage.links.sitemap'), path: '/sitemap' },
      ]
    },
    {
      title: t('sitemapPage.categories.resources'),
      links: [
        { name: t('sitemapPage.links.howTo'), path: '/blog#how-to' },
        { name: t('sitemapPage.links.successStories'), path: '/blog#success-story' },
        { name: t('sitemapPage.links.educational'), path: '/blog#education' },
        { name: t('sitemapPage.links.news'), path: '/blog#news' },
      ]
    },
    {
      title: t('sitemapPage.categories.legal'),
      links: [
        { name: t('sitemapPage.links.contact'), path: '/contact' },
        { name: t('sitemapPage.links.privacy'), path: '/privacy' },
        { name: t('sitemapPage.links.terms'), path: '/terms' },
      ]
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <Helmet>
        <title>{t('pages.sitemap.title')}</title>
        <meta name="description" content={t('pages.sitemap.metaDesc')} />
        <link rel="canonical" href="https://anaaj.ai/sitemap" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-headline font-bold text-primary mb-4">{t('sitemapPage.title')}</h1>
          <p className="text-on-surface-variant font-medium">{t('sitemapPage.description')}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {categories.map((cat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-headline font-bold text-primary border-b border-outline-variant/30 pb-4">{cat.title}</h2>
              <ul className="space-y-4">
                {cat.links.map((link, j) => (
                  <li key={j}>
                    <Link 
                      to={link.path} 
                      className="text-lg text-on-surface-variant hover:text-primary hover:translate-x-2 transition-all flex items-center gap-2 group"
                    >
                      <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-32 p-12 rounded-[3rem] bg-primary-container text-on-primary-container flex flex-col items-center text-center">
          <h3 className="text-3xl font-headline font-bold mb-4">{t('sitemapPage.footer.title')}</h3>
          <p className="mb-8 opacity-80">{t('sitemapPage.footer.desc')}</p>
          <Link to="/contact" className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl">
            {t('sitemapPage.footer.button')}
          </Link>
        </div>

      </div>
    </div>
  );
}
