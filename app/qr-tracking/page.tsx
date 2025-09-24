'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { QrCode, Calendar, User, Package, Truck, Clock, ExternalLink, Search, Filter, ArrowUpDown } from 'lucide-react';
import { Container, Card, Button, Heading, Text } from '../../styles/components';
import { DynamoDBService, Order as DynamoOrder } from '../../lib/dynamodb';
import Header from '../../components/Header';
import { QRCodeCanvas } from 'qrcode.react';

// Styled Components
const QRTrackingContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const PageHeader = styled.div`
  background: white;
  border-bottom: 1px solid #e7e5e4;
  padding: 2rem 0;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h1 {
    margin: 0;
    color: #1c1917;
    font-size: 1.75rem;
    font-weight: 600;
  }

  svg {
    color: #ed7734;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
  background: white;
  border: 1px solid #e7e5e4;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #ed773410;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ed7734;
`;

const StatContent = styled.div`
  h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #1c1917;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: #78716c;
  }
`;

const FiltersSection = styled(Card)`
  padding: 1.5rem;
  background: white;
  border: 1px solid #e7e5e4;
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #44403c;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const SearchContainer = styled.div`
  position: relative;

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a8a29e;
    width: 16px;
    height: 16px;
  }
`;

const Select = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const QRGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const QRCard = styled(Card)`
  padding: 1.5rem;
  background: white;
  border: 1px solid #e7e5e4;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const QRCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const OrderInfo = styled.div`
  h3 {
    margin: 0 0 0.25rem 0;
    color: #1c1917;
    font-size: 1.125rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #78716c;
    font-size: 0.875rem;
  }
`;

const StatusBadge = styled.span<{ status: 'pending' | 'picked_up' | 'delivered' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.status === 'pending') return '#f59e0b20';
    if (props.status === 'picked_up') return '#22c55e20';
    return '#3b82f620'; // delivered - blue
  }};
  color: ${props => {
    if (props.status === 'pending') return '#f59e0b';
    if (props.status === 'picked_up') return '#22c55e';
    return '#3b82f6'; // delivered - blue
  }};
`;

const QRCodeSection = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0;
`;

const OrderDetails = styled.div`
  margin: 1rem 0;
  padding: 1rem;
  background: #f9f9f8;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: #44403c;
