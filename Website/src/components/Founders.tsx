import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FounderCard } from './ui/FounderCard';
import { members } from '../data/members';

export default function Founders() {
  const { t } = useTranslation();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface to-surface-container-low py-24">
      {/* Background Decor */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full opacity-30">
        <div className="absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-primary/10 bg-primary-container/30 px-4 py-2 text-primary-fixed backdrop-blur-sm">
            <span className="material-symbols-outlined text-sm">group</span>
            <span className="font-label text-xs font-bold uppercase tracking-[0.3em]">{t('founders.label')}</span>
          </div>
          <h2 className="mb-8 text-4xl font-headline font-bold leading-tight tracking-tight text-primary md:text-5xl">
            {t('founders.title')}
          </h2>
          <p className="mx-auto max-w-3xl font-body text-base leading-relaxed text-on-surface-variant md:text-lg">
            {t('founders.desc')}
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {members.map((member) => (
            <motion.div key={member.id} variants={itemVariants}>
              <FounderCard
                name={t(`founders.${member.slug}.name`)}
                role={t(`founders.${member.slug}.role`)}
                description={t(`founders.${member.slug}.desc`)}
                image={member.image}
                color={member.color}
                profilePath={`/members/${member.slug}`}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
