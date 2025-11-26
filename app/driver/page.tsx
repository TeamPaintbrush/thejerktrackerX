'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { DynamoDBService, Order } from '@/lib/dynamodb';
import { LoadingOverlay } from '@/components/Loading';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast';
import { Toaster } from 'react-hot-toast';
import { 
  Home, 
  PlusCircle, 
  Package, 
  BarChart3, 
  Settings, 
  QrCode, 
  Menu,
  X,
  User as UserIcon,
  Truck,
  MapPin
} from 'lucide-react';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #fafaf9;
`;

// Top Navigation Bar Components
const TopNavBar = styled.header`
  background: white;
  border-bottom: 2px solid #e7e5e4;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const NavContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
`;

const LogoText = styled.div`
  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0;
    line-height: 1.2;
  }
  
  p {
    font-size: 0.75rem;
    color: #78716c;
    margin: 0;
    line-height: 1;
  }
`;

const NavMenu = styled.nav`
  display: none;
  
  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavItem = styled.li`
  display: inline-flex;
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : '#f5f5f4'};
    color: ${props => props.$active ? 'white' : '#1c1917'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  font-size: 0.875rem;
  
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

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  border: none;
  background: #f5f5f4;
  color: #1c1917;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: #44403c;
  cursor: pointer;
  border-radius: 0.5rem;
  
  &:hover {
    background: #f5f5f4;
  }
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileMenuNav = styled.div`
  background: white;
  width: 280px;
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
`;

const MobileNavButton = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$active ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : '#f5f5f4'};
    color: ${props => props.$active ? 'white' : '#1c1917'};
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 1rem;
    color: #78716c;
    margin: 0;
  }
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  padding-bottom: 4rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  text-align: center;

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    color: #3b82f6;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-weight: 500;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Section = styled.section`
  margin-bottom: 2rem;
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e7e5e4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e7e5e4;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'picked_up' | 'delivered'>('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    const toastId = showLoading(`Updating status to ${newStatus}...`);
    
    try {
      setDriverStatus(newStatus);
      
      // Update driver status in database
      if (session?.user?.id) {
        const success = await DynamoDBService.updateDriverStatus(session.user.id, newStatus);
        
        if (success) {
          dismissToast(toastId);
          showSuccess(`Status updated to ${newStatus}`);
        } else {
          throw new Error('Failed to update status');
        }
      }
    } catch (error) {
      dismissToast(toastId);
      showError('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    const toastId = showLoading('Accepting order...');
    
    try {
      // Update order with driver info
      const updatedOrder = await DynamoDBService.updateOrder(orderId, {
        driverName: session?.user?.name || '',
        driverCompany: 'The JERK Tracker Fleet'
      });

      if (updatedOrder) {
        dismissToast(toastId);
        showSuccess('Order accepted successfully!');
        // Refresh data
        loadDriverData();
      } else {
        throw new Error('Failed to accept order');
      }
    } catch (error) {
      dismissToast(toastId);
      showError('Failed to accept order');
      console.error('Error accepting order:', error);
    }
  };

  const handlePickupComplete = async (orderId: string) => {
    const toastId = showLoading('Marking as picked up...');
    
    try {
      const updatedOrder = await DynamoDBService.updateOrder(orderId, {
        status: 'picked_up' as const,
        pickedUpAt: new Date()
      });

      if (updatedOrder) {
        dismissToast(toastId);
        showSuccess('Pickup confirmed! Order in transit.');
        loadDriverData();
      } else {
        throw new Error('Failed to update pickup status');
      }
    } catch (error) {
      dismissToast(toastId);
      showError('Failed to mark as picked up');
      console.error('Error completing pickup:', error);
    }
  };

  const handleDeliveryComplete = async (orderId: string) => {
    const toastId = showLoading('Marking as delivered...');
    
    try {
      const updatedOrder = await DynamoDBService.updateOrder(orderId, {
        status: 'delivered' as const,
        deliveredAt: new Date()
      });

      if (updatedOrder) {
        dismissToast(toastId);
        showSuccess('Delivery completed! Great job! 🎉');
        loadDriverData();
      } else {
        throw new Error('Failed to update delivery status');
      }
    } catch (error) {
      dismissToast(toastId);
      showError('Failed to mark as delivered');
      console.error('Error completing delivery:', error);
    }
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <DashboardContainer>
        <LoadingOverlay isLoading={true} message="Loading driver dashboard...">
          <div />
        </LoadingOverlay>
      </DashboardContainer>
    );
  }

  if (!session?.user || session.user.role !== 'driver') {
    return (
      <DashboardContainer>
        <LoadingOverlay isLoading={true} message="Redirecting...">
          <div />
        </LoadingOverlay>
      </DashboardContainer>
    );
  }

  const pendingPickups = assignedOrders.filter(order => order.status === 'pending');
  const inTransit = assignedOrders.filter(order => order.status === 'picked_up');
  const completedToday = assignedOrders.filter(order => 
    order.status === 'delivered' && 
    new Date(order.deliveredAt || '').toDateString() === new Date().toDateString()
  );

  // Filter assigned orders based on search and status
  const filteredAssignedOrders = assignedOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter available orders based on search
  const filteredAvailableOrders = orders.filter(order => {
    return searchTerm === '' || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'assigned', icon: <Package size={20} />, label: 'My Orders' },
    { id: 'available', icon: <MapPin size={20} />, label: 'Available Orders' },
    { id: 'qr', icon: <QrCode size={20} />, label: 'QR Codes', href: '/qr-tracking' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
  ];

  return (
    <DashboardContainer>
      <Toaster />
      
      {/* Mobile Menu Overlay */}
      <MobileMenu $isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)}>
        <MobileMenuNav onClick={(e) => e.stopPropagation()}>
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e7e5e4' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1c1917' }}>Menu</h3>
          </div>
          {menuItems.map((item) => (
            <MobileNavButton
              key={item.id}
              $active={activeTab === item.id}
              onClick={() => {
                if (item.href) {
                  router.push(item.href);
                } else {
                  setActiveTab(item.id);
                }
                setMobileMenuOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </MobileNavButton>
          ))}
          <div style={{ height: '1px', background: '#e7e5e4', margin: '1rem 0' }} />
          <MobileNavButton $active={false} onClick={handleSignOut} style={{ color: '#dc2626' }}>
            <UserIcon size={20} />
            <span>Sign Out</span>
          </MobileNavButton>
        </MobileMenuNav>
      </MobileMenu>

      {/* Top Navigation */}
      <TopNavBar>
        <NavContainer>
          <NavLeft>
            <Logo href="/">
              <LogoIcon>JT</LogoIcon>
              <LogoText>
                <h1>TheJERKTracker</h1>
                <p>Driver Panel</p>
              </LogoText>
            </Logo>

            {/* Desktop Navigation Menu */}
            <NavMenu>
              <NavList>
                {menuItems.map((item) => (
                  <NavItem key={item.id}>
                    <NavButton
                      $active={activeTab === item.id}
                      onClick={() => {
                        if (item.href) {
                          router.push(item.href);
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavButton>
                  </NavItem>
                ))}
              </NavList>
            </NavMenu>
          </NavLeft>

          <NavRight>
            <StatusToggle>
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

            <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </MobileMenuButton>

            <UserButton onClick={handleSignOut}>
              <UserIcon size={18} />
              <span>{session.user.name}</span>
            </UserButton>
          </NavRight>
        </NavContainer>
      </TopNavBar>

      {/* Main Content */}
      <MainContent>
        {activeTab === 'dashboard' && (
          <>
            <PageHeader>
              <h2>Driver Dashboard</h2>
              <p>Welcome back, {session.user.name}!</p>
            </PageHeader>

            <FilterBar>
              <SearchInput 
                type="text"
                placeholder="Search by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterSelect 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending Pickup</option>
                <option value="picked_up">In Transit</option>
                <option value="delivered">Delivered</option>
              </FilterSelect>
            </FilterBar>

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

            {filteredAssignedOrders.filter(o => o.status === 'pending').length > 0 && (
              <Section>
                <h2>Pending Pickups ({filteredAssignedOrders.filter(o => o.status === 'pending').length})</h2>
                <OrderGrid>
                  {filteredAssignedOrders.filter(o => o.status === 'pending').map(order => (
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

            {filteredAssignedOrders.filter(o => o.status === 'picked_up').length > 0 && (
              <Section>
                <h2>In Transit ({filteredAssignedOrders.filter(o => o.status === 'picked_up').length})</h2>
                <OrderGrid>
                  {filteredAssignedOrders.filter(o => o.status === 'picked_up').map(order => (
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
          </>
        )}

        {activeTab === 'assigned' && (
          <>
            <PageHeader>
              <h2>My Orders</h2>
              <p>Orders assigned to you</p>
            </PageHeader>

            <FilterBar>
              <SearchInput 
                type="text"
                placeholder="Search by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterSelect 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending Pickup</option>
                <option value="picked_up">In Transit</option>
                <option value="delivered">Delivered</option>
              </FilterSelect>
            </FilterBar>

            {filteredAssignedOrders.length > 0 ? (
              <Section>
                <h2>Assigned Orders ({filteredAssignedOrders.length})</h2>
                <OrderGrid>
                  {filteredAssignedOrders.map(order => (
                    <OrderCard key={order.id}>
                      <OrderHeader>
                        <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                        {order.status === 'pending' && (
                          <ActionButton 
                            $variant="primary" 
                            onClick={() => handlePickupComplete(order.id)}
                          >
                            Mark Picked Up
                          </ActionButton>
                        )}
                        {order.status === 'picked_up' && (
                          <ActionButton 
                            $variant="primary" 
                            onClick={() => handleDeliveryComplete(order.id)}
                          >
                            Mark Delivered
                          </ActionButton>
                        )}
                      </OrderHeader>
                      <OrderDetails>
                        <div><strong>Customer:</strong> {order.customerName}</div>
                        <div><strong>Items:</strong> {order.orderDetails}</div>
                        <div><strong>Status:</strong> {order.status}</div>
                        <div><strong>Order Time:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                      </OrderDetails>
                    </OrderCard>
                  ))}
                </OrderGrid>
              </Section>
            ) : (
              <Section>
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <h3>No assigned orders</h3>
                  <p>Check the Available Orders tab to accept new orders.</p>
                </div>
              </Section>
            )}
          </>
        )}

        {activeTab === 'available' && (
          <>
            <PageHeader>
              <h2>Available Orders</h2>
              <p>Accept orders to add them to your queue</p>
            </PageHeader>

            <FilterBar>
              <SearchInput 
                type="text"
                placeholder="Search by customer name or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FilterBar>

            {driverStatus === 'offline' ? (
              <Section>
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <h3>You are currently offline</h3>
                  <p>Set your status to &quot;Available&quot; to see and accept new orders.</p>
                </div>
              </Section>
            ) : filteredAvailableOrders.length > 0 ? (
              <Section>
                <h2>Available Orders ({filteredAvailableOrders.length})</h2>
                <OrderGrid>
                  {filteredAvailableOrders.map(order => (
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
            ) : (
              <Section>
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <h3>No available orders</h3>
                  <p>{searchTerm ? 'Try adjusting your search filters.' : 'Check back later for new orders.'}</p>
                </div>
              </Section>
            )}
          </>
        )}
      </MainContent>
    </DashboardContainer>
  );
}