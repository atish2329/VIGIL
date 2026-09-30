import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalysisMode } from '../types';
import { Card } from './Card';
import { Button } from './Button';

interface ScannerSelectorProps {
  selectedMode: AnalysisMode;
  onSelectMode: (mode: AnalysisMode) => void;
}

const modes = [
  {
    id: 'message' as AnalysisMode,
    label: 'MESSAGE',
    description: 'Analyze suspicious texts, emails, and messages',
    icon: '💬',
    features: ['SMS', 'Email', 'WhatsApp', 'Social Media', 'Bank Messages'],
  },
  {
    id: 'url' as AnalysisMode,
    label: 'URL',
    description: 'Check suspicious website addresses',
    icon: '🔗',
    features: ['Domain', 'Structure', 'Parameters', 'HTTPS', 'Lookalike'],
  },
  {
    id: 'screenshot' as AnalysisMode,
    label: 'SCREENSHOT',
    description: 'Analyze screenshots of suspicious content',
    icon: '📷',
    features: ['OCR', 'URL Extraction', 'Phishing Indicators', 'QR Detection'],
  },
];

export const ScannerSelector = ({ selectedMode, onSelectMode }: ScannerSelectorProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full"
    >
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
      >
        {modes.map((mode) => (
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Card
              variant={selectedMode === mode.id ? 'elevated' : 'bordered'}
              padding="lg"
              hoverEffect
              clickable
              onClick={() => onSelectMode(mode.id)}
              className={`cursor-pointer transition-all duration-300 ${
                selectedMode === mode.id
                  ? 'ring-2 ring-primary-accent shadow-soft-lg'
                  : ''
              }`}
            >
              <div className="flex flex-col items-center text-center">
                <motion.div
                  className="w-16 h-16 mb-4 bg-soft-accent rounded-2xl flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: selectedMode === mode.id ? 0 : [0, -5, 5, 0] }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <span className="text-3xl">{mode.icon}</span>
                </motion.div>
                
                <h3 className="text-lg font-semibold text-primary-text mb-2">
                  {mode.label}
                </h3>
                
                <p className="text-sm text-secondary-text mb-4">
                  {mode.description}
                </p>
                
                <AnimatePresence mode="wait">
                  {selectedMode === mode.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-wrap justify-center gap-1.5"
                    >
                      {mode.features.map((feature) => (
                        <motion.span
                          key={feature}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + mode.features.indexOf(feature) * 0.05 }}
                          className="px-2 py-1 bg-primary-accent/10 text-primary-accent text-xs rounded-full"
                        >
                          {feature}
                        </motion.span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button
                    variant={selectedMode === mode.id ? 'primary' : 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMode(mode.id);
                    }}
                  >
                    {selectedMode === mode.id ? 'Selected' : 'Choose'}
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ScannerSelector;
