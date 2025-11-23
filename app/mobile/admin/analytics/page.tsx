'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import BackButton from '../../../../mobile-android/shared/components/BackButton';

// Dynamically import to avoid SSR issues
const MobileAnalytics = dynamic(
  () => import('../../../../mobile-android/shared/components/admin/MobileAnalytics'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        padding: '1rem',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        Loading Analytics...
      </div>
    )
  }
);

export default function MobileAnalyticsPage() {
  return (
    <>
      <BackButton href="/mobile/dashboard" label="Dashboard" />
      <MobileAnalytics />
    </>
  );
}