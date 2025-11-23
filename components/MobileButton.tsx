'use client';

import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion, MotionProps } from 'framer-motion';
import { Loader } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  touchOptimized?: boolean;
  accessibilityLabel?: string;
}

const buttonVariants = css<ButtonProps>`
  ${({ variant = 'primary', theme }) => {
    const variants = {
      primary: css`
        background: ${theme.colors.primary[500]};
        color: white;
        border: 2px solid ${theme.colors.primary[500]};
        
        &:hover:not(:disabled) {
          background: ${theme.colors.primary[600]};
          border-color: ${theme.colors.primary[600]};
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 6px rgba(237, 119, 52, 0.3);
        }
        
        &:focus-visible {
          outline: 3px solid rgba(237, 119, 52, 0.4);
          outline-offset: 2px;
        }
      `,
      secondary: css`
        background: ${theme.colors.secondary[100]};
        color: ${theme.colors.text.primary};
        border: 2px solid ${theme.colors.secondary[200]};
        
        &:hover:not(:disabled) {
          background: ${theme.colors.secondary[200]};
          border-color: ${theme.colors.secondary[300]};
          transform: translateY(-1px);
        }
        
        &:focus-visible {
          outline: 3px solid rgba(168, 162, 158, 0.4);
          outline-offset: 2px;
        }
      `,
      outline: css`
        background: transparent;
        color: ${theme.colors.primary[500]};
        border: 2px solid ${theme.colors.primary[500]};
        
        &:hover:not(:disabled) {
          background: ${theme.colors.primary[500]};
          color: white;
          transform: translateY(-1px);
        }
        
        &:focus-visible {
          outline: 3px solid rgba(237, 119, 52, 0.4);
          outline-offset: 2px;
        }
      `,
      ghost: css`
        background: transparent;
        color: ${theme.colors.text.secondary};
        border: 2px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${theme.colors.secondary[100]};
          color: ${theme.colors.text.primary};
        }
        
        &:focus-visible {
          outline: 3px solid rgba(168, 162, 158, 0.4);
          outline-offset: 2px;
        }
      `,
      danger: css`
        background: ${theme.colors.error};
        color: white;
        border: 2px solid ${theme.colors.error};
        
        &:hover:not(:disabled) {
          background: #dc2626;
          border-color: #dc2626;
          transform: translateY(-1px);
        }
        
        &:focus-visible {
          outline: 3px solid rgba(239, 68, 68, 0.4);
          outline-offset: 2px;
        }
      `
    };
    return variants[variant];
  }}
`;

const buttonSizes = css<ButtonProps>`
  ${({ size = 'md', touchOptimized }) => {
    // Enhanced touch targets for mobile
    const minTouchTarget = touchOptimized ? '44px' : 'auto';
    
    const sizes = {
      xs: css`
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        min-height: ${minTouchTarget};
        min-width: ${minTouchTarget};
      `,
      sm: css`
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        min-height: ${minTouchTarget};
        min-width: ${minTouchTarget};
      `,
      md: css`
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        min-height: ${minTouchTarget};
        min-width: ${minTouchTarget};
      `,
      lg: css`
        padding: 1rem 2rem;
        font-size: 1.125rem;
        min-height: 48px;
        min-width: 48px;
      `,
      xl: css`
        padding: 1.25rem 2.5rem;
        font-size: 1.25rem;
        min-height: 56px;
        min-width: 56px;
      `
    };
    return sizes[size];
  }}
`;

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  font-weight: 500;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  overflow: hidden;
  
  /* Disable text selection */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  
  /* Better touch behavior */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  ${buttonVariants}
  ${buttonSizes}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    
    &:hover {
      transform: none !important;
    }
  }
  
  /* Loading state */
  ${({ loading }) => loading && css`
    color: transparent !important;
    
    &:hover {
      transform: none !important;
    }
  `}
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 3px;
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    
    &:hover, &:active, &:focus {
      transform: none !important;
    }
  }
`;

const LoadingSpinner = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const IconWrapper = styled.span<{ position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  
  ${({ position }) => position === 'left' && css`
    margin-right: -0.125rem;
  `}
  
  ${({ position }) => position === 'right' && css`
    margin-left: -0.125rem;
  `}
`;

export const MobileButton = forwardRef<HTMLButtonElement, ButtonProps & MotionProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    touchOptimized = true,
    accessibilityLabel,
    onClick,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    
    return (
      <StyledButton
        ref={ref}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        loading={loading}
        touchOptimized={touchOptimized}
        disabled={isDisabled}
        onClick={onClick}
        aria-label={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={loading}
        role="button"
        {...props}
      >
        {loading && (
          <LoadingSpinner
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Loader size={size === 'xs' ? 12 : size === 'sm' ? 14 : size === 'lg' ? 20 : size === 'xl' ? 24 : 16} />
          </LoadingSpinner>
        )}
        
        {leftIcon && !loading && (
          <IconWrapper position="left">
            {leftIcon}
          </IconWrapper>
        )}
        
        <span style={{ opacity: loading ? 0 : 1 }}>
          {children}
        </span>
        
        {rightIcon && !loading && (
          <IconWrapper position="right">
            {rightIcon}
          </IconWrapper>
        )}
      </StyledButton>
    );
  }
);

MobileButton.displayName = 'MobileButton';

export default MobileButton;