`;

const CustomerInfo = styled.div`
  margin: 1rem 0;
  
  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #1c1917;
  }

  p {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    color: #78716c;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled(Button)<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  background: ${props => props.variant === 'secondary' ? 'white' : '#ed7734'};
  color: ${props => props.variant === 'secondary' ? '#ed7734' : 'white'};
  border: 1px solid #ed7734;

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#ed773405' : '#de5d20'};
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

  h3 {
    margin: 0 0 0.5rem 0;
    color: #44403c;
  }

  p {
    margin: 0;
  }
`;

// Use the DynamoDB Order type directly
type Order = DynamoOrder;

const QRTrackingPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const ordersData = await DynamoDBService.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = useCallback(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower) ||
        order.customerEmail?.toLowerCase().includes(searchLower) ||
        order.orderDetails.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'orderNumber':
          return a.orderNumber.localeCompare(b.orderNumber);
        case 'customer':
          return (a.customerName || '').localeCompare(b.customerName || '');
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  const getOrderUrl = (orderId: string) => {
    const isProduction = typeof window !== 'undefined' && window.location.hostname.includes('github.io');
    const basePath = isProduction ? '/thejerktrackerX' : '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${basePath}/order?id=${orderId}`;
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'picked_up').length,
    todayOrders: orders.filter(o => {
      const today = new Date().toDateString();
      return new Date(o.createdAt).toDateString() === today;
    }).length
  };

  if (loading) {
    return (
      <QRTrackingContainer>
        <Header />
        <Container>
          <div style={{ textAlign: 'center', padding: '3rem', color: '#78716c' }}>
            Loading QR codes tracking data...
          </div>
        </Container>
      </QRTrackingContainer>
    );
  }

  return (
    <QRTrackingContainer>
      <Header />
      
      <PageHeader>
        <Container>
          <HeaderContent>
            <HeaderTitle>
              <QrCode size={32} />
              <h1>QR Codes Tracking</h1>
            </HeaderTitle>
            <Button onClick={loadOrders}>
              Refresh Data
            </Button>
          </HeaderContent>
          
          <StatsGrid>
            <StatCard>
              <StatIcon>
                <Package />
              </StatIcon>
              <StatContent>
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <Clock />
              </StatIcon>
              <StatContent>
                <h3>{stats.pendingOrders}</h3>
                <p>Pending Delivery</p>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <Truck />
              </StatIcon>
              <StatContent>
                <h3>{stats.completedOrders}</h3>
                <p>Delivered</p>
              </StatContent>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <Calendar />
              </StatIcon>
              <StatContent>
                <h3>{stats.todayOrders}</h3>
                <p>Today&apos;s Orders</p>
              </StatContent>
            </StatCard>
          </StatsGrid>
        </Container>
      </PageHeader>

      <Container style={{ padding: '2rem 1rem' }}>
        <FiltersSection>
          <FiltersGrid>
            <FilterGroup>
              <label>Search Orders</label>
              <SearchContainer>
                <Search />
                <SearchInput
                  type="text"
                  placeholder="Search by order #, customer, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </SearchContainer>
            </FilterGroup>
            
            <FilterGroup>
              <label>Filter by Status</label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="picked_up">Picked Up</option>
              </Select>
            </FilterGroup>
            
            <FilterGroup>
              <label>Sort by</label>
              <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="orderNumber">Order Number</option>
                <option value="customer">Customer Name</option>
              </Select>
            </FilterGroup>
          </FiltersGrid>
        </FiltersSection>

        {filteredOrders.length === 0 ? (
          <EmptyState>
            <QrCode />
            <h3>No QR Codes Found</h3>
            <p>No orders match your current filters. Try adjusting your search criteria.</p>
          </EmptyState>
        ) : (
          <QRGrid>
            {filteredOrders.map((order) => (
              <QRCard key={order.id}>
                <QRCardHeader>
                  <OrderInfo>
                    <h3>Order #{order.orderNumber}</h3>
                    <p>Created {new Date(order.createdAt).toLocaleDateString()}</p>
                  </OrderInfo>
                  <StatusBadge status={order.status}>
                    {order.status === 'pending' ? 'Pending' : 
                     order.status === 'picked_up' ? 'Picked Up' : 'Delivered'}
                  </StatusBadge>
                </QRCardHeader>

                <QRCodeSection>
                  <QRCodeCanvas 
                    value={getOrderUrl(order.id)}
                    size={120}
                  />
                </QRCodeSection>

                <CustomerInfo>
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {order.customerName || 'N/A'}</p>
                  <p><strong>Email:</strong> {order.customerEmail || 'N/A'}</p>
                </CustomerInfo>

                <OrderDetails>
                  <strong>Order Details:</strong><br />
                  {order.orderDetails}
                </OrderDetails>

                {order.status === 'picked_up' && order.pickedUpAt && (
                  <div style={{ fontSize: '0.875rem', color: '#22c55e', marginTop: '0.5rem' }}>
                    <strong>Picked up:</strong> {new Date(order.pickedUpAt).toLocaleString()}
                    {order.driverName && (
                      <span> by {order.driverName}{order.driverCompany ? ` (${order.driverCompany})` : ''}</span>
                    )}
                  </div>
                )}

                <ActionButtons>
                  <ActionButton as={Link} href={`/order?id=${order.id}`}>
                    <ExternalLink size={16} />
                    View Order
                  </ActionButton>
                  <ActionButton 
                    variant="secondary"
                    onClick={() => {
                      const url = getOrderUrl(order.id);
                      navigator.clipboard.writeText(url);
                      // You could add a toast notification here
                    }}
                  >
                    Copy Link
                  </ActionButton>
                </ActionButtons>
              </QRCard>
            ))}
          </QRGrid>
        )}
      </Container>
    </QRTrackingContainer>
  );
};

export default QRTrackingPage;