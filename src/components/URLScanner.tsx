import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { URLChecks } from '../types';

interface URLScannerProps {
  onAnalyze: (url: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const URLScanner = ({
  onAnalyze,
  isLoading = false,
  placeholder = 'Enter a suspicious URL...',
}: URLScannerProps) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateUrl = useCallback((url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }
    
    if (!validateUrl(url)) {
      // Allow non-standard URLs for analysis
      if (!url.includes('.') && !url.includes('://')) {
        setError('Please enter a valid URL');
        return;
      }
    }
    
    setError(null);
    onAnalyze(url);
  }, [url, onAnalyze, validateUrl]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

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
              URL Scanner
            </h3>
            <p className="text-secondary-text">
              Enter suspicious website addresses to check for threats
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Website URL"
              type="url"
              placeholder={placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              error={error || undefined}
              leftIcon="🌐"
              hint="VIGIL inspects the address only. The website will not be opened."
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-secondary-text/60">
                Analyzes: {URLChecks.join(', ')}
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
                Analyze URL
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default URLScanner;
