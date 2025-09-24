'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 28rem;
  width: 100%;

  @media (max-width: 640px) {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }
`;

const ToastItem = styled.div<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1rem;
  box-shadow: ${({ theme }) => theme.shadows.large};
  border: 1px solid;
  animation: ${slideIn} 0.3s ease-out;
  transition: all 0.3s ease;

  ${({ $type, theme }) => {
    switch ($type) {
      case 'success':
        return `
          border-color: ${theme.colors.accent[200]};
          background: ${theme.colors.accent[50]};
        `;
      case 'error':
        return `
          border-color: #fecaca;
          background: #fef2f2;
        `;
      case 'warning':
        return `
          border-color: #fed7aa;
          background: #fffbeb;
        `;
      case 'info':
        return `
          border-color: #bfdbfe;
          background: #eff6ff;
        `;
      default:
        return `
          border-color: ${theme.colors.secondary[200]};
          background: ${theme.colors.secondary[50]};
        `;
    }
  }}

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const ToastContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const ToastIcon = styled.div<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  flex-shrink: 0;
  
  ${({ $type }) => {
    switch ($type) {
      case 'success':
        return 'color: #22c55e;';
      case 'error':
        return 'color: #ef4444;';
      case 'warning':
        return 'color: #f59e0b;';
      case 'info':
        return 'color: #3b82f6;';
      default:
        return 'color: #6b7280;';
    }
  }}
`;

const ToastText = styled.div<{ $type: 'success' | 'error' | 'warning' | 'info' }>`
  flex: 1;
  
  ${({ $type }) => {
    switch ($type) {
      case 'success':
        return 'color: #166534;';
      case 'error':
        return 'color: #991b1b;';
      case 'warning':
        return 'color: #92400e;';
      case 'info':
        return 'color: #1e40af;';
      default:
        return 'color: #374151;';
    }
  }}
`;

const ToastTitle = styled.h4`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
`;

const ToastMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0.25rem 0 0 0;
  opacity: 0.9;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;

  &:hover {
    color: #6b7280;
    background: rgba(0, 0, 0, 0.05);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(107, 114, 128, 0.3);
  }
`;

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  }, [removeToast]);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <ToastContainer>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            $type={toast.type}
            role="alert"
            aria-live="polite"
          >
            <ToastContent>
              <ToastIcon $type={toast.type}>
                {getIcon(toast.type)}
              </ToastIcon>
              
              <ToastText $type={toast.type}>
                <ToastTitle>{toast.title}</ToastTitle>
                {toast.message && (
                  <ToastMessage>{toast.message}</ToastMessage>
                )}
              </ToastText>
              
              <CloseButton
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </CloseButton>
            </ToastContent>
          </ToastItem>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export default ToastProvider;