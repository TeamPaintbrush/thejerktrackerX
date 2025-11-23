// 📍 Mobile Locations Page
// Wrapper page for MobileLocationSettings component

'use client';

import React from 'react';
import styled from 'styled-components';
import MobileLocationSettings from '../../../../mobile-android/shared/components/settings/MobileLocationSettings';
import BackButton from '../../../../mobile-android/shared/components/BackButton';

const PageContainer = styled.div`
  position: relative;
  z-index: 10;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  min-height: 100vh;
`;

const ButtonWrapper = styled.div`
  padding: 0.5rem 1rem;
  padding-top: 0.75rem;
`;

export default function MobileLocationsPage() {
  return (
    <PageContainer>
      <ButtonWrapper>
        <BackButton href="/mobile/settings" label="Settings" />
      </ButtonWrapper>
      <MobileLocationSettings />
    </PageContainer>
  );
}
