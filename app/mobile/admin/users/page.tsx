'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import BackButton from '../../../../mobile-android/shared/components/BackButton';

// Dynamically import to avoid SSR issues
const MobileUsers = dynamic(
  () => import('../../../../mobile-android/shared/components/admin/MobileUsers'),
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
        Loading Users...
      </div>
    )
  }
);

export default function MobileUsersPage() {
  return (
    <>
      <BackButton href="/mobile/dashboard" label="Dashboard" />
      <MobileUsers />
    </>
  );
}