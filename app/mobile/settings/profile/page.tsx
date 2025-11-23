// 📱 Mobile Profile Settings Page
// Uses MobileProfileSettings component for profile management

'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import BackButton from '../../../../mobile-android/shared/components/BackButton';

// Dynamically import the mobile profile settings component
const MobileProfileSettings = dynamic(
  () => import('../../../../mobile-android/shared/components/settings/MobileProfileSettings'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        Loading profile settings...
      </div>
    )
  }
);

export default function MobileProfileSettingsPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)' }}>
      <div style={{ padding: '1rem', paddingTop: '0.5rem' }}>
        <BackButton href="/mobile/settings" label="Settings" />
      </div>
      
      <Suspense fallback={
        <div style={{ 
          padding: '2rem', 
          textAlign: 'center',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          Loading...
        </div>
      }>
        <MobileProfileSettings />
      </Suspense>
    </div>
  );
}