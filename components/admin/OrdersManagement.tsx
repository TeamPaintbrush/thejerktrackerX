import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { RefreshCw, Download } from 'lucide-react'
import { Order } from '../../lib/dynamodb'
import OrderList from '../OrderList'

interface OrdersManagementProps {
  orders: Order[]
  onRefresh: () => void
  onExportCSV: () => void
}

const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    margin: 0 -0.5rem;
  }
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
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
  white-space: nowrap;

  @media (max-width: 640px) {
    flex: 1;
    justify-content: center;
    min-width: 0;
  }

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

const OrdersManagement: React.FC<OrdersManagementProps> = ({
  orders,
  onRefresh,
  onExportCSV
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <SectionCard>
        <SectionHeader>
          <Heading $size="xl" $weight="bold" $mb="0" $color="#1c1917">
            All Orders
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
        <OrderList 
          orders={orders} 
          onExportCSV={onExportCSV} 
          onRefresh={onRefresh} 
        />
      </SectionCard>
    </motion.div>
  )
}

export default OrdersManagement