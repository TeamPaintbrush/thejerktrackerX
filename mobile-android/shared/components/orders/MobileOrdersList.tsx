'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  Truck,
  AlertCircle,
  RefreshCw,
  Star
} from 'lucide-react';
import { MobileDataService } from '@/mobile-android/shared/services/mobileDataService';

const OrdersContainer = styled.div`
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding-bottom: 120px; /* Increased space for bottom navigation */
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem 0.75rem;
  text-align: center;
  border: 1px solid rgba(237, 119, 52, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const Controls = styled.div`
  margin-bottom: 1.5rem;
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

const RefreshButton = styled(motion.button)`
  width: 100%;
  padding: 0.75rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.active ? '#ed7734' : '#d1d5db'};
  background: ${props => props.active ? '#ed7734' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  
  &:active {
    transform: scale(0.98);
  }
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const OrderCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderId = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const OrderTime = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatusBadge = styled.div<{ status: string }>`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: capitalize;
  background: ${props => {
    switch(props.status) {
      case 'pending': return 'rgba(251, 191, 36, 0.1)';
      case 'confirmed': return 'rgba(59, 130, 246, 0.1)';
      case 'preparing': return 'rgba(168, 85, 247, 0.1)';
      case 'ready': return 'rgba(16, 185, 129, 0.1)';
      case 'out-for-delivery': return 'rgba(245, 158, 11, 0.1)';
      case 'delivered': return 'rgba(34, 197, 94, 0.1)';
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
      case 'out-for-delivery': return '#f59e0b';
      case 'delivered': return '#16a34a';
      case 'cancelled': return '#dc2626';
      default: return '#4b5563';
    }
  }};
`;

const OrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
`;

const PriceText = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #ed7734;
`;

const ActionButton = styled.button`
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid #ed7734;
  color: #ed7734;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
    background: rgba(237, 119, 52, 0.05);
  }
