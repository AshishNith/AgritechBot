import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { getAndroidDownloadUrl } from '../utils/runtime';

export default function DownloadApp() {
  const androidDownloadUrl = getAndroidDownloadUrl();

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface flex flex-col items-center">
      <Helmet>
        <title>Download Anaaj.ai App - Android APK | AI Farming Assistant</title>
        <meta name="description" content="Download Anaaj.ai Android app v1.0.1 - India's #1 AI farming assistant. Get real-time crop advice, pest diagnosis, weather alerts in Hindi, Punjabi, Gujarati & 12+ languages." />
        <link rel="canonical" href="https://anaaj.ai/download" />
        <meta property="og:title" content="Download Anaaj.ai App - AI Farming Assistant" />
        <meta property="og:description" content="Download Anaaj.ai Android app - Get real-time crop advice, pest diagnosis, and weather alerts in 12+ Indian languages." />
        <meta property="og:url" content="https://anaaj.ai/download" />
      </Helmet>
      <div className="max-w-5xl w-full mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-tertiary-container text-tertiary-fixed mb-6 shadow-md">
            <span className="material-symbols-outlined text-sm">rocket_launch</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">Now Available</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary tracking-tight mb-6">
            Get Anaaj.ai for your device.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Experience real-time agronomy, voice intelligence, and personalized market insights directly from your pocket.
          </p>
        </motion.div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          
          {/* Android Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 md:p-12 rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/30 shadow-2xl relative overflow-hidden group"
          >
            {/* Background glow hover effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-10">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-3xl flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-4xl">android</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-1">Version 1.0.1</p>
                <p className="text-xs text-stone-400 font-medium">Updated: April 2026</p>
              </div>
            </div>
            
            <h3 className="text-3xl font-bold text-primary mb-4">Android (APK)</h3>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Download the current Android release directly when a signed production artifact is available. The link below is controlled by deployment configuration so the website does not advertise a stale build.
            </p>

            {androidDownloadUrl ? (
              <a
                href={androidDownloadUrl}
                download
                className="w-full flex items-center justify-center gap-3 bg-primary text-on-primary py-4 rounded-xl font-bold text-lg hover:bg-emerald-900 hover:scale-[1.02] transition-all shadow-lg select-none"
              >
                <span className="material-symbols-outlined">download</span>
                Download Android Build
              </a>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-3 bg-stone-200 text-stone-500 py-4 rounded-xl font-bold text-lg cursor-not-allowed"
              >
                <span className="material-symbols-outlined">schedule</span>
                Android release link coming soon
              </button>
            )}
            
            <div className="mt-6 flex items-center gap-2 text-sm text-on-surface-variant bg-surface-container p-4 rounded-xl">
              <span className="material-symbols-outlined text-tertiary-fixed text-lg">info</span>
              <span>Install instructions depend on how the current Android artifact is distributed.</span>
            </div>
          </motion.div>

          {/* iOS Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="p-8 md:p-12 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/10 relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-10">
                <div className="w-16 h-16 bg-stone-200 text-stone-700 rounded-3xl flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-4xl">apple</span>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 bg-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-lg">
                    Coming Soon
                  </span>
                </div>
              </div>
              
              <h3 className="text-3xl font-bold text-stone-400 mb-4 text-opacity-80">iOS (App Store)</h3>
              <p className="text-stone-500 mb-8 leading-relaxed">
                We're currently fine-tuning the Anaaj.ai experience for iOS. Keep an eye out for the official App Store release in the coming months.
              </p>
            </div>
            
            <button 
              disabled
              className="w-full flex items-center justify-center gap-3 bg-stone-200 text-stone-400 py-4 rounded-xl font-bold text-lg cursor-not-allowed select-none"
            >
              <span className="material-symbols-outlined">laptop_mac</span>
              Available Soon
            </button>
          </motion.div>

        </div>

        {/* Release Notes */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-3xl font-headline font-bold text-primary">What's New</h2>
            <div className="flex-1 h-px bg-outline-variant/20"></div>
          </div>
          
          <div className="bg-surface-container-lowest p-8 md:p-10 rounded-3xl border border-outline-variant/20 shadow-sm mb-6">
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-lg font-bold text-sm">v1.0.1</span>
              <span className="text-on-surface-variant font-medium text-sm">April 02, 2026</span>
            </div>
            <h3 className="text-xl font-bold text-primary mb-4">Current launch baseline</h3>
            <ul className="space-y-3 text-on-surface-variant">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed text-xl shrink-0">check_circle</span>
                <span>Android app, backend API, and public website are aligned around launch-safe behavior.</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed text-xl shrink-0">check_circle</span>
                <span>Public site messaging now reflects actual live capabilities instead of demo-only interactions.</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed text-xl shrink-0">check_circle</span>
                <span>Checkout and subscription flows are designed around verified payment confirmation.</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed text-xl shrink-0">check_circle</span>
                <span>Release links are now deployment-driven instead of hardcoded in the repo.</span>
              </li>
            </ul>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
