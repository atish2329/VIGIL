import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SectionHeader,
  ScannerSelector,
  MessageScanner,
  URLScanner,
  ScreenshotScanner,
  LoadingState,
  RiskCard,
  EvidenceCard,
  RecommendationCard,
  Alert,
  Button,
} from '../components';
import { AnalysisMode, AnalysisResult, LoadingStep, AppError } from '../types';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockApi';
import { DefaultLoadingSteps } from '../types';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [selectedMode, setSelectedMode] = useState<AnalysisMode>(
    (searchParams.get('mode') as AnalysisMode) || 'message'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>(DefaultLoadingSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
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

  // Update loading steps
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          const newStep = prev + 1;
          if (newStep >= loadingSteps.length) {
            clearInterval(interval);
            return prev;
          }
          
          // Update step status
          setLoadingSteps(prevSteps => 
            prevSteps.map((step, index) => ({
              ...step,
              status: index < newStep ? 'completed' : index === newStep ? 'pending' : 'pending'
            }))
          );
          
          return newStep;
        });
      }, 1500);
      
      return () => clearInterval(interval);
    }
  }, [isLoading, loadingSteps.length]);

  const handleModeSelect = useCallback((mode: AnalysisMode) => {
    setSelectedMode(mode);
    setResult(null);
    setError(null);
    navigate(`/scanner?mode=${mode}`);
  }, [navigate]);

  const handleAnalyze = useCallback(async (
    content: string | File,
    scanType: AnalysisMode,
  ) => {
    setIsLoading(true);
    setError(null);
    setCurrentStep(0);
    setLoadingSteps(DefaultLoadingSteps);

    try {
      let analysisResult: AnalysisResult | null = null;

      if (useMockBackend) {
        // Use mock API for development
        if (scanType === 'message') {
          const response = await mockApiService.analyzeMessage({
            content: content as string,
          });
          analysisResult = response.data || null;
        } else if (scanType === 'url') {
          const response = await mockApiService.analyzeURL({
            url: content as string,
          });
          analysisResult = response.data || null;
        } else if (scanType === 'screenshot') {
          const file = content as File;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          
          const response = await mockApiService.analyzeScreenshot({
            imageData: await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
            }),
            fileName: file.name,
            mimeType: file.type,
          });
          analysisResult = response.data || null;
        }
      } else {
        // Use real API
        if (scanType === 'message') {
          const response = await apiService.analyzeMessage({
            content: content as string,
          });
          analysisResult = response.data || null;
        } else if (scanType === 'url') {
          const response = await apiService.analyzeURL({
            url: content as string,
          });
          analysisResult = response.data || null;
        } else if (scanType === 'screenshot') {
          const file = content as File;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          
          const response = await apiService.analyzeScreenshot({
            imageData: await new Promise<string>((resolve) => {
              reader.onload = () => resolve(reader.result as string);
            }),
            fileName: file.name,
            mimeType: file.type,
          });
          analysisResult = response.data || null;
        }
      }

      if (analysisResult) {
        setResult(analysisResult);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError({
        code: 'ANALYSIS_ERROR',
        message: 'Failed to analyze content. Please try again.',
        details: err instanceof Error ? err.message : 'Unknown error',
        isRetryable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [useMockBackend]);

  const handleRetry = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

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
            title="What would you like VIGIL to check?"
            eyebrow="SCANNER"
            description="Choose a scan type and provide the content you want to analyze"
          />
        </motion.div>

        {/* Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <ScannerSelector
            selectedMode={selectedMode}
            onSelectMode={handleModeSelect}
          />
        </motion.div>

        {/* Scanner Components */}
        <AnimatePresence mode="wait">
          {selectedMode === 'message' && !result && !isLoading && !error && (
            <motion.div
              key="message-scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <MessageScanner
                onAnalyze={(content, _type) => handleAnalyze(content, 'message')}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {selectedMode === 'url' && !result && !isLoading && !error && (
            <motion.div
              key="url-scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <URLScanner
                onAnalyze={(url) => handleAnalyze(url, 'url')}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {selectedMode === 'screenshot' && !result && !isLoading && !error && (
            <motion.div
              key="screenshot-scanner"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <ScreenshotScanner
                onAnalyze={(file) => handleAnalyze(file.file, 'screenshot')}
                isLoading={isLoading}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-8"
            >
              <LoadingState
                steps={loadingSteps}
                currentStep={currentStep}
                title="VIGIL ANALYZING"
                subtitle="Please wait while we analyze your content"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-8"
            >
              <Alert
                type="error"
                title="Analysis Error"
                message={error.message}
                action={error.isRetryable ? {
                  label: 'Try Again',
                  onClick: handleRetry,
                } : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !isLoading && !error && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-8 space-y-6"
            >
              {/* Risk Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
              >
                <RiskCard result={result} showDetails={true} />
              </motion.div>

              {/* Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
              >
                <RecommendationCard result={result} />
              </motion.div>

              {/* Evidence */}
              {result.indicators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
                >
                  <h3 className="text-xl font-semibold text-primary-text mb-4">
                    Why VIGIL flagged this
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

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/analysis/${result.analysisId}`)}
                  rightIcon="→"
                >
                  View Full Analysis
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                >
                  New Scan
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => navigate('/history')}
                >
                  View History
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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

export default ScannerPage;
