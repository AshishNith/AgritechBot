import React from 'react';
import { Helmet } from 'react-helmet-async';
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
import FinalCTA from '../components/FinalCTA';

import YouTubeSection from '../components/YouTubeSection';

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Anaaj.ai | India's #1 Multilingual AI Farming Assistant</title>
        <meta name="description" content="Anaaj.ai is India's first multilingual AI farming assistant. Get real-time crop advice, pest diagnosis, weather alerts, and market prices in Hindi, Punjabi, Gujarati & 12+ Indian languages." />
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
      <MapSection />
      <FinalCTA />
    </>
  );
}
