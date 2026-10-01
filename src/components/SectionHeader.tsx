import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type SectionHeaderProps = HTMLMotionProps<'div'> & {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center' | 'right';
};

export const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      title,
      subtitle,
      eyebrow,
      description,
      action,
      align = 'center',
      className = '',
      ...props
    },
    ref
  ) => {
    const textAlign = {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    };

    return (
      <motion.div
        ref={ref}
        className={`max-w-4xl mx-auto ${textAlign[align]} ${className}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        {...props}
      >
        {eyebrow && (
          <p className="text-sm font-medium text-primary-accent tracking-wider uppercase mb-3">
            {eyebrow}
          </p>
        )}
        
        {subtitle && (
          <p className="text-2xl font-medium text-secondary-text mb-2">{subtitle}</p>
        )}
        
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-text leading-tight tracking-tight">
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-lg text-secondary-text max-w-2xl">
            {description}
          </p>
        )}

        {action && <div className="mt-6">{action}</div>}
      </motion.div>
    );
  }
);

SectionHeader.displayName = 'SectionHeader';

export default SectionHeader;
