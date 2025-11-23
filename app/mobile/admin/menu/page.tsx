'use client';

import React from 'react';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';
import MenuManagementDashboard from '@/components/MenuManagementDashboard';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 1rem;
  background: #fafaf9;
  min-height: calc(100vh - 60px);
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

// Mobile auth hook
function useMobileAuth() {
  const [user, setUser] = React.useState<any>(null);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Auth check error:', error);
      }
    }
  }, []);
  
  return { user };
}

const MobileAdminMenuPage = () => {
  const { user } = useMobileAuth();

  // Menu management is now available to ALL users
  const businessId = user?.businessId || user?.id || user?.email || 'default-business';

  return (
    <MobileLayout>
      <PageContainer>
        <MenuManagementDashboard 
          businessId={businessId}
          showPresetItems={true}
        />
      </PageContainer>
    </MobileLayout>
  );
};

export default MobileAdminMenuPage;
