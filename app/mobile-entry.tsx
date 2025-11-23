'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Mobile app entry point
 * Immediately redirects to mobile login
 */
export default function MobileEntry() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/mobile/login');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)',
    }}>
      <div style={{
        textAlign: 'center',
        fontSize: '2rem',
        fontWeight: 800,
        color: '#ed7734'
      }}>
        🍗 JERK Tracker X
      </div>
    </div>
  );
}
