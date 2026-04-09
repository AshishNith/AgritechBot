import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../utils/runtime';

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${getApiBaseUrl()}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(data.message || t('contactUs.status.errorDefault'));
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage(t('contactUs.status.errorNetwork'));
    }
  };

  return (
    <div className="min-h-[100vh] bg-surface pt-32 pb-24 px-6">
      <Helmet>
        <title>{t('pages.contact.title')}</title>
        <meta name="description" content={t('pages.contact.metaDesc')} />
        <link rel="canonical" href="https://anaaj.ai/contact" />
        <meta property="og:title" content={t('pages.contact.title')} />
        <meta property="og:description" content={t('pages.contact.metaDesc')} />
        <meta property="og:url" content="https://anaaj.ai/contact" />
      </Helmet>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-10">
          <div className="rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit mb-6 shadow-sm">
              <span className="material-symbols-outlined text-sm">support_agent</span>
              <span className="text-xs font-bold uppercase tracking-widest font-label">{t('contactUs.label')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary leading-tight">
              {t('contactUs.title')}
            </h1>
            <p className="mt-6 text-xl text-on-surface-variant leading-relaxed">
              {t('contactUs.description')}
            </p>

            <form onSubmit={handleSubmit} className="mt-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-on-surface-variant ml-1">{t('contactUs.form.name')}</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body"
                    placeholder={t('contactUs.form.namePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-on-surface-variant ml-1">{t('contactUs.form.email')}</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 rounded-2xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body"
                    placeholder={t('contactUs.form.emailPlaceholder')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-bold text-on-surface-variant ml-1">{t('contactUs.form.subject')}</label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body"
                  placeholder={t('contactUs.form.subjectPlaceholder')}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-on-surface-variant ml-1">{t('contactUs.form.message')}</label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-6 py-4 rounded-2xl bg-surface-container border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body resize-none"
                  placeholder={t('contactUs.form.messagePlaceholder')}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 ${
                  status === 'loading' 
                  ? 'bg-outline-variant text-on-surface-variant cursor-not-allowed' 
                  : 'bg-primary text-white hover:scale-[1.01] active:scale-[0.99]'
                }`}
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {t('contactUs.form.sending')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">send</span>
                    {t('contactUs.form.submit')}
                  </>
                )}
              </button>

              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-green-100 text-green-800 border border-green-200 flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-green-600">check_circle</span>
                    <span className="text-sm font-bold">{t('contactUs.status.success')}</span>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 rounded-xl bg-red-100 text-red-800 border border-red-200 flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-red-600">error</span>
                    <span className="text-sm font-bold">{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl p-10 space-y-8 h-fit lg:sticky lg:top-32">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">{t('contactUs.sidebar.email.label')}</p>
            <a href="mailto:support@anaajai.com" className="text-2xl font-bold text-primary mt-3 inline-block">
              support@anaajai.com
            </a>
            <p className="text-on-surface-variant mt-3">
              {t('contactUs.sidebar.email.desc')}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">{t('contactUs.sidebar.phone.label')}</p>
            <a href="tel:18002474100" className="text-2xl font-bold text-primary mt-3 inline-block">
              1800-AGRI-100
            </a>
            <p className="text-on-surface-variant mt-3">
              {t('contactUs.sidebar.phone.desc')}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">{t('contactUs.sidebar.address.label')}</p>
            <p className="text-on-surface-variant mt-3 leading-relaxed">
              {t('contactUs.sidebar.address.line1')}
              <br />
              {t('contactUs.sidebar.address.line2')}
              <br />
              {t('contactUs.sidebar.address.line3')}
            </p>
          </div>
          
          <div className="pt-8 border-t border-outline-variant/20">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant mb-4">{t('contactUs.sidebar.follow')}</p>
            <div className="flex gap-4">
              {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                <button key={social} className="px-4 py-2 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-primary hover:text-white transition-all">
                  {social}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
