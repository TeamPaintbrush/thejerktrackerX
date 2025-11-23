'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { DynamoDBService, Order, User } from '@/lib/dynamodb';
import { LoadingOverlay } from '@/components/Loading';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  padding: 2rem;
`;

const Dashboard = styled.div`
  max-width: 1400px;
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

const QuickActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: #7c3aed;
    color: white;
    &:hover { background: #6d28d9; }
  ` : `
    background: #f3f4f6;
    color: #6b7280;
    &:hover { background: #e5e7eb; }
  `}
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
    color: #7c3aed;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-weight: 500;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  h2 {
    font-size: 1.5rem;
    color: #1f2937;
    margin-bottom: 1rem;
    border-left: 4px solid #7c3aed;
    padding-left: 1rem;
  }
`;

const TableContainer = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    background: #f3f4f6;
    font-weight: 600;
    color: #374151;
  }

  tbody tr:hover {
    background: #f9fafb;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
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
      case 'available':
        return `
          background: #d1fae5;
          color: #059669;
        `;
      case 'busy':
        return `
          background: #fed7aa;
          color: #ea580c;
        `;
      case 'offline':
        return `
          background: #fecaca;
          color: #dc2626;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const StaffCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const StaffHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const StaffName = styled.h4`
  margin: 0;
  color: #1f2937;
`;

const StaffInfo = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
`;

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'manager' && session?.user?.role !== 'admin') {
      router.push('/'); // Redirect if not a manager or admin
      return;
    }

    loadManagerData();
  }, [session, status, router]);

  const loadManagerData = async () => {
    try {
      setIsLoading(true);
      
      // Load orders
      const allOrders = await DynamoDBService.getAllOrders();
      setOrders(allOrders);
      
      // Load staff (drivers and customers)
      const drivers = await DynamoDBService.getUsersByRole('driver');
      const customers = await DynamoDBService.getUsersByRole('customer');
      setStaff([...drivers, ...customers]);
      
    } catch (error) {
      console.error('Error loading manager data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDriver = async (orderId: string, driverName: string) => {
    try {
      await DynamoDBService.updateOrder(orderId, {
        driverName: driverName,
        driverCompany: 'The JERK Tracker Fleet'
      });
      loadManagerData(); // Refresh data
    } catch (error) {
      console.error('Error assigning driver:', error);
    }
  };

  const handleViewAnalytics = () => {
    router.push('/analytics');
  };

  const handleManageStaff = () => {
    router.push('/staff');
  };

  if (status === 'loading' || isLoading) {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Loading manager dashboard...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  if (!session?.user || (session.user.role !== 'manager' && session.user.role !== 'admin')) {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Redirecting...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  // Calculate statistics
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === today
  );
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const inTransitOrders = orders.filter(order => order.status === 'picked_up');
  const completedToday = orders.filter(order => 
    order.status === 'delivered' && 
    new Date(order.deliveredAt || '').toDateString() === today
  );
  
  const drivers = staff.filter(user => user.role === 'driver');
  const availableDrivers = drivers.filter(driver => 
    driver.driverInfo?.availability === 'available'
  );

  const recentOrders = orders.slice(0, 10);

  return (
    <Container>
      <Dashboard>
        <Header>
          <div>
            <Title>Manager Dashboard</Title>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
              Welcome back, {session.user.name}! Overview of operations.
            </p>
          </div>
          <QuickActions>
            <ActionButton $variant="secondary" onClick={handleViewAnalytics}>
              View Analytics
            </ActionButton>
            <ActionButton $variant="primary" onClick={handleManageStaff}>
              Manage Staff
            </ActionButton>
          </QuickActions>
        </Header>

        <StatsGrid>
          <StatCard>
            <h3>{todayOrders.length}</h3>
            <p>Orders Today</p>
          </StatCard>
          <StatCard>
            <h3>{pendingOrders.length}</h3>
            <p>Pending Orders</p>
          </StatCard>
          <StatCard>
            <h3>{inTransitOrders.length}</h3>
            <p>In Transit</p>
          </StatCard>
          <StatCard>
            <h3>{completedToday.length}</h3>
            <p>Completed Today</p>
          </StatCard>
          <StatCard>
            <h3>{availableDrivers.length}</h3>
            <p>Available Drivers</p>
          </StatCard>
          <StatCard>
            <h3>{drivers.length}</h3>
            <p>Total Drivers</p>
          </StatCard>
        </StatsGrid>

        <ContentGrid>
          <Section>
            <h2>Recent Orders</h2>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Driver</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.orderNumber}</td>
                      <td>{order.customerName}</td>
                      <td>
                        <StatusBadge status={order.status}>
                          {order.status}
                        </StatusBadge>
                      </td>
                      <td>{order.driverName || 'Unassigned'}</td>
                      <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </Section>

          <Section>
            <h2>Driver Status</h2>
            {drivers.length === 0 ? (
              <StaffCard>
                <StaffInfo>No drivers registered yet.</StaffInfo>
              </StaffCard>
            ) : (
              drivers.map(driver => (
                <StaffCard key={driver.id}>
                  <StaffHeader>
                    <StaffName>{driver.name}</StaffName>
                    <StatusBadge status={driver.driverInfo?.availability || 'offline'}>
                      {driver.driverInfo?.availability || 'offline'}
                    </StatusBadge>
                  </StaffHeader>
                  <StaffInfo>
                    <div>{driver.email}</div>
                    {driver.driverInfo?.licenseNumber && (
                      <div>License: {driver.driverInfo.licenseNumber}</div>
                    )}
                  </StaffInfo>
                </StaffCard>
              ))
            )}
          </Section>
        </ContentGrid>
      </Dashboard>
    </Container>
  );
}