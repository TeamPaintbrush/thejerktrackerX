'use client';

import dynamic from 'next/dynamic';

// Dynamically import the enhanced sign-in with no SSR to handle mobile/web differences
const EnhancedSignIn = dynamic(
  () => import('../../../mobile-android/shared/components/EnhancedSignIn'),
  { 
    ssr: false,
    loading: () => (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%)'
      }}>
        <div>Loading...</div>
      </div>
    )
  }
);

export default function SignInPage() {
  return (
    <div style={{ marginBottom: '-80px' }}>
      <EnhancedSignIn />
    </div>
  );
}
