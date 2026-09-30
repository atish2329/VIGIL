import { motion } from 'framer-motion';
import { RiskLevel, RiskLevelColors } from '../types';
import { Badge } from './Badge';

interface RiskScoreProps {
  score: number;
  level: RiskLevel;
  confidence?: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskScore = ({
  score,
  level,
  confidence,
  showLabel = true,
  size = 'md',
}: RiskScoreProps) => {
  const colors = RiskLevelColors[level];
  
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };

  const containerClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  // Animate score on mount
  const scoreAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.2, 
        duration: 0.6, 
        ease: 'easeOut' 
      }
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex flex-col items-center ${containerClasses[size]}`}
    >
      {showLabel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Badge variant="risk" riskLevel={level} dot>
            {level === 'HIGH' ? 'HIGH RISK' : level === 'SUSPICIOUS' ? 'SUSPICIOUS' : 'LOW RISK'}
          </Badge>
        </motion.div>
      )}

      <motion.div
        {...scoreAnimation}
        className={`flex items-baseline ${sizeClasses[size]}`}
      >
        <span className="font-bold text-primary-text">{score}</span>
        <span className="text-secondary-text ml-1">/ 100</span>
      </motion.div>

      {/* Risk Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
        className="w-full h-1.5 bg-border-color rounded-full overflow-hidden"
      >
        <motion.div
          className={`h-full ${colors.bg.replace('bg-', '')} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
        />
      </motion.div>

      {confidence && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="text-xs text-secondary-text"
        >
          Confidence: {Math.round(confidence * 100)}%
        </motion.p>
      )}
    </motion.div>
  );
};

export default RiskScore;
