'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the mobile order details component
const MobileOrderDetails = dynamic(
  () => import('../../../../mobile-android/shared/components/orders/MobileOrderDetails'),
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
        Loading order details...
      </div>
    )
  }
);

interface ClientWrapperProps {
  orderId: string;
}

export default function ClientWrapper({ orderId }: ClientWrapperProps) {
  return (
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
      <MobileOrderDetails orderId={orderId} />
    </Suspense>
  );
}