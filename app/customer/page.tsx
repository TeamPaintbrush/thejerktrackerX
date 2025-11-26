'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DynamoDBService, Order, Location } from '@/lib/dynamodb';
import { LoadingOverlay } from '@/components/Loading';
import TransferOrderModal from '@/components/TransferOrderModal';
import { 
  Home, 
  PlusCircle, 
  Package, 
  QrCode, 
  Settings, 
  Menu as MenuIcon,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  User,
  History,
  ArrowRightLeft
} from 'lucide-react';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #fafaf9;
`;

// Top Navigation Bar
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
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
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
  background: ${props => props.$active ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  text-decoration: none;
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' : '#f5f5f4'};
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
  background: ${props => props.$active ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' : '#f5f5f4'};
    color: ${props => props.$active ? 'white' : '#1c1917'};
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

// Main Content
const MainContent = styled.main`
  margin-left: 0;
  padding: 2rem 1.5rem;
  padding-bottom: 4rem;
  max-width: 1400px;
  margin: 0 auto;
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

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e7e5e4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatTrend = styled.div<{ $isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  background: ${props => props.$isPositive ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$isPositive ? '#16a34a' : '#dc2626'};
  font-size: 0.875rem;
  font-weight: 600;
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #78716c;
  font-weight: 500;
`;

// Section Card
const SectionCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #e7e5e4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e7e5e4;
  }
`;

// Orders Section
const OrdersGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const OrderCard = styled.div`
  padding: 1rem;
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #ed7734;
    background: white;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const OrderNumber = styled.div`
  font-weight: 700;
  color: #1c1917;
  font-size: 1rem;
`;

const OrderStatus = styled.div<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${props => {
    switch(props.$status) {
      case 'pending': return '#fef3c7';
      case 'picked_up': return '#dbeafe';
      case 'delivered': return '#dcfce7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'pending': return '#d97706';
      case 'picked_up': return '#2563eb';
      case 'delivered': return '#16a34a';
      default: return '#6b7280';
    }
  }};
`;

const OrderDetails = styled.div`
  font-size: 0.875rem;
  color: #78716c;
  
  div {
    margin-bottom: 0.25rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: #44403c;
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e7e5e4;
`;

const TransferButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(237, 119, 52, 0.3);
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  color: #78716c;
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 1rem;
    color: #d6d3d1;
  }
  
  h4 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #44403c;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    margin: 0 0 1.5rem 0;
  }
