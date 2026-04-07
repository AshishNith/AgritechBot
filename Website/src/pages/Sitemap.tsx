import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Sitemap() {
  const categories = [
    {
      title: 'Navigation',
      links: [
        { name: 'Home', path: '/' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact', path: '/contact' },
        { name: 'Download App', path: '/download' },
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Sustainability Report', path: '/sustainability' },
        { name: 'Global Sitemap', path: '/sitemap' },
      ]
    },
    {
      title: 'Blog & Resources',
      links: [
        { name: 'How-To Guides', path: '/blog#how-to' },
        { name: 'Farmer Success Stories', path: '/blog#success-story' },
        { name: 'Educational Guides', path: '/blog#education' },
        { name: 'News & Updates', path: '/blog#news' },
      ]
    },
    {
      title: 'Support & Legal',
      links: [
        { name: 'Contact Support', path: '/contact' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
      ]
    }
  ];

  return (
    <div className="pt-32 pb-24 bg-surface min-h-screen">
      <Helmet>
        <title>Sitemap - Anaaj.ai | Navigate Our AI Farming Platform</title>
        <meta name="description" content="Browse all pages on Anaaj.ai - India's AI farming assistant. Find links to Home, About Us, Contact, Download App, Sustainability Report, Privacy Policy and Terms." />
        <link rel="canonical" href="https://anaaj.ai/sitemap" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-headline font-bold text-primary mb-4">Global Sitemap</h1>
          <p className="text-on-surface-variant font-medium">Explore all parts of the Anaaj Portal.</p>
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
          <h3 className="text-3xl font-headline font-bold mb-4">Can't find what you're looking for?</h3>
          <p className="mb-8 opacity-80">Reach the team directly or download the Android app for the authenticated AI assistant experience.</p>
          <Link to="/contact" className="bg-primary text-on-primary px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl">
            Contact Support
          </Link>
        </div>

      </div>
    </div>
  );
}
