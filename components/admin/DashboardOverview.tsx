import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { 
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { Order } from '../../lib/dynamodb'

interface DashboardStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  todaysRevenue: number
  averageOrderTime: string
  completionRate: number
}

interface DashboardOverviewProps {
  orders: Order[]
  stats: DashboardStats
  onRefresh: () => void
  isLoading?: boolean
}

const OverviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  position: relative;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 8px;
  }
`

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const StatTrend = styled.div<{ isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.isPositive ? '#10b981' : '#ef4444'};
`

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1;
`

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`

const RefreshButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  color: #9ca3af;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const LoadingSpinner = styled(motion.div)`
  display: inline-block;
`

const RecentOrdersSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
  margin-bottom: 2rem;
`

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
`

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`

const OrderInfo = styled.div`
  flex: 1;
  
  .order-number {
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.25rem;
  }
  
  .customer-name {
    font-size: 0.875rem;
    color: #6b7280;
  }
`

const OrderStatus = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7'
      case 'picked_up': return '#dbeafe'
      case 'delivered': return '#d1fae5'
      default: return '#f3f4f6'
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#92400e'
      case 'picked_up': return '#1e40af'
      case 'delivered': return '#065f46'
      default: return '#374151'
    }
  }};
`

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  orders,
  stats,
  onRefresh,
  isLoading = false
}) => {
  const recentOrders = orders.slice(0, 5)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <>
      <OverviewContainer>
        <StatCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon color="#3b82f6">
              <Package size={24} />
            </StatIcon>
            <StatTrend isPositive={true}>
              <TrendingUp size={16} />
              +12%
            </StatTrend>
          </StatHeader>
          <StatValue>{stats.totalOrders}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>

        <StatCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon color="#f59e0b">
              <Clock size={24} />
            </StatIcon>
            <StatTrend isPositive={false}>
              <TrendingDown size={16} />
              -3%
            </StatTrend>
          </StatHeader>
          <StatValue>{stats.pendingOrders}</StatValue>
          <StatLabel>Pending Orders</StatLabel>
        </StatCard>

        <StatCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon color="#10b981">
              <CheckCircle size={24} />
            </StatIcon>
            <StatTrend isPositive={true}>
              <TrendingUp size={16} />
              +8%
            </StatTrend>
          </StatHeader>
          <StatValue>{stats.completedOrders}</StatValue>
          <StatLabel>Completed Orders</StatLabel>
        </StatCard>

        <StatCard
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <RefreshButton onClick={onRefresh} disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={16} />
              </LoadingSpinner>
            ) : (
              <RefreshCw size={16} />
            )}
          </RefreshButton>
          <StatHeader>
            <StatIcon color="#8b5cf6">
              <TrendingUp size={24} />
            </StatIcon>
            <StatTrend isPositive={true}>
              <TrendingUp size={16} />
              +15%
            </StatTrend>
          </StatHeader>
          <StatValue>${stats.todaysRevenue.toFixed(2)}</StatValue>
          <StatLabel>Today&apos;s Revenue</StatLabel>
        </StatCard>
      </OverviewContainer>

      <RecentOrdersSection>
        <SectionTitle>Recent Orders</SectionTitle>
        {recentOrders.length > 0 ? (
          recentOrders.map((order) => (
            <OrderItem key={order.id}>
              <OrderInfo>
                <div className="order-number">#{order.orderNumber}</div>
                <div className="customer-name">{order.customerName}</div>
              </OrderInfo>
              <OrderStatus status={order.status}>
                {order.status.replace('_', ' ')}
              </OrderStatus>
            </OrderItem>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
            No recent orders found
          </div>
        )}
      </RecentOrdersSection>
    </>
  )
}

export default DashboardOverview
export type { DashboardStats }