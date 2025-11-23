// 📱 Mobile Orders List Page
// Uses MobileOrdersList component for viewing orders based on user role

'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import BackButton from '../../../mobile-android/shared/components/BackButton';

// Dynamically import the mobile orders list component
const MobileOrdersList = dynamic(
  () => import('../../../mobile-android/shared/components/orders/MobileOrdersList'),
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
        Loading orders...
      </div>
    )
  }
);

export default function MobileOrdersPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)' }}>
      <div style={{ padding: '1rem', paddingTop: '0.5rem' }}>
        <BackButton href="/mobile/orders-hub" label="Orders Hub" />
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
        <MobileOrdersList />
      </Suspense>
    </div>
  );
}