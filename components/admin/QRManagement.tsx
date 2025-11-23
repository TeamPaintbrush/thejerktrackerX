import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  RefreshCw, 
  Download, 
  Package, 
  Clock, 
  CheckCircle, 
  Search, 
  ExternalLink,
  QrCode
} from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import { Order } from '../../lib/dynamodb'

interface QRManagementProps {
  orders: Order[]
  onRefresh: () => void
  onExportCSV: () => void
  onCreateOrder: () => void
}

const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`

const Heading = styled.h3<{
  $size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  $weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  $mb?: string
  $color?: string
}>`
  margin: 0;
  margin-bottom: ${props => props.$mb || '0'};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm': return '0.875rem'
      case 'md': return '1rem'
      case 'lg': return '1.125rem'
      case 'xl': return '1.25rem'
      case 'xxl': return '1.5rem'
      default: return '1rem'
    }
  }};
  font-weight: ${props => {
    switch (props.$weight) {
      case 'normal': return '400'
      case 'medium': return '500'
      case 'semibold': return '600'
      case 'bold': return '700'
      default: return '400'
    }
  }};
  color: ${props => props.$color || '#111827'};
  line-height: 1.2;
`

const Text = styled.p<{
  $size?: 'xs' | 'sm' | 'base' | 'lg'
  $weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  $color?: string
  $mb?: string
}>`
  margin: 0;
  margin-bottom: ${props => props.$mb || '0'};
  font-size: ${props => {
    switch (props.$size) {
      case 'xs': return '0.75rem'
      case 'sm': return '0.875rem'
      case 'lg': return '1.125rem'
      default: return '1rem'
    }
  }};
  font-weight: ${props => {
    switch (props.$weight) {
      case 'medium': return '500'
      case 'semibold': return '600'
      case 'bold': return '700'
      default: return '400'
    }
  }};
  color: ${props => props.$color || '#374151'};
  line-height: 1.5;
`

const ActionButtonsGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  &:active {
    transform: translateY(1px);
  }
`

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    border-color: #2563eb;
  }

  &:active {
    transform: translateY(1px);
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`

const StatCard = styled.div`
  background: white;
  border: 1px solid #f3f4f6;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.color) {
      case 'primary': return '#dbeafe'
      case 'secondary': return '#fef3c7'
      case 'success': return '#d1fae5'
      default: return '#f3f4f6'
    }
  }};
  color: ${props => {
    switch (props.color) {
      case 'primary': return '#1e40af'
      case 'secondary': return '#92400e'
      case 'success': return '#065f46'
      default: return '#374151'
    }
  }};
`

const StatContent = styled.div`
  h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1.5rem;
    font-weight: bold;
    color: #111827;
  }
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }
`

const FiltersSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`

const QRSearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    width: 16px;
    height: 16px;
  }
`

const QRSearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const QRGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`

const QROrderCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`

const QRCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`

const OrderInfo = styled.div`
  h3 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
  
  p {
    margin: 0 0 0.25rem 0;
    font-size: 0.875rem;
    color: #6b7280;
  }
`

const StatusBadge = styled.span<{ status: string }>`
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

const QRCodeSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #fafafa;
  border-radius: 0.5rem;
`

