import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { StackedCards, GlassCardData } from './ui/StackedCards';

// We'll move the data generation inside the component to use the translation hook

export default function Founders() {
  const { t } = useTranslation();

  const foundersData: GlassCardData[] = [
    {
      id: 1,
      title: "Ashish Ranjan",
      role: t('founders.ashish.role'),
      description: t('founders.ashish.desc'),
      image: "https://res.cloudinary.com/dvwpxb2oa/image/upload/v1/AnaajAI/founder_ashish.jpg",
      linkedin: "#",
      twitter: "#",
      color: "#061b0e"
    },
    {
      id: 2,
      title: "Mehak Sharma",
      role: t('founders.mehak.role'),
      description: t('founders.mehak.desc'),
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop",
      linkedin: "#",
      twitter: "#",
      color: "#586151"
    },
    {
      id: 3,
      title: "Vikram Singh",
      role: t('founders.vikram.role'),
      description: t('founders.vikram.desc'),
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
      linkedin: "#",
      twitter: "#",
      color: "#bef500"
    },
    {
      id: 4,
      title: "Sanjay Verma",
      role: t('founders.sanjay.role'),
      description: t('founders.sanjay.desc'),
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop",
      linkedin: "#",
      twitter: "#",
      color: "#4d6453"
    }
  ];

  return (
    <section className="py-24 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-tertiary-fixed w-fit mb-6 shadow-sm">
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span className="text-xs font-bold uppercase tracking-widest font-label">{t('founders.label')}</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-headline font-bold text-primary tracking-tight">
            {t('founders.title')}
          </h2>
          <p className="mt-6 text-xl text-on-surface-variant max-w-2xl mx-auto font-body">
            {t('founders.desc')}
          </p>
        </motion.div>

        <StackedCards cards={foundersData} />
      </div>
    </section>
  );
}
