'use client';

import React, { useState, useEffect } from 'react';
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
  MoreVertical,
  MapPin,
  Phone,
  User,
  Calendar,
  DollarSign,
  Truck,
  AlertCircle,
  List,
  LayoutGrid,
  CalendarIcon
} from 'lucide-react';
import MobileOrderBoard from '../orders/MobileOrderBoard';
import { Order as DynamoOrder } from '@/lib/dynamodb';
import { MobileDataService } from '@/mobile-android/shared/services/mobileDataService';

const OrdersContainer = styled.div`
  padding: 0.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  margin-top: 0.5rem;
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
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 0.75rem 0.5rem;
  text-align: center;
  border: 1px solid rgba(237, 119, 52, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatLabel = styled.div`
  font-size: 0.625rem;
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

const FilterRow = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const ViewModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  background: #f5f5f4;
  padding: 0.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? 'white' : 'transparent'};
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.$active ? '#ed7734' : '#78716c'};
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};
  transition: all 0.2s ease;
  flex: 1;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:active {
    transform: scale(0.95);
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

interface MobileAdminOrdersProps {
  className?: string;
}

export default function MobileAdminOrders({ className }: MobileAdminOrdersProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<DynamoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'board' | 'timeline'>('list');

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      setLoading(true);
      try {
        const liveOrders = await MobileDataService.getAllOrders();
        if (isActive) {
          setOrders(liveOrders);
        }
      } catch (error) {
        console.error('Failed to load admin orders:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderDetails.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusFilters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  const getOrderStats = () => {
    return {
      total: orders.length,
      active: orders.filter(o => ['pending', 'picked_up'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'delivered').length,
      cancelled: 0 // DynamoDB Order doesn't have cancelled status
    };
  };

  const stats = getOrderStats();

  const formatTime = (timestamp: string | Date) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
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

  const handleOrderStatusUpdate = async (orderId: string, newStatus: 'pending' | 'picked_up' | 'delivered') => {
    try {
      await MobileDataService.updateOrderStatus(orderId, newStatus);
      
      // Update local state optimistically
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
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
        <Title>All Orders</Title>
        <Subtitle>Complete order management</Subtitle>
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
          <StatLabel>Done</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.cancelled}</StatValue>
          <StatLabel>Cancelled</StatLabel>
        </StatCard>
      </StatsRow>

      <Controls>
        <SearchBar>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search orders, customers, items..."
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

        <ViewModeToggle>
          <ViewModeButton 
            $active={viewMode === 'list'} 
            onClick={() => setViewMode('list')}
          >
            <List />
            <span>List</span>
          </ViewModeButton>
          <ViewModeButton 
            $active={viewMode === 'board'} 
            onClick={() => setViewMode('board')}
          >
            <LayoutGrid />
            <span>Board</span>
          </ViewModeButton>
          <ViewModeButton 
            $active={viewMode === 'timeline'} 
            onClick={() => setViewMode('timeline')}
          >
            <CalendarIcon />
            <span>Timeline</span>
          </ViewModeButton>
        </ViewModeToggle>
      </Controls>

      {viewMode === 'list' && (
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
                  <DetailRow>
                    <User size={14} />
                    {order.customerName}
                  </DetailRow>
                  <DetailRow>
                    <Package size={14} />
                    {order.orderDetails}
                  </DetailRow>
                  {order.driverName && (
                    <DetailRow>
                      <Truck size={14} />
                      Driver: {order.driverName}
                    </DetailRow>
                  )}
                  <DetailRow>
                    <Clock size={14} />
                    {new Date(order.createdAt).toLocaleString()}
                  </DetailRow>
                </OrderDetails>

                <OrderFooter>
                  <span style={{ fontSize: '0.875rem', color: '#78716c' }}>
                    {order.orderNumber}
                  </span>
                  <ActionButton onClick={() => router.push(`/mobile/orders/${order.id}`)}>
                    <Eye size={12} style={{ marginRight: '0.25rem' }} />
                    View Details
                  </ActionButton>
                </OrderFooter>
              </OrderCard>
            ))}
          </AnimatePresence>
        </OrdersList>
      )}

      {viewMode === 'board' && (
        <MobileOrderBoard orders={filteredOrders} onOrderUpdate={handleOrderStatusUpdate} />
      )}

      {viewMode === 'timeline' && (
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#78716c' }}>
          <CalendarIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p>Timeline view coming soon</p>
        </div>
      )}

      {filteredOrders.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
          No orders found matching your criteria.
        </div>
      )}
    </OrdersContainer>
  );
}