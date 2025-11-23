'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

// Enhanced mobile touch button component
export const TouchButton = styled.button<{ 
  $size?: 'small' | 'medium' | 'large';
  $variant?: 'primary' | 'secondary' | 'danger';
}>`
  position: relative;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  transition: all 0.2s ease;
  
  /* Prevent text selection on touch */
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  
  /* Enhanced touch target size */
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return `
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          min-height: 44px; /* iOS minimum touch target */
        `;
      case 'large':
        return `
          padding: 1.25rem 2rem;
          font-size: 1.125rem;
          min-height: 56px;
        `;
      default:
        return `
          padding: 1rem 1.5rem;
          font-size: 1rem;
          min-height: 48px;
        `;
    }
  }}

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
          
          &:active {
            transform: translateY(1px);
            box-shadow: 0 2px 8px rgba(237, 119, 52, 0.4);
          }
          
          &:hover {
            box-shadow: 0 6px 16px rgba(237, 119, 52, 0.4);
          }
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
          
          &:active {
            transform: translateY(1px);
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
          
          &:active {
            background: #e5e7eb;
            transform: translateY(1px);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Ripple effect for touch feedback */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.3s ease, height 0.3s ease;
  }

  &:active::after {
    width: 100%;
    height: 100%;
  }
`;

// Swipe gesture handler component
interface SwipeHandlerProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const SwipeHandler: React.FC<SwipeHandlerProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  children,
  className
}) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });

  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd({ x: 0, y: 0 });
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart.x || !touchEnd.x) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    } else if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    } else if (isUpSwipe && onSwipeUp) {
      onSwipeUp();
    } else if (isDownSwipe && onSwipeDown) {
      onSwipeDown();
    }
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {children}
    </div>
  );
};

// Mobile-optimized input component
export const MobileInput = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 16px; /* Prevents zoom on iOS */
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #ffffff;
  transition: all 0.2s ease;
  
  /* Enhanced touch styling */
  min-height: 48px;
  -webkit-appearance: none;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
    background: #fefefe;
  }

  &::placeholder {
    color: #9ca3af;
    opacity: 1;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: #1f2937;
    color: #f9fafb;
    border-color: #374151;
    
    &:focus {
      border-color: #f59e0b;
      background: #111827;
    }
  }
`;

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const maxPullDistance = 80;
  const refreshThreshold = 60;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || window.scrollY > 0) return;

    const touch = e.touches[0];
    const pullDistance = Math.min(touch.clientY / 3, maxPullDistance);
    setPullDistance(pullDistance);

    if (pullDistance > 10) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
      setIsRefreshing(false);
    }
    setIsPulling(false);
    setPullDistance(0);
  };

  return (
    <div
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? 'none' : 'transform 0.3s ease'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div
          style={{
            height: `${pullDistance}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}
        >
          {isRefreshing ? '🔄 Refreshing...' : 
           pullDistance > refreshThreshold ? '↓ Release to refresh' : 
           '↓ Pull to refresh'}
        </div>
      )}
      {children}
    </div>
  );
};

// Haptic feedback utility
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 50, 50]);
    }
  },
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  }
};

// Mobile device detection hook
export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 768);
      setIsPortrait(height > width);
      setScreenSize({ width, height });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  return { isMobile, isPortrait, screenSize };
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      
      // Check connection type if available
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        setConnectionType(conn.effectiveType || 'unknown');
      }
    };

    updateNetworkStatus();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  return { isOnline, connectionType };
}

// PWA install prompt hook
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      }
    } catch (error) {
      console.error('PWA install failed:', error);
    }
    
    return false;
  };

  return { isInstallable, installPWA };
}