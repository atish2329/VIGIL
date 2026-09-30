import { motion } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';
import { ThreatInsight } from '../types';

interface ThreatCardProps {
  insight: ThreatInsight;
  index: number;
}

const threatIcons: Record<string, string> = {
  phishing: '🎣',
  impersonation: '👤',
  'credential-theft': '🔑',
  urgency: '⏰',
  'fake-support': '💼',
  'payment-scams': '💳',
  default: '⚠️',
};

export const ThreatCard = ({ insight, index }: ThreatCardProps) => {
  const icon = threatIcons[insight.category.toLowerCase()] || threatIcons.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="w-full"
    >
      <Card
        variant="bordered"
        padding="lg"
        hoverEffect
        className="h-full flex flex-col"
      >
        <div className="flex items-start gap-4 mb-4">
          <motion.div
            className="flex-shrink-0 w-12 h-12 bg-soft-accent rounded-xl flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <span className="text-2xl">{icon}</span>
          </motion.div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-text mb-2">
              {insight.title}
            </h3>
          </div>
        </div>

        <motion.p
          className="text-secondary-text flex-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.3 }}
        >
          {insight.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.4 }}
          className="mt-6 pt-4 border-t border-border-color/50"
        >
          <Button
            variant="ghost"
            size="sm"
            rightIcon="→"
            className="w-full justify-between"
          >
            Learn More
          </Button>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default ThreatCard;
