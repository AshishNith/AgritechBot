import React from 'react';
import ChatWidget from '../components/ChatWidget';

export default function Chatbot() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-surface px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">
            Live Anaaj.ai chat
          </p>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mt-4">
            Real session-based agricultural advisory on the web.
          </h1>
          <p className="text-lg text-on-surface-variant mt-6 leading-relaxed">
            This page now connects to the production chat backend under
            <span className="font-bold text-on-surface"> /api/v1/chat</span>.
            Use a valid farmer JWT to test the same authenticated assistant that powers the Android app.
          </p>
        </div>

        <ChatWidget />
      </div>
    </div>
  );
}
