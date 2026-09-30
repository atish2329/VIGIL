import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SectionHeader,
  RiskCard,
  EvidenceCard,
  RecommendationCard,
  LoadingState,
  Alert,
  Button,
  Card,
} from '../components';
import { AnalysisResult, AppError } from '../types';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockApi';
import { storageService } from '../services/storage';

export const AnalysisPage = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  
  const [result, setResult] = useState<AnalysisResult | null>(null);
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

  // Load analysis
  useEffect(() => {
    const loadAnalysis = async () => {
      if (!analysisId) {
        setError({
          code: 'NO_ID',
          message: 'Analysis ID not provided',
          isRetryable: false,
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        let analysisResult: AnalysisResult | null = null;
        
        if (useMockBackend) {
          // Try to find in mock history
          const history = await mockApiService.getHistory();
          const item = history.data?.find(h => h.analysisId === analysisId);
          if (item) {
            const response = await mockApiService.getAnalysis(item.analysisId);
            analysisResult = response.data || null;
          } else {
            // Generate mock result
            const response = await mockApiService.analyzeMessage({
              content: 'Sample analysis content',
            });
            analysisResult = response.data || null;
          }
        } else {
          const response = await apiService.getAnalysis(analysisId);
          analysisResult = response.data || null;
        }

        if (!analysisResult) {
          // Try local storage
          const history = storageService.history.getHistory();
          const item = history.find(h => h.analysisId === analysisId);
          if (item) {
            // This is a simplified version - in production you'd fetch the full result
            navigate('/scanner');
            return;
          }
        }

        if (analysisResult) {
          setResult(analysisResult);
        } else {
          setError({
            code: 'NOT_FOUND',
            message: 'Analysis not found',
            isRetryable: false,
          });
        }
      } catch (err) {
        console.error('Failed to load analysis:', err);
        setError({
          code: 'LOAD_ERROR',
          message: 'Failed to load analysis. Please try again.',
          details: err instanceof Error ? err.message : 'Unknown error',
          isRetryable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalysis();
  }, [analysisId, useMockBackend, navigate]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    const loadAnalysis = async () => {
      if (!analysisId) return;
      
      try {
        if (useMockBackend) {
          const response = await mockApiService.getAnalysis(analysisId);
          setResult(response.data || null);
        } else {
          const response = await apiService.getAnalysis(analysisId);
          setResult(response.data || null);
        }
      } catch (err) {
        setError({
          code: 'LOAD_ERROR',
          message: 'Failed to load analysis. Please try again.',
          isRetryable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAnalysis();
  }, [analysisId, useMockBackend]);

  const handleDelete = useCallback(async () => {
    if (!analysisId) return;
    
    try {
      if (useMockBackend) {
        await mockApiService.deleteHistoryItem(analysisId);
      } else {
        await apiService.deleteHistoryItem(analysisId);
      }
      
      // Also delete from local storage
      storageService.history.deleteHistoryItem(
        storageService.history.getHistory().find(item => item.analysisId === analysisId)?.id || ''
      );
      
      navigate('/history');
    } catch (err) {
      console.error('Failed to delete analysis:', err);
      setError({
        code: 'DELETE_ERROR',
        message: 'Failed to delete analysis. Please try again.',
        isRetryable: true,
      });
    }
  }, [analysisId, useMockBackend, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-12"
          >
            <SectionHeader
              title="Loading Analysis..."
              align="center"
            />
          </motion.div>
          
          <LoadingState
            title="Fetching Analysis"
            subtitle="Please wait while we retrieve your analysis results"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-12"
          >
            <SectionHeader
              title="Analysis Error"
              align="center"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          >
            <Alert
              type="error"
              title={error.code}
              message={error.message}
              action={error.isRetryable ? {
                label: 'Try Again',
                onClick: handleRetry,
              } : undefined}
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
            className="mt-8 text-center"
          >
            <Button
              variant="outline"
              onClick={() => navigate('/history')}
            >
              Back to History
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-12"
          >
            <SectionHeader
              title="Analysis Not Found"
              align="center"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
            className="text-center"
          >
            <Card variant="subtle" padding="lg" className="max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-24 h-24 mb-4 bg-soft-accent rounded-2xl flex items-center justify-center"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="text-4xl">🔍</span>
                </motion.div>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-secondary-text mb-6"
                >
                  The analysis you're looking for doesn't exist or has been deleted.
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4"
                >
                  <Button
                    variant="primary"
                    onClick={() => navigate('/scanner')}
                    rightIcon="→"
                  >
                    New Scan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/history')}
                  >
                    View History
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <SectionHeader
            title="Security Analysis"
            eyebrow="ANALYSIS RESULTS"
            description={`Analysis ID: ${result.analysisId}`}
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
            variant="outline"
            size="md"
            onClick={() => navigate('/scanner')}
            leftIcon="←"
          >
            Back to Scanner
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/history')}
          >
            View History
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={handleDelete}
            className="text-danger hover:text-danger/80"
          >
            Delete Analysis
          </Button>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          className="space-y-6"
        >
          {/* Metadata Card */}
          <Card variant="subtle" padding="md">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-secondary-text/60 mb-1">Scan Type</p>
                <p className="font-medium text-primary-text capitalize">{result.scanType}</p>
              </div>
              <div>
                <p className="text-secondary-text/60 mb-1">Timestamp</p>
                <p className="font-medium text-primary-text">
                  {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-secondary-text/60 mb-1">Risk Score</p>
                <p className="font-medium text-primary-text">{result.riskScore}/100</p>
              </div>
              <div>
                <p className="text-secondary-text/60 mb-1">Confidence</p>
                <p className="font-medium text-primary-text">
                  {Math.round(result.confidence * 100)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Risk Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
          >
            <RiskCard result={result} showDetails={false} />
          </motion.div>

          {/* Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
          >
            <RecommendationCard result={result} />
          </motion.div>

          {/* Raw Input */}
          {result.rawInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
            >
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-primary-text mb-3">
                  Original Input
                </h3>
                <pre className="text-sm text-secondary-text overflow-x-auto p-4 bg-background rounded-lg">
                  {result.rawInput}
                </pre>
              </Card>
            </motion.div>
          )}

          {/* Evidence */}
          {result.indicators.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease: 'easeOut' }}
            >
              <h3 className="text-xl font-semibold text-primary-text mb-4">
                Detected Indicators
              </h3>
              <p className="text-secondary-text mb-6">
                Evidence detected in the analysis
              </p>
              
              <div className="space-y-4">
                {result.indicators.map((indicator, index) => (
                  <EvidenceCard
                    key={`${indicator.type}-${index}`}
                    indicator={indicator}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Screenshot Preview */}
          {result.imagePreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4, ease: 'easeOut' }}
            >
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-primary-text mb-3">
                  Screenshot Preview
                </h3>
                <img
                  src={result.imagePreview}
                  alt="Screenshot"
                  className="w-full rounded-lg"
                />
              </Card>
            </motion.div>
          )}

          {/* OCR Text */}
          {result.ocrText && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4, ease: 'easeOut' }}
            >
              <Card variant="bordered" padding="md">
                <h3 className="text-lg font-semibold text-primary-text mb-3">
                  Extracted Text (OCR)
                </h3>
                <pre className="text-sm text-secondary-text overflow-x-auto p-4 bg-background rounded-lg">
                  {result.ocrText}
                </pre>
                {result.ocrConfidence && (
                  <p className="text-xs text-secondary-text/60 mt-3">
                    OCR Confidence: {Math.round(result.ocrConfidence * 100)}%
                  </p>
                )}
              </Card>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
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
              onClick={() => window.print()}
            >
              Print Results
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => navigate('/history')}
            >
              Back to History
            </Button>
          </motion.div>
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
              message="Using mock data for demonstration. Connect to VIGIL backend for real analysis."
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
