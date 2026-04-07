import React from 'react';
import { motion } from 'framer-motion';
import { ContainerScroll } from './ui/container-scroll-animation';

export default function Features() {
  return (
    <section className="bg-surface-container-lowest overflow-hidden">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center">
            <span className="text-on-primary-container font-label uppercase tracking-widest font-bold mb-4">
              Precision Farming
            </span>
            <h2 className="text-center text-4xl md:text-7xl font-headline font-bold mb-8 text-primary">
              Precision tools for <br />
              <span className="text-primary/80">every acre.</span>
            </h2>
          </div>
        }
      >
        <div className="relative h-full w-full">
          <img
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop"
            alt="Anaaj.ai precision farming dashboard showing real-time soil health metrics, pest risk analysis, yield estimates and water usage for Indian agricultural farms"
            className="mx-auto rounded-2xl object-cover h-full w-full object-center"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Soil Health', value: 'Optimal', icon: 'monitoring' },
                { label: 'Pest Risk', value: 'Low', icon: 'security' },
                { label: 'Yield Est.', value: '+15%', icon: 'trending_up' },
                { label: 'Water', value: '42%', icon: 'water_drop' }
              ].map((stat, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <span className="material-symbols-outlined text-tertiary-fixed text-sm mb-1">{stat.icon}</span>
                  <div className="text-xs text-white/70 font-medium">{stat.label}</div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ContainerScroll>

      <div className="max-w-7xl mx-auto px-8">
        {/* Feature 1 - Now also with Scroll Animation */}
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center mb-0 md:mb-10">
              <span className="text-on-primary-container font-label uppercase tracking-widest font-bold mb-4">
                AI Vision
              </span>
              <h3 className="text-3xl md:text-5xl font-headline font-bold leading-tight text-primary text-center">
                Identify pests and diseases <br />
                <span className="text-primary/70">in seconds.</span>
              </h3>
            </div>
          }
        >
          <div className="relative h-full w-full group overflow-hidden">
             <img 
              className="w-full h-full object-cover rounded-2xl" 
              alt="AI-powered crop disease detection scanning wheat leaves for fungal and bacterial infections using Anaaj.ai technology" 
              src="https://images.unsplash.com/photo-1592997571659-0b21ff64313b?q=80&w=1200&auto=format&fit=crop"
            />
            {/* Overlay showing AI scanning in progress */}
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-tertiary-fixed/50 rounded-lg animate-pulse pointer-events-none">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-tertiary-fixed"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-tertiary-fixed"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-tertiary-fixed"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-tertiary-fixed"></div>
              <div className="flex items-center justify-center h-full">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded text-[10px] font-bold uppercase tracking-tighter shadow-xl">
                  Analyzing Leaf Structure...
                </span>
              </div>
            </div>
          </div>
        </ContainerScroll>

        <div className="mt-20 space-y-32">
          <div className="lg:w-2/3 mx-auto text-center space-y-6">
             <p className="text-xl text-on-surface-variant leading-relaxed">
              Take a photo of your leaf or crop. Our AI analyzes thousands of data points to identify issues instantly and suggest the exact cure.
            </p>
            <ul className="flex flex-wrap justify-center gap-8 pt-4 text-on-surface font-bold">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed text-3xl">biotech</span>
                <span>Fungal & Bacterial detection</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary-fixed text-3xl">nutrition</span>
                <span>Nutrient deficiency analysis</span>
              </li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16 pb-32">
            <div className="lg:w-1/2">
              <div className="relative p-6 md:p-12 bg-surface-container rounded-[2rem] border border-outline-variant/20 overflow-hidden shadow-xl">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                    <span className="font-label text-sm text-on-surface-variant tracking-wider uppercase">Soil pH</span>
                    <div className="text-3xl font-bold text-primary mt-2">6.8</div>
                    <div className="text-xs text-lime-600 mt-1 font-semibold">Perfect Range</div>
                  </div>
                  <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
                    <span className="font-label text-sm text-on-surface-variant tracking-wider uppercase">Moisture</span>
                    <div className="text-3xl font-bold text-primary mt-2">42%</div>
                    <div className="text-xs text-secondary mt-1 font-semibold">Optimal</div>
                  </div>
                  <div className="col-span-2 bg-primary-container text-on-primary p-6 rounded-2xl shadow-2xl mt-4 z-10 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-tertiary-fixed">smart_toy</span>
                      <span className="text-xs font-bold tracking-widest uppercase">Smart Recommendation</span>
                    </div>
                    <p className="text-sm font-medium">Add organic compost next week to maintain nitrogen levels before the sowing cycle.</p>
                  </div>
                </div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl z-0"></div>
              </div>
            </div>
            <div className="lg:w-1/2 space-y-6">
              <span className="text-on-primary-container font-label uppercase tracking-widest font-bold">Smart Insights</span>
              <h3 className="text-3xl md:text-4xl font-headline font-bold leading-tight text-primary">Data-driven decisions, simplified.</h3>
              <p className="text-lg text-on-surface-variant leading-relaxed">
                Anaaj.ai connects with your local climate data and soil history to provide recommendations that actually work for your specific land.
              </p>
              <button className="bg-surface-container-high px-8 py-4 rounded-xl font-bold flex items-center gap-2 text-primary hover:bg-surface-container-highest transition-all hover:gap-4 shadow-sm border border-outline-variant/20">
                Learn how we use data
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
