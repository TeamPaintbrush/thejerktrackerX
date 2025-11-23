'use client';

// QR Manager - Opens QR page with Orders tab active
// This provides direct access to QR code management

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QRManagerPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main QR page with tab parameter
    router.replace('/mobile/qr?tab=orders');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)'
    }}>
      <p style={{ color: '#78716c' }}>Loading QR Manager...</p>
    </div>
  );
}
