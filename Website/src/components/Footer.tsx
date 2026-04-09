import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-stone-50 border-t border-stone-200">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 py-16 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-xl font-bold text-emerald-950 font-headline"><img src="https://res.cloudinary.com/dvwpxb2oa/image/upload/v1773932879/Full_Logo_dt1pqi.png" alt="Anaaj.ai - AI Farming Assistant Logo" /></div>
          <p className="text-stone-500 font-body text-sm leading-relaxed">
            {t('footer.mission')}
          </p>
        </div>
        
        <div>
          <h5 className="text-emerald-900 font-bold mb-6">{t('footer.company')}</h5>
          <ul className="space-y-4">
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/about">{t('nav.about')}</Link></li>
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/blog">{t('nav.blogWithGuides')}</Link></li>
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/sustainability">{t('footer.sustainabilityReport')}</Link></li>
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/sitemap">{t('footer.sitemap')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h5 className="text-emerald-900 font-bold mb-6">{t('footer.resources')}</h5>
          <ul className="space-y-4">
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/blog?category=how-to">{t('footer.howToGuides')}</Link></li>
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/blog?category=success-story">{t('footer.farmerStories')}</Link></li>
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/blog?category=education">{t('footer.learnFarming')}</Link></li>
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/download">{t('nav.downloadApp')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h5 className="text-emerald-900 font-bold mb-6">{t('footer.supportLegal')}</h5>
          <ul className="space-y-4">
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/contact">{t('footer.contactSupport')}</Link></li>
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/privacy">{t('footer.privacyPolicy')}</Link></li>
            <li><Link className="text-stone-500 hover:text-emerald-700 hover:translate-x-1 transition-all inline-block font-body text-sm" to="/terms">{t('footer.termsOfService')}</Link></li>
          </ul>
          <div className="flex gap-3 mt-6">
            <a href="https://youtube.com/@AnaajAI" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors" aria-label="YouTube">
              <span className="material-symbols-outlined text-sm">play_circle</span>
            </a>
            <a href="https://twitter.com/AnaajAI" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors" aria-label="Twitter">
              <span className="material-symbols-outlined text-sm">share</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 py-8 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-stone-500 font-body text-sm tracking-wide">{t('footer.copyright')}</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
          <span className="text-xs font-bold text-stone-500 uppercase tracking-tighter">{t('footer.systemsOperational')}</span>
        </div>
      </div>
    </footer>
  );
}
