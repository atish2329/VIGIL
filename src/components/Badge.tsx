import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { RiskLevel, Severity, RiskLevelColors, SeverityColors } from '../types';

type BadgeProps = HTMLMotionProps<'span'> & {
  variant?: 'risk' | 'severity' | 'status' | 'custom';
  riskLevel?: RiskLevel;
  severity?: Severity;
  color?: string;
  dot?: boolean;
  children?: React.ReactNode;
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'custom',
      riskLevel,
      severity,
      color = 'bg-primary-accent/10 text-primary-accent',
      dot = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      if (variant === 'risk' && riskLevel) {
        const colors = RiskLevelColors[riskLevel];
        return `${colors.bg} ${colors.text} ${colors.border} border`;
      }
      if (variant === 'severity' && severity) {
        const colors = SeverityColors[severity];
        return `${colors.bg} ${colors.text} ${colors.border} border`;
      }
      return color;
    };

    return (
      <motion.span
        ref={ref}
        className={`
          inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
          ${getVariantStyles()}
          ${className}
        `}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        {...props}
      >
        {dot && (
          <span
            className={`w-1.5 h-1.5 rounded-full mr-2 ${
              variant === 'risk' && riskLevel
                ? RiskLevelColors[riskLevel].text.replace('text-', 'bg-')
                : variant === 'severity' && severity
                ? SeverityColors[severity].text.replace('text-', 'bg-')
                : 'bg-current'
            }`}
          />
        )}
        {children}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