`;

export default function CustomerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedOrderForTransfer, setSelectedOrderForTransfer] = useState<Order | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'customer') {
      router.push('/');
      return;
    }

    loadCustomerOrders();
  }, [session, status, router]);

  const loadCustomerOrders = async () => {
    if (!session?.user?.email) return;
    try {
      setIsLoading(true);
      const fetchedOrders = await DynamoDBService.getAllOrders();
      
      // Customer dashboard shows all orders from locations they own
      const customerBusinessId = session.user.id || 'BUS-001';
      
      // Get all orders from this customer's business locations
      const customerOrders = fetchedOrders.filter(order => 
        order.location?.businessId === customerBusinessId || 
        order.customerEmail === session.user.email
      );
      
      setAllOrders(customerOrders);
      
      // Load locations for this business
      const businessLocations = await DynamoDBService.getLocationsByBusinessId(customerBusinessId);
      setLocations(businessLocations);
      
      // Apply location filter
      filterOrdersByLocation(customerOrders, selectedLocationId);
    } catch (error) {
      console.error('Error loading customer orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrdersByLocation = (ordersToFilter: Order[], locationId: string) => {
    if (locationId === 'all') {
      setOrders(ordersToFilter);
    } else {
      const filtered = ordersToFilter.filter(order => order.location?.locationId === locationId);
      setOrders(filtered);
    }
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
    filterOrdersByLocation(allOrders, locationId);
  };

  const handleTransferClick = (e: React.MouseEvent, order: Order) => {
    e.stopPropagation(); // Prevent order card click
    setSelectedOrderForTransfer(order);
    setShowTransferModal(true);
  };

  const handleTransferSuccess = () => {
    loadCustomerOrders(); // Refresh orders after transfer
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <DashboardContainer>
        <LoadingOverlay isLoading={true} message="Loading dashboard...">
          <div />
        </LoadingOverlay>
      </DashboardContainer>
    );
  }

  const totalOrders = orders.length;
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }).length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'delivered' || order.status === 'picked_up').length;
  const activeOrders = orders.filter(order => order.status !== 'delivered' && order.status !== 'picked_up');
  const recentOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'orders', icon: <Package size={20} />, label: 'Orders' },
    { id: 'create', icon: <PlusCircle size={20} />, label: 'Create Order', href: '/orders/create' },
    { id: 'history', icon: <History size={20} />, label: 'Order History' },
    { id: 'qr', icon: <QrCode size={20} />, label: 'QR Codes', href: '/qr-tracking' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
  ];

  return (
    <DashboardContainer>
      {/* Mobile Menu Overlay */}
      <MobileMenu $isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)}>
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
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </MobileNavButton>
          ))}
          <div style={{ height: '1px', background: '#e7e5e4', margin: '1rem 0' }} />
          <MobileNavButton $active={false} onClick={handleSignOut} style={{ color: '#dc2626' }}>
            <User size={20} />
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
                <p>Customer Panel</p>
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
            <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </MobileMenuButton>

            <UserButton onClick={handleSignOut}>
              <User size={18} />
              <span>{session?.user?.name || 'User'}</span>
            </UserButton>
          </NavRight>
        </NavContainer>
      </TopNavBar>

      {/* Main Content */}
      <MainContent>
        {activeTab === 'dashboard' && (
          <>
            <PageHeader>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2>Business Dashboard</h2>
                  <p>Welcome back, {session?.user?.name || 'Customer'}! Track orders across all your restaurant locations.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {locations.length > 0 && (
                    <select
                      value={selectedLocationId}
                      onChange={(e) => handleLocationChange(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'white',
                        border: '2px solid #ed7734',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.875rem',
                        color: '#1c1917',
                        minWidth: '200px'
                      }}
                    >
                      <option value="all">📊 All Locations ({locations.length})</option>
                      {locations.map(location => (
                        <option key={location.id} value={location.id}>
                          📍 {location.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button 
                    onClick={loadCustomerOrders}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.875rem'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>
            </PageHeader>

            {/* Stats Grid */}
            <StatsGrid>
              <StatCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatHeader>
                  <StatIcon $color="#f97316">
                    <Package />
                  </StatIcon>
                  <StatTrend $isPositive={true}>
                    <TrendingUp />
                    +12%
                  </StatTrend>
                </StatHeader>
                <StatValue>{totalOrders}</StatValue>
                <StatLabel>Total Orders</StatLabel>
              </StatCard>

              <StatCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatHeader>
                  <StatIcon $color="#6b7280">
                    <Clock />
                  </StatIcon>
                  <StatTrend $isPositive={true}>
                    <TrendingUp />
                    +8%
                  </StatTrend>
                </StatHeader>
                <StatValue>{todayOrders}</StatValue>
                <StatLabel>Today's Orders</StatLabel>
              </StatCard>

              <StatCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatHeader>
                  <StatIcon $color="#f59e0b">
                    <Clock />
                  </StatIcon>
                  <StatTrend $isPositive={false}>
                    <TrendingDown />
                    -5%
                  </StatTrend>
                </StatHeader>
                <StatValue>{pendingOrders}</StatValue>
                <StatLabel>Pending</StatLabel>
              </StatCard>

              <StatCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <StatHeader>
                  <StatIcon $color="#10b981">
                    <CheckCircle />
                  </StatIcon>
                </StatHeader>
                <StatValue>{completedOrders}</StatValue>
                <StatLabel>Completed</StatLabel>
              </StatCard>
            </StatsGrid>

            {/* Recent Orders Section */}
            <SectionCard>
              <h3>Recent Orders</h3>
              
              {recentOrders.length > 0 ? (
                <OrdersGrid>
                  {recentOrders.map(order => (
                    <OrderCard key={order.id}>
                      <div onClick={() => router.push(`/orders/${order.id}`)}>
                        <OrderHeader>
                          <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                          <OrderStatus $status={order.status}>{order.status}</OrderStatus>
                        </OrderHeader>
                        <OrderDetails>
                          <div><strong>Items:</strong> {order.orderDetails}</div>
                          <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                          {order.location?.locationName && (
                            <div><strong>Location:</strong> {order.location.locationName}</div>
                          )}
                        </OrderDetails>
                      </div>
                      {locations.length > 1 && (
                        <OrderActions>
                          <TransferButton onClick={(e) => handleTransferClick(e, order)}>
                            <ArrowRightLeft />
                            Transfer Location
                          </TransferButton>
                        </OrderActions>
                      )}
                    </OrderCard>
                  ))}
                </OrdersGrid>
              ) : (
                <EmptyState>
                  <Package />
                  <h4>No orders yet</h4>
                  <p>Place your first order!</p>
                  <button 
                    onClick={() => router.push('/orders/create')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Create Order
                  </button>
                </EmptyState>
              )}
            </SectionCard>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <PageHeader>
              <h2>My Orders</h2>
              <p>View and manage all your orders</p>
            </PageHeader>

            <SectionCard>
              {orders.length > 0 ? (
                <OrdersGrid>
                  {orders.map(order => (
                    <OrderCard key={order.id}>
                      <div onClick={() => router.push(`/orders/${order.id}`)}>
                        <OrderHeader>
                          <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                          <OrderStatus $status={order.status}>{order.status}</OrderStatus>
                        </OrderHeader>
                        <OrderDetails>
                          <div><strong>Items:</strong> {order.orderDetails}</div>
                          <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                          <div><strong>Total:</strong> ${order.totalAmount || '0.00'}</div>
                          {order.location?.locationName && (
                            <div><strong>Location:</strong> {order.location.locationName}</div>
                          )}
                        </OrderDetails>
                      </div>
                      {locations.length > 1 && (
                        <OrderActions>
                          <TransferButton onClick={(e) => handleTransferClick(e, order)}>
                            <ArrowRightLeft />
                            Transfer Location
                          </TransferButton>
                        </OrderActions>
                      )}
                    </OrderCard>
                  ))}
                </OrdersGrid>
              ) : (
                <EmptyState>
                  <Package />
                  <h4>No orders found</h4>
                  <p>You haven't placed any orders yet.</p>
                  <button 
                    onClick={() => router.push('/orders/create')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Create Your First Order
                  </button>
                </EmptyState>
              )}
            </SectionCard>
          </>
        )}

        {activeTab === 'history' && (
          <>
            <PageHeader>
              <h2>Order History</h2>
              <p>View your completed orders</p>
            </PageHeader>

            <SectionCard>
              {completedOrders > 0 ? (
                <OrdersGrid>
                  {orders.filter(order => order.status === 'delivered' || order.status === 'picked_up').map(order => (
                    <OrderCard key={order.id}>
                      <div onClick={() => router.push(`/orders/${order.id}`)}>
                        <OrderHeader>
                          <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                          <OrderStatus $status={order.status}>{order.status}</OrderStatus>
                        </OrderHeader>
                        <OrderDetails>
                          <div><strong>Items:</strong> {order.orderDetails}</div>
                          <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                          <div><strong>Total:</strong> ${order.totalAmount || '0.00'}</div>
                          {order.location?.locationName && (
                            <div><strong>Location:</strong> {order.location.locationName}</div>
                          )}
                        </OrderDetails>
                      </div>
                      {locations.length > 1 && (
                        <OrderActions>
                          <TransferButton onClick={(e) => handleTransferClick(e, order)}>
                            <ArrowRightLeft />
                            Transfer Location
                          </TransferButton>
                        </OrderActions>
                      )}
                    </OrderCard>
                  ))}
                </OrdersGrid>
              ) : (
                <EmptyState>
                  <History />
                  <h4>No order history</h4>
                  <p>Your completed orders will appear here.</p>
                </EmptyState>
              )}
            </SectionCard>
          </>
        )}
      </MainContent>

      {/* Transfer Order Modal */}
      {showTransferModal && selectedOrderForTransfer && (
        <TransferOrderModal
          order={selectedOrderForTransfer}
          locations={locations}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedOrderForTransfer(null);
          }}
          onSuccess={handleTransferSuccess}
        />
      )}
    </DashboardContainer>
  );
}
