import { motion } from 'framer-motion';
import { Card } from './Card';
import { LoadingStep } from '../types';
import { DefaultLoadingSteps } from '../types';
import { ProgressBar } from './ProgressBar';

interface LoadingStateProps {
  steps?: LoadingStep[];
  currentStep?: number;
  title?: string;
  subtitle?: string;
}

export const LoadingState = ({
  steps = DefaultLoadingSteps,
  currentStep = 0,
  title = 'VIGIL ANALYZING',
  subtitle,
}: LoadingStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
    >
      <Card variant="elevated" padding="lg" className="shadow-soft">
        <div className="flex flex-col items-center text-center">
          {/* Spinner */}
          <motion.div
            className="w-16 h-16 mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-full h-full border-4 border-primary-accent border-t-transparent rounded-full" />
          </motion.div>

          {/* Title */}
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-semibold text-primary-text"
          >
            {title}
          </motion.h3>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-secondary-text mt-1"
            >
              {subtitle}
            </motion.p>
          )}

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full mt-8 space-y-4"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: 1, 
                  x: index <= currentStep ? 0 : -20 
                }}
                transition={{ 
                  delay: index * 0.1 + 0.4,
                  duration: 0.3,
                  ease: 'easeOut' 
                }}
                className="flex items-center gap-3"
              >
                <motion.div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                    index < currentStep
                      ? 'bg-primary-accent text-white'
                      : index === currentStep
                      ? 'bg-primary-accent/20 text-primary-accent ring-2 ring-primary-accent'
                      : 'bg-border-color text-secondary-text/60'
                  }`}
                  animate={index === currentStep ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {index < currentStep ? '✓' : index === currentStep ? '…' : ''}
                </motion.div>

                <motion.span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    index <= currentStep ? 'text-primary-text' : 'text-secondary-text/60'
                  }`}
                >
                  {step.label}
                </motion.span>

                {index === currentStep && (
                  <motion.div
                    className="flex-1 h-0.5 bg-border-color rounded-full mx-3 overflow-hidden"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className="h-full bg-primary-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                    />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full mt-6"
          >
            <ProgressBar
              progress={Math.min(100, (currentStep / Math.max(1, steps.length - 1)) * 100)}
              height={3}
            />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default LoadingState;
