'use client';

import dynamic from 'next/dynamic';

// Dynamically import the enhanced sign-up with no SSR to handle mobile/web differences
const EnhancedSignUp = dynamic(
  () => import('../../../mobile-android/shared/components/EnhancedSignUp'),
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

export default function SignUpPage() {
  return (
    <div style={{ marginBottom: '-80px' }}>
      <EnhancedSignUp />
    </div>
  );
}
