// 🚗 Mobile Driver Dashboard Page
// Wrapper page for MobileDriverDashboard component

'use client';

import React from 'react';
import MobileDriverDashboard from '../../../mobile-android/shared/components/dashboards/MobileDriverDashboard';
import BackButton from '../../../mobile-android/shared/components/BackButton';

export default function MobileDriverPage() {
  return (
    <>
      <BackButton href="/mobile/dashboard" label="Dashboard" />
      <MobileDriverDashboard />
    </>
  );
}
