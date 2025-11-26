'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styled from 'styled-components';
import { QRCodeCanvas } from 'qrcode.react';
import { DynamoDBService, Order } from '@/lib/dynamodb';
import FraudClaimForm from '@/components/FraudClaimForm';
import { 
  Package, 
  Clock, 
  Truck, 
  Calendar, 
  QrCode as QrCodeIcon,
  Home,
  Settings,
  User,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { buildTrackingUrl } from '@/lib/url';

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
  box-shadow: 0 2px 8px rgba(237, 119, 52, 0.3);
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

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$color};
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: bold;
  color: #111827;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f5f5f4;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const FilterBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterInput = styled.input`
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #ed7734;
    ring: 2px;
    ring-color: rgba(237, 119, 52, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.625rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #ed7734;
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  background: #fafafa;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const OrderNumber = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
`;

const OrderDate = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch(props.$status) {
      case 'Delivered': return '#dbeafe';
      case 'Awaiting Pickup': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'Delivered': return '#1e40af';
      case 'Awaiting Pickup': return '#92400e';
      default: return '#374151';
    }
  }};
`;

const QRCodeSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const CustomerInfo = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const InfoTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const InfoLabel = styled.span`
  color: #6b7280;
`;

const InfoValue = styled.span`
  color: #111827;
  font-weight: 500;
`;

const OrderDetails = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

const DetailText = styled.div`
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ViewButton = styled(Link)`
  flex: 1;
  min-width: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1rem;
  background: #ed7734;
  color: white;
  text-decoration: none;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  transition: background 0.2s;

  &:hover {
    background: #de5d20;
  }
`;

const CopyButton = styled.button`
  flex: 1;
  min-width: 100px;
  padding: 0.625rem 1rem;
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
`;

export default function QRTrackingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('qr-codes');
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Orders');
  const [sortBy, setSortBy] = useState('Newest First');
  const [selectedOrderForClaim, setSelectedOrderForClaim] = useState<Order | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => router.push('/admin') },
    { id: 'qr-codes', label: 'QR Codes', icon: QrCodeIcon },
    { id: 'history', label: 'History', icon: History },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedOrders = await DynamoDBService.getAllOrders();
      setAllOrders(fetchedOrders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filterAndSortOrders = useCallback(() => {
    let filtered = [...allOrders];

    if (searchTerm) {
      filtered = filtered.filter((order: Order) => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All Orders') {
      if (statusFilter === 'Pending') {
        filtered = filtered.filter((order: Order) => order.status === 'pending');
      } else if (statusFilter === 'Delivered') {
        filtered = filtered.filter((order: Order) => order.status === 'picked_up' || order.status === 'delivered');
      }
    }

    if (sortBy === 'Newest First') {
      filtered.sort((a: Order, b: Order) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'Oldest First') {
      filtered.sort((a: Order, b: Order) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    setOrders(filtered);
  }, [allOrders, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    if (!isClient) return;
    loadOrders();
  }, [isClient, loadOrders]);

  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  const getStats = () => {
    const totalOrders = allOrders.length;
    const pendingDelivery = allOrders.filter((o: Order) => o.status === 'pending').length;
    const delivered = allOrders.filter((o: Order) => o.status === 'picked_up' || o.status === 'delivered').length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysOrders = allOrders.filter((o: Order) => {
      const orderDate = new Date(o.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    }).length;

    return {
      totalOrders,
      pendingDelivery,
      delivered,
      todaysOrders
    };
  };

  const stats = getStats();

  const generateQRUrl = (orderId: string) => buildTrackingUrl(`/orders/${orderId}`);

  const copyOrderLink = (orderId: string) => {
    const url = generateQRUrl(orderId);
    navigator.clipboard.writeText(url);
    alert('Order link copied to clipboard!');
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pending') return 'Awaiting Pickup';
    if (status === 'picked_up' || status === 'delivered') return 'Delivered';
    return status;
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'qr-codes':
        return (
          <>
            <StatsGrid>
              <StatCard>
                <StatIcon $color="#f97316">
                  <Package size={24} />
                </StatIcon>
                <StatContent>
                  <StatValue>{stats.totalOrders}</StatValue>
                  <StatLabel>Total Orders</StatLabel>
                </StatContent>
              </StatCard>

              <StatCard>
                <StatIcon $color="#f59e0b">
                  <Clock size={24} />
                </StatIcon>
                <StatContent>
                  <StatValue>{stats.pendingDelivery}</StatValue>
                  <StatLabel>Pending Delivery</StatLabel>
                </StatContent>
              </StatCard>

              <StatCard>
                <StatIcon $color="#10b981">
                  <Truck size={24} />
                </StatIcon>
                <StatContent>
                  <StatValue>{stats.delivered}</StatValue>
                  <StatLabel>Delivered</StatLabel>
                </StatContent>
              </StatCard>

              <StatCard>
                <StatIcon $color="#3b82f6">
                  <Calendar size={24} />
                </StatIcon>
                <StatContent>
                  <StatValue>{stats.todaysOrders}</StatValue>
                  <StatLabel>Today&apos;s Orders</StatLabel>
                </StatContent>
              </StatCard>
            </StatsGrid>

            <Section>
              <SectionHeader>
                <SectionTitle>
                  <QrCodeIcon size={24} />
                  QR Codes Tracking
                </SectionTitle>
              </SectionHeader>

              <FilterBar>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
                    Search Orders
                  </label>
                  <FilterInput
                    type="text"
                    placeholder="Search by order #, customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
                    Filter by Status
                  </label>
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option>All Orders</option>
                    <option>Pending</option>
                    <option>Delivered</option>
                  </Select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: '#374151' }}>
                    Sort by
                  </label>
                  <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option>Newest First</option>
                    <option>Oldest First</option>
                  </Select>
                </div>
              </FilterBar>

              {loading ? (
                <EmptyState>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
                  <p>Loading orders...</p>
                </EmptyState>
              ) : orders.length === 0 ? (
                <EmptyState>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                  <p>No orders found</p>
                </EmptyState>
              ) : (
                <OrdersGrid>
                  {orders.map((order) => (
                    <OrderCard key={order.id}>
                      <OrderHeader>
                        <div>
                          <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                          <OrderDate>
                            Created {new Date(order.createdAt).toLocaleDateString('en-US', { 
                              month: 'numeric', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </OrderDate>
                        </div>
                        <StatusBadge $status={getStatusLabel(order.status)}>
                          {getStatusLabel(order.status)}
                        </StatusBadge>
                      </OrderHeader>

                      <QRCodeSection>
                        <QRCodeCanvas
                          value={generateQRUrl(order.id)}
                          size={150}
                          level="H"
                          includeMargin={true}
                        />
                      </QRCodeSection>

                      <CustomerInfo>
                        <InfoTitle>Customer Information</InfoTitle>
                        <InfoRow>
                          <InfoLabel>Name:</InfoLabel>
                          <InfoValue>{order.customerName}</InfoValue>
                        </InfoRow>
                        <InfoRow>
                          <InfoLabel>Email:</InfoLabel>
                          <InfoValue>{order.customerEmail}</InfoValue>
                        </InfoRow>
                      </CustomerInfo>

                      <OrderDetails>
                        <InfoTitle>Order Details:</InfoTitle>
                        <DetailText>{order.orderDetails}</DetailText>
                      </OrderDetails>

                      <ActionButtons>
                        <ViewButton href={`/orders/${order.id}`}>
                          📋 View Order
                        </ViewButton>
                        <CopyButton onClick={() => copyOrderLink(order.id)}>
                          Copy Link
                        </CopyButton>
                        <CopyButton 
                          onClick={() => setSelectedOrderForClaim(order)}
                          style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', color: 'white', border: 'none' }}
                        >
                          <AlertTriangle size={16} style={{ marginRight: '0.25rem' }} />
                          Report
                        </CopyButton>
                      </ActionButtons>
                    </OrderCard>
                  ))}
                </OrdersGrid>
              )}
            </Section>
          </>
        );
      default:
        return (
          <Section>
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <p>Content for {activeTab} coming soon...</p>
            </div>
          </Section>
        );
    }
  };

  return (
    <DashboardContainer>
      <TopNavBar>
        <NavContainer>
          <NavLeft>
            <Logo href="/">
              <LogoIcon>JT</LogoIcon>
              <LogoText>
                <h1>TheJERKTracker</h1>
                <p>QR Tracking</p>
              </LogoText>
            </Logo>
            <NavMenu>
              <NavList>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavItem key={item.id}>
                      <NavButton 
                        $active={activeTab === item.id}
                        onClick={item.onClick || (() => setActiveTab(item.id))}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </NavButton>
                    </NavItem>
                  );
                })}
              </NavList>
            </NavMenu>
          </NavLeft>
          <NavRight>
            <NavButton $active={false} onClick={() => router.push('/settings')}>
              <Settings size={18} />
              <span>Settings</span>
            </NavButton>
            <UserButton onClick={handleSignOut}>
              <User size={18} />
              <span>{session?.user?.email || 'User'}</span>
            </UserButton>
          </NavRight>
        </NavContainer>
      </TopNavBar>

      <ContentWrapper>
        {renderContent()}
      </ContentWrapper>

      {selectedOrderForClaim && (
        <FraudClaimForm
          isOpen={!!selectedOrderForClaim}
          onClose={() => setSelectedOrderForClaim(null)}
          order={selectedOrderForClaim}
          businessId={selectedOrderForClaim.location.businessId}
          onSubmitSuccess={() => {
            setSelectedOrderForClaim(null);
            alert('Fraud claim submitted successfully!');
          }}
        />
      )}
    </DashboardContainer>
  );
}
