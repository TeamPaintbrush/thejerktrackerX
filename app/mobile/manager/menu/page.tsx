// 👨‍💼 Manager Menu Management Page

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MenuManagementDashboard from '@/components/MenuManagementDashboard';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';
import BackButton from '@/mobile-android/shared/components/BackButton';
import { MobileAuth } from '@/mobile-android/shared/services/mobileAuth';

export default function ManagerMenuPage() {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string>('default-business');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const user = MobileAuth.getCurrentUser();
      if (!user) {
        router.push('/mobile/login');
        return;
      }
      
      // Get businessId from user data
      const userBusinessId = (user as any).businessId || user.id || 'default-business';
      setBusinessId(userBusinessId);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <MobileLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      </MobileLayout>
    );
  }
  
  return (
    <MobileLayout>
      <BackButton href="/mobile/manager" label="Back to Dashboard" />
      <MenuManagementDashboard businessId={businessId} />
    </MobileLayout>
  );
}
