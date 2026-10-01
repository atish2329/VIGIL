import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Textarea } from './Textarea';
import { Button } from './Button';
import { Select } from './Select';
import { MessageTypes } from '../types';

interface MessageScannerProps {
  onAnalyze: (content: string, messageType?: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  initialError?: string;
}

export const MessageScanner = ({
  onAnalyze,
  isLoading = false,
  placeholder = 'Paste a suspicious message here...',
  initialError = '',
}: MessageScannerProps) => {
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState('');
  const [error, setError] = useState<string>(initialError);

  const handleSubmit = useCallback(() => {
    if (!content.trim()) {
      setError('Please paste a message to analyze');
      return;
    }
    setError('');
    onAnalyze(content, messageType || undefined);
  }, [content, messageType, onAnalyze]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
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
              Message Scanner
            </h3>
            <p className="text-secondary-text">
              Paste suspicious messages from SMS, email, WhatsApp, or social media
            </p>
          </div>

          <div className="space-y-4">
            <Textarea
              label="Message Content"
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              error={error}
              charCount={content.length}
              maxLength={20000}
              hint="Press Ctrl+Enter to analyze"
            />

            <Select
              label="Message Type (Optional)"
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
              hint="Helps improve analysis accuracy"
            >
              <option value="">Select message type...</option>
              {MessageTypes.map((type) => (
                <option key={type} value={type.toLowerCase().replace('/', '-')}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center justify-between pt-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm text-secondary-text/60">
                Analyzes for: urgency, threats, OTP requests, password requests, 
                financial requests, suspicious URLs, impersonation, payment requests, 
                social engineering, reward/prize scams, fake support
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
                Analyze Message
              </Button>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default MessageScanner;
