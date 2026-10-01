import { useState, useCallback, DragEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { UploadedFile } from '../types';
import { Button } from './Button';
import { Alert } from './Alert';

interface UploadAreaProps {
  onFileSelect: (file: UploadedFile) => void;
  onRemove: () => void;
  acceptedTypes?: string[];
  maxSize?: number;
  multiple?: boolean;
  placeholderText?: string;
  subtitle?: string;
  allowedFormats?: string[];
}

export const UploadArea = ({
  onFileSelect,
  onRemove,
  acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'],
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  placeholderText = 'Drop a screenshot here',
  subtitle = 'or',
  allowedFormats = ['PNG', 'JPG', 'JPEG', 'WEBP'],
}: UploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    []
  );

  const handleFiles = (files: FileList | File[]) => {
    setError(null);
    
    const file = files[0];
    
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Unsupported file type. Please upload: ${allowedFormats.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        const previewUrl = reader.result as string;
        setPreview(previewUrl);
        setSelectedFileName(file.name);
        
        onFileSelect({
          file,
          preview: previewUrl,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
        });
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFileName(file.name);
      onFileSelect({
        file,
        preview: '',
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFileName('');
    setError(null);
    onRemove();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full"
    >
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert type="error" message={error} onDismiss={() => setError(null)} />
        </motion.div>
      )}

      <motion.div
        className={`border-2 border-dashed rounded-2xl transition-all duration-300 ${
          isDragging
            ? 'border-primary-accent bg-soft-accent/50'
            : 'border-border-color bg-card-bg hover:border-primary-accent/50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          {preview ? (
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-48 rounded-lg shadow-soft"
                />
                <button
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-danger/20 hover:bg-danger/30 text-danger rounded-full flex items-center justify-center transition-colors"
                  aria-label="Remove"
                >
                  ×
                </button>
              </motion.div>
              <p className="text-sm text-secondary-text">{selectedFileName}</p>
            </div>
          ) : (
            <>
              <motion.div
                className="w-16 h-16 mx-auto mb-4 bg-soft-accent rounded-2xl flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <span className="text-3xl">📷</span>
              </motion.div>
              
              <motion.p
                className="text-lg font-medium text-primary-text mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {placeholderText}
              </motion.p>
              
              <p className="text-sm text-secondary-text mb-4">{subtitle}</p>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button variant="secondary" size="sm">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Browse Files
                  </label>
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept={acceptedTypes.join(',')}
                  onChange={handleFileChange}
                  className="sr-only"
                  multiple={multiple}
                />
              </motion.div>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-secondary-text/60 mt-4"
              >
                Supported: {allowedFormats.join(' • ')}
              </motion.p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default UploadArea;
