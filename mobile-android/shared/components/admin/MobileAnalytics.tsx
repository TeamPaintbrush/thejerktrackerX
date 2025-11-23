'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Clock,
  Zap,
  Eye,
  Download
} from 'lucide-react';

interface MobileAnalyticsProps {
  className?: string;
}

const AnalyticsContainer = styled.div`
  padding: 0.5rem;
  padding-bottom: 120px; /* Space for bottom navigation */
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(237, 119, 52, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: #ed7734;
  }
`;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const MetricChange = styled.div<{ $positive?: boolean }>`
  font-size: 0.75rem;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const ChartsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

const ChartCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  margin-bottom: 1rem;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ChartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ChartPlaceholder = styled.div`
  height: 200px;
  background: rgba(237, 119, 52, 0.05);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(237, 119, 52, 0.2);
`;

const ChartText = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const ExportButton = styled(motion.button)`
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
`;

const InsightsSection = styled.div`
  margin-bottom: 2rem;
`;

const InsightCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  margin-bottom: 0.75rem;
`;

const InsightTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const InsightText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

interface AnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  metrics: {
    totalOrders: number;
    ordersThisMonth: number;
    ordersChange: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueChange: number;
    totalCustomers: number;
    newCustomersThisMonth: number;
    customersChange: number;
    avgOrderValue: number;
    avgCompletionMinutes: number;
    activeDrivers: number;
    totalLocations: number;
  };
  charts: {
    statusCounts: Record<string, number>;
    ordersByDay: Array<{ date: string; orders: number }>;
    revenueByDay: Array<{ date: string; revenue: number }>;
    locationStats: Array<{ id: string; name: string; orders: number; revenue: number }>;
  };
}

export default function MobileAnalytics({ className }: MobileAnalyticsProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      const data = await response.json();
      
      if (data.success && data.data) {
        setAnalyticsData(data.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <AnalyticsContainer className={className}>
        <Header>
          <Title>Loading Analytics...</Title>
        </Header>
      </AnalyticsContainer>
    );
  }

  if (error || !analyticsData) {
    return (
      <AnalyticsContainer className={className}>
        <Header>
          <Title>Analytics Dashboard</Title>
          <Subtitle>{error || 'No data available'}</Subtitle>
        </Header>
      </AnalyticsContainer>
    );
  }

  const metrics = [
    { 
      icon: Package, 
      label: 'Total Orders', 
      value: analyticsData.metrics.totalOrders.toLocaleString(), 
      change: formatChange(analyticsData.metrics.ordersChange), 
      positive: analyticsData.metrics.ordersChange >= 0 
    },
    { 
      icon: Users, 
      label: 'Active Users', 
      value: analyticsData.metrics.totalCustomers.toLocaleString(), 
      change: formatChange(analyticsData.metrics.customersChange), 
      positive: analyticsData.metrics.customersChange >= 0 
    },
    { 
      icon: DollarSign, 
      label: 'Revenue', 
      value: formatCurrency(analyticsData.metrics.totalRevenue), 
      change: formatChange(analyticsData.metrics.revenueChange), 
      positive: analyticsData.metrics.revenueChange >= 0 
    },
    { 
      icon: Clock, 
      label: 'Avg Completion', 
      value: `${analyticsData.metrics.avgCompletionMinutes}m`, 
      change: `${analyticsData.metrics.activeDrivers} drivers`, 
      positive: true 
    }
  ];

  const insights = [
    {
      title: 'This Month Performance',
      text: `${analyticsData.metrics.ordersThisMonth} orders processed this month with ${formatCurrency(analyticsData.metrics.revenueThisMonth)} in revenue.`
    },
    {
      title: 'User Growth',
      text: `${analyticsData.metrics.newCustomersThisMonth} new customers joined this month. Total customer base: ${analyticsData.metrics.totalCustomers}.`
    },
    {
      title: 'Average Order Value',
      text: `Current average order value is ${formatCurrency(analyticsData.metrics.avgOrderValue)}. ${analyticsData.metrics.activeDrivers} drivers are currently active.`
    }
  ];

  return (
    <AnalyticsContainer className={className}>
      <Header>
        <Title>Analytics Dashboard</Title>
        <Subtitle>System performance & insights</Subtitle>
      </Header>

      <MetricsGrid>
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricIcon>
              <metric.icon />
            </MetricIcon>
            <MetricValue>{metric.value}</MetricValue>
            <MetricLabel>{metric.label}</MetricLabel>
            <MetricChange $positive={metric.positive}>
              {metric.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {metric.change}
            </MetricChange>
          </MetricCard>
        ))}
      </MetricsGrid>

      <ChartsSection>
        <SectionTitle>Performance Charts</SectionTitle>
        
        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <ChartHeader>
            <ChartTitle>Order Volume Trends</ChartTitle>
          </ChartHeader>
          <ChartPlaceholder>
            <ChartText>Chart visualization coming soon</ChartText>
          </ChartPlaceholder>
        </ChartCard>

        <ChartCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChartHeader>
            <ChartTitle>Revenue Breakdown</ChartTitle>
          </ChartHeader>
          <ChartPlaceholder>
            <ChartText>Revenue analytics chart</ChartText>
          </ChartPlaceholder>
        </ChartCard>
      </ChartsSection>

      <InsightsSection>
        <SectionTitle>Key Insights</SectionTitle>
        {insights.map((insight, index) => (
          <InsightCard
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <InsightTitle>{insight.title}</InsightTitle>
            <InsightText>{insight.text}</InsightText>
          </InsightCard>
        ))}
      </InsightsSection>

      <ExportButton
        whileTap={{ scale: 0.98 }}
        onClick={() => addToast({
          type: 'info',
          title: 'Coming Soon',
          message: 'Export report feature is in development',
          duration: 3000
        })}
      >
        <Download size={16} />
        Export Report
      </ExportButton>
    </AnalyticsContainer>
  );
}