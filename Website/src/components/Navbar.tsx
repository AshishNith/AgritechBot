import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Languages, Check, Download } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { t, i18n } = useTranslation();

  const languages = [
    { code: 'hi', name: 'हिन्दी' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'en', name: 'English' }
  ];

  // Trigger floating pill state after 50px of scroll
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  const toggleMenu = () => setIsOpen(!isOpen);
  const isActive = (path: string) => location.pathname === path;
  
  // To ensure the white logo is always visible on light paths, we always inject a dark glass aesthetic
  const isDarkCanvas = location.pathname === '/';

  return (
    <motion.nav 
      initial={{ x: "-50%", y: -100 }}
      animate={{ x: "-50%", y: 0 }}
      className={`fixed z-[100] transition-all duration-500 left-1/2 w-full
        ${isScrolled 
          ? 'top-4 w-[calc(100%-2rem)] md:w-[90%] max-w-6xl rounded-[2rem] bg-emerald-950/80 backdrop-blur-xl shadow-2xl border border-white/10' 
          : `top-0 max-w-full ${isDarkCanvas ? 'bg-transparent' : 'bg-emerald-950/90 backdrop-blur-lg border-b border-white/5 shadow-md'}`
        }
      `}
    >
      <div className={`flex justify-between items-center w-full max-w-7xl mx-auto px-6 md:px-8 ${isScrolled ? 'py-3' : 'py-5'} transition-all duration-300`}>
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src="https://res.cloudinary.com/dvwpxb2oa/image/upload/v1774369551/Printable_Logo_nim1ca.svg" 
            alt="Anaaj.ai - India's #1 AI Farming Assistant" 
            className={`transition-all duration-500 ease-[cubic-bezier(0.2,1,0.2,1)] ${isScrolled ? 'h-6 md:h-7' : 'h-7 md:h-9'}`} 
          />

          <h1 className="text-white text-xl font-bold">ANAAJ AI</h1>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center bg-white/5 px-6 py-2 rounded-full border border-white/10">
          <Link to="/" className={`font-headline font-bold text-sm tracking-widest uppercase transition-colors ${isActive('/') ? 'text-lime-400' : 'text-stone-300 hover:text-white'}`}>
            {t('nav.home')}
          </Link>
          <Link to="/blog" className={`font-headline font-bold text-sm tracking-widest uppercase transition-colors ${isActive('/blog') || location.pathname.startsWith('/blog/') ? 'text-lime-400' : 'text-stone-300 hover:text-white'}`}>
            {t('nav.blog')}
          </Link>
          <Link to="/about" className={`font-headline font-bold text-sm tracking-widest uppercase transition-colors ${isActive('/about') ? 'text-lime-400' : 'text-stone-300 hover:text-white'}`}>
            {t('nav.about')}
          </Link>
          <Link to="/founders" className={`font-headline font-bold text-sm tracking-widest uppercase transition-colors ${isActive('/founders') ? 'text-lime-400' : 'text-stone-300 hover:text-white'}`}>
            {t('nav.founders')}
          </Link>
          <Link to="/contact" className={`font-headline font-bold text-sm tracking-widest uppercase transition-colors ${isActive('/contact') ? 'text-lime-400' : 'text-stone-300 hover:text-white'}`}>
            {t('nav.contact')}
          </Link>
        </div>
        
        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">

          
          <div className="relative">
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-3 text-stone-300 hover:text-white transition-all group px-3 py-2 rounded-full hover:bg-white/5 ml-2"
            >
              <Languages size={18} className="group-hover:text-lime-400 transition-colors" />
              <div className="flex flex-col items-start leading-none gap-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">Language</span>
                <span className="text-[11px] font-medium text-lime-400/80 group-hover:text-lime-400 transition-colors">
                  भाषा / ਭਾਸ਼ਾ / ભાષા
                </span>
              </div>
            </button>

            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-48 bg-emerald-950/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden z-[110]"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm font-medium flex items-center justify-between transition-colors hover:bg-white/10 text-stone-200"
                    >
                      <span>{lang.name}</span>
                      {i18n.language === lang.code && <Check size={16} className="text-lime-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/download" className="flex items-center gap-2 bg-white text-emerald-950 px-6 py-2.5 rounded-full font-bold hover:scale-105 hover:bg-lime-400 active:opacity-80 transition-all shadow-lg text-sm uppercase tracking-wider group">
            <Download size={18} className="transition-transform group-hover:-translate-y-0.5" />
            {t('nav.downloadApp')}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <button onClick={toggleMenu} className="text-white focus:outline-none focus:ring-2 focus:ring-lime-400 rounded-lg p-1 bg-white/10 backdrop-blur-md">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className={`md:hidden absolute top-full left-0 w-full mt-2 rounded-[2rem] overflow-hidden bg-emerald-950/95 backdrop-blur-3xl shadow-2xl border border-white/10 origin-top transform transition-all duration-300 ${isScrolled ? 'w-[calc(100%+0rem)]' : ''}`}>
          <div className="flex flex-col px-6 py-8 gap-6 text-center">
            <Link to="/" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/') ? 'text-lime-400' : 'text-stone-200'}`}>
              {t('nav.home')}
            </Link>
            <Link to="/blog" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/blog') || location.pathname.startsWith('/blog/') ? 'text-lime-400' : 'text-stone-200'}`}>
              {t('nav.blog')}
            </Link>
            <Link to="/about" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/about') ? 'text-lime-400' : 'text-stone-200'}`}>
              {t('nav.about')}
            </Link>
            <Link to="/founders" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/founders') ? 'text-lime-400' : 'text-stone-200'}`}>
              {t('nav.founders')}
            </Link>
            <Link to="/contact" onClick={toggleMenu} className={`font-headline font-bold text-xl uppercase tracking-widest ${isActive('/contact') ? 'text-lime-400' : 'text-stone-200'}`}>
              {t('nav.contact')}
            </Link>

            
            <div className="flex justify-center gap-2 py-2 flex-wrap px-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    toggleMenu();
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    i18n.language === lang.code 
                      ? 'bg-lime-400 border-lime-400 text-emerald-900' 
                      : 'border-white/20 text-white'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <hr className="border-white/10 mx-10 my-1" />
            <Link to="/download" onClick={toggleMenu} className="flex items-center justify-center gap-3 bg-lime-400 text-emerald-950 text-center px-6 py-4 rounded-2xl font-bold mx-4 shadow-xl uppercase tracking-widest hover:scale-105 transition-transform group">
              <Download size={20} />
              {t('nav.downloadApp')}
            </Link>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
