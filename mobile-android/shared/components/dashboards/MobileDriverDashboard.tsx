// 🚗 Mobile Driver Dashboard Component
// Driver delivery management and status tracking

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  DollarSign,
  Navigation,
  Package,
  BarChart3,
  Radio
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
interface Delivery {
  id: string;
  orderNumber: string;
  status: 'assigned' | 'picked_up' | 'en_route' | 'delivered';
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  items: string;
  distance: string;
  estimatedTime: string;
  payment: string;
}

type DriverStatus = 'available' | 'busy' | 'offline';

interface MobileDriverDashboardProps {}

// Styled Components
const DashboardContainer = styled.div`
  padding: 1rem;
  padding-bottom: 120px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
`;

const WelcomeText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const StatusSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const StatusLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const StatusButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
`;

const StatusButton = styled(motion.button)<{ $active: boolean; $status: DriverStatus }>`
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => {
    const isActive = props.$active;
    switch (props.$status) {
      case 'available':
        return `
          background: ${isActive ? '#10b981' : '#f3f4f6'};
          color: ${isActive ? 'white' : '#6b7280'};
        `;
      case 'busy':
        return `
          background: ${isActive ? '#f59e0b' : '#f3f4f6'};
          color: ${isActive ? 'white' : '#6b7280'};
        `;
      case 'offline':
        return `
          background: ${isActive ? '#ef4444' : '#f3f4f6'};
          color: ${isActive ? 'white' : '#6b7280'};
        `;
    }
  }}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const StatIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(237, 119, 52, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.5rem auto;
  
  svg {
    width: 16px;
    height: 16px;
    color: #ed7734;
  }
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.625rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Section = styled.section`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
    color: #ed7734;
  }
`;

const DeliveryCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const DeliveryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
`;

const OrderNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const DeliveryStatus = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.$status) {
      case 'assigned':
        return `
          background: #fef3c7;
          color: #d97706;
        `;
      case 'picked_up':
        return `
          background: #dbeafe;
          color: #2563eb;
        `;
      case 'en_route':
        return `
          background: #ddd6fe;
          color: #7c3aed;
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

const DeliveryDetails = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 1rem;
  
  div {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    
    svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      margin-top: 2px;
      color: #ed7734;
    }
  }
`;

const DeliveryActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const ActionButton = styled(motion.button)<{ $variant: 'primary' | 'secondary' }>`
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
    color: white;
  ` : `
    background: #f3f4f6;
    color: #1f2937;
  `}
  
  svg {
    width: 16px;
    height: 16px;
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
  margin: 0;
  font-size: 0.875rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #6b7280;
`;

const MobileDriverDashboard: React.FC<MobileDriverDashboardProps> = () => {
  const router = useRouter();
  const { user } = useMobileAuth();
  const [driverStatus, setDriverStatus] = useState<DriverStatus>('available');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    setIsLoading(true);
    
    try {
      // Load real deliveries from API/DynamoDB
      // const deliveries = await DynamoDBService.getDriverOrders(user?.id);
      // setDeliveries(deliveries);
      
      // For now, show empty state - no mock data
      setDeliveries([]);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      // Show error state, no mock fallback
      setDeliveries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (status: DriverStatus) => {
    setDriverStatus(status);
  };

  const handleNavigate = (deliveryId: string) => {
    // Open map navigation (future implementation)
    console.log('Navigate to delivery:', deliveryId);
  };

  const handleUpdateStatus = (deliveryId: string) => {
    router.push(`/mobile/orders/${deliveryId}`);
  };

  const todayEarnings = '$125.00';
  const todayDeliveries = deliveries.length;
  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered').length;

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingContainer>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Truck size={32} color="#ed7734" />
          </motion.div>
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <WelcomeText>Driver Dashboard</WelcomeText>
      </Header>

      {/* Status Toggle */}
      <StatusSection>
        <StatusLabel>Current Status</StatusLabel>
        <StatusButtons>
          <StatusButton
            $active={driverStatus === 'available'}
            $status="available"
            onClick={() => handleStatusChange('available')}
            whileTap={{ scale: 0.95 }}
          >
            <Radio size={16} />
            Available
          </StatusButton>
          <StatusButton
            $active={driverStatus === 'busy'}
            $status="busy"
            onClick={() => handleStatusChange('busy')}
            whileTap={{ scale: 0.95 }}
          >
            <Clock size={16} />
            Busy
          </StatusButton>
          <StatusButton
            $active={driverStatus === 'offline'}
            $status="offline"
            onClick={() => handleStatusChange('offline')}
            whileTap={{ scale: 0.95 }}
          >
            Offline
          </StatusButton>
        </StatusButtons>
      </StatusSection>

      {/* Stats */}
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <StatIcon>
            <DollarSign />
          </StatIcon>
          <StatValue>{todayEarnings}</StatValue>
          <StatLabel>Today</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <StatIcon>
            <Package />
          </StatIcon>
          <StatValue>{todayDeliveries}</StatValue>
          <StatLabel>Deliveries</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <StatIcon>
            <Truck />
          </StatIcon>
          <StatValue>{activeDeliveries}</StatValue>
          <StatLabel>Active</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <StatIcon>
            <CheckCircle />
          </StatIcon>
          <StatValue>4.9</StatValue>
          <StatLabel>Rating</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Active Deliveries */}
      <Section>
        <SectionTitle>
          <Navigation />
          Active Deliveries
        </SectionTitle>

        {deliveries.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Truck />
            </EmptyIcon>
            <EmptyText>
              {driverStatus === 'available' 
                ? 'Waiting for delivery assignments...' 
                : 'No active deliveries'}
            </EmptyText>
          </EmptyState>
        ) : (
          deliveries.map((delivery, index) => (
            <DeliveryCard
              key={delivery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <DeliveryHeader>
                <OrderNumber>#{delivery.orderNumber}</OrderNumber>
                <DeliveryStatus $status={delivery.status}>
                  {delivery.status.replace('_', ' ')}
                </DeliveryStatus>
              </DeliveryHeader>

              <DeliveryDetails>
                <div>
                  <Package />
                  <span><strong>Customer:</strong> {delivery.customerName}</span>
                </div>
                <div>
                  <MapPin />
                  <span><strong>Pickup:</strong> {delivery.pickupAddress}</span>
                </div>
                <div>
                  <MapPin />
                  <span><strong>Delivery:</strong> {delivery.deliveryAddress}</span>
                </div>
                <div>
                  <Clock />
                  <span><strong>Distance:</strong> {delivery.distance} • {delivery.estimatedTime}</span>
                </div>
                <div>
                  <DollarSign />
                  <span><strong>Payment:</strong> {delivery.payment}</span>
                </div>
              </DeliveryDetails>

              <DeliveryActions>
                <ActionButton
                  $variant="primary"
                  onClick={() => handleNavigate(delivery.id)}
                  whileTap={{ scale: 0.95 }}
                >
                  <Navigation />
                  Navigate
                </ActionButton>
                <ActionButton
                  $variant="secondary"
                  onClick={() => handleUpdateStatus(delivery.id)}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle />
                  Update
                </ActionButton>
              </DeliveryActions>
            </DeliveryCard>
          ))
        )}
      </Section>
    </DashboardContainer>
  );
};

export default MobileDriverDashboard;
