// 📱 Mobile Layout Wrapper
// Handles safe areas and mobile-specific layout

'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import BottomNavigation from './BottomNavigation';
import PushNotificationProvider from './PushNotificationProvider';

// Platform detection hook
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    const isCapacitor = !!(window as any).Capacitor;
    setIsMobile(isCapacitor);
  }, []);
  
  return isMobile;
}

const MobileLayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  /* Minimal padding for status bar - content should be lower on screen */
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
`;

const PageContent = styled.main`
  flex: 1;
  position: relative;
  overflow-x: hidden;
`;

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideBottomNav?: boolean;
}

/**
 * Mobile Layout Wrapper Component
 * 
 * Provides:
 * - Bottom navigation (on mobile only)
 * - Safe area handling
 * - Proper spacing for mobile content
 * - Responsive behavior
 */
export default function MobileLayout({ 
  children,
  className,
  hideBottomNav = false
}: MobileLayoutProps) {
  const [userContext, setUserContext] = useState<{
    userId?: string;
    userRole?: 'admin' | 'manager' | 'driver' | 'customer';
  }>({});

  useEffect(() => {
    // Get user context from localStorage (mobile auth)
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserContext({
            userId: user.id,
            userRole: user.role
          });
        }
      } catch (error) {
        console.log('Failed to load user context:', error);
      }
    }
  }, []);

  return (
    <PushNotificationProvider 
      userId={userContext.userId} 
      userRole={userContext.userRole}
    >
      <MobileLayoutContainer className={className}>
        <PageContent>
          {children}
        </PageContent>
        {!hideBottomNav && <BottomNavigation />}
      </MobileLayoutContainer>
    </PushNotificationProvider>
  );
}

/**
 * Hook for components that need to know about mobile layout
 */
export function useMobileLayout() {
  const isMobile = useIsMobile();
  
  return {
    isMobile,
    safeAreaBottom: 'env(safe-area-inset-bottom)',
    safeAreaTop: 'env(safe-area-inset-top)'
  };
}