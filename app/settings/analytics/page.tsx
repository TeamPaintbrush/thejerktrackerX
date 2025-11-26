'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { DynamoDBService, Location } from '@/lib/dynamodb'
import { BillingService } from '@/lib/billingService'
import { User } from '@/lib/dynamodb'
import { LoadingSpinner } from '@/components/Loading'
import BackButton from '@/components/settings/BackButton'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`

const PageHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
  
  h1 {
    margin: 0;
    color: #333;
    font-size: 28px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const FilterSection = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  
  select {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    color: #374151;
    font-size: 14px;
  }
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`

const MetricCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  .icon {
    font-size: 32px;
    margin-bottom: 10px;
  }
  
  .value {
    font-size: 32px;
    font-weight: 700;
    color: #ed7734;
    margin-bottom: 5px;
  }
  
  .label {
    font-size: 14px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 10px;
  }
  
  .change {
    font-size: 12px;
    font-weight: 600;
    
    &.positive {
      color: #10b981;
    }
    
    &.negative {
      color: #ef4444;
    }
    
    &.neutral {
      color: #6b7280;
    }
  }
`

const ChartSection = styled.div`
  margin-bottom: 30px;
`

const ChartHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    color: #333;
    font-size: 20px;
  }
`

const LocationTable = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  
  .header {
    background: #f9fafb;
    padding: 15px 20px;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 600;
    color: #374151;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
    gap: 20px;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  .row {
    padding: 15px 20px;
    border-bottom: 1px solid #f3f4f6;
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr;
    gap: 20px;
    align-items: center;
    transition: background 0.2s ease;
    
    &:hover {
      background: #f9fafb;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    @media (max-width: 768px) {
      display: block;
      padding: 20px;
      border-bottom: 2px solid #f3f4f6;
    }
  }
  
  .location-info {
    .name {
      font-weight: 600;
      color: #333;
      margin-bottom: 5px;
    }
    
    .address {
      font-size: 14px;
      color: #6b7280;
    }
    
    @media (max-width: 768px) {
      margin-bottom: 15px;
    }
  }
  
  .metric {
    text-align: center;
    
    .value {
      font-weight: 600;
      color: #333;
      margin-bottom: 2px;
    }
    
    .label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
    }
    
    @media (max-width: 768px) {
      display: inline-block;
      margin-right: 20px;
      text-align: left;
      
      .label {
        margin-right: 5px;
      }
      
      .value {
        display: inline;
      }
    }
  }
`

const StatusBadge = styled.span<{ status: 'active' | 'inactive' | 'pending' }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'active':
        return 'background: #dcfce7; color: #166534;'
      case 'inactive':
        return 'background: #fee2e2; color: #dc2626;'
      case 'pending':
        return 'background: #fef3c7; color: #92400e;'
      default:
        return 'background: #f3f4f6; color: #6b7280;'
    }
  }}
`

const SimpleChart = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 16px;
`

const ExportButton = styled.button`
  background: transparent;
  color: #ed7734;
  border: 2px solid #ed7734;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ed7734;
    color: white;
  }
