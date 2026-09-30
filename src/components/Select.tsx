import { forwardRef, SelectHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      className = '',
      disabled,
      children,
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
        
        <select
          ref={ref}
          disabled={disabled}
          className={`w-full px-4 py-3 rounded-xl border bg-card-bg text-primary-text
            appearance-none bg-no-repeat bg-right-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDRDMTAuMDQgNC4yNzIgOC4zNjQgNi4yNzIgOC4zNjQgOC4yNzJDMTAuMDQgMTAuMDQgMTIgMTJDMTAuMDQgMTQuMDQgOC4zNjQgMTYuMDQgOC4zNjQgMTguMDQyQzguMzY0IDIwLjA0IDUuMzY0IDIyIDIgMjBIMiBWMThWNEMzIDIxLjkgNC4zNjQgMjMgNi4zNjQgMjBIMjBWMjJDMTcuNjQgMjIgMTYuMDQgMTguNjQgMTYuMDQgMTZWMTJDMTYuMDQgMTAuMDQgMTIuMDQgOC4wNDIgMTIgNEMxMi4wNC4wNDIgMTIuMDQgMCAxMiAxMkwyMHYyMEg0VjhIMTJWOEg0VjhIMTJWMjBIMjBWMjJIMThWMTZIMjBWMTJ6Ii8+Cjwvc3ZnPg==')] pr-10
            transition-all duration-200
            ${error ? 'border-danger focus:ring-2 focus:ring-danger/20' : 'border-border-color focus:ring-2 focus:ring-primary-accent/20'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        
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

Select.displayName = 'Select';

export default Select;
