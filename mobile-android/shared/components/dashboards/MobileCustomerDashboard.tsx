// 🛍️ Mobile Customer Dashboard Component
// Customer order tracking and management

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Package,
  User,
  History,
  Plus,
  ArrowRight,
  TrendingUp
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

// Interfaces
interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'picked_up' | 'delivered';
  orderDetails: string;
  createdAt: string;
  driverName?: string;
  driverCompany?: string;
  customerEmail?: string;
}

interface MobileCustomerDashboardProps {}

// Styled Components (matching mobile UI pattern)
const DashboardContainer = styled.div`
  padding: 1rem;
  padding-bottom: 120px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const WelcomeText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const SubText = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const QuickActionCard = styled(motion.button)`
  background: white;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
`;

const ActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(237, 119, 52, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: #ed7734;
  }
`;

const ActionText = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #1f2937;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ed7734;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
    color: #ed7734;
  }
`;

const ViewAllButton = styled.button`
  background: none;
  border: none;
  color: #ed7734;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const OrderCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const OrderNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const OrderStatus = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status) {
      case 'pending':
        return `
          background: #fef3c7;
          color: #d97706;
        `;
      case 'picked_up':
        return `
          background: #dbeafe;
          color: #2563eb;
        `;
      case 'delivered':
        return `
          background: #d1fae5;
          color: #059669;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const OrderDetails = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  
  div {
    margin-bottom: 0.25rem;
  }
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const EmptyIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(237, 119, 52, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  
  svg {
    width: 30px;
    height: 30px;
    color: #ed7734;
  }
`;

const EmptyText = styled.p`
  color: #6b7280;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
`;

const NewOrderButton = styled(motion.button)`
  background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #6b7280;
`;

const MobileCustomerDashboard: React.FC<MobileCustomerDashboardProps> = () => {
  const router = useRouter();
  const { user } = useMobileAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomerOrders();
  }, [user]);

  const loadCustomerOrders = async () => {
    setIsLoading(true);
    
    // Simulate loading with mock data
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2025-001',
          status: 'picked_up',
          orderDetails: 'Jerk Chicken Platter, Rice & Peas',
          createdAt: new Date().toISOString(),
          driverName: 'Marcus Johnson',
          driverCompany: 'Quick Deliver',
          customerEmail: user?.email
        },
        {
          id: '2',
          orderNumber: 'ORD-2025-002',
          status: 'pending',
          orderDetails: 'Curry Goat, Festival, Escovitch Fish',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          customerEmail: user?.email
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-095',
          status: 'delivered',
          orderDetails: 'Ackee & Saltfish, Fried Dumpling',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          driverName: 'Sarah Williams',
          driverCompany: 'Fast Track',
          customerEmail: user?.email
        }
      ];
      
      setOrders(mockOrders);
      setIsLoading(false);
    }, 800);
  };

  const handleNewOrder = () => {
    router.push('/mobile/orders/create');
  };

  const handleOrderHistory = () => {
    router.push('/mobile/orders');
  };

  const handleProfile = () => {
    router.push('/mobile/settings/profile');
  };

  const handleTrackOrder = (orderId: string) => {
    router.push(`/mobile/orders/${orderId}`);
  };

  const activeOrders = orders.filter(order => order.status !== 'delivered');
  const totalOrders = orders.length;
  const completedOrders = orders.filter(order => order.status === 'delivered').length;

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Package size={32} color="#ed7734" />
          </motion.div>
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <WelcomeText>Customer Dashboard</WelcomeText>
        <SubText>Welcome back, {user?.name || 'Guest'}!</SubText>
      </Header>

      {/* Quick Actions */}
      <QuickActionsGrid>
        <QuickActionCard
          onClick={handleNewOrder}
          whileTap={{ scale: 0.95 }}
        >
          <ActionIcon>
            <Plus />
          </ActionIcon>
          <ActionText>New Order</ActionText>
        </QuickActionCard>

        <QuickActionCard
          onClick={handleOrderHistory}
          whileTap={{ scale: 0.95 }}
        >
          <ActionIcon>
            <History />
          </ActionIcon>
          <ActionText>History</ActionText>
        </QuickActionCard>

        <QuickActionCard
          onClick={handleProfile}
          whileTap={{ scale: 0.95 }}
        >
          <ActionIcon>
            <User />
          </ActionIcon>
          <ActionText>Profile</ActionText>
        </QuickActionCard>
      </QuickActionsGrid>

      {/* Stats */}
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatValue>{activeOrders.length}</StatValue>
          <StatLabel>Active</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatValue>{totalOrders}</StatValue>
          <StatLabel>Total</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatValue>{completedOrders}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <Section>
          <SectionHeader>
            <SectionTitle>
              <Clock />
              Active Orders
            </SectionTitle>
            <ViewAllButton onClick={handleOrderHistory}>
              View All
              <ArrowRight />
            </ViewAllButton>
          </SectionHeader>

          {activeOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              onClick={() => handleTrackOrder(order.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <OrderHeader>
                <OrderNumber>#{order.orderNumber}</OrderNumber>
                <OrderStatus $status={order.status}>
                  {order.status.replace('_', ' ')}
                </OrderStatus>
              </OrderHeader>
              <OrderDetails>
                <div><strong>Items:</strong> {order.orderDetails}</div>
                <div><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                {order.driverName && (
                  <div><strong>Driver:</strong> {order.driverName}</div>
                )}
              </OrderDetails>
            </OrderCard>
          ))}
        </Section>
      )}

      {/* Recent Orders */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <ShoppingBag />
            Recent Orders
          </SectionTitle>
        </SectionHeader>

        {orders.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <ShoppingBag />
            </EmptyIcon>
            <EmptyText>No orders yet. Place your first order!</EmptyText>
            <NewOrderButton
              onClick={handleNewOrder}
              whileTap={{ scale: 0.95 }}
            >
              <Plus />
              Place Order
            </NewOrderButton>
          </EmptyState>
        ) : (
          orders.slice(0, 3).map((order, index) => (
            <OrderCard
              key={order.id}
              onClick={() => handleTrackOrder(order.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileTap={{ scale: 0.98 }}
            >
              <OrderHeader>
                <OrderNumber>#{order.orderNumber}</OrderNumber>
                <OrderStatus $status={order.status}>
                  {order.status.replace('_', ' ')}
                </OrderStatus>
              </OrderHeader>
              <OrderDetails>
                <div><strong>Items:</strong> {order.orderDetails}</div>
                <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
              </OrderDetails>
            </OrderCard>
          ))
        )}
      </Section>
    </DashboardContainer>
  );
};

export default MobileCustomerDashboard;
