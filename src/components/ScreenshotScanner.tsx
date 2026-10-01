import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './Card';
import { UploadArea } from './UploadArea';
import { Button } from './Button';
import { ScreenshotChecks } from '../types';
import { UploadedFile } from '../types';

interface ScreenshotScannerProps {
  onAnalyze: (file: UploadedFile) => void;
  isLoading?: boolean;
}

export const ScreenshotScanner = ({
  onAnalyze,
  isLoading = false,
}: ScreenshotScannerProps) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: UploadedFile) => {
    setError(null);
    setUploadedFile(file);
  }, []);

  const handleRemove = useCallback(() => {
    setUploadedFile(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!uploadedFile) {
      setError('Please upload a screenshot to analyze');
      return;
    }
    setError(null);
    onAnalyze(uploadedFile);
  }, [uploadedFile, onAnalyze]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full"
    >
      <Card variant="elevated" padding="lg" className="shadow-soft">
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-primary-text mb-2">
              Screenshot Scanner
            </h3>
            <p className="text-secondary-text">
              Upload screenshots of suspicious messages, webpages, or QR codes
            </p>
          </div>

          <UploadArea
            onFileSelect={handleFileSelect}
            onRemove={handleRemove}
            placeholderText="Drop a screenshot here"
            subtitle="or choose a file"
            allowedFormats={['PNG', 'JPG', 'JPEG', 'WEBP']}
          />

          <AnimatePresence>
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center justify-between pt-4"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-secondary-text/60">
                    Analyzes: {ScreenshotChecks.join(', ')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    leftIcon="🔍"
                  >
                    Analyze Screenshot
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {!uploadedFile && error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4"
            >
              <p className="text-sm text-danger">{error}</p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default ScreenshotScanner;