const Button = styled.button<{
  $variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  $size?: 'sm' | 'md' | 'lg'
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: ${props => {
    switch (props.$size) {
      case 'sm': return '0.5rem 0.75rem'
      case 'lg': return '0.75rem 1.5rem'
      default: return '0.625rem 1rem'
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm': return '0.875rem'
      case 'lg': return '1rem'
      default: return '0.875rem'
    }
  }};
  font-weight: 500;
  border-radius: 0.5rem;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  
  background: ${props => {
    switch (props.$variant) {
      case 'primary': return '#3b82f6'
      case 'secondary': return '#f3f4f6'
      case 'outline': return 'transparent'
      case 'danger': return '#ef4444'
      default: return '#3b82f6'
    }
  }};
  
  color: ${props => {
    switch (props.$variant) {
      case 'primary': return 'white'
      case 'secondary': return '#374151'
      case 'outline': return '#374151'
      case 'danger': return 'white'
      default: return 'white'
    }
  }};
  
  border-color: ${props => {
    switch (props.$variant) {
      case 'primary': return '#3b82f6'
      case 'secondary': return '#d1d5db'
      case 'outline': return '#d1d5db'
      case 'danger': return '#ef4444'
      default: return '#3b82f6'
    }
  }};
  
  &:hover {
    background: ${props => {
      switch (props.$variant) {
        case 'primary': return '#2563eb'
        case 'secondary': return '#e5e7eb'
        case 'outline': return '#f9fafb'
        case 'danger': return '#dc2626'
        default: return '#2563eb'
      }
    }};
    
    border-color: ${props => {
      switch (props.$variant) {
        case 'primary': return '#2563eb'
        case 'secondary': return '#9ca3af'
        case 'outline': return '#9ca3af'
        case 'danger': return '#dc2626'
        default: return '#2563eb'
      }
    }};
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const QRManagement: React.FC<QRManagementProps> = ({
  orders,
  onRefresh,
  onExportCSV,
  onCreateOrder
}) => {
  const [qrSearchTerm, setQrSearchTerm] = useState('')
  const [qrStatusFilter, setQrStatusFilter] = useState('all')
  const [qrSortBy, setQrSortBy] = useState('newest')

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = qrSearchTerm === '' || 
        order.orderNumber.toLowerCase().includes(qrSearchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(qrSearchTerm.toLowerCase()));
      const matchesStatus = qrStatusFilter === 'all' || order.status === qrStatusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (qrSortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'order_number':
          return a.orderNumber.localeCompare(b.orderNumber);
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <SectionCard>
        <SectionHeader>
          <Heading $size="xl" $weight="bold" $mb="0" $color="#1c1917">
            QR Code Tracking
          </Heading>
          <ActionButtonsGroup>
            <RefreshButton onClick={onRefresh}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </RefreshButton>
            <ExportButton onClick={onExportCSV}>
              <Download size={16} />
              <span>Export CSV</span>
            </ExportButton>
          </ActionButtonsGroup>
        </SectionHeader>

        {/* Stats */}
        <StatsGrid style={{ marginBottom: '1.5rem' }}>
          <StatCard>
            <StatIcon color="primary">
              <Package size={24} />
            </StatIcon>
            <StatContent>
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </StatContent>
          </StatCard>
          <StatCard>
            <StatIcon color="secondary">
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              <h3>{orders.filter(order => order.status === 'pending').length}</h3>
              <p>Pending Pickup</p>
            </StatContent>
          </StatCard>
          <StatCard>
            <StatIcon color="success">
              <CheckCircle size={24} />
            </StatIcon>
            <StatContent>
              <h3>{orders.filter(order => order.status === 'picked_up').length}</h3>
              <p>Completed</p>
            </StatContent>
          </StatCard>
        </StatsGrid>

        {/* Filters */}
        <FiltersSection>
          <QRSearchContainer>
            <Search />
            <QRSearchInput
              type="text"
              placeholder="Search orders..."
              value={qrSearchTerm}
              onChange={(e) => setQrSearchTerm(e.target.value)}
            />
          </QRSearchContainer>
          <FilterSelect
            value={qrStatusFilter}
            onChange={(e) => setQrStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="picked_up">Picked Up</option>
            <option value="delivered">Delivered</option>
          </FilterSelect>
          <FilterSelect
            value={qrSortBy}
            onChange={(e) => setQrSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="order_number">Order Number</option>
          </FilterSelect>
        </FiltersSection>

        {/* Orders Grid */}
        {filteredOrders.length > 0 ? (
          <QRGrid>
            {filteredOrders.map((order) => (
              <QROrderCard key={order.id}>
                <QRCardHeader>
                  <OrderInfo>
                    <h3>Order #{order.orderNumber}</h3>
                    <p>{order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()}</p>
                    {order.customerName && <p>Customer: {order.customerName}</p>}
                  </OrderInfo>
                  <StatusBadge status={order.status}>
                    {order.status.replace('_', ' ')}
                  </StatusBadge>
                </QRCardHeader>

                <QRCodeSection>
                  <QRCodeCanvas
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/orders/${order.id}`}
                    size={120}
                    level="M"
                    includeMargin={true}
                  />
                </QRCodeSection>

                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <Text $size="sm" $color="#78716c">
                    Scan to track this order
                  </Text>
                </div>

                {order.driverName && (
                  <div style={{ padding: '1rem', background: '#f9f9f8', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                    <Text $size="sm" $weight="semibold" $color="#1c1917" $mb="0.25rem">Driver Information</Text>
                    <Text $size="sm" $color="#78716c">Name: {order.driverName}</Text>
                    {order.driverCompany && (
                      <Text $size="sm" $color="#78716c">Company: {order.driverCompany}</Text>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                    <Button $variant="outline" style={{ width: '100%', fontSize: '0.875rem' }}>
                      <ExternalLink size={16} />
                      View Details
                    </Button>
                  </Link>
                </div>
              </QROrderCard>
            ))}
          </QRGrid>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#78716c' }}>
            <QrCode size={48} style={{ marginBottom: '1rem', color: '#d6d3d1' }} />
            <Heading $size="lg" $weight="semibold" $mb="0.5rem" $color="#44403c">No Orders Found</Heading>
            <Text $size="base" $color="#78716c" $mb="1.5rem">
              Create your first order to generate QR codes for tracking.
            </Text>
            <Button $variant="primary" onClick={onCreateOrder}>
              Create Order
            </Button>
          </div>
        )}
      </SectionCard>
    </motion.div>
  )
}

export default QRManagement