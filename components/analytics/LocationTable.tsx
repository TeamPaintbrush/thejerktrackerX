import React, { useState } from 'react'
import styled from 'styled-components'
import { Location } from '@/lib/dynamodb'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import Button from '@/components/ui/Button'

interface LocationTableProps {
  locations: Array<Location & {
    analytics: {
      orders: number
      revenue: number
      avgOrderValue: number
      lastOrderAt?: Date
    }
  }>
  onLocationSelect?: (locationId: string) => void
  sortBy?: 'name' | 'orders' | 'revenue' | 'avgOrderValue'
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: string) => void
}

const TableContainer = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`

const TableHeader = styled.thead`
  background: #f9fafb;
  
  th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #374151;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
    
    &.sortable {
      cursor: pointer;
      user-select: none;
      
      &:hover {
        background: #f3f4f6;
      }
      
      &::after {
        content: '↕';
        margin-left: 8px;
        color: #9ca3af;
        font-weight: normal;
      }
      
      &.sorted-asc::after {
        content: '↑';
        color: #3b82f6;
      }
      
      &.sorted-desc::after {
        content: '↓';
        color: #3b82f6;
      }
    }
    
    @media (max-width: 768px) {
      padding: 8px 12px;
      font-size: 11px;
    }
  }
`

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.15s ease;
    
    &:hover {
      background: #f9fafb;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  td {
    padding: 16px;
    color: #374151;
    
    @media (max-width: 768px) {
      padding: 12px;
    }
  }
`

const LocationInfo = styled.div`
  .location-name {
    font-weight: 600;
    color: #111827;
    margin-bottom: 4px;
  }
  
  .location-address {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.4;
  }
`

const MetricCell = styled.div`
  text-align: right;
  
  .metric-value {
    font-weight: 600;
    color: #111827;
    font-size: 16px;
  }
  
  .metric-label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }
`

const ActionCell = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .empty-title {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 8px;
  }
  
  .empty-description {
    font-size: 14px;
    line-height: 1.5;
  }
`

const LoadingRow = styled.tr`
  td {
    padding: 40px 16px;
    text-align: center;
    color: #6b7280;
  }
`

interface SortableHeaderProps {
  field: string
  label: string
  currentSort?: string
  sortOrder?: 'asc' | 'desc'
  onSort: (field: string) => void
}

function SortableHeader({ field, label, currentSort, sortOrder, onSort }: SortableHeaderProps) {
  const handleClick = () => onSort(field)
  
  const getSortClass = () => {
    if (currentSort !== field) return 'sortable'
    return `sortable sorted-${sortOrder}`
  }

  return (
    <th className={getSortClass()} onClick={handleClick}>
      {label}
    </th>
  )
}

export default function LocationTable({
  locations,
  onLocationSelect,
  sortBy,
  sortOrder = 'asc',
  onSort = () => {}
}: LocationTableProps) {
  const [isLoading] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusType = (location: Location) => {
    if (!location.settings.isActive) return 'inactive'
    if (location.verification.status === 'verified') return 'active'
    if (location.verification.status === 'pending') return 'pending'
    return 'error'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <h3>Location Performance</h3>
        </CardHeader>
        <CardContent>
          <TableContainer>
            <Table>
              <TableBody>
                <LoadingRow>
                  <td colSpan={6}>Loading location data...</td>
                </LoadingRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    )
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3>Location Performance</h3>
        </CardHeader>
        <CardContent>
          <EmptyState>
            <div className="empty-icon">📍</div>
            <div className="empty-title">No Locations Found</div>
            <div className="empty-description">
              Add your first location to start tracking performance metrics and analytics.
            </div>
          </EmptyState>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3>Location Performance</h3>
        <p>Analytics and metrics for each of your restaurant locations</p>
      </CardHeader>
      
      <CardContent>
        <TableContainer>
          <Table>
            <TableHeader>
              <tr>
                <SortableHeader
                  field="name"
                  label="Location"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
                <th>Status</th>
                <SortableHeader
                  field="orders"
                  label="Orders"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="revenue"
                  label="Revenue"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
                <SortableHeader
                  field="avgOrderValue"
                  label="Avg. Order"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSort}
                />
                <th>Last Order</th>
                <th>Actions</th>
              </tr>
            </TableHeader>
            
            <TableBody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td>
                    <LocationInfo>
                      <div className="location-name">{location.name}</div>
                      <div className="location-address">
                        {location.address.street}, {location.address.city}, {location.address.state}
                      </div>
                    </LocationInfo>
                  </td>
                  
                  <td>
                    <StatusBadge status={getStatusType(location)}>
                      {location.settings.isActive ? location.verification.status : 'inactive'}
                    </StatusBadge>
                  </td>
                  
                  <td>
                    <MetricCell>
                      <div className="metric-value">
                        {location.analytics.orders.toLocaleString()}
                      </div>
                      <div className="metric-label">Orders</div>
                    </MetricCell>
                  </td>
                  
                  <td>
                    <MetricCell>
                      <div className="metric-value">
                        {formatCurrency(location.analytics.revenue)}
                      </div>
                      <div className="metric-label">Revenue</div>
                    </MetricCell>
                  </td>
                  
                  <td>
                    <MetricCell>
                      <div className="metric-value">
                        {formatCurrency(location.analytics.avgOrderValue)}
                      </div>
                      <div className="metric-label">Per Order</div>
                    </MetricCell>
                  </td>
                  
                  <td>
                    {location.analytics.lastOrderAt ? (
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>
                        {formatDate(location.analytics.lastOrderAt)}
                      </div>
                    ) : (
                      <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                        No orders yet
                      </div>
                    )}
                  </td>
                  
                  <td>
                    <ActionCell>
                      {onLocationSelect && (
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => onLocationSelect(location.id)}
                        >
                          View Details
                        </Button>
                      )}
                    </ActionCell>
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}