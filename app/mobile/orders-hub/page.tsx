// 📋 Mobile Orders Hub - Central Orders Navigation
// Hub page with action cards: View Orders, Create Order, QR Scanning
// Generic user interface - all options available to everyone

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Plus, 
  Menu as MenuIcon, 
  Eye,
  ShoppingCart,
  Users,
  Truck,
  ChefHat,
  ArrowRight,
  Bell,
  QrCode,
  AlertTriangle,
  UtensilsCrossed
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
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      try {
        // Check for stored user
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

const HubContainer = styled.div`
  padding: 0.5rem;
  padding-bottom: 120px; /* Increased space for bottom navigation */
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  padding-top: 0;
`;

const ActionCardsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 400px;
  margin: 0 auto;
`;

const ActionCard = styled(motion.button)`
  background: white;
  border: none;
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: left;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 80px;
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const CardDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const CardArrow = styled.div`
  color: #9ca3af;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const RoleBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #ed7734;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

const StatsRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ed7734;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

interface ActionCardConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  href: string;
  enabled: boolean;
}

// Get action cards for generic QR tracking system - all options available to everyone
const getActionCards = (): ActionCardConfig[] => {
  return [
    {
      id: 'create-order',
      title: 'Create Order',
      description: 'Create order with auto QR generation',
      icon: Plus,
      color: '#10b981',
      href: '/mobile/orders/create',
      enabled: true
    },
    {
      id: 'scan-qr',
      title: 'Scan QR Code',
      description: 'Scan QR code for order details',
      icon: QrCode,
      color: '#3b82f6',
      href: '/mobile/qr',
      enabled: true
    },
    {
      id: 'qr-manager',
      title: 'QR Code Manager',
      description: 'View QR codes and order status',
      icon: QrCode,
      color: '#8b5cf6',
      href: '/mobile/qr/manager',
      enabled: true
    },
    {
      id: 'menu-management',
      title: 'Menu Management',
      description: 'Manage food items & categories',
      icon: UtensilsCrossed,
      color: '#f59e0b',
      href: '/mobile/manager/menu',
      enabled: true
    },
    {
      id: 'order-history',
      title: 'Order History',
      description: 'View all orders and deliveries',
      icon: ClipboardList,
      color: '#fb923c',
      href: '/mobile/orders',
      enabled: true
    },
    {
      id: 'fraud-claims',
      title: 'Fraud Claims',
      description: 'Track delivery disputes & fraud',
      icon: AlertTriangle,
      color: '#dc2626',
      href: '/mobile/fraud-claims',
      enabled: true
    }
  ];
};

// Mock stats for QR tracking - generic for all users
const getMockStats = () => {
  return { stat1: { number: '12', label: 'Orders Today' }, stat2: { number: '3', label: 'Pending Pickup' } };
};

export default function OrdersHubPage() {
  const router = useRouter();
  const { user } = useMobileAuth();
  
  // Get user info
  const userName = user?.name || 'User';

  const actionCards = getActionCards();
  const stats = getMockStats();

  const handleCardClick = (card: ActionCardConfig) => {
    console.log('🔥 ORDERS HUB - Card clicked:', {
      cardId: card.id,
      title: card.title,
      href: card.href,
      enabled: card.enabled,
      user
    });
    
    if (card.enabled && card.href !== '#') {
      console.log('🚀 ORDERS HUB - Navigating to:', card.href);
      
      // Special handling for System Menu to ensure it goes to admin
      if (card.id === 'menu-items' || card.title === 'System Menu') {
        console.log('🎯 SYSTEM MENU CLICKED - Force navigate to /mobile/admin');
        router.push('/mobile/admin');
      } else {
        router.push(card.href);
      }
    } else {
      console.log('❌ ORDERS HUB - Navigation blocked - card disabled or invalid href');
    }
  };

  return (
    <HubContainer>
      <BackButton href="/mobile/dashboard" label="Dashboard" />
      
      <Header>
        <RoleBadge>
          <QrCode size={16} />
          QR Tracker Portal
        </RoleBadge>
        
        <PageHeading $size="2xl" $mb="0.5rem" $color="#1c1917">
          Orders Hub
        </PageHeading>

            <PageText $color="#6b7280" $mb="1rem">
              Welcome back, {userName}
            </PageText>        <StatsRow>
          <StatCard>
            <StatNumber>{stats.stat1.number}</StatNumber>
            <StatLabel>{stats.stat1.label}</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.stat2.number}</StatNumber>
            <StatLabel>{stats.stat2.label}</StatLabel>
          </StatCard>
        </StatsRow>
      </Header>

      <ActionCardsGrid>
        {actionCards.map((card, index) => {
          const IconComponent = card.icon;
          
          return (
            <ActionCard
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={!card.enabled}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: card.enabled ? 1.02 : 1 }}
              whileTap={{ scale: card.enabled ? 0.98 : 1 }}
            >
              <CardIcon $color={card.color}>
                <IconComponent />
              </CardIcon>
              
              <CardContent>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
              
              {card.enabled && (
                <CardArrow>
                  <ArrowRight />
                </CardArrow>
              )}
            </ActionCard>
          );
        })}
      </ActionCardsGrid>
    </HubContainer>
  );
}