'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamoDBService, Order } from '../../lib/dynamodb';
import { 
  Home, 
  PlusCircle, 
  Package, 
  BarChart3, 
  Settings, 
  QrCode, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Menu,
  X,
  Search,
  Bell,
  User
} from 'lucide-react';
import { Container, Button, Heading, Text, Flex, Grid, Card } from '../../styles/components';
import OrderForm from '../../components/OrderForm';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import OrderList from '../../components/OrderList';
import { PRESET_FOOD_ITEMS, FOOD_CATEGORIES, formatPrice } from '../../lib/foodItems';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #fafaf9;
`;

const SidebarOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;

  @media (min-width: 1024px) {
    display: none;
  }
`;

const Sidebar = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 256px;
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease-in-out;
  z-index: 50;

  @media (min-width: 1024px) {
    position: static;
    transform: translateX(0);
    box-shadow: none;
    border-right: 1px solid #e7e5e4;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80px;
  padding: 0 1.5rem;
  border-bottom: 1px solid #e7e5e4;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: none;
  color: #78716c;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f4;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

const SidebarNav = styled.nav`
  padding: 1rem;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled.li`
  width: 100%;
`;

const NavButton = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: none;
  text-align: left;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${props => props.$active ? '#ed773410' : 'transparent'};
  color: ${props => props.$active ? '#ed7734' : '#78716c'};
  border: ${props => props.$active ? '1px solid #ed773420' : '1px solid transparent'};

  &:hover {
    background: ${props => props.$active ? '#ed773410' : '#f5f5f4'};
    color: ${props => props.$active ? '#ed7734' : '#1c1917'};
  }
`;

const SidebarFooter = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  color: #78716c;
  text-decoration: none;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: #f5f5f4;
    color: #1c1917;
  }
`;

const MainContent = styled.div`
  @media (min-width: 1024px) {
    margin-left: 256px;
  }
`;

const TopBar = styled.header`
  background: white;
  border-bottom: 1px solid #e7e5e4;
  position: sticky;
  top: 0;
  z-index: 30;
`;

const TopBarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 1.5rem;
`;

const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MenuButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: none;
  color: #78716c;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f4;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a8a29e;
  width: 16px;
  height: 16px;
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  width: 256px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const IconButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: #78716c;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    color: #1c1917;
    background: #f5f5f4;
  }
`;

const MainContainer = styled.main`
  padding: 1.5rem;
`;

const StatsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
  background: white;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => {
    switch(props.color) {
      case 'primary': return 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)';
      case 'secondary': return 'linear-gradient(135deg, #78716c 0%, #57534e 100%)';
      case 'accent': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'success': return 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
      default: return 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)';
    }
  }};
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatTrend = styled.div<{ trend: 'up' | 'down' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.trend === 'up' ? '#22c55e' : '#ef4444'};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 0.25rem;
`;

const StatTitle = styled.div`
  color: #78716c;
  font-size: 0.875rem;
`;

const SectionCard = styled(Card)`
  background: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const QuickActionsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px dashed #d6d3d1;
  border-radius: 0.75rem;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #44403c;

  &:hover {
    border-color: #ed7734;
    background: #ed773410;
  }
`;

const RecentOrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RecentOrderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
`;

const StatusBadge = styled.span<{ status: 'pending' | 'picked_up' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.status === 'pending' ? '#f59e0b20' : '#22c55e20'};
  color: ${props => props.status === 'pending' ? '#f59e0b' : '#22c55e'};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ViewAllButton = styled.button`
  color: #ed7734;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #de5d20;
  }
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f5f5f4;
  color: #44403c;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #de5d20;
  }