`

interface LocationAnalytics {
  locationId: string;
  name: string;
  address: string;
  status: 'active' | 'inactive' | 'pending';
  ordersCount: number;
  revenue: number;
  averageOrderValue: number;
  peakHours: string;
  utilizationRate: number;
  monthlyGrowth: number;
  lastOrderAt?: Date;
}

export default function LocationAnalyticsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<Location[]>([])
  const [analytics, setAnalytics] = useState<LocationAnalytics[]>([])
  const [timeRange, setTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('orders')

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const user = session?.user as User
      const businessId = user.businessId || 'biz_' + user.id

      // Load locations
      const userLocations = await DynamoDBService.getLocationsByBusinessId(businessId)
      setLocations(userLocations)

      // Generate mock analytics data (in real app, this would come from your analytics service)
      const rangeMultiplier = timeRange === '7d' ? 0.25 : timeRange === '90d' ? 3 : 1

      const analyticsData: LocationAnalytics[] = userLocations.map(location => {
        const ordersCount = Math.round(location.billing.monthlyUsage * rangeMultiplier)
        const avgOrderValue = 35 + (Math.random() * 25) // $35-60 average
        const revenue = ordersCount * avgOrderValue
        
        return {
          locationId: location.id,
          name: location.name,
          address: `${location.address.city}, ${location.address.state}`,
          status: location.billing.isActive ? 'active' : 'inactive',
          ordersCount,
          revenue,
          averageOrderValue: avgOrderValue,
          peakHours: ['11AM-1PM', '6PM-8PM'][Math.floor(Math.random() * 2)],
          utilizationRate: Math.min(100, Math.random() * 100 * rangeMultiplier),
          monthlyGrowth: (Math.random() - 0.5) * 30, // -15% to +15%
          lastOrderAt: ordersCount > 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
        }
      })

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [session, timeRange])

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    loadAnalytics()
  }, [session, status, router, loadAnalytics])

  const calculateTotals = () => {
    return analytics.reduce((totals, location) => ({
      totalLocations: totals.totalLocations + 1,
      activeLocations: totals.activeLocations + (location.status === 'active' ? 1 : 0),
      totalOrders: totals.totalOrders + location.ordersCount,
      totalRevenue: totals.totalRevenue + location.revenue,
      averageUtilization: totals.averageUtilization + location.utilizationRate
    }), {
      totalLocations: 0,
      activeLocations: 0,
      totalOrders: 0,
      totalRevenue: 0,
      averageUtilization: 0
    })
  }

  const exportData = () => {
    const csvContent = [
      ['Location', 'Status', 'Orders', 'Revenue', 'Avg Order Value', 'Peak Hours', 'Utilization %', 'Growth %'],
      ...analytics.map(loc => [
        loc.name,
        loc.status,
        loc.ordersCount,
        loc.revenue.toFixed(2),
        loc.averageOrderValue.toFixed(2),
        loc.peakHours,
        loc.utilizationRate.toFixed(1),
        loc.monthlyGrowth.toFixed(1)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `location-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (status === 'loading' || loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    )
  }

  if (!session?.user) {
    return null
  }

  const totals = calculateTotals()
  const averageUtilization = totals.totalLocations > 0 ? totals.averageUtilization / totals.totalLocations : 0

  return (
    <Container>
      <ContentWrapper>
        <BackButton />
        <PageHeader>
          <h1>Location Analytics</h1>
          <FilterSection>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
            <ExportButton onClick={exportData}>
              Export Data
            </ExportButton>
          </FilterSection>
        </PageHeader>

        <MetricsGrid>
          <MetricCard>
            <div className="icon">🏪</div>
            <div className="value">{totals.totalLocations}</div>
            <div className="label">Total Locations</div>
            <div className="change neutral">
              {totals.activeLocations} active
            </div>
          </MetricCard>

          <MetricCard>
            <div className="icon">📦</div>
            <div className="value">{totals.totalOrders.toLocaleString()}</div>
            <div className="label">Total Orders</div>
            <div className="change positive">
              Across all locations
            </div>
          </MetricCard>

          <MetricCard>
            <div className="icon">💰</div>
            <div className="value">${totals.totalRevenue.toFixed(0)}</div>
            <div className="label">Total Revenue</div>
            <div className="change positive">
              Last {timeRange}
            </div>
          </MetricCard>

          <MetricCard>
            <div className="icon">📊</div>
            <div className="value">{averageUtilization.toFixed(1)}%</div>
            <div className="label">Avg Utilization</div>
            <div className={averageUtilization >= 75 ? 'change positive' : averageUtilization >= 50 ? 'change neutral' : 'change negative'}>
              {averageUtilization >= 75 ? 'Excellent' : averageUtilization >= 50 ? 'Good' : 'Needs attention'}
            </div>
          </MetricCard>
        </MetricsGrid>

        <ChartSection>
          <ChartHeader>
            <h3>Performance Overview</h3>
            <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)}>
              <option value="orders">Orders</option>
              <option value="revenue">Revenue</option>
              <option value="utilization">Utilization</option>
            </select>
          </ChartHeader>
          <SimpleChart>
            📈 Performance chart would be displayed here
            <br />
            (Integration with charting library like Chart.js or Recharts recommended)
          </SimpleChart>
        </ChartSection>

        <div>
          <h3 style={{ marginBottom: '20px', color: '#333' }}>Location Performance Details</h3>
          <LocationTable>
            <div className="header">
              <div>Location</div>
              <div>Status</div>
              <div>Orders</div>
              <div>Revenue</div>
              <div>Avg Order</div>
              <div>Utilization</div>
            </div>
            
            {analytics.map(location => (
              <div key={location.locationId} className="row">
                <div className="location-info">
                  <div className="name">{location.name}</div>
                  <div className="address">{location.address}</div>
                </div>
                
                <div className="metric">
                  <StatusBadge status={location.status}>
                    {location.status}
                  </StatusBadge>
                </div>
                
                <div className="metric">
                  <div className="value">{location.ordersCount}</div>
                  <div className="label">Orders</div>
                </div>
                
                <div className="metric">
                  <div className="value">${location.revenue.toFixed(0)}</div>
                  <div className="label">Revenue</div>
                </div>
                
                <div className="metric">
                  <div className="value">${location.averageOrderValue.toFixed(2)}</div>
                  <div className="label">Avg Order</div>
                </div>
                
                <div className="metric">
                  <div className="value">{location.utilizationRate.toFixed(1)}%</div>
                  <div className="label">Utilization</div>
                </div>
              </div>
            ))}
            
            {analytics.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No location data available. Add locations to see analytics.
              </div>
            )}
          </LocationTable>
        </div>
      </ContentWrapper>
    </Container>
  )
}