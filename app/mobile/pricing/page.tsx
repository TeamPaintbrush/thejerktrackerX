// 💳 Mobile Pricing Page
// Wrapper page for MobilePricing component

'use client';

import React from 'react';
import MobilePricing from '../../../mobile-android/shared/components/informational/MobilePricing';
import BackButton from '../../../mobile-android/shared/components/BackButton';

export default function MobilePricingPage() {
  return (
    <>
      <BackButton href="/mobile/login" label="Sign In" />
      <MobilePricing />
    </>
  );
}
