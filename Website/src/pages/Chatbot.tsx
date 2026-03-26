import React from 'react';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-surface px-6">
      <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/20 shadow-2xl p-10 md:p-16">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">
          Web assistant availability
        </p>
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mt-4">
          The live AI assistant is currently app-first.
        </h1>
        <p className="text-lg text-on-surface-variant mt-6 leading-relaxed max-w-2xl">
          We removed the old demo chatbot from the public site so every launch-facing surface reflects real product behavior.
          The production assistant is available inside the Android app with authenticated chat, voice, and history.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/download"
            className="bg-primary text-on-primary px-6 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform text-center"
          >
            Download the Android app
          </Link>
          <Link
            to="/contact"
            className="bg-surface-container-low border border-outline-variant/20 px-6 py-4 rounded-2xl font-bold hover:scale-[1.02] transition-transform text-center"
          >
            Contact the team
          </Link>
        </div>
      </div>
    </div>
  );
}
