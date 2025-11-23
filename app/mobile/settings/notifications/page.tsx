// 📱 Mobile Notification Settings Page
// Uses MobileNotificationSettings component for notification preferences

'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import BackButton from '../../../../mobile-android/shared/components/BackButton';

// Dynamically import the mobile notification settings component
const MobileNotificationSettings = dynamic(
  () => import('../../../../mobile-android/shared/components/settings/MobileNotificationSettings'),
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
        Loading notification settings...
      </div>
    )
  }
);

export default function MobileNotificationSettingsPage() {
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
        <MobileNotificationSettings />
      </Suspense>
    </div>
  );
}