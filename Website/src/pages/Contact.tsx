import React from 'react';

export default function Contact() {
  return (
    <div className="min-h-[100vh] bg-surface pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit mb-6 shadow-sm">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">Talk To Us</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary leading-tight">
            Contact the AnaajAI team
          </h1>
          <p className="mt-6 text-xl text-on-surface-variant leading-relaxed">
            The public site now shows only working support paths. Reach us directly by email or phone for product,
            launch, or partnership requests.
          </p>
        </div>

        <div className="rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/10 shadow-2xl p-10 space-y-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">Email support</p>
            <a href="mailto:support@anaajai.com" className="text-2xl font-bold text-primary mt-3 inline-block">
              support@anaajai.com
            </a>
            <p className="text-on-surface-variant mt-3">
              Best for technical issues, launch questions, and partnership conversations.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">Phone support</p>
            <a href="tel:18002474100" className="text-2xl font-bold text-primary mt-3 inline-block">
              1800-AGRI-100
            </a>
            <p className="text-on-surface-variant mt-3">
              Best for urgent farmer onboarding or deployment coordination.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-on-surface-variant">Headquarters</p>
            <p className="text-on-surface-variant mt-3 leading-relaxed">
              Agro-Tech Hub, Level 4
              <br />
              Sector 82, Mohali, Punjab
              <br />
              India 140308
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
