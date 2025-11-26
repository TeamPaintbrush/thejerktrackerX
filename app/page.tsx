'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { getDefaultRoute } from '@/lib/roles';

// Dynamically import the web homepage to avoid SSR issues
const WebHomepage = dynamic(() => import('./web-homepage'), { ssr: false });

/**
 * Root page - detects platform and shows appropriate homepage
 * - Capacitor (mobile): redirects to /mobile
 * - Web browser: shows web homepage OR redirects authenticated users to dashboard
 */
export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if running in Capacitor mobile app
    if (typeof window !== 'undefined') {
      const isCapacitor = !!(window as any).Capacitor;
      setIsMobile(isCapacitor);
      
      if (isCapacitor) {
        router.replace('/mobile');
      } else {
        setIsChecking(false);
      }
    }
  }, [router]);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role && !isMobile) {
      const defaultRoute = getDefaultRoute(session.user.role as 'admin' | 'manager' | 'driver' | 'customer');
      router.replace(defaultRoute);
    }
  }, [status, session, router, isMobile]);

  // Show web homepage for web browsers (unauthenticated users)
  if (!isChecking && !isMobile && status !== 'authenticated') {
    return <WebHomepage />;
  }

  // Loading screen for mobile redirect or auth check
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
