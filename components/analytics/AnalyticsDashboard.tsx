'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  MapPin,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { DynamoDBService, Order, Location } from '@/lib/dynamodb';

const DashboardContainer = styled.div`
  padding: 2rem;
  background: #fafaf9;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1c1917;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #78716c;
  font-size: 1rem;
  margin: 0;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #44403c;
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  color: #1c1917;
  cursor: pointer;
  min-width: 200px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const DateInput = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  color: #1c1917;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e7e5e4;
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const MetricIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 0.75rem;
  background: ${props => `${props.$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.$color};
  }
`;

const MetricTrend = styled.div<{ $isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  background: ${props => props.$isPositive ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$isPositive ? '#16a34a' : '#dc2626'};
  font-size: 0.75rem;
  font-weight: 600;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #78716c;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e7e5e4;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1c1917;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 20px;
    height: 20px;
    color: #ed7734;
  }
`;

const LocationComparisonTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #44403c;
  border-bottom: 2px solid #e7e5e4;
`;

const TableRow = styled.tr`
  &:hover {
    background: #fafaf9;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #1c1917;
  border-bottom: 1px solid #f5f5f4;
`;

const PerformanceBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f5f5f4;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const PerformanceFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${props => props.$width}%;
  background: ${props => props.$color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

const PeakHoursGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
`;

const HourCard = styled.div<{ $intensity: number }>`
  padding: 1rem;
  border-radius: 0.5rem;
  text-align: center;
  background: ${props => {
    if (props.$intensity > 80) return '#fee2e2';
    if (props.$intensity > 50) return '#fed7aa';
    if (props.$intensity > 20) return '#fef3c7';
    return '#f5f5f4';
  }};
  border: 1px solid ${props => {
    if (props.$intensity > 80) return '#fca5a5';
    if (props.$intensity > 50) return '#fdba74';
    if (props.$intensity > 20) return '#fde047';
    return '#e7e5e4';
  }};
`;

const HourTime = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #44403c;
  margin-bottom: 0.25rem;
`;

const HourOrders = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #1c1917;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #78716c;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    color: #d6d3d1;
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #44403c;
    margin: 0 0 0.5rem 0;
  }

  p {
    margin: 0;
  }
`;

interface AnalyticsDashboardProps {
  businessId: string;
}

interface LocationMetrics {
  locationId: string;
  locationName: string;
  totalOrders: number;
  revenue: number;
  averageOrderValue: number;
  completionRate: number;
}

interface HourlyData {
  hour: number;
  orders: number;
}

export default function AnalyticsDashboard({ businessId }: AnalyticsDashboardProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [businessId, selectedLocationId, dateRange, startDate, endDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [fetchedLocations, fetchedOrders] = await Promise.all([
        DynamoDBService.getLocationsByBusinessId(businessId),
        DynamoDBService.getAllOrders()
      ]);

      setLocations(fetchedLocations);
      
      // Filter orders by business
      let businessOrders = fetchedOrders.filter(order => 
        order.location?.businessId === businessId
      );

      // Filter by location if not 'all'
      if (selectedLocationId !== 'all') {
        businessOrders = businessOrders.filter(order => 
          order.location?.locationId === selectedLocationId
        );
      }

      // Filter by date range
      const now = new Date();
      let startFilter = new Date();
      
      if (dateRange === 'today') {
        startFilter.setHours(0, 0, 0, 0);
      } else if (dateRange === 'week') {
        startFilter.setDate(now.getDate() - 7);
      } else if (dateRange === 'month') {
        startFilter.setMonth(now.getMonth() - 1);
      } else if (dateRange === 'custom' && startDate && endDate) {
        startFilter = new Date(startDate);
        const endFilter = new Date(endDate);
        businessOrders = businessOrders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= startFilter && orderDate <= endFilter;
        });
      }

      if (dateRange !== 'custom') {
        businessOrders = businessOrders.filter(order => 
          new Date(order.createdAt) >= startFilter
        );
      }

      setOrders(businessOrders);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => 
    sum + (parseFloat(order.totalAmount) || 0), 0
  );

  const totalOrders = orders.length;

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const completedOrders = orders.filter(order => 
    order.status === 'delivered' || order.status === 'picked_up'
  ).length;

  const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

  // Calculate previous period for trends (simplified)
  const previousPeriodOrders = totalOrders * 0.85; // Mock comparison
  const ordersTrend = totalOrders - previousPeriodOrders;
  const revenueTrend = totalRevenue * 0.15; // Mock trend

  // Location comparison metrics
  const locationMetrics: LocationMetrics[] = locations.map(location => {
    const locationOrders = orders.filter(order => 
      order.location?.locationId === location.id
    );
    
    const locationRevenue = locationOrders.reduce((sum, order) => 
      sum + (parseFloat(order.totalAmount) || 0), 0
    );

    const locationCompleted = locationOrders.filter(order => 
      order.status === 'delivered' || order.status === 'picked_up'
    ).length;

    return {
      locationId: location.id,
      locationName: location.name,
      totalOrders: locationOrders.length,
      revenue: locationRevenue,
      averageOrderValue: locationOrders.length > 0 ? locationRevenue / locationOrders.length : 0,
      completionRate: locationOrders.length > 0 ? (locationCompleted / locationOrders.length) * 100 : 0
    };
  });

  // Peak hours analysis
  const hourlyData: HourlyData[] = Array.from({ length: 24 }, (_, hour) => {
    const hourOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate.getHours() === hour;
    });

    return { hour, orders: hourOrders.length };
  });

  const maxHourlyOrders = Math.max(...hourlyData.map(h => h.orders), 1);

  const maxRevenue = Math.max(...locationMetrics.map(l => l.revenue), 1);

  return (
    <DashboardContainer>
      <Header>
        <Title>Business Intelligence & Analytics</Title>
        <Subtitle>Real-time insights across all your restaurant locations</Subtitle>
      </Header>

      {/* Filters */}
      <FilterBar>
        <FilterGroup>
          <FilterLabel>Location</FilterLabel>
          <Select 
            value={selectedLocationId} 
            onChange={(e) => setSelectedLocationId(e.target.value)}
          >
            <option value="all">All Locations</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Time Period</FilterLabel>
          <Select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value as any)}
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </Select>
        </FilterGroup>

        {dateRange === 'custom' && (
          <>
            <FilterGroup>
              <FilterLabel>Start Date</FilterLabel>
              <DateInput 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>End Date</FilterLabel>
              <DateInput 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FilterGroup>
          </>
        )}
      </FilterBar>

      {!isLoading && orders.length > 0 ? (
        <>
          {/* Key Metrics */}
          <MetricsGrid>
            <MetricCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <MetricHeader>
                <MetricIcon $color="#16a34a">
                  <DollarSign />
                </MetricIcon>
                <MetricTrend $isPositive={revenueTrend >= 0}>
                  {revenueTrend >= 0 ? <TrendingUp /> : <TrendingDown />}
                  {Math.abs(revenueTrend).toFixed(0)}%
                </MetricTrend>
              </MetricHeader>
              <MetricValue>${totalRevenue.toFixed(2)}</MetricValue>
              <MetricLabel>Total Revenue</MetricLabel>
            </MetricCard>

            <MetricCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <MetricHeader>
                <MetricIcon $color="#ed7734">
                  <Package />
                </MetricIcon>
                <MetricTrend $isPositive={ordersTrend >= 0}>
                  {ordersTrend >= 0 ? <TrendingUp /> : <TrendingDown />}
                  {Math.abs(ordersTrend).toFixed(0)}
                </MetricTrend>
              </MetricHeader>
              <MetricValue>{totalOrders}</MetricValue>
              <MetricLabel>Total Orders</MetricLabel>
            </MetricCard>

            <MetricCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <MetricHeader>
                <MetricIcon $color="#3b82f6">
                  <DollarSign />
                </MetricIcon>
              </MetricHeader>
              <MetricValue>${averageOrderValue.toFixed(2)}</MetricValue>
              <MetricLabel>Avg Order Value</MetricLabel>
            </MetricCard>

            <MetricCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <MetricHeader>
                <MetricIcon $color="#8b5cf6">
                  <Activity />
                </MetricIcon>
              </MetricHeader>
              <MetricValue>{completionRate.toFixed(1)}%</MetricValue>
              <MetricLabel>Completion Rate</MetricLabel>
            </MetricCard>
          </MetricsGrid>

          {/* Charts Section */}
          <ChartsGrid>
            {/* Location Performance Comparison */}
            {selectedLocationId === 'all' && locations.length > 1 && (
              <ChartCard>
                <ChartTitle>
                  <BarChart3 />
                  Location Performance
                </ChartTitle>
                <LocationComparisonTable>
                  <thead>
                    <tr>
                      <TableHeader>Location</TableHeader>
                      <TableHeader>Orders</TableHeader>
                      <TableHeader>Revenue</TableHeader>
                      <TableHeader>Avg Order</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {locationMetrics
                      .sort((a, b) => b.revenue - a.revenue)
                      .map(metric => (
                        <TableRow key={metric.locationId}>
                          <TableCell>
                            <strong>{metric.locationName}</strong>
                            <PerformanceBar>
                              <PerformanceFill 
                                $width={(metric.revenue / maxRevenue) * 100}
                                $color="#ed7734"
                              />
                            </PerformanceBar>
                          </TableCell>
                          <TableCell>{metric.totalOrders}</TableCell>
                          <TableCell>${metric.revenue.toFixed(2)}</TableCell>
                          <TableCell>${metric.averageOrderValue.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                  </tbody>
                </LocationComparisonTable>
              </ChartCard>
            )}

            {/* Peak Hours */}
            <ChartCard>
              <ChartTitle>
                <Clock />
                Peak Hours Analysis
              </ChartTitle>
              <PeakHoursGrid>
                {hourlyData
                  .filter(h => h.hour >= 6 && h.hour <= 23) // Business hours
                  .map(hourData => (
                    <HourCard 
                      key={hourData.hour}
                      $intensity={(hourData.orders / maxHourlyOrders) * 100}
                    >
                      <HourTime>
                        {hourData.hour % 12 || 12}{hourData.hour >= 12 ? 'PM' : 'AM'}
                      </HourTime>
                      <HourOrders>{hourData.orders}</HourOrders>
                    </HourCard>
                  ))}
              </PeakHoursGrid>
            </ChartCard>
          </ChartsGrid>
        </>
      ) : !isLoading ? (
        <EmptyState>
          <BarChart3 />
          <h3>No Data Available</h3>
          <p>No orders found for the selected filters. Try adjusting your date range or location.</p>
        </EmptyState>
      ) : (
        <EmptyState>
          <Activity />
          <h3>Loading Analytics...</h3>
        </EmptyState>
      )}
    </DashboardContainer>
  );
}
