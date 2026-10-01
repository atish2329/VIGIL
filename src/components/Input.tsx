import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      type = 'text',
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
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-xl border bg-card-bg text-primary-text placeholder:text-secondary-text/60
              transition-all duration-200
              ${error ? 'border-danger focus:ring-2 focus:ring-danger/20' : 'border-border-color focus:ring-2 focus:ring-primary-accent/20'}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${className}
            `}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-danger"
          >
            {error}
          </motion.p>
        )}
        
        {hint && !error && (
          <p className="mt-1 text-sm text-secondary-text/60">{hint}</p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
