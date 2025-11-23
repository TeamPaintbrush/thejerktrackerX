// 📚 Mobile How It Works Page
// Wrapper page for MobileHowItWorks component

'use client';

import React from 'react';
import MobileHowItWorks from '../../../mobile-android/shared/components/informational/MobileHowItWorks';
import BackButton from '../../../mobile-android/shared/components/BackButton';

export default function MobileHowItWorksPage() {
  return (
    <>
      <BackButton href="/mobile" label="Home" />
      <MobileHowItWorks />
    </>
  );
}
