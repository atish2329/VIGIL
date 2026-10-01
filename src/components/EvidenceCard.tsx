import { motion } from 'framer-motion';
import { Card } from './Card';
import { Badge } from './Badge';
import { Indicator, SeverityColors } from '../types';

interface EvidenceCardProps {
  indicator: Indicator;
  index: number;
}

export const EvidenceCard = ({ indicator, index }: EvidenceCardProps) => {
  const colors = SeverityColors[indicator.severity];
  
  const severityLabels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card
        variant="bordered"
        padding="md"
        className={`border-l-4 ${colors.border.replace('border-', 'border-l-')}`}
      >
        <div className="flex items-start gap-4">
          <motion.div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.bg.replace('bg-', '').replace('/', '-') }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <SeverityIcon severity={indicator.severity} />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-primary-text capitalize">
                {formatIndicatorType(indicator.type)}
              </h4>
              <Badge variant="severity" severity={indicator.severity}>
                {severityLabels[indicator.severity]}
              </Badge>
            </div>

            <p className="text-sm text-secondary-text mb-3">
              <strong>Evidence:</strong> {indicator.evidence}
            </p>

            <p className="text-sm text-secondary-text/80">
              {indicator.explanation}
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className="mt-3"
            >
              <div className="w-full bg-border-color rounded-full h-1.5">
                <motion.div
                  className={`h-full ${colors.bg.replace('bg-', '')} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${indicator.riskContribution}%` }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                />
              </div>
              <p className="text-xs text-secondary-text/60 mt-1">
                Risk contribution: {indicator.riskContribution}%
              </p>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Helper to format indicator type
function formatIndicatorType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Severity icon component
function SeverityIcon({ severity }: { severity: string }) {
  const icons: Record<string, string> = {
    low: 'ℹ️',
    medium: '⚠️',
    high: '❗',
    critical: '🔴',
  };
  return <span>{icons[severity] || '?'}</span>;
}

export default EvidenceCard;
