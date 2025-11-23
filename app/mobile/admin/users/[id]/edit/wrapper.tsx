'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import BackButton from '../../../../../../mobile-android/shared/components/BackButton';

// Dynamically import to avoid SSR issues
const MobileUserEdit = dynamic(
  () => import('../../../../../../mobile-android/shared/components/admin/MobileUserEdit'),
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
        Loading User Details...
      </div>
    )
  }
);

export default function MobileUserEditWrapper({ userId }: { userId: string }) {
  return (
    <>
      <BackButton href="/mobile/admin/users" label="Back to Users" />
      <MobileUserEdit userId={userId} />
    </>
  );
}
