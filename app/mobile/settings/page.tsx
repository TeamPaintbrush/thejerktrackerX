// ⚙️ Mobile Settings Page
// Settings hub for mobile app

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Lock, 
  BarChart3, 
  CreditCard, 
  MapPin, 
  LogOut, 
  ArrowRight,
  Palette
} from 'lucide-react';
import BackButton from '../../../mobile-android/shared/components/BackButton';

// Mobile-specific styled components
const PageHeading = styled.h1<{ $size?: string; $mb?: string; $color?: string }>`
  font-size: ${props => props.$size === '2xl' ? '1.5rem' : '1.25rem'};
  margin-bottom: ${props => props.$mb || '0'};
  color: ${props => props.$color || '#1c1917'};
  font-weight: 600;
`;

const PageText = styled.p<{ $color?: string; $mb?: string }>`
  color: ${props => props.$color || '#6b7280'};
  margin-bottom: ${props => props.$mb || '0'};
  font-size: 0.875rem;
`;

// Simplified mobile auth hook
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
  
  const signOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mobile_auth_user');
      setUser(null);
    }
  };
  
  return { user, signOut };
}

const SettingsContainer = styled.div`
  padding: 0.5rem 1rem 2rem 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding-top: 0.5rem;
`;

const SettingsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
`;

const SettingsCard = styled(motion.button)`
  background: white;
  border: none;
  border-radius: 1rem;
  padding: 1rem;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;

  &:active {
    transform: scale(0.98);
  }

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardArrow = styled.div`
  color: #9ca3af;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }
`;

export default function MobileSettingsPage() {
  const router = useRouter();
  const { user, signOut } = useMobileAuth();

  const handleSignOut = async () => {
    try {
      // Clear mobile auth first
      signOut();
      
      // Clear all localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('mobile_auth_user');
        localStorage.removeItem('mobile_auth_token');
        localStorage.clear();
      }
      
      // Redirect to main mobile page immediately
      router.push('/mobile');
      
      // Also try to clear NextAuth session in background (non-blocking)
      try {
        const { signOut: nextAuthSignOut } = await import('next-auth/react');
        await nextAuthSignOut({ redirect: false });
      } catch (error) {
        console.log('NextAuth sign out skipped (expected for mobile-only users)');
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Still redirect even if there's an error
      router.push('/mobile');
    }
  };

  const settingsItems = [
    {
      id: 'profile',
      title: 'Profile Settings',
      icon: User,
      color: '#3b82f6',
      onClick: () => {
        console.log('Profile Settings clicked - navigating to /mobile/settings/profile');
        router.push('/mobile/settings/profile');
      }
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      color: '#10b981',
      onClick: () => {
        console.log('Notifications clicked - navigating to /mobile/settings/notifications');
        router.push('/mobile/settings/notifications');
      }
    },
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: Lock,
      color: '#f59e0b',
      onClick: () => {
        console.log('Security clicked - navigating to /mobile/settings/security');
        router.push('/mobile/settings/security');
      }
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      color: '#8b5cf6',
      onClick: () => {
        console.log('Analytics clicked - navigating to /mobile/admin/analytics');
        router.push('/mobile/admin/analytics');
      }
    },
    {
      id: 'billing',
      title: 'Billing & Plans',
      icon: CreditCard,
      color: '#8b5cf6',
      onClick: () => {
        console.log('Billing & Plans clicked - navigating to /mobile/settings/billing');
        router.push('/mobile/settings/billing');
      }
    },
    {
      id: 'branding',
      title: 'Business Branding',
      icon: Palette,
      color: '#ed7734',
      badge: 'Pro+',
      onClick: () => {
        console.log('Branding clicked - navigating to /mobile/settings/branding');
        router.push('/mobile/settings/branding');
      }
    },
    {
      id: 'locations',
      title: 'Locations', 
      icon: MapPin,
      color: '#10b981',
      onClick: () => {
        console.log('Locations clicked - navigating to /mobile/settings/locations');
        router.push('/mobile/settings/locations');
      }
    },
    {
      id: 'logout',
      title: 'Sign Out',
      icon: LogOut,
      color: '#ef4444',
      onClick: () => {
        console.log('Sign Out clicked');
        handleSignOut();
      }
    }
  ];

  return (
    <SettingsContainer>
      <BackButton href="/mobile/dashboard" label="Dashboard" />
      
      <Header>
        <PageHeading $size="2xl" $mb="0.5rem" $color="#1c1917">
          Settings
        </PageHeading>
        
        <PageText $color="#6b7280" $mb="1rem">
          Manage your account and app preferences
        </PageText>
      </Header>

      <SettingsGrid>
        {settingsItems.map((item, index) => {
          const IconComponent = item.icon;
          const isDisabled = (item as any).disabled;
          
          return (
            <SettingsCard
              key={item.id}
              onClick={item.onClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: isDisabled ? 1 : 1.02 }}
              whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              style={{ 
                opacity: isDisabled ? 0.6 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer'
              }}
            >
              <CardIcon $color={item.color}>
                <IconComponent />
              </CardIcon>
              
              <CardContent>
                <CardTitle>
                  {item.title}
                  {(item as any).badge && <Badge>{(item as any).badge}</Badge>}
                </CardTitle>
                {isDisabled && (
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    Coming Soon
                  </div>
                )}
              </CardContent>
              
              {!isDisabled && (
                <CardArrow>
                  <ArrowRight />
                </CardArrow>
              )}
            </SettingsCard>
          );
        })}
      </SettingsGrid>
    </SettingsContainer>
  );
}