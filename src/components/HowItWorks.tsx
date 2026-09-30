import { motion } from 'framer-motion';
import { Card } from './Card';
import { SectionHeader } from './SectionHeader';
import { WorkStep } from '../types';

const steps: WorkStep[] = [
  {
    number: '01',
    title: 'CAPTURE',
    description: 'Paste a message, URL or screenshot.',
  },
  {
    number: '02',
    title: 'ANALYZE',
    description: 'VIGIL examines multiple security signals.',
  },
  {
    number: '03',
    title: 'UNDERSTAND',
    description: 'See the evidence behind the result.',
  },
  {
    number: '04',
    title: 'ACT',
    description: 'Follow practical recommendations.',
  },
];

const stepIcons: Record<string, string> = {
  '01': '📥',
  '02': '🔍',
  '03': '💡',
  '04': '✅',
};

export const HowItWorks = () => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="py-16 sm:py-24 bg-background"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="How VIGIL works"
          eyebrow="PROCESS"
          description="A simple, transparent process that puts you in control"
          align="center"
        />

        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card variant="bordered" padding="lg" className="h-full">
                <div className="flex flex-col items-center text-center h-full">
                  <motion.div
                    className="w-16 h-16 mb-4 bg-soft-accent rounded-2xl flex items-center justify-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <span className="text-3xl">{stepIcons[step.number] || '?'}</span>
                  </motion.div>

                  <motion.p
                    className="text-sm font-medium text-primary-accent tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    STEP {step.number}
                  </motion.p>

                  <motion.h3
                    className="text-xl font-semibold text-primary-text mt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                  >
                    {step.title}
                  </motion.h3>

                  <motion.p
                    className="text-secondary-text mt-3 flex-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    {step.description}
                  </motion.p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;
