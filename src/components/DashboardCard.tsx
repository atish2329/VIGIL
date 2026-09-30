import { motion } from 'framer-motion';
import { Card } from './Card';
import { RiskLevel, DashboardMetrics } from '../types';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
  trend?: number;
  isCurrency?: boolean;
}

export const StatCard = ({
  title,
  value,
  icon,
  color = 'text-primary-accent',
  trend,
  isCurrency = false,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -5 }}
      className="w-full"
    >
      <Card variant="bordered" padding="lg" className="h-full">
        <div className="flex items-center justify-between h-full">
          <div>
            <p className="text-sm font-medium text-secondary-text/80 mb-1">{title}</p>
            <motion.p
              className={`text-3xl font-bold ${color}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {isCurrency ? `$${value}` : value}
            </motion.p>
            {trend !== undefined && (
              <motion.p
                className={`text-xs mt-2 ${
                  trend >= 0 ? 'text-safe' : 'text-danger'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {trend >= 0 ? `+${trend}%` : `${trend}%`}
              </motion.p>
            )}
          </div>
          <motion.div
            className="w-12 h-12 bg-soft-accent rounded-xl flex items-center justify-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-2xl">{icon}</span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

// Risk Distribution Chart
interface RiskDistributionProps {
  distribution: Record<RiskLevel, number>;
}

export const RiskDistribution = ({ distribution }: RiskDistributionProps) => {
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  
  const colors: Record<RiskLevel, string> = {
    LOW: 'bg-safe',
    SUSPICIOUS: 'bg-warning',
    HIGH: 'bg-danger',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="w-full"
    >
      <Card variant="bordered" padding="lg">
        <h3 className="text-lg font-semibold text-primary-text mb-4">
          Risk Distribution
        </h3>
        
        <div className="space-y-4">
          {Object.entries(distribution).map(([level, count]) => (
            <div key={level} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary-text">
                  {level}
                </span>
                <span className="text-sm text-secondary-text">
                  {count} ({Math.round((count / total) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-border-color rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full ${colors[level as RiskLevel]} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(count / total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

// Scan Type Distribution
interface ScanTypeDistributionProps {
  distribution: Record<'message' | 'url' | 'screenshot', number>;
}

export const ScanTypeDistribution = ({ distribution }: ScanTypeDistributionProps) => {
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  
  const icons: Record<string, string> = {
    message: '💬',
    url: '🔗',
    screenshot: '📷',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
      className="w-full"
    >
      <Card variant="bordered" padding="lg">
        <h3 className="text-lg font-semibold text-primary-text mb-4">
          Scan Type Distribution
        </h3>
        
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(distribution).map(([type, count]) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center p-4 bg-soft-accent/30 rounded-xl"
            >
              <div className="text-3xl mb-2">{icons[type] || '?'}</div>
              <p className="text-2xl font-bold text-primary-text">{count}</p>
              <p className="text-xs text-secondary-text/60">
                {Math.round((count / total) * 100)}%
              </p>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

// Recent Scans
interface RecentScansProps {
  scans: any[];
  onView: (scan: any) => void;
}

export const RecentScans = ({ scans, onView }: RecentScansProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.4 }}
      className="w-full"
    >
      <Card variant="bordered" padding="lg">
        <h3 className="text-lg font-semibold text-primary-text mb-4">
          Recent Scans
        </h3>
        
        <div className="space-y-3">
          {scans.slice(0, 5).map((scan, index) => (
            <motion.div
              key={scan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onView(scan)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-soft-accent/50 cursor-pointer transition-colors"
            >
              <span className="text-xl">
                {scan.scanType === 'message' ? '💬' : 
                 scan.scanType === 'url' ? '🔗' : '📷'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-primary-text truncate">{scan.preview}</p>
                <p className="text-xs text-secondary-text/60">{scan.timestamp}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                scan.riskLevel === 'HIGH' ? 'bg-danger/10 text-danger' :
                scan.riskLevel === 'SUSPICIOUS' ? 'bg-warning/10 text-warning' :
                'bg-safe/10 text-safe'
              }`}>
                {scan.riskLevel}
              </span>
            </motion.div>
          ))}
        </div>
        
        {scans.length > 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-4 border-t border-border-color/50 text-center"
          >
            <p className="text-sm text-secondary-text/60">
              +{scans.length - 5} more scans
            </p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export const DashboardCard = {
  Stat: StatCard,
  RiskDistribution,
  ScanTypeDistribution,
  RecentScans,
};

export default DashboardCard;
