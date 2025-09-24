import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div<{ $size: 'sm' | 'md' | 'lg'; $color: 'orange' | 'white' | 'gray' }>`
  animation: ${spin} 1s linear infinite;
  
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return 'width: 1rem; height: 1rem;';
      case 'lg':
        return 'width: 2rem; height: 2rem;';
      default:
        return 'width: 1.5rem; height: 1.5rem;';
    }
  }}
  
  ${({ $color, theme }) => {
    switch ($color) {
      case 'white':
        return 'color: white;';
      case 'gray':
        return `color: ${theme.colors.secondary[600]};`;
      default:
        return `color: ${theme.colors.primary[600]};`;
    }
  }}
`;

const LoadingButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingOverlayContainer = styled.div`
  position: relative;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const OverlayContent = styled.div`
  text-align: center;
  
  p {
    margin-top: 0.5rem;
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'orange',
  className = '' 
}) => {
  return (
    <SpinnerContainer $size={size} $color={color} className={className}>
      <svg width="100%" height="100%" fill="none" viewBox="0 0 24 24">
        <circle 
          style={{ opacity: 0.25 }}
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          style={{ opacity: 0.75 }}
          fill="currentColor" 
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </SpinnerContainer>
  );
};

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false
}) => {
  return (
    <LoadingButtonStyled
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={className}
    >
      {isLoading && <LoadingSpinner size="sm" color="white" />}
      <span>{children}</span>
    </LoadingButtonStyled>
  );
};

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children
}) => {
  return (
    <LoadingOverlayContainer>
      {children}
      {isLoading && (
        <Overlay>
          <OverlayContent>
            <LoadingSpinner size="lg" />
            <p>{message}</p>
          </OverlayContent>
        </Overlay>
      )}
    </LoadingOverlayContainer>
  );
};