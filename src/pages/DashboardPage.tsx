import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  SectionHeader,
  Alert,
  Button,
} from '../components';
import { DashboardCard } from '../components/DashboardCard';
import { DashboardMetrics, HistoryItem } from '../types';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockApi';
import { storageService } from '../services/storage';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockBackend, setUseMockBackend] = useState(false);

  // Check if backend is available
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await apiService.checkBackend();
      setUseMockBackend(!isAvailable);
    };
    checkBackend();
  }, []);

  // Load metrics
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        
        if (useMockBackend) {
          const response = await mockApiService.getDashboardMetrics();
          setMetrics(response.data || null);
        } else {
          const response = await apiService.getDashboardMetrics();
          setMetrics(response.data || null);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err);
        setError('Failed to load dashboard metrics. Please try again.');
        
        // Fallback to local storage
        const history = storageService.history.getHistory();
        const localMetrics = calculateLocalMetrics(history);
        setMetrics(localMetrics);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetrics();
  }, [useMockBackend]);

  const calculateLocalMetrics = (history: HistoryItem[]): DashboardMetrics => {
    const totalScans = history.length;
    const highRisk = history.filter(item => item.riskLevel === 'HIGH').length;
    const suspicious = history.filter(item => item.riskLevel === 'SUSPICIOUS').length;
    const lowRisk = history.filter(item => item.riskLevel === 'LOW').length;
    
    const riskDistribution = {
      LOW: lowRisk,
      SUSPICIOUS: suspicious,
      HIGH: highRisk,
    };
    
    const scanTypeDistribution = {
      message: history.filter(item => item.scanType === 'message').length,
      url: history.filter(item => item.scanType === 'url').length,
      screenshot: history.filter(item => item.scanType === 'screenshot').length,
    };
    
    return {
      totalScans,
      highRisk,
      suspicious,
      lowRisk,
      recentScans: history.slice(0, 5),
      riskDistribution,
      scanTypeDistribution,
    };
  };

  const handleViewScan = useCallback((scan: HistoryItem) => {
    navigate(`/analysis/${scan.analysisId}`);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    const loadMetrics = async () => {
      try {
        if (useMockBackend) {
          const response = await mockApiService.getDashboardMetrics();
          setMetrics(response.data || null);
        } else {
          const response = await apiService.getDashboardMetrics();
          setMetrics(response.data || null);
        }
      } catch (err) {
        setError('Failed to refresh metrics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMetrics();
  }, [useMockBackend]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <SectionHeader
            title="Your Security Dashboard"
            eyebrow="DASHBOARD"
            description="Track your scan history and security insights"
          />
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {metrics ? (
            <>
              <StatCard
                title="Total Scans"
                value={metrics.totalScans}
                icon="📊"
                color="text-primary-accent"
              />
              <StatCard
                title="High Risk"
                value={metrics.highRisk}
                icon="🚨"
                color="text-danger"
              />
              <StatCard
                title="Suspicious"
                value={metrics.suspicious}
                icon="⚠️"
                color="text-warning"
              />
              <StatCard
                title="Low Risk"
                value={metrics.lowRisk}
                icon="✅"
                color="text-safe"
              />
            </>
          ) : (
            <>
              <StatCard title="Total Scans" value="0" icon="📊" />
              <StatCard title="High Risk" value="0" icon="🚨" />
              <StatCard title="Suspicious" value="0" icon="⚠️" />
              <StatCard title="Low Risk" value="0" icon="✅" />
            </>
          )}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="mb-8"
          >
            <Alert
              type="error"
              title="Error Loading Metrics"
              message={error}
              action={{ label: 'Retry', onClick: handleRefresh }}
            />
          </motion.div>
        )}

        {/* Charts Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12"
        >
          {metrics && (
            <>
              <RiskDistribution distribution={metrics.riskDistribution} />
              <ScanTypeDistribution distribution={metrics.scanTypeDistribution} />
            </>
          )}
        </motion.div>

        {/* Recent Scans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          {metrics && (
            <RecentScans
              scans={metrics.recentScans}
              onView={handleViewScan}
            />
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          className="mt-8 flex justify-center"
        >
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/scanner')}
            rightIcon="→"
          >
            Run New Scan
          </Button>
        </motion.div>

        {/* Backend Notice */}
        {useMockBackend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8"
          >
            <Alert
              type="warning"
              title="Backend Not Available"
              message="Using local storage data for demonstration. Connect to VIGIL backend for full functionality."
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
