'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { DynamoDBService, Order } from '@/lib/dynamodb';
import { LoadingOverlay } from '@/components/Loading';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  justify-content: between;
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

const WelcomeMessage = styled.p`
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ActionCard = styled.button`
  background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
  border: none;
  border-radius: 0.75rem;
  padding: 1.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(237, 119, 52, 0.3);
  }

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }

  p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin-bottom: 1rem;
    border-left: 4px solid #ed7734;
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
    border-color: #ed7734;
    box-shadow: 0 4px 12px rgba(237, 119, 52, 0.1);
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

const OrderStatus = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
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
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
`;

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomerOrders = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      setIsLoading(true);
      const allOrders = await DynamoDBService.getAllOrders();
      const customerOrders = allOrders.filter(order => order.customerEmail === session.user.email);
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error loading customer orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'customer') {
      router.push('/'); // Redirect if not a customer
      return;
    }

    loadCustomerOrders();
  }, [session, status, router, loadCustomerOrders]);

  const handleNewOrder = () => {
    router.push('/order');
  };

  const handleOrderHistory = () => {
    router.push('/order-history');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  const handleTrackOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  if (status === 'loading' || isLoading) {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Loading dashboard...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  if (!session?.user || session.user.role !== 'customer') {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Redirecting...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  const activeOrders = orders.filter(order => order.status !== 'delivered');
  const recentOrders = orders.slice(0, 5);

  return (
    <Container>
      <Dashboard>
        <Header>
          <div>
            <Title>Customer Dashboard</Title>
            <WelcomeMessage>
              Welcome back, {session.user.name}! Track your orders and manage your account.
            </WelcomeMessage>
          </div>
        </Header>

        <QuickActions>
          <ActionCard onClick={handleNewOrder}>
            <h3>Place New Order</h3>
            <p>Start a new food order</p>
          </ActionCard>
          
          <ActionCard onClick={handleOrderHistory}>
            <h3>Order History</h3>
            <p>View all your past orders</p>
          </ActionCard>
          
          <ActionCard onClick={handleProfile}>
            <h3>Profile Settings</h3>
            <p>Update your information</p>
          </ActionCard>
        </QuickActions>

        {activeOrders.length > 0 && (
          <Section>
            <h2>Active Orders ({activeOrders.length})</h2>
            <OrderGrid>
              {activeOrders.map(order => (
                <OrderCard key={order.id} onClick={() => handleTrackOrder(order.id)}>
                  <OrderHeader>
                    <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                    <OrderStatus status={order.status}>{order.status}</OrderStatus>
                  </OrderHeader>
                  <OrderDetails>
                    <div><strong>Items:</strong> {order.orderDetails}</div>
                    <div><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                    {order.driverName && (
                      <div><strong>Driver:</strong> {order.driverName} ({order.driverCompany})</div>
                    )}
                  </OrderDetails>
                  <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                    Click to track order progress
                  </div>
                </OrderCard>
              ))}
            </OrderGrid>
          </Section>
        )}

        <Section>
          <h2>Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <OrderCard>
              <OrderDetails>
                No orders yet. <button onClick={handleNewOrder} style={{color: '#ed7734', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer'}}>Place your first order!</button>
              </OrderDetails>
            </OrderCard>
          ) : (
            <OrderGrid>
              {recentOrders.map(order => (
                <OrderCard key={order.id} onClick={() => handleTrackOrder(order.id)}>
                  <OrderHeader>
                    <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                    <OrderStatus status={order.status}>{order.status}</OrderStatus>
                  </OrderHeader>
                  <OrderDetails>
                    <div><strong>Items:</strong> {order.orderDetails}</div>
                    <div><strong>Ordered:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                  </OrderDetails>
                </OrderCard>
              ))}
            </OrderGrid>
          )}
        </Section>
      </Dashboard>
    </Container>
  );
}