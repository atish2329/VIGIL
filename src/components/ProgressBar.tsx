import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  height?: number;
  showPercentage?: boolean;
}

export const ProgressBar = ({
  progress = 0,
  label,
  height = 4,
  showPercentage = false,
}: ProgressBarProps) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-secondary-text">{label}</span>
          {showPercentage && (
            <span className="text-sm font-medium text-primary-text">{progress}%</span>
          )}
        </div>
      )}
      
      <div
        className="w-full bg-border-color rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full bg-primary-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
