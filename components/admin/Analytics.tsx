'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users,
  Package,
  DollarSign,
  Clock,
  Download,
  Calendar,
  Eye,
  Activity
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

const ExportButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #ed7734, #f59e0b);
  }
`;

const MetricIcon = styled.div<{ color: string }>`
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

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const MetricChange = styled.div<{ positive?: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const ChartsSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const DateFilter = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  color: #6b7280;
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
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ChartSubtitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  background: linear-gradient(135deg, rgba(237, 119, 52, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(237, 119, 52, 0.2);
  gap: 0.75rem;
`;

const ChartIcon = styled.div`
  color: #ed7734;
`;

const ChartText = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
`;

const InsightsSection = styled.div`
  margin-bottom: 2rem;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const InsightCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  border-left: 4px solid #ed7734;
`;

const InsightIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(237, 119, 52, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    width: 20px;
    height: 20px;
    color: #ed7734;
  }
`;

const InsightTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const InsightText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
`;

const LoadingState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
`;

interface AnalyticsProps {
  className?: string;
}

export default function Analytics({ className }: AnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const metrics = [
    { 
      icon: Package, 
      label: 'Total Orders', 
      value: '1,247', 
      change: '+12%', 
      positive: true,
      color: '#3b82f6'
    },
    { 
      icon: Users, 
      label: 'Active Users', 
      value: '342', 
      change: '+8%', 
      positive: true,
      color: '#10b981'
    },
    { 
      icon: DollarSign, 
      label: 'Revenue', 
      value: '$24.7K', 
      change: '+15%', 
      positive: true,
      color: '#ed7734'
    },
    { 
      icon: Clock, 
      label: 'Avg Response', 
      value: '2.3m', 
      change: '-5%', 
      positive: false,
      color: '#f59e0b'
    }
  ];

  const insights = [
    {
      icon: TrendingUp,
      title: 'Peak Hours Performance',
      text: 'Order volume increases 45% between 12 PM - 2 PM. Consider optimizing staff during these hours for better efficiency.'
    },
    {
      icon: Users,
      title: 'User Engagement',
      text: 'Mobile app usage has grown 23% this month. Push notifications show 18% higher engagement rates.'
    },
    {
      icon: DollarSign,
      title: 'Revenue Trends',
      text: 'Weekend orders average 35% higher value. Upselling strategies are working effectively.'
    },
    {
      icon: Activity,
      title: 'System Performance',
      text: 'Average order processing time reduced by 12%. Infrastructure improvements showing positive impact.'
    },
    {
      icon: Eye,
      title: 'Customer Retention',
      text: 'Repeat customer rate increased to 68%. Loyalty program driving strong engagement.'
    },
    {
      icon: BarChart3,
      title: 'Growth Forecast',
      text: 'Projected 28% growth in Q2 based on current trends. Expansion opportunities identified.'
    }
  ];

  if (loading) {
    return (
      <Container className={className}>
        <Header>
          <Title>Loading Analytics...</Title>
        </Header>
      </Container>
    );
  }

  return (
    <Container className={className}>
      <Header>
        <TitleRow>
          <div>
            <Title>Analytics Dashboard</Title>
            <Subtitle>System performance & business insights</Subtitle>
          </div>
          <ExportButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => alert('Export functionality coming soon!')}
          >
            <Download size={18} />
            Export Report
          </ExportButton>
        </TitleRow>
      </Header>

      <MetricsGrid>
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MetricIcon color={metric.color}>
              <metric.icon />
            </MetricIcon>
            <MetricValue>{metric.value}</MetricValue>
            <MetricLabel>{metric.label}</MetricLabel>
            <MetricChange positive={metric.positive}>
              {metric.positive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {metric.change}
            </MetricChange>
          </MetricCard>
        ))}
      </MetricsGrid>

      <ChartsSection>
        <SectionHeader>
          <SectionTitle>Performance Charts</SectionTitle>
          <DateFilter>
            <Calendar size={16} />
            <FilterButton active={timeRange === '24h'} onClick={() => setTimeRange('24h')}>
              24h
            </FilterButton>
            <FilterButton active={timeRange === '7d'} onClick={() => setTimeRange('7d')}>
              7 days
            </FilterButton>
            <FilterButton active={timeRange === '30d'} onClick={() => setTimeRange('30d')}>
              30 days
            </FilterButton>
            <FilterButton active={timeRange === '90d'} onClick={() => setTimeRange('90d')}>
              90 days
            </FilterButton>
          </DateFilter>
        </SectionHeader>

        <ChartsGrid>
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ChartHeader>
              <div>
                <ChartTitle>Order Volume Trends</ChartTitle>
                <ChartSubtitle>Daily order counts over time</ChartSubtitle>
              </div>
            </ChartHeader>
            <ChartPlaceholder>
              <ChartIcon>
                <BarChart3 size={48} />
              </ChartIcon>
              <ChartText>Chart visualization coming soon</ChartText>
            </ChartPlaceholder>
          </ChartCard>

          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <ChartHeader>
              <div>
                <ChartTitle>Revenue Breakdown</ChartTitle>
                <ChartSubtitle>Revenue by category and time</ChartSubtitle>
              </div>
            </ChartHeader>
            <ChartPlaceholder>
              <ChartIcon>
                <DollarSign size={48} />
              </ChartIcon>
              <ChartText>Revenue analytics chart</ChartText>
            </ChartPlaceholder>
          </ChartCard>

          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <ChartHeader>
              <div>
                <ChartTitle>User Activity</ChartTitle>
                <ChartSubtitle>Active users and engagement metrics</ChartSubtitle>
              </div>
            </ChartHeader>
            <ChartPlaceholder>
              <ChartIcon>
                <Users size={48} />
              </ChartIcon>
              <ChartText>User engagement chart</ChartText>
            </ChartPlaceholder>
          </ChartCard>

          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <ChartHeader>
              <div>
                <ChartTitle>Response Time</ChartTitle>
                <ChartSubtitle>Average processing times</ChartSubtitle>
              </div>
            </ChartHeader>
            <ChartPlaceholder>
              <ChartIcon>
                <Clock size={48} />
              </ChartIcon>
              <ChartText>Performance metrics chart</ChartText>
            </ChartPlaceholder>
          </ChartCard>
        </ChartsGrid>
      </ChartsSection>

      <InsightsSection>
        <SectionHeader>
          <SectionTitle>Key Insights & Recommendations</SectionTitle>
        </SectionHeader>
        <InsightsGrid>
          {insights.map((insight, index) => (
            <InsightCard
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <InsightIcon>
                <insight.icon />
              </InsightIcon>
              <InsightTitle>{insight.title}</InsightTitle>
              <InsightText>{insight.text}</InsightText>
            </InsightCard>
          ))}
        </InsightsGrid>
      </InsightsSection>
    </Container>
  );
}
