import { motion } from 'framer-motion';
import { FounderCard } from './ui/FounderCard';
import { members } from '../data/members';

export default function Founders() {
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
    <section className="relative overflow-hidden bg-gradient-to-b from-surface to-surface-container-low py-32">
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
            <span className="font-label text-xs font-bold uppercase tracking-[0.3em]">Our Team</span>
          </div>
          <h2 className="mb-8 text-5xl font-headline font-bold leading-tight tracking-tight text-primary md:text-7xl">
            Meet Our Core Members
          </h2>
          <p className="mx-auto max-w-3xl font-body text-lg leading-relaxed text-on-surface-variant md:text-xl">
            The people guiding our direction and building meaningful impact with consistent, long-term execution.
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
                name={member.name}
                role={member.role}
                description={member.description}
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