`;

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // Load orders from localStorage
    const loadOrders = async () => {
      try {
        const ordersFromDB = await DynamoDBService.getAllOrders();
        setOrders(ordersFromDB);
        if (ordersFromDB.length > 0) {
          setLatestOrder(ordersFromDB[ordersFromDB.length - 1]);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrders([]);
      }
    };
    loadOrders();
  }, [isClient]);

  const handleOrderCreated = async (newOrder: Order) => {
    try {
      // Save to DynamoDB
      await DynamoDBService.createOrder(newOrder);
      // Update local state
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      setLatestOrder(newOrder);
    } catch (error) {
      console.error('Failed to create order:', error);
      // DynamoDBService handles localStorage internally
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      setLatestOrder(newOrder);
    }
  };

  const refreshOrders = async () => {
    try {
      // Reload orders from DynamoDB
      const ordersFromDB = await DynamoDBService.getAllOrders();
      setOrders(ordersFromDB);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      // DynamoDBService handles localStorage internally, so just try again
      setOrders([]);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Order Number', 'Customer Name', 'Status', 'Created At', 'Driver Name', 'Driver Company', 'Picked Up At'],
      ...orders.map(order => [
        order.orderNumber,
        order.customerName || '',
        order.status,
        order.createdAt.toISOString(),
        order.driverName || '',
        order.driverCompany || '',
        order.pickedUpAt ? order.pickedUpAt.toISOString() : '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'picked_up').length;
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const sidebarItems = [
    { id: 'dashboard', icon: <BarChart3 size={20} />, label: 'Dashboard' },
    { id: 'orders', icon: <Package size={20} />, label: 'Orders' },
    { id: 'create', icon: <PlusCircle size={20} />, label: 'Create Order' },
    { id: 'menu', icon: <Menu size={20} />, label: 'Menu Items' },
    { id: 'qr', icon: <QrCode size={20} />, label: 'QR Codes' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const statCards = [
    {
      title: 'Total Orders',
      value: totalOrders,
      change: '+12%',
      trend: 'up' as const,
      icon: <Package size={24} />,
      color: 'primary'
    },
    {
      title: 'Today\'s Orders',
      value: todayOrders,
      change: '+8%',
      trend: 'up' as const,
      icon: <Clock size={24} />,
      color: 'secondary'
    },
    {
      title: 'Pending',
      value: pendingOrders,
      change: '-5%',
      trend: 'down' as const,
      icon: <Clock size={24} />,
      color: 'accent'
    },
    {
      title: 'Completed',
      value: completedOrders,
      change: '+15%',
      trend: 'up' as const,
      icon: <CheckCircle size={24} />,
      color: 'success'
    }
  ];

  return (
    <DashboardContainer>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SidebarOverlay onClick={() => setSidebarOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo href="/">
            <LogoIcon>JT</LogoIcon>
            <div>
              <Heading as="h1" size="lg" mb="0" weight="bold" color="#1c1917">TheJERKTracker</Heading>
              <Text size="xs" color="#78716c">Admin Panel</Text>
            </div>
          </Logo>
          <CloseButton onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </CloseButton>
        </SidebarHeader>

        <SidebarNav>
          <NavList>
            {sidebarItems.map((item) => (
              <NavItem key={item.id}>
                <NavButton
                  $active={activeTab === item.id}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavButton>
              </NavItem>
            ))}
          </NavList>
        </SidebarNav>

        <SidebarFooter>
          <BackLink href="/">
            <Home size={20} />
            <span>Back to Home</span>
          </BackLink>
        </SidebarFooter>
      </Sidebar>

      {/* Main content */}
      <MainContent>
        {/* Top bar */}
        <TopBar>
          <TopBarContent>
            <TopBarLeft>
              <MenuButton onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </MenuButton>
              <Heading as="h2" size="xl" weight="bold" mb="0" color="#1c1917" style={{ textTransform: 'capitalize' }}>
                {activeTab}
              </Heading>
            </TopBarLeft>

            <TopBarRight>
              <SearchContainer>
                <SearchIcon />
                <SearchInput
                  type="text"
                  placeholder="Search orders..."
                />
              </SearchContainer>
              <IconButton>
                <Bell size={20} />
              </IconButton>
              <IconButton>
                <User size={20} />
              </IconButton>
            </TopBarRight>
          </TopBarContent>
        </TopBar>

        {/* Content */}
        <MainContainer>
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Stats Cards */}
              <StatsGrid>
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <StatCard>
                      <StatHeader>
                        <StatIcon color={stat.color}>
                          {stat.icon}
                        </StatIcon>
                        <StatTrend trend={stat.trend}>
                          {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          <span>{stat.change}</span>
                        </StatTrend>
                      </StatHeader>
                      <StatValue>{stat.value}</StatValue>
                      <StatTitle>{stat.title}</StatTitle>
                    </StatCard>
                  </motion.div>
                ))}
              </StatsGrid>

              {/* Quick Actions */}
              <SectionCard>
                <Heading as="h3" size="lg" weight="bold" mb="1rem" color="#1c1917">Quick Actions</Heading>
                <QuickActionsGrid>
                  <QuickActionButton onClick={() => setActiveTab('create')}>
                    <PlusCircle size={24} color="#ed7734" />
                    <span>Create New Order</span>
                  </QuickActionButton>
                  <QuickActionButton onClick={handleExportCSV}>
                    <Download size={24} color="#ed7734" />
                    <span>Export Orders</span>
                  </QuickActionButton>
                  <QuickActionButton onClick={refreshOrders}>
                    <RefreshCw size={24} color="#ed7734" />
                    <span>Refresh Data</span>
                  </QuickActionButton>
                </QuickActionsGrid>
              </SectionCard>

              {/* Recent Orders Preview */}
              <SectionCard>
                <SectionHeader>
                  <Heading as="h3" size="lg" weight="bold" mb="0" color="#1c1917">Recent Orders</Heading>
                  <ViewAllButton onClick={() => setActiveTab('orders')}>
                    View All
                  </ViewAllButton>
                </SectionHeader>
                <RecentOrdersList>
                  {orders.slice(0, 5).map((order) => (
                    <RecentOrderItem key={order.id}>
                      <div>
                        <Text size="base" weight="medium" color="#1c1917">#{order.orderNumber}</Text>
                        <Text size="sm" color="#78716c">{order.customerName}</Text>
                      </div>
                      <StatusBadge status={order.status}>
                        {order.status === 'pending' ? 'Pending' : 'Picked Up'}
                      </StatusBadge>
                    </RecentOrderItem>
                  ))}
                </RecentOrdersList>
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" size="xl" weight="bold" mb="1.5rem" color="#1c1917">Create New Order</Heading>
                <OrderForm onOrderCreated={handleOrderCreated} />
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <SectionHeader>
                  <Heading as="h3" size="xl" weight="bold" mb="0" color="#1c1917">All Orders</Heading>
                  <ActionButtonsGroup>
                    <RefreshButton onClick={refreshOrders}>
                      <RefreshCw size={16} />
                      <span>Refresh</span>
                    </RefreshButton>
                    <ExportButton onClick={handleExportCSV}>
                      <Download size={16} />
                      <span>Export CSV</span>
                    </ExportButton>
                  </ActionButtonsGroup>
                </SectionHeader>
                <OrderList orders={orders} onExportCSV={handleExportCSV} onRefresh={refreshOrders} />
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'qr' && isClient && latestOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" size="xl" weight="bold" mb="1.5rem" color="#1c1917">Latest QR Code</Heading>
                <QRCodeDisplay
                  orderId={latestOrder.id}
                  orderNumber={latestOrder.orderNumber}
                />
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'qr' && (!isClient || !latestOrder) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" size="xl" weight="bold" mb="1.5rem" color="#1c1917">QR Code</Heading>
                <Text size="base" color="#78716c">
                  {!isClient ? 'Loading...' : 'No orders found. Create an order first to generate a QR code.'}
                </Text>
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" size="xl" weight="bold" mb="1.5rem" color="#1c1917">Menu Items</Heading>
                <Text size="base" color="#78716c" mb="1.5rem">
                  Browse and manage your restaurant's menu items. Click on any item to edit its details.
                </Text>
                
                {/* Categories */}
                {FOOD_CATEGORIES.map((category) => {
                  const categoryItems = PRESET_FOOD_ITEMS.filter(item => item.category === category.id);
                  
                  return (
                    <div key={category.id} style={{ marginBottom: '2rem' }}>
                      <Heading as="h4" size="lg" weight="semibold" mb="1rem" color="#44403c">
                        {category.icon} {category.name}
                      </Heading>
                      <Grid gap="1rem" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {categoryItems.map((item) => (
                          <Card key={item.id} style={{ padding: '1rem', border: '1px solid #e7e5e4' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                              <div>
                                <Text size="base" weight="semibold" color="#1c1917">{item.name}</Text>
                                {item.popular && (
                                  <span style={{ 
                                    background: '#ed7734', 
                                    color: 'white', 
                                    padding: '0.125rem 0.5rem', 
                                    borderRadius: '0.25rem', 
                                    fontSize: '0.75rem',
                                    marginLeft: '0.5rem'
                                  }}>
                                    Popular
                                  </span>
                                )}
                              </div>
                              <Text size="base" weight="bold" color="#ed7734">
                                {formatPrice(item.price)}
                              </Text>
                            </div>
                            <div style={{ marginBottom: '0.75rem' }}>
                              <Text size="sm" color="#78716c">
                                {item.description}
                              </Text>
                            </div>
                            <Flex align="center" gap="1rem">
                              {item.preparationTime && (
                                <Text size="xs" color="#a8a29e">
                                  <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                                  {item.preparationTime}m
                                </Text>
                              )}
                              {item.spiceLevel && (
                                <Text size="xs" color="#a8a29e">
                                  🌶️ {item.spiceLevel}
                                </Text>
                              )}
                              {item.allergens && item.allergens.length > 0 && (
                                <Text size="xs" color="#a8a29e">
                                  Allergens: {item.allergens.join(', ')}
                                </Text>
                              )}
                            </Flex>
                          </Card>
                        ))}
                      </Grid>
                    </div>
                  );
                })}
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" size="xl" weight="bold" mb="1.5rem" color="#1c1917">Settings</Heading>
                <Text size="base" color="#78716c">Settings panel coming soon...</Text>
              </SectionCard>
            </motion.div>
          )}
        </MainContainer>
      </MainContent>
    </DashboardContainer>
  );
}