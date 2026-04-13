import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { members } from '../data/members';

export default function MemberProfile() {
  const { slug } = useParams();
  const member = members.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-8 text-center">
        <Helmet>
          <title>Member Not Found | Anaaj.ai</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <h1 className="mb-4 text-4xl font-bold text-primary">Member not found</h1>
        <Link to="/" className="font-bold text-tertiary-fixed underline">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
      <Helmet>
        <title>{member.name} | Anaaj.ai</title>
        <meta name="description" content={member.description} />
      </Helmet>

      <main className="pt-24 pb-20">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl px-6 md:px-8"
        >
          <div className="overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container shadow-xl">
            <div className="relative h-72 md:h-96">
              <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="mb-2 inline-flex rounded-full bg-white/20 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur">
                  Member Profile
                </p>
                <h1 className="text-4xl font-headline font-bold text-white md:text-6xl">{member.name}</h1>
                <p className="mt-3 text-lg text-white/90">{member.role}</p>
              </div>
            </div>

            <div className="grid gap-10 p-8 md:grid-cols-[1.2fr_2fr] md:p-12">
              <div className="rounded-2xl border border-outline-variant/20 bg-surface p-6">
                <h2 className="mb-4 text-xl font-headline font-bold text-primary">Highlights</h2>
                <p className="text-on-surface-variant leading-relaxed">{member.description}</p>
              </div>

              <div>
                <h2 className="mb-4 text-2xl font-headline font-bold text-primary">About {member.name}</h2>
                <p className="text-lg leading-relaxed text-on-surface-variant">{member.bio}</p>
                <Link
                  to="/"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary/10"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
