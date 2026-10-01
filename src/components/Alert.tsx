import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Button } from './Button';

type AlertProps = HTMLMotionProps<'div'> & {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onDismiss?: () => void;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      type = 'info',
      title,
      message,
      onDismiss,
      dismissible = true,
      action,
      className = '',
      ...props
    },
    ref
  ) => {
    const typeStyles = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-amber-50 border-amber-200 text-amber-800',
      error: 'bg-red-50 border-red-200 text-red-800',
    };

    const iconStyles = {
      info: 'ℹ️',
      success: '✓',
      warning: '⚠️',
      error: '✕',
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`border-l-4 rounded-r-lg p-4 ${typeStyles[type]} ${className}`}
        role="alert"
        {...props}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-xl">{iconStyles[type]}</div>
          <div className="flex-1">
            {title && (
              <h4 className="font-semibold mb-1">{title}</h4>
            )}
            <p className="text-sm">{message}</p>
            {action && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={action.onClick}
                  className="text-sm"
                >
                  {action.label}
                </Button>
              </div>
            )}
          </div>
          {dismissible && onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
              aria-label="Dismiss"
            >
              <span className="text-lg">×</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
