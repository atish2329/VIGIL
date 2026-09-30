import { forwardRef, TextareaHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  charCount?: number;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      charCount,
      maxLength,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {label && (
          <label className="block text-sm font-medium text-primary-text mb-2">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          className={`w-full px-4 py-3 rounded-xl border bg-card-bg text-primary-text placeholder:text-secondary-text/60
            resize-none min-h-[120px]
            transition-all duration-200
            ${error ? 'border-danger focus:ring-2 focus:ring-danger/20' : 'border-border-color focus:ring-2 focus:ring-primary-accent/20'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        />
        
        <div className="flex justify-between items-center mt-2">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-danger"
            >
              {error}
            </motion.p>
          )}
          
          {charCount !== undefined && maxLength && (
            <span className={`text-sm ${error ? 'text-danger' : 'text-secondary-text/60'}`}>
              {charCount} / {maxLength}
            </span>
          )}
        </div>
        
        {hint && !error && (
          <p className="mt-1 text-sm text-secondary-text/60">{hint}</p>
        )}
      </motion.div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
