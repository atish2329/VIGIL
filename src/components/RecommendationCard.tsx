import { motion } from 'framer-motion';
import { Card } from './Card';
import { AnalysisResult, RiskLevelColors } from '../types';

interface RecommendationCardProps {
  result: AnalysisResult;
}

export const RecommendationCard = ({ result }: RecommendationCardProps) => {
  const colors = RiskLevelColors[result.riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
      className="w-full"
    >
      <Card
        variant="subtle"
        padding="lg"
        className={`border-l-4 ${colors.border.replace('border-', 'border-l-')}`}
      >
        <div className="flex items-start gap-4">
          <motion.div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: colors.bg.replace('bg-', '').replace('/', '-') }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <RecommendationIcon riskLevel={result.riskLevel} />
          </motion.div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary-text mb-2">
              Recommended Action
            </h3>

            <motion.p
              className="text-secondary-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {result.recommendation}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 bg-background rounded-lg"
            >
              <p className="text-xs text-secondary-text/60 leading-relaxed">
                <strong>Remember:</strong> VIGIL provides evidence-based analysis to help you make informed decisions. 
                Always verify independently and never share sensitive information unless you're certain of the recipient's legitimacy.
              </p>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Recommendation icon based on risk level
function RecommendationIcon({ riskLevel }: { riskLevel: string }) {
  const icons: Record<string, string> = {
    HIGH: '🚨',
    SUSPICIOUS: '⚠️',
    LOW: '✅',
  };
  return <span className="text-xl">{icons[riskLevel] || 'ℹ️'}</span>;
}

export default RecommendationCard;
