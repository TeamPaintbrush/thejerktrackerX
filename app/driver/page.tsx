'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { DynamoDBService, Order } from '@/lib/dynamodb';
import { LoadingOverlay } from '@/components/Loading';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  padding: 2rem;
`;

const Dashboard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1f2937;
  margin: 0;
`;

const StatusToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StatusButton = styled.button<{ $active: boolean; $status: 'available' | 'busy' | 'offline' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => {
    const isActive = props.$active;
    switch (props.$status) {
      case 'available':
        return `
          background: ${isActive ? '#10b981' : '#f3f4f6'};
          color: ${isActive ? 'white' : '#6b7280'};
          &:hover { background: ${isActive ? '#059669' : '#e5e7eb'}; }
        `;
      case 'busy':
        return `
          background: ${isActive ? '#f59e0b' : '#f3f4f6'};
          color: ${isActive ? 'white' : '#6b7280'};
          &:hover { background: ${isActive ? '#d97706' : '#e5e7eb'}; }
        `;
      case 'offline':
        return `
          background: ${isActive ? '#ef4444' : '#f3f4f6'};
          color: ${isActive ? 'white' : '#6b7280'};
          &:hover { background: ${isActive ? '#dc2626' : '#e5e7eb'}; }
        `;
    }
  }}
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    color: #3b82f6;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-weight: 500;
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin-bottom: 1rem;
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
  }
`;

const OrderGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const OrderCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderNumber = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 1.1rem;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #3b82f6;
    color: white;
    &:hover { background: #2563eb; }
  ` : `
    background: #f3f4f6;
    color: #6b7280;
    &:hover { background: #e5e7eb; }
  `}
`;

const OrderDetails = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 1rem;
`;

