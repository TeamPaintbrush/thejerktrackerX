'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  Clock, 
  TrendingUp, 
  Users, 
  Truck,
  ShoppingBag,
  Star,
  QrCode,
  MapPin
} from 'lucide-react';
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

const DashboardContainer = styled.div`
  padding: 2rem 1rem 120px 1rem; /* Increased top padding for logo visibility */
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
  margin-top: 1rem;
  text-align: center;
`;

const WelcomeText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const RoleText = styled.p`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  text-transform: capitalize;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(237, 119, 52, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.15);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(to right, #ed7734, #f59e0b);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 40px -12px rgba(237, 119, 52, 0.25), 0 0 30px rgba(237, 119, 52, 0.15);
    border-color: rgba(237, 119, 52, 0.3);
    
    &::before {
      transform: scaleX(1);
    }
  }
  
  &:active {
    transform: translateY(-4px) scale(1.01);
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(237, 119, 52, 0.15) 0%, rgba(246, 188, 137, 0.15) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  position: relative;
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ed7734, #f59e0b);
    opacity: 0;
    z-index: -1;
    transition: opacity 300ms ease;
  }
  
  ${StatCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 0 20px rgba(237, 119, 52, 0.3);
    
    &::after {
      opacity: 0.2;
    }
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: #ed7734;
    filter: drop-shadow(0 2px 4px rgba(237, 119, 52, 0.2));
    transition: all 300ms ease;
  }
  
  ${StatCard}:hover & svg {
    transform: scale(1.1);
    filter: drop-shadow(0 4px 8px rgba(237, 119, 52, 0.3));
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const QuickActions = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const ActionCard = styled(motion.div)`
  position: relative;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.95) 100%);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.12);
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(237, 119, 52, 0.1), transparent);
    transition: left 500ms ease;
  }
  
  &:hover {
    transform: translateX(4px);
    box-shadow: 0 8px 30px -8px rgba(237, 119, 52, 0.2), 0 0 20px rgba(237, 119, 52, 0.1);
    border-color: rgba(237, 119, 52, 0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateX(2px) scale(0.98);
  }
`;

const ActionIcon = styled.div`
  width: 54px;
  height: 54px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(237, 119, 52, 0.12) 0%, rgba(246, 188, 137, 0.12) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: linear-gradient(135deg, #ed7734, #f59e0b);
    opacity: 0;
    transition: opacity 300ms ease;
  }
  
  ${ActionCard}:hover & {
    transform: scale(1.08);
    box-shadow: 0 0 20px rgba(237, 119, 52, 0.25);
    
    &::after {
      opacity: 0.15;
    }
  }
  
  svg {
    width: 26px;
    height: 26px;
    color: #ed7734;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 2px 4px rgba(237, 119, 52, 0.15));
    transition: all 300ms ease;
  }
  
  ${ActionCard}:hover & svg {
    transform: scale(1.05);
    filter: drop-shadow(0 4px 8px rgba(237, 119, 52, 0.25));
  }
`;

const ActionContent = styled.div`
  flex: 1;
`;

const ActionTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ActionDesc = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

// Generic dashboard content - same for all users
const getDashboardContent = () => {
  return {
    stats: [
      { icon: Package, label: 'Total Orders', value: '23' },
      { icon: QrCode, label: 'QR Codes', value: '12' },
      { icon: Clock, label: 'Active Today', value: '8' },
      { icon: TrendingUp, label: 'Completed', value: '15' }
    ],
    actions: [
      { icon: Package, title: 'Orders Hub', desc: 'Create & manage orders', href: '/mobile/orders-hub' },
      { icon: QrCode, title: 'QR Scanner', desc: 'Scan QR codes', href: '/mobile/qr' },
      { icon: MapPin, title: 'Locations', desc: 'Manage your locations', href: '/mobile/settings/locations' },
      { icon: BarChart3, title: 'Analytics', desc: 'View reports & data', href: '/mobile/admin/analytics' }
    ]
  };
};

export default function MobileDashboard() {
  const { user } = useMobileAuth();
  const router = useRouter();
  const content = getDashboardContent();

  return (
    <DashboardContainer>
      <Header>
        <WelcomeText>
          Welcome back{user?.name ? `, ${user.name}` : ''}!
        </WelcomeText>
        <RoleText>
          QR Tracker Dashboard
        </RoleText>
      </Header>

      <StatsGrid>
        {content.stats.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatIcon>
              <stat.icon />
            </StatIcon>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <QuickActions>
        <SectionTitle>Quick Actions</SectionTitle>
        <ActionGrid>
          {content.actions.map((action, index) => (
            <ActionCard
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              onClick={() => router.push(action.href)}
              whileTap={{ scale: 0.98 }}
            >
              <ActionIcon>
                <action.icon />
              </ActionIcon>
              <ActionContent>
                <ActionTitle>{action.title}</ActionTitle>
                <ActionDesc>{action.desc}</ActionDesc>
              </ActionContent>
            </ActionCard>
          ))}
        </ActionGrid>
      </QuickActions>
    </DashboardContainer>
  );
}