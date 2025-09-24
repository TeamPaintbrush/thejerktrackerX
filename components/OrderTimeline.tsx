'use client';

import React from 'react';
import { CheckCircle, Clock, Package, Truck, User } from 'lucide-react';
import styled from 'styled-components';

const TimelineContainer = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const TimelineHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const TimelineTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
`;

const OrderInfo = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const TimelineList = styled.div`
  padding: 1.5rem;
`;

const TimelineItem = styled.div<{ $isLast: boolean }>`
  position: relative;
  padding-bottom: ${({ $isLast }) => ($isLast ? '0' : '2rem')};
  
  ${({ $isLast }) =>
    !$isLast &&
    `
    &::after {
      content: '';
      position: absolute;
      left: 1rem;
      top: 3rem;
      bottom: 0;
      width: 2px;
      background: #e5e7eb;
    }
  `}
`;

const TimelineContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const TimelineIcon = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  flex-shrink: 0;
  z-index: 1;
  position: relative;
  
  ${({ $completed, theme }) =>
    $completed
      ? `
        background: ${theme.colors.accent[600]};
        color: white;
      `
      : `
        background: ${theme.colors.secondary[200]};
        color: ${theme.colors.secondary[500]};
      `}
`;

const TimelineDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const StepTitle = styled.h4<{ $completed: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  
  ${({ $completed, theme }) =>
    $completed
      ? `color: ${theme.colors.text.primary};`
      : `color: ${theme.colors.text.secondary};`}
`;

const StepDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0 0 0.5rem 0;
`;

const StepTimestamp = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 0.25rem;
`;

const StepDetails = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.muted};
  font-style: italic;
`;

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDetails: string;
  status: 'pending' | 'picked_up' | 'delivered';
  createdAt: Date;
  driverName?: string;
  driverCompany?: string;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}

interface OrderTimelineProps {
  order: Order;
}

const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const timelineSteps = [
    {
      id: 1,
      title: 'Order Created',
      description: 'Order placed and QR code generated',
      icon: Package,
      completed: true,
      timestamp: order.createdAt,
      details: order.customerName ? `Customer: ${order.customerName}` : undefined
    },
    {
      id: 2,
      title: 'Awaiting Pickup',
      description: 'Order ready for driver collection',
      icon: Clock,
      completed: true,
      timestamp: order.createdAt,
      details: 'QR code available for scanning'
    },
    {
      id: 3,
      title: 'Driver Arrived',
      description: 'Driver scanned QR code and checked in',
      icon: User,
      completed: order.status === 'picked_up',
      timestamp: order.pickedUpAt,
      details: order.driverName ? `Driver: ${order.driverName} (${order.driverCompany})` : undefined
    },
    {
      id: 4,
      title: 'Order Picked Up',
      description: 'Order collected by delivery driver',
      icon: Truck,
      completed: order.status === 'picked_up' || order.status === 'delivered',
      timestamp: order.pickedUpAt,
      details: (order.status === 'picked_up' || order.status === 'delivered') ? 'Pickup confirmed' : 'Pending pickup'
    },
    {
      id: 5,
      title: 'Order Delivered',
      description: 'Order delivered to customer',
      icon: CheckCircle,
      completed: order.status === 'delivered',
      timestamp: order.deliveredAt,
      details: order.status === 'delivered' ? 'Delivery confirmed' : 'Pending delivery'
    }
  ];

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(timestamp);
  };

  return (
    <TimelineContainer>
      <TimelineHeader>
        <TimelineTitle>Order Timeline</TimelineTitle>
        <OrderInfo>Order #{order.orderNumber}</OrderInfo>
      </TimelineHeader>
      
      <TimelineList>
        {timelineSteps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === timelineSteps.length - 1;
          
          return (
            <TimelineItem key={step.id} $isLast={isLast}>
              <TimelineContent>
                <TimelineIcon $completed={step.completed}>
                  {step.completed ? (
                    <CheckCircle size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                </TimelineIcon>
                
                <TimelineDetails>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <StepTitle $completed={step.completed}>
                      {step.title}
                    </StepTitle>
                    {step.timestamp && (
                      <StepTimestamp>
                        {formatTimestamp(step.timestamp)}
                      </StepTimestamp>
                    )}
                  </div>
                  
                  <StepDescription>
                    {step.description}
                  </StepDescription>
                  
                  {step.details && (
                    <StepDetails>
                      {step.details}
                    </StepDetails>
                  )}
                </TimelineDetails>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </TimelineList>
    </TimelineContainer>
  );
};

export default OrderTimeline;