import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  SectionHeader,
  UploadArea,
  LoadingState,
  RiskCard,
  EvidenceCard,
  RecommendationCard,
  Alert,
  Card,
  Button,
} from '../components';
import { UploadedFile, AnalysisResult, LoadingStep, AppError, DetectedRegion } from '../types';
import { apiService } from '../services/api';
import { mockApiService } from '../services/mockApi';

// Vision-specific loading steps
const VisionLoadingSteps: LoadingStep[] = [
  { id: 'uploading', label: 'Uploading image', status: 'pending' },
  { id: 'preprocessing', label: 'Preprocessing image', status: 'pending' },
  { id: 'ocr', label: 'Running OCR', status: 'pending' },
  { id: 'url-extraction', label: 'Extracting URLs and text', status: 'pending' },
  { id: 'visual-analysis', label: 'Analyzing visual signals', status: 'pending' },
  { id: 'evidence', label: 'Detecting evidence', status: 'pending' },
  { id: 'risk-calculation', label: 'Calculating risk', status: 'pending' },
];

export const VisionPage = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>(VisionLoadingSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<AppError | null>(null);
  const [useMockBackend, setUseMockBackend] = useState(false);
  const [regions, setRegions] = useState<DetectedRegion[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<DetectedRegion | null>(null);

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
          
          setLoadingSteps(prevSteps => 
            prevSteps.map((step, index) => ({
              ...step,
              status: index < newStep ? 'completed' : index === newStep ? 'pending' : 'pending'
            }))
          );
          
          return newStep;
        });
      }, 1200);
      
      return () => clearInterval(interval);
    }
  }, [isLoading, loadingSteps.length]);

  // Draw on canvas when result is available
  useEffect(() => {
    if (result?.imagePreview && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Draw region overlays
        if (showOverlay && regions.length > 0) {
          drawRegionOverlays(ctx, regions);
        }
      };
      img.src = result.imagePreview;
    }
  }, [result, regions, showOverlay]);

  const drawRegionOverlays = (ctx: CanvasRenderingContext2D, regions: DetectedRegion[]) => {
    regions.forEach(region => {
      const { x, y, width, height } = region.boundingBox;
      
      // Set color based on risk level
      const colors: Record<string, { fill: string; stroke: string }> = {
        low: { fill: 'rgba(62, 142, 114, 0.2)', stroke: '#3E8E72' },
        medium: { fill: 'rgba(194, 138, 69, 0.2)', stroke: '#C28A45' },
        high: { fill: 'rgba(184, 92, 92, 0.2)', stroke: '#B85C5C' },
        critical: { fill: 'rgba(184, 92, 92, 0.3)', stroke: '#B85C5C' },
      };
      
      const color = colors[region.riskLevel] || colors.medium;
      
      ctx.fillStyle = color.fill;
      ctx.strokeStyle = color.stroke;
      ctx.lineWidth = 2;
      
      ctx.fillRect(x, y, width, height);
      ctx.strokeRect(x, y, width, height);
      
      // Draw label
      ctx.fillStyle = color.stroke;
      ctx.font = '12px sans-serif';
      ctx.fillText(region.type, x + 5, y + 15);
    });
  };

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setUploadedFile(file);
    setError(null);
    setResult(null);
    setRegions([]);
    setShowOverlay(false);
  }, []);

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!uploadedFile) {
      setError({
        code: 'NO_FILE',
        message: 'Please upload a screenshot to analyze',
        isRetryable: false,
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentStep(0);
    setLoadingSteps(VisionLoadingSteps);

    try {
      let analysisResult: AnalysisResult | null = null;

      if (useMockBackend) {
        // Use mock API for development
        const response = await mockApiService.analyzeScreenshot({
          imageData: uploadedFile.preview,
          fileName: uploadedFile.fileName,
          mimeType: uploadedFile.mimeType,
        });
        analysisResult = response.data || null;
        
        // Generate mock regions
        if (analysisResult) {
          const mockRegions: DetectedRegion[] = [
            {
              id: '1',
              type: 'URL',
              text: 'suspicious-website.com',
              boundingBox: { x: 100, y: 100, width: 200, height: 30 },
              confidence: 0.95,
              riskLevel: 'high',
            },
            {
              id: '2',
              type: 'Login Form',
              text: 'Username: _______ Password: _______',
              boundingBox: { x: 50, y: 200, width: 300, height: 100 },
              confidence: 0.92,
              riskLevel: 'critical',
            },
          ];
          setRegions(mockRegions);
        }
      } else {
        // Use real API
        const response = await apiService.analyzeScreenshot({
          imageData: uploadedFile.preview,
          fileName: uploadedFile.fileName,
          mimeType: uploadedFile.mimeType,
        });
        analysisResult = response.data || null;
      }

      if (analysisResult) {
        setResult(analysisResult);
      }
    } catch (err) {
      console.error('Vision analysis error:', err);
      setError({
        code: 'VISION_ERROR',
        message: 'Failed to analyze screenshot. Please try again.',
        details: err instanceof Error ? err.message : 'Unknown error',
        isRetryable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile, useMockBackend]);

  const handleRegionClick = (region: DetectedRegion) => {
    setSelectedRegion(region);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !showOverlay) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is within any region
    const clickedRegion = regions.find(r => {
      const { x: rx, y: ry, width, height } = r.boundingBox;
      return x >= rx && x <= rx + width && y >= ry && y <= ry + height;
    });
    
    if (clickedRegion) {
      handleRegionClick(clickedRegion);
    }
  };

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
            title="See what VIGIL sees."
            eyebrow="VIGIL VISION"
            description="Upload a screenshot and let VIGIL analyze it for security threats"
          />
        </motion.div>

        {/* Workflow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="mb-12"
        >
          <Card variant="subtle" padding="lg">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
              <WorkflowStep number="1" label="Upload" icon="📤" />
              <WorkflowStep number="2" label="OCR" icon="📝" />
              <WorkflowStep number="3" label="Extract" icon="🔍" />
              <WorkflowStep number="4" label="Analyze" icon="🧠" />
              <WorkflowStep number="5" label="Detect" icon="🎯" />
              <WorkflowStep number="6" label="Calculate" icon="📊" />
              <WorkflowStep number="7" label="Explain" icon="💡" />
            </div>
          </Card>
        </motion.div>

        {/* Upload Area */}
        <AnimatePresence mode="wait">
          {!result && !isLoading && !error && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <UploadArea
                onFileSelect={handleFileSelect}
                onRemove={handleRemove}
                placeholderText="Drop a screenshot here"
                subtitle="or choose a file"
                allowedFormats={['PNG', 'JPG', 'JPEG', 'WEBP']}
              />
              
              {uploadedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 flex justify-end"
                >
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAnalyze}
                    isLoading={isLoading}
                    leftIcon="🔍"
                  >
                    Analyze Screenshot
                  </Button>
                </motion.div>
              )}
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
                title="VIGIL VISION ANALYZING"
                subtitle="Processing your screenshot"
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

              {/* Screenshot Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
                className="bg-card-bg rounded-2xl border border-border-color overflow-hidden"
              >
                <div className="p-4 border-b border-border-color/50 flex items-center justify-between">
                  <h3 className="font-semibold text-primary-text">Screenshot Preview</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOverlay(!showOverlay)}
                      className={showOverlay ? 'bg-soft-accent/50' : ''}
                    >
                      {showOverlay ? 'Hide Overlay' : 'Show Analysis'}
                    </Button>
                  </div>
                </div>
                
                <div className="p-4">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full rounded-lg cursor-crosshair"
                    style={{ maxHeight: '600px', objectFit: 'contain' }}
                  />
                </div>
                
                {showOverlay && regions.length > 0 && (
                  <div className="p-4 bg-soft-accent/30">
                    <p className="text-sm text-secondary-text/60 mb-2">
                      Click on highlighted regions to see details
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {regions.map(region => (
                        <button
                          key={region.id}
                          onClick={() => handleRegionClick(region)}
                          className={`px-3 py-1 text-xs rounded-full ${
                            region.riskLevel === 'high' || region.riskLevel === 'critical' 
                              ? 'bg-danger/10 text-danger' 
                              : region.riskLevel === 'medium' 
                              ? 'bg-warning/10 text-warning' 
                              : 'bg-safe/10 text-safe'
                          }`}
                        >
                          {region.type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Region Details Modal */}
              <AnimatePresence>
                {selectedRegion && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedRegion(null)}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-card-bg rounded-2xl p-6 max-w-md w-full"
                      onClick={e => e.stopPropagation()}
                    >
                      <h3 className="text-lg font-semibold text-primary-text mb-4">
                        Evidence Details
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-secondary-text/60 mb-1">Type</p>
                          <p className="font-medium text-primary-text">{selectedRegion.type}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-secondary-text/60 mb-1">Text</p>
                          <p className="font-medium text-primary-text">{selectedRegion.text}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-secondary-text/60 mb-1">Confidence</p>
                          <p className="font-medium text-primary-text">
                            {Math.round(selectedRegion.confidence * 100)}%
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-secondary-text/60 mb-1">Risk Level</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            selectedRegion.riskLevel === 'high' || selectedRegion.riskLevel === 'critical'
                              ? 'bg-danger/10 text-danger'
                              : selectedRegion.riskLevel === 'medium'
                              ? 'bg-warning/10 text-warning'
                              : 'bg-safe/10 text-safe'
                          }`}>
                            {selectedRegion.riskLevel.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedRegion(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
              >
                <RecommendationCard result={result} />
              </motion.div>

              {/* Evidence */}
              {result.indicators.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
                >
                  <h3 className="text-xl font-semibold text-primary-text mb-4">
                    Detected Indicators
                  </h3>
                  
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
                transition={{ delay: 0.5, duration: 0.4, ease: 'easeOut' }}
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
                    setUploadedFile(null);
                    setError(null);
                  }}
                >
                  New Analysis
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

// Workflow Step Component
const WorkflowStep = ({ number, label, icon }: { number: string; label: string; icon: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center"
    >
      <motion.div
        className="w-10 h-10 bg-soft-accent rounded-full flex items-center justify-center mb-2"
        whileHover={{ scale: 1.1 }}
      >
        <span className="text-lg">{icon}</span>
      </motion.div>
      <p className="text-xs font-medium text-primary-text">{label}</p>
      <p className="text-xs text-secondary-text/60">Step {number}</p>
    </motion.div>
  );
};

export default VisionPage;