`;

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: string[];
  total: number;
  status: string;
  createdAt: string;
  estimatedTime: string;
  deliveryAddress: string;
  driverId?: string;
  driverName?: string;
  rating?: number;
}

interface MobileOrdersListProps {
  className?: string;
  userRole?: string;
  userId?: string;
}

export default function MobileOrdersList({ className, userRole = 'customer', userId }: MobileOrdersListProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load orders from API
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all orders from API (DynamoDB behind API layer)
      const allOrders = await MobileDataService.getAllOrders();
      
      // Transform database orders to component format
      const transformedOrders: Order[] = allOrders.map(order => ({
        id: order.id,
        customerId: order.location?.businessId || 'unknown',
        customerName: order.customerName,
        customerPhone: order.customerEmail, // Using email as placeholder
        items: [order.orderDetails], // Order details as items
        total: 0, // We don't have price in current schema
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        estimatedTime: order.status === 'delivered' ? 'Delivered' : 
                      order.status === 'picked_up' ? 'Out for Delivery' : 
                      'Preparing',
        deliveryAddress: order.location?.businessId || 'Pickup',
        driverId: order.driverName ? 'DRV-001' : undefined,
        driverName: order.driverName,
        rating: order.status === 'delivered' ? 5 : undefined
      }));
      
      // Filter orders based on user role
      let filteredOrders = transformedOrders;
      if (userRole === 'customer' && userId) {
        filteredOrders = transformedOrders.filter(order => order.customerId === userId);
      } else if (userRole === 'driver' && userId) {
        filteredOrders = transformedOrders.filter(order => 
          order.status === 'pending' || order.driverId === userId
        );
      }
      
      setOrders(filteredOrders);
      console.log(`✅ Loaded ${filteredOrders.length} orders successfully`);
    } catch (error) {
      console.error('Failed to load orders:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`⚠️ Could not load orders\n\n${errorMessage}\n\nNote: This app requires AWS DynamoDB. Check your configuration.`);
      // Set empty array on error - don't navigate away
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userRole, userId]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusFilters = () => {
    switch (userRole) {
      case 'driver':
        return [
          { key: 'all', label: 'All' },
          { key: 'ready', label: 'Ready' },
          { key: 'out-for-delivery', label: 'Delivering' },
          { key: 'delivered', label: 'Delivered' }
        ];
      case 'manager':
        return [
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'preparing', label: 'Preparing' },
          { key: 'ready', label: 'Ready' }
        ];
      case 'customer':
      default:
        return [
          { key: 'all', label: 'All' },
          { key: 'preparing', label: 'Preparing' },
          { key: 'ready', label: 'Ready' },
          { key: 'delivered', label: 'Delivered' }
        ];
    }
  };

  const statusFilters = getStatusFilters();

  const getOrderStats = () => {
    const total = orders.length;
    const active = orders.filter(o => 
      ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery'].includes(o.status)
    ).length;
    const completed = orders.filter(o => o.status === 'delivered').length;
    
    return { total, active, completed };
  };

  const stats = getOrderStats();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ago`;
    }
  };

  const getTitle = () => {
    switch (userRole) {
      case 'driver': return 'Driver Orders';
      case 'manager': return 'Restaurant Orders';
      case 'admin': return 'All Orders';
      case 'customer':
      default: return 'My Orders';
    }
  };

  const getSubtitle = () => {
    switch (userRole) {
      case 'driver': return 'Orders available for delivery';
      case 'manager': return 'Manage restaurant orders';
      case 'admin': return 'System-wide order management';
      case 'customer':
      default: return 'Your order history and tracking';
    }
  };

  if (loading) {
    return (
      <OrdersContainer className={className}>
        <Header>
          <Title>Loading Orders...</Title>
        </Header>
      </OrdersContainer>
    );
  }

  return (
    <OrdersContainer className={className}>
      <Header>
        <Title>{getTitle()}</Title>
        <Subtitle>{getSubtitle()}</Subtitle>
      </Header>

      <StatsRow>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.active}</StatValue>
          <StatLabel>Active</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.completed}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>
      </StatsRow>

      <Controls>
        <SearchBar>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>

        <FilterRow>
          {statusFilters.map(filter => (
            <FilterButton
              key={filter.key}
              active={statusFilter === filter.key}
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </FilterRow>

        <RefreshButton
          whileTap={{ scale: 0.98 }}
          onClick={loadOrders}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? 'Loading...' : 'Refresh Orders'}
        </RefreshButton>
      </Controls>

      <OrdersList>
        <AnimatePresence>
          {filteredOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <OrderHeader>
                <OrderInfo>
                  <OrderId>{order.id}</OrderId>
                  <OrderTime>
                    <Clock size={12} />
                    {formatTime(order.createdAt)}
                  </OrderTime>
                </OrderInfo>
                <StatusBadge status={order.status}>
                  {order.status}
                </StatusBadge>
              </OrderHeader>

              <OrderDetails>
                {userRole !== 'customer' && (
                  <DetailRow>
                    <User size={14} />
                    {order.customerName}
                    <Phone size={12} style={{ marginLeft: 'auto' }} />
                  </DetailRow>
                )}
                <DetailRow>
                  <Package size={14} />
                  {order.items.slice(0, 2).join(', ')}
                  {order.items.length > 2 && ` +${order.items.length - 2} more`}
                </DetailRow>
                <DetailRow>
                  <MapPin size={14} />
                  {order.deliveryAddress}
                </DetailRow>
                {order.driverName && (
                  <DetailRow>
                    <Truck size={14} />
                    Driver: {order.driverName}
                  </DetailRow>
                )}
                <DetailRow>
                  <Clock size={14} />
                  {order.estimatedTime}
                </DetailRow>
                {order.rating && (
                  <DetailRow>
                    <Star size={14} />
                    Rating: {order.rating}/5
                  </DetailRow>
                )}
              </OrderDetails>

              <OrderFooter>
                <PriceText>${order.total.toFixed(2)}</PriceText>
                <ActionButton onClick={() => alert(`View order ${order.id}`)}>
                  <Eye size={12} style={{ marginRight: '0.25rem' }} />
                  View Details
                </ActionButton>
              </OrderFooter>
            </OrderCard>
          ))}
        </AnimatePresence>
      </OrdersList>

      {filteredOrders.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
          No orders found matching your criteria.
        </div>
      )}
    </OrdersContainer>
  );
}