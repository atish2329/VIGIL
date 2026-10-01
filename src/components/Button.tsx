import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { ButtonVariant, ButtonSize } from '../types';

type ButtonProps = HTMLMotionProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-xl
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variants = {
      primary: `
        bg-primary-accent text-white
        hover:bg-opacity-90 active:bg-opacity-80
        focus:ring-primary-accent/30
        shadow-soft hover:shadow-soft-lg
      `,
      secondary: `
        bg-soft-accent text-primary-accent
        hover:bg-opacity-80 active:bg-opacity-60
        focus:ring-primary-accent/30
      `,
      ghost: `
        bg-transparent text-primary-text
        hover:bg-soft-accent/50 active:bg-soft-accent
        focus:ring-primary-accent/30
      `,
      outline: `
        bg-transparent border-2 border-primary-accent text-primary-accent
        hover:bg-primary-accent/10 active:bg-primary-accent/20
        focus:ring-primary-accent/30
      `,
      danger: `
        bg-danger text-white
        hover:bg-opacity-90 active:bg-opacity-80
        focus:ring-danger/30
        shadow-soft hover:shadow-soft-lg
      `,
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5',
      md: 'px-6 py-3 text-base gap-2',
      lg: 'px-8 py-4 text-lg gap-2.5',
    };

    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18,
    };

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        {...props}
      >
        {isLoading ? (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0" style={{ fontSize: iconSizes[size] }}>
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className="flex-shrink-0" style={{ fontSize: iconSizes[size] }}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
