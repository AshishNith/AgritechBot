import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Hero from '../components/Hero';
import Story from '../components/Story';
import LiveChat from '../components/LiveChat';
import Features from '../components/Features';
import Timeline from '../components/Timeline';
import WeatherWidget from '../components/WeatherWidget';
import Marketplace from '../components/Marketplace';
import AppShowcase from '../components/AppShowcase';
import PricingFAQ from '../components/PricingFAQ';
import MapSection from '../components/MapSection';
import Founders from '../components/Founders';
import FinalCTA from '../components/FinalCTA';

import YouTubeSection from '../components/YouTubeSection';

export default function Home() {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('pages.home.title')}</title>
        <meta name="description" content={t('pages.home.metaDesc')} />
        <link rel="canonical" href="https://anaaj.ai/" />
      </Helmet>
      <Hero />
      {/* <Story /> */}
      <LiveChat />
      <Features />
      <Timeline />
      <WeatherWidget />
      <Marketplace />
      <AppShowcase />
      <YouTubeSection />
      <PricingFAQ />
      <Founders />
      <MapSection />
      <FinalCTA />
    </>
  );
}
