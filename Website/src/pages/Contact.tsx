import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Facebook, Youtube, Send, User, MessageSquare } from 'lucide-react';
import { getApiBaseUrl } from '../utils/runtime';

const WhatsAppIcon = ({ size = 18, className = "" }: { size?: number, className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
            <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary leading-tight">
              {t('contactUs.title')}
            </h1>
            <p className="mt-6 text-lg text-on-surface-variant leading-relaxed">
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
            <div className="flex items-center gap-2 mb-3">
              <Mail size={16} className="text-primary" />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">{t('contactUs.sidebar.email.label')}</p>
            </div>
            <a href="mailto:anaajcustomerservice@gmail.com" className="text-2xl font-bold text-primary inline-block">
              anaajcustomerservice@gmail.com
            </a>
            <p className="text-on-surface-variant mt-3">
              {t('contactUs.sidebar.email.desc')}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Phone size={16} className="text-primary" />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">{t('contactUs.sidebar.phone.label')}</p>
            </div>
            <a href="tel:8740007770" className="text-2xl font-bold text-primary inline-block">
              8740007770
            </a>
            <p className="text-on-surface-variant mt-3">
              {t('contactUs.sidebar.phone.desc')}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-primary" />
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">{t('contactUs.sidebar.address.label')}</p>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              {t('contactUs.sidebar.address.line1')}
              <br />
              {t('contactUs.sidebar.address.line2')}
              <br />
              {t('contactUs.sidebar.address.line3')}
            </p>
          </div>
          
          <div className="pt-8 border-t border-outline-variant/20">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant mb-4">{t('contactUs.sidebar.follow')}</p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="#" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all"
              >
                <Facebook size={16} fill="currentColor" />
                Facebook
              </a>
              <a 
                href="https://www.youtube.com/@anaajrajasthan01" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000] transition-all"
              >
                <Youtube size={16} fill="currentColor" />
                Youtube
              </a>
              <a 
                href="https://whatsapp.com/channel/0029VbCdUxoBKfi8x9xbIP0m" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all"
              >
                <WhatsAppIcon size={16} />
                WhatsApp Channel
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
