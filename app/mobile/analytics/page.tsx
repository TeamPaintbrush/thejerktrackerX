'use client';

import React, { useEffect, useState } from 'react';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { MobileAuth } from '@/mobile-android/shared/services/mobileAuth';

export default function MobileAnalyticsPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = MobileAuth.getCurrentUser();
    setUser(currentUser);
  }, []);

  if (!user?.id) {
    return (
      <MobileLayout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Please sign in to view analytics</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <AnalyticsDashboard businessId={user.id} />
    </MobileLayout>
  );
}