export default function DriverDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [driverStatus, setDriverStatus] = useState<'available' | 'busy' | 'offline'>('offline');
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);

  const loadDriverData = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      setIsLoading(true);
      const allOrders = await DynamoDBService.getAllOrders();
      const driverOrders = allOrders.filter(order =>
        order.driverName === session.user?.name ||
        order.customerEmail === session.user?.email
      );
      setAssignedOrders(driverOrders);
      const availableOrders = allOrders.filter(order => order.status === 'pending' && !order.driverName);
      setOrders(availableOrders);
      setDriverStatus('available');
    } catch (error) {
      console.error('Error loading driver data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email, session?.user?.name]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'driver') {
      router.push('/'); // Redirect if not a driver
      return;
    }

    loadDriverData();
  }, [session, status, router, loadDriverData]);

  const handleStatusChange = async (newStatus: 'available' | 'busy' | 'offline') => {
    setDriverStatus(newStatus);
    
    // Update driver status in database
    if (session?.user?.id) {
      await DynamoDBService.updateDriverStatus(session.user.id, newStatus);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      // Update order with driver info
      const updatedOrder = await DynamoDBService.updateOrder(orderId, {
        driverName: session?.user?.name || '',
        driverCompany: 'The JERK Tracker Fleet'
      });

      if (updatedOrder) {
        // Refresh data
        loadDriverData();
      }
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const handlePickupComplete = async (orderId: string) => {
    try {
      const updatedOrder = await DynamoDBService.updateOrder(orderId, {
        status: 'picked_up' as const,
        pickedUpAt: new Date()
      });

      if (updatedOrder) {
        loadDriverData();
      }
    } catch (error) {
      console.error('Error completing pickup:', error);
    }
  };

  const handleDeliveryComplete = async (orderId: string) => {
    try {
      const updatedOrder = await DynamoDBService.updateOrder(orderId, {
        status: 'delivered' as const,
        deliveredAt: new Date()
      });

      if (updatedOrder) {
        loadDriverData();
      }
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Loading driver dashboard...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  if (!session?.user || session.user.role !== 'driver') {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Redirecting...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  const pendingPickups = assignedOrders.filter(order => order.status === 'pending');
  const inTransit = assignedOrders.filter(order => order.status === 'picked_up');
  const completedToday = assignedOrders.filter(order => 
    order.status === 'delivered' && 
    new Date(order.deliveredAt || '').toDateString() === new Date().toDateString()
  );

  return (
    <Container>
      <Dashboard>
        <Header>
          <div>
            <Title>Driver Dashboard</Title>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
              Welcome back, {session.user.name}!
            </p>
          </div>
          <StatusToggle>
            <span style={{ marginRight: '1rem', color: '#6b7280' }}>Status:</span>
            <StatusButton 
              $active={driverStatus === 'available'} 
              $status="available"
              onClick={() => handleStatusChange('available')}
            >
              Available
            </StatusButton>
            <StatusButton 
              $active={driverStatus === 'busy'} 
              $status="busy"
              onClick={() => handleStatusChange('busy')}
            >
              Busy
            </StatusButton>
            <StatusButton 
              $active={driverStatus === 'offline'} 
              $status="offline"
              onClick={() => handleStatusChange('offline')}
            >
              Offline
            </StatusButton>
          </StatusToggle>
        </Header>

        <StatsGrid>
          <StatCard>
            <h3>{pendingPickups.length}</h3>
            <p>Pending Pickups</p>
          </StatCard>
          <StatCard>
            <h3>{inTransit.length}</h3>
            <p>In Transit</p>
          </StatCard>
          <StatCard>
            <h3>{completedToday.length}</h3>
            <p>Completed Today</p>
          </StatCard>
          <StatCard>
            <h3>{orders.length}</h3>
            <p>Available Orders</p>
          </StatCard>
        </StatsGrid>

        {pendingPickups.length > 0 && (
          <Section>
            <h2>Pending Pickups ({pendingPickups.length})</h2>
            <OrderGrid>
              {pendingPickups.map(order => (
                <OrderCard key={order.id}>
                  <OrderHeader>
                    <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                    <ActionButton 
                      $variant="primary" 
                      onClick={() => handlePickupComplete(order.id)}
                    >
                      Mark Picked Up
                    </ActionButton>
                  </OrderHeader>
                  <OrderDetails>
                    <div><strong>Customer:</strong> {order.customerName}</div>
                    <div><strong>Items:</strong> {order.orderDetails}</div>
                    <div><strong>Order Time:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                  </OrderDetails>
                </OrderCard>
              ))}
            </OrderGrid>
          </Section>
        )}

        {inTransit.length > 0 && (
          <Section>
            <h2>In Transit ({inTransit.length})</h2>
            <OrderGrid>
              {inTransit.map(order => (
                <OrderCard key={order.id}>
                  <OrderHeader>
                    <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                    <ActionButton 
                      $variant="primary" 
                      onClick={() => handleDeliveryComplete(order.id)}
                    >
                      Mark Delivered
                    </ActionButton>
                  </OrderHeader>
                  <OrderDetails>
                    <div><strong>Customer:</strong> {order.customerName}</div>
                    <div><strong>Items:</strong> {order.orderDetails}</div>
                    <div><strong>Picked up:</strong> {order.pickedUpAt ? new Date(order.pickedUpAt).toLocaleString() : 'N/A'}</div>
                  </OrderDetails>
                </OrderCard>
              ))}
            </OrderGrid>
          </Section>
        )}

        {driverStatus === 'available' && orders.length > 0 && (
          <Section>
            <h2>Available Orders ({orders.length})</h2>
            <OrderGrid>
              {orders.map(order => (
                <OrderCard key={order.id}>
                  <OrderHeader>
                    <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                    <ActionButton 
                      $variant="primary" 
                      onClick={() => handleAcceptOrder(order.id)}
                    >
                      Accept Order
                    </ActionButton>
                  </OrderHeader>
                  <OrderDetails>
                    <div><strong>Customer:</strong> {order.customerName}</div>
                    <div><strong>Items:</strong> {order.orderDetails}</div>
                    <div><strong>Order Time:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                  </OrderDetails>
                </OrderCard>
              ))}
            </OrderGrid>
          </Section>
        )}

        {driverStatus === 'offline' && (
          <Section>
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <h3>You are currently offline</h3>
              <p>Set your status to &quot;Available&quot; to see and accept new orders.</p>
            </div>
          </Section>
        )}
      </Dashboard>
    </Container>
  );
}