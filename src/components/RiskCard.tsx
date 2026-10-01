import { motion } from 'framer-motion';
import { Card } from './Card';
import { RiskScore } from './RiskScore';
import { Badge } from './Badge';
import { AnalysisResult, RiskLevelColors } from '../types';

interface RiskCardProps {
  result: AnalysisResult;
  showDetails?: boolean;
}

export const RiskCard = ({ result, showDetails = true }: RiskCardProps) => {
  const colors = RiskLevelColors[result.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full"
    >
      <Card
        variant="elevated"
        padding="lg"
        className={`shadow-soft border-l-4 ${colors.border.replace('border-', 'border-l-')}`}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-4"
          >
            <Badge variant="risk" riskLevel={result.riskLevel} dot>
              {result.riskLevel === 'HIGH' ? 'HIGH RISK' : 
               result.riskLevel === 'SUSPICIOUS' ? 'SUSPICIOUS' : 'LOW RISK'}
            </Badge>
          </motion.div>

          <RiskScore
            score={result.riskScore}
            level={result.riskLevel}
            confidence={result.confidence}
            showLabel={false}
            size="lg"
          />

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 pt-4 border-t border-border-color/50 w-full"
            >
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-secondary-text/60 mb-1">Risk Score</p>
                  <p className="font-semibold text-primary-text">{result.riskScore}/100</p>
                </div>
                <div>
                  <p className="text-secondary-text/60 mb-1">Confidence</p>
                  <p className="font-semibold text-primary-text">{Math.round(result.confidence * 100)}%</p>
                </div>
                <div>
                  <p className="text-secondary-text/60 mb-1">Scan Type</p>
                  <p className="font-semibold text-primary-text capitalize">{result.scanType}</p>
                </div>
                <div>
                  <p className="text-secondary-text/60 mb-1">Indicators</p>
                  <p className="font-semibold text-primary-text">{result.indicators.length}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default RiskCard;
