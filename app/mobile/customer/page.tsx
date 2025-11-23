// 🛍️ Mobile Customer Dashboard Page
// Wrapper page for MobileCustomerDashboard component

'use client';

import React from 'react';
import MobileCustomerDashboard from '../../../mobile-android/shared/components/dashboards/MobileCustomerDashboard';
import BackButton from '../../../mobile-android/shared/components/BackButton';

export default function MobileCustomerPage() {
  return (
    <>
      <BackButton href="/mobile/dashboard" label="Dashboard" />
      <MobileCustomerDashboard />
    </>
  );
}
