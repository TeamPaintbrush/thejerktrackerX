'use client';

import React from 'react';
import BottomNavigation from '@/mobile-android/shared/components/BottomNavigation';

/**
 * Mobile Layout with Bottom Navigation
 * Provides layout structure for mobile pages with bottom navigation
 */
export default function MobileLayout({ children }: { children: React.ReactNode }) {
  console.log('🏗️ Mobile Layout Rendering');
  
  return (
    <>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)',
        padding: 0,
        margin: 0,
        paddingBottom: '80px' // Space for bottom navigation
      }}>
        {children}
      </div>
      <BottomNavigation />
    </>
  );
}