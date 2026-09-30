import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  SectionHeader,
  HistoryTable,
  Alert,
  Button,
  Card,
} from '../components';
import { HistoryItem, AppError } from '../types';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockApi';
import { storageService } from '../services/storage';

export const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);
  const [useMockBackend, setUseMockBackend] = useState(false);

  // Check if backend is available
  useEffect(() => {
    const checkBackend = async () => {
      const isAvailable = await apiService.checkBackend();
      setUseMockBackend(!isAvailable);
    };
    checkBackend();
  }, []);

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        
        let items: HistoryItem[] = [];
        
        if (useMockBackend) {
          const response = await mockApiService.getHistory(50);
          items = response.data || [];
        } else {
          const response = await apiService.getHistory(50);
          items = response.data || [];
        }
        
        // Also get local history
        const localHistory = storageService.history.getHistory();
        
        // Combine and deduplicate
        const combined = [...items, ...localHistory];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        
        setHistory(unique.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (err) {
        console.error('Failed to load history:', err);
        setError({
          code: 'LOAD_ERROR',
          message: 'Failed to load history. Please try again.',
          details: err instanceof Error ? err.message : 'Unknown error',
          isRetryable: true,
        });
        
        // Fallback to local storage
        const localHistory = storageService.history.getHistory();
        setHistory(localHistory);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, [useMockBackend]);

  const handleView = useCallback((item: HistoryItem) => {
    navigate(`/analysis/${item.analysisId}`);
  }, [navigate]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      if (useMockBackend) {
        await mockApiService.deleteHistoryItem(id);
      } else {
        await apiService.deleteHistoryItem(id);
      }
      
      // Also delete from local storage
      storageService.history.deleteHistoryItem(id);
      
      // Remove from state
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
      setError({
        code: 'DELETE_ERROR',
        message: 'Failed to delete history item. Please try again.',
        isRetryable: true,
      });
    }
  }, [useMockBackend]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    const loadHistory = async () => {
      try {
        let items: HistoryItem[] = [];
        
        if (useMockBackend) {
          const response = await mockApiService.getHistory(50);
          items = response.data || [];
        } else {
          const response = await apiService.getHistory(50);
          items = response.data || [];
        }
        
        const localHistory = storageService.history.getHistory();
        const combined = [...items, ...localHistory];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
        
        setHistory(unique.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
      } catch (err) {
        setError({
          code: 'LOAD_ERROR',
          message: 'Failed to refresh history. Please try again.',
          isRetryable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHistory();
  }, [useMockBackend]);

  const handleClearAll = useCallback(async () => {
    try {
      if (useMockBackend) {
        // Mock clear all
        setHistory([]);
      } else {
        // Clear all from backend
        const localHistory = storageService.history.getHistory();
        for (const item of localHistory) {
          await apiService.deleteHistoryItem(item.id);
        }
      }
      
      // Clear local storage
      storageService.history.clearHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setError({
        code: 'CLEAR_ERROR',
        message: 'Failed to clear history. Please try again.',
        isRetryable: true,
      });
    }
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
            title="Your Scan History"
            eyebrow="HISTORY"
            description="Review your past scans and analysis results"
          />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/scanner')}
            rightIcon="→"
          >
            New Scan
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleRefresh}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={handleClearAll}
            isLoading={isLoading}
            className="text-danger hover:text-danger/80"
          >
            Clear All
          </Button>
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
              title="Error"
              message={error.message}
              action={error.isRetryable ? {
                label: 'Retry',
                onClick: handleRefresh,
              } : undefined}
            />
          </motion.div>
        )}

        {/* History Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <Card variant="subtle" padding="lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-sm text-secondary-text/60 mb-1">Total Scans</p>
                <p className="text-2xl font-bold text-primary-text">{history.length}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-text/60 mb-1">High Risk</p>
                <p className="text-2xl font-bold text-danger">
                  {history.filter(item => item.riskLevel === 'HIGH').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-text/60 mb-1">Suspicious</p>
                <p className="text-2xl font-bold text-warning">
                  {history.filter(item => item.riskLevel === 'SUSPICIOUS').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-secondary-text/60 mb-1">Low Risk</p>
                <p className="text-2xl font-bold text-safe">
                  {history.filter(item => item.riskLevel === 'LOW').length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* History Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        >
          <HistoryTable
            history={history}
            onView={handleView}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Empty State */}
        {history.length === 0 && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="text-center py-12"
          >
            <Card variant="subtle" padding="lg" className="max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-24 h-24 mb-4 bg-soft-accent rounded-2xl flex items-center justify-center"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-4xl">📜</span>
                </motion.div>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-xl font-semibold text-primary-text mb-2"
                >
                  No Scan History Yet
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-secondary-text mb-6"
                >
                  Your scan history will appear here after you complete your first analysis.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('/scanner')}
                    rightIcon="→"
                  >
                    Start Your First Scan
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        )}

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

export default HistoryPage;
