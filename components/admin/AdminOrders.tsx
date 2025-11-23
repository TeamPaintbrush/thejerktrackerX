'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  MapPin,
  Phone,
  User,
  Calendar,
  DollarSign,
  Truck,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ActionButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #ed7734;
  border: 1px solid #ed7734;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &:hover {
    background: rgba(237, 119, 52, 0.05);
  }
`;

const RefreshButton = styled(ActionButton)`
  background: #ed7734;
  color: white;
  border: none;
  box-shadow: 0 2px 4px rgba(237, 119, 52, 0.2);
  
  &:hover {
    background: #d96929;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${props => props.color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.color};
  }
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Controls = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#ed7734' : '#d1d5db'};
  background: ${props => props.active ? '#ed7734' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #ed7734;
    background: ${props => props.active ? '#d96929' : 'rgba(237, 119, 52, 0.05)'};
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const OrderCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f3f4f6;
`;

const OrderIdSection = styled.div``;

const OrderId = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const OrderTime = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const OrderStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

const StatusBadge = styled.div<{ status: string }>`
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-transform: capitalize;
  background: ${props => {
    switch(props.status) {
      case 'pending': return 'rgba(251, 191, 36, 0.1)';
      case 'confirmed': return 'rgba(59, 130, 246, 0.1)';
      case 'preparing': return 'rgba(168, 85, 247, 0.1)';
      case 'ready': return 'rgba(16, 185, 129, 0.1)';
      case 'completed': return 'rgba(34, 197, 94, 0.1)';
      case 'cancelled': return 'rgba(239, 68, 68, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'pending': return '#d97706';
      case 'confirmed': return '#2563eb';
      case 'preparing': return '#7c3aed';
      case 'ready': return '#059669';
      case 'completed': return '#16a34a';
      case 'cancelled': return '#dc2626';
      default: return '#4b5563';
    }
  }};
`;

const PriceText = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ed7734;
`;

const OrderBody = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1rem;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SectionTitle = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #1f2937;
`;

const IconWrapper = styled.div`
  color: #ed7734;
  display: flex;
  align-items: center;
`;

const ItemsList = styled.div`
  background: #fafaf9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const ItemsTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  
  &:not(:last-child) {
    border-bottom: 1px solid #e5e7eb;
  }
`;

const ItemName = styled.span`
  color: #1f2937;
`;

const ItemQuantity = styled.span`
  color: #6b7280;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
`;

const FooterButton = styled.button`
  padding: 0.625rem 1.25rem;
  border: 1px solid #ed7734;
  background: transparent;
  color: #ed7734;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(237, 119, 52, 0.05);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ViewButton = styled(FooterButton)`
  background: #ed7734;
  color: white;
  
  &:hover {
    background: #d96929;
  }
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LoadingState = styled.div`
  background: white;
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
  };
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  pickupLocation: string;
  orderTime: string;
  driver?: string;
  notes?: string;
}

interface AdminOrdersProps {
  className?: string;
}

export default function AdminOrders({ className }: AdminOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders([
        {
          id: 'ORD-2025-001',
          customer: {
            name: 'John Doe',
            phone: '+1 (555) 123-4567'
          },
          items: [
            { name: 'Jerk Chicken Plate', quantity: 2, price: 15.99 },
            { name: 'Rice & Peas', quantity: 1, price: 5.99 }
          ],
          totalPrice: 37.97,
          status: 'pending',
          pickupLocation: 'Main Street Kitchen',
          orderTime: new Date().toISOString(),
          notes: 'Extra spicy please'
        },
        {
          id: 'ORD-2025-002',
          customer: {
            name: 'Jane Smith',
            phone: '+1 (555) 234-5678'
          },
          items: [
            { name: 'Jerk Pork Plate', quantity: 1, price: 16.99 },
            { name: 'Plantains', quantity: 2, price: 4.99 }
          ],
          totalPrice: 26.97,
          status: 'preparing',
          pickupLocation: 'Downtown Location',
          orderTime: new Date(Date.now() - 1800000).toISOString(),
          driver: 'Mike Wilson'
        },
        {
          id: 'ORD-2025-003',
          customer: {
            name: 'Bob Johnson',
            phone: '+1 (555) 345-6789'
          },
          items: [
            { name: 'Jerk Chicken Bowl', quantity: 3, price: 12.99 }
          ],
          totalPrice: 38.97,
          status: 'ready',
          pickupLocation: 'Airport Terminal',
          orderTime: new Date(Date.now() - 3600000).toISOString(),
          driver: 'Sarah Davis'
        },
        {
          id: 'ORD-2025-004',
          customer: {
            name: 'Alice Williams',
            phone: '+1 (555) 456-7890'
          },
          items: [
            { name: 'Festival (3pc)', quantity: 1, price: 6.99 },
            { name: 'Jerk Wings', quantity: 1, price: 11.99 }
          ],
          totalPrice: 18.98,
          status: 'completed',
          pickupLocation: 'West End Shop',
          orderTime: new Date(Date.now() - 7200000).toISOString(),
          driver: 'Mike Wilson'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    ready: orders.filter(o => o.status === 'ready').length,
    completed: orders.filter(o => o.status === 'completed').length
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <Container className={className}>
      <Header>
        <TitleRow>
          <Title>Admin Orders</Title>
          <ActionButtons>
            <ActionButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={18} />
              Export
            </ActionButton>
            <RefreshButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadOrders}
            >
              <RefreshCw size={18} />
              Refresh
            </RefreshButton>
          </ActionButtons>
        </TitleRow>
        <Subtitle>View and manage all customer orders</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon color="#3b82f6">
            <Package />
          </StatIcon>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon color="#f59e0b">
            <Clock />
          </StatIcon>
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon color="#a855f7">
            <AlertCircle />
          </StatIcon>
          <StatValue>{stats.preparing}</StatValue>
          <StatLabel>Preparing</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatIcon color="#10b981">
            <CheckCircle />
          </StatIcon>
          <StatValue>{stats.ready}</StatValue>
          <StatLabel>Ready</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <StatIcon color="#22c55e">
            <CheckCircle />
          </StatIcon>
          <StatValue>{stats.completed}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>
      </StatsGrid>

      <Controls>
        <SearchBar>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search orders by ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>

        <FilterRow>
          <FilterButton
            active={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          >
            All Orders
          </FilterButton>
          <FilterButton
            active={statusFilter === 'pending'}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </FilterButton>
          <FilterButton
            active={statusFilter === 'confirmed'}
            onClick={() => setStatusFilter('confirmed')}
          >
            Confirmed
          </FilterButton>
          <FilterButton
            active={statusFilter === 'preparing'}
            onClick={() => setStatusFilter('preparing')}
          >
            Preparing
          </FilterButton>
          <FilterButton
            active={statusFilter === 'ready'}
            onClick={() => setStatusFilter('ready')}
          >
            Ready
          </FilterButton>
          <FilterButton
            active={statusFilter === 'completed'}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </FilterButton>
        </FilterRow>
      </Controls>

      <OrdersGrid>
        {loading ? (
          <LoadingState>Loading orders...</LoadingState>
        ) : filteredOrders.length === 0 ? (
          <EmptyState>No orders found</EmptyState>
        ) : (
          filteredOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <OrderHeader>
                <OrderIdSection>
                  <OrderId>{order.id}</OrderId>
                  <OrderTime>
                    <Clock size={14} />
                    {formatTime(order.orderTime)}
                  </OrderTime>
                </OrderIdSection>
                <OrderStatus>
                  <StatusBadge status={order.status}>{order.status}</StatusBadge>
                  <PriceText>${order.totalPrice.toFixed(2)}</PriceText>
                </OrderStatus>
              </OrderHeader>

              <OrderBody>
                <InfoSection>
                  <SectionTitle>Customer</SectionTitle>
                  <InfoRow>
                    <IconWrapper><User size={16} /></IconWrapper>
                    {order.customer.name}
                  </InfoRow>
                  <InfoRow>
                    <IconWrapper><Phone size={16} /></IconWrapper>
                    {order.customer.phone}
                  </InfoRow>
                </InfoSection>

                <InfoSection>
                  <SectionTitle>Location</SectionTitle>
                  <InfoRow>
                    <IconWrapper><MapPin size={16} /></IconWrapper>
                    {order.pickupLocation}
                  </InfoRow>
                  {order.driver && (
                    <InfoRow>
                      <IconWrapper><Truck size={16} /></IconWrapper>
                      Driver: {order.driver}
                    </InfoRow>
                  )}
                </InfoSection>
              </OrderBody>

              <ItemsList>
                <ItemsTitle>Order Items</ItemsTitle>
                {order.items.map((item, idx) => (
                  <OrderItem key={idx}>
                    <ItemName>{item.name}</ItemName>
                    <ItemQuantity>×{item.quantity}</ItemQuantity>
                  </OrderItem>
                ))}
              </ItemsList>

              {order.notes && (
                <InfoRow style={{ marginBottom: '1rem', color: '#6b7280' }}>
                  <IconWrapper><AlertCircle size={16} /></IconWrapper>
                  {order.notes}
                </InfoRow>
              )}

              <OrderFooter>
                <FooterButton>
                  <Phone size={16} />
                  Call Customer
                </FooterButton>
                <ViewButton>
                  <Eye size={16} />
                  View Details
                </ViewButton>
              </OrderFooter>
            </OrderCard>
          ))
        )}
      </OrdersGrid>
    </Container>
  );
}
