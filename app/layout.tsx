'use client';

import React from 'react';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from '../styles/components';
import { theme } from '../styles/theme';
import { ToastProvider } from '../components/Toast';
import { AnimatePresence } from 'framer-motion';
import StyledComponentsRegistry from '../lib/registry';
import { SessionProvider } from '../components/SessionProvider';
import dynamic from 'next/dynamic';
import '../styles/responsive-fixes.css';
import { initMobileEnhancements } from '../lib/mobile-enhancements';

// Dynamically import mobile layout to avoid SSR issues
const MobileLayout = dynamic(
  () => import('../mobile-android/shared/components/MobileLayout'),
  { ssr: false }
);

// Mobile detection hook
function useMobileRoute() {
  const [isMobilePath, setIsMobilePath] = React.useState(false);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      setIsMobilePath(path.startsWith('/mobile'));
    }
  }, []);
  
  return isMobilePath;
}

function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const isMobilePath = useMobileRoute();
  
  // Initialize mobile enhancements
  React.useEffect(() => {
    const cleanup = initMobileEnhancements();
    return cleanup;
  }, []);
  
  // REMOVED: Capacitor detection and redirect logic 
  // Only app/page.tsx should handle mobile redirects now
  
  if (isMobilePath) {
    return (
      <MobileLayout>
        <AnimatePresence mode="wait" initial={false}>
          <div suppressHydrationWarning>
            {children}
          </div>
        </AnimatePresence>
      </MobileLayout>
    );
  }
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <div suppressHydrationWarning>
        {children}
      </div>
    </AnimatePresence>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#ed7734" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="JERK Tracker" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.svg" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.svg" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.svg" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.svg" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.svg" />
        
        {/* Favicons */}
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-32x32.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-16x16.svg" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.svg" />
        <meta name="msapplication-TileColor" content="#ed7734" />
        
        {/* Open Graph */}
        <meta property="og:title" content="JERK Tracker - Mobile Restaurant Management" />
        <meta property="og:description" content="Mobile-first restaurant pickup tracking with GitHub integration" />
        <meta property="og:image" content="/icons/icon-512x512.svg" />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JERK Tracker" />
        <meta name="twitter:description" content="Mobile restaurant order management" />
        <meta name="twitter:image" content="/icons/icon-512x512.svg" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ThemeProvider theme={theme}>
            <GlobalStyles />
            <ToastProvider>
              <SessionProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
              </SessionProvider>
            </ToastProvider>
          </ThemeProvider>
        </StyledComponentsRegistry>
        
        {/* Service Worker Registration - TEMPORARILY DISABLED TO FIX DASHBOARD OVERLAY */}
        <script dangerouslySetInnerHTML={{
          __html: `
            console.log('[DEBUG] Service Worker registration disabled to fix dashboard overlay issue');
            
            // UNREGISTER any existing service worker to clear cache
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  console.log('[DEBUG] Unregistering existing service worker:', registration);
                  registration.unregister();
                }
              });
            }
            
            // Service worker disabled temporarily
            // if ('serviceWorker' in navigator) {
            //   window.addEventListener('load', () => {
            //     navigator.serviceWorker.register('/sw.js')
            //       .then((registration) => {
            //         console.log('SW registered: ', registration);
            //       })
            //       .catch((registrationError) => {
            //         console.log('SW registration failed: ', registrationError);
            //       });
            //   });
            // }
          `
        }} />
      </body>
    </html>
  )
}