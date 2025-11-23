'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page - detects platform and redirects accordingly
 * - Capacitor (mobile): redirects to /mobile (main homepage)
 * - Web browser: shows web homepage (handled by middleware or this component)
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if running in Capacitor mobile app
    if (typeof window !== 'undefined' && (window as any).Capacitor) {
      router.replace('/mobile');
    }
    // For web, this component will continue to render the placeholder
    // In production, you'd show the full web homepage here or handle via middleware
  }, [router]);

  // Minimal UI while checking/redirecting
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)',
    }}>
      <div style={{
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '3rem',
          marginBottom: '1rem'
        }}>
          🍗
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#ed7734',
          marginBottom: '0.5rem'
        }}>
          JERK Tracker X
        </h1>
        <p style={{
          color: '#78716c',
          fontSize: '1.1rem'
        }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
