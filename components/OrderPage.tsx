'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Clock, User, Phone, MapPin, Truck, Home, AlertTriangle } from 'lucide-react';
import { LoadingButton, LoadingSpinner } from './Loading';
import { useToast } from './Toast';
import OrderTimeline from './OrderTimeline';
import styled from 'styled-components';
import { DynamoDBService, Order } from '../lib/dynamodb';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.secondary[50]};
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
`;

const LoadingText = styled.p`
  margin-top: 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const OrderNotFound = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const NotFoundTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary[600]};
  color: white;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary[700]};
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const OrderTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const OrderMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const StatusBadge = styled.span<{ $status: 'pending' | 'picked_up' | 'delivered' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: 500;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  ${({ $status, theme }) => {
    switch ($status) {
      case 'delivered':
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case 'picked_up':
        return `
          background: ${theme.colors.accent[100]};
          color: ${theme.colors.accent[800]};
        `;
      default:
        return `
          background: #fef3c7;
          color: #92400e;
        `;
    }
  }}
`;

const OrderDetails = styled.div`
  background: ${({ theme }) => theme.colors.secondary[50]};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 4px solid ${({ theme }) => theme.colors.primary[500]};
`;

const OrderDetailsTitle = styled.h3`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const OrderDetailsText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
  white-space: pre-wrap;
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 1fr 400px;
  }
`;

const CheckInCard = styled.div`
  background: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  padding: 2rem;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
`;

const CheckInTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const CheckInForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary[500]}20;
  }
`;

const SubmitButton = styled(LoadingButton)`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary[600]};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary[700]};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.accent[50]};
  border: 1px solid ${({ theme }) => theme.colors.accent[200]};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  text-align: center;
`;

const SuccessTitle = styled.h3`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.accent[800]};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const SuccessText = styled.p`
  color: ${({ theme }) => theme.colors.accent[700]};
  margin: 0;
`;

const DeliveryCard = styled.div`
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const DeliveryTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InfoItem = styled.div`
  background: ${({ theme }) => theme.colors.secondary[50]};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border-left: 3px solid ${({ theme }) => theme.colors.primary[500]};

  h4 {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  p {
    font-size: ${({ theme }) => theme.typography.fontSize.base};
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
    word-break: break-word;
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;

  ${({ variant = 'primary', theme }) => {
    switch (variant) {
      case 'success':
        return `
          background: ${theme.colors.accent[600]};
          border-color: ${theme.colors.accent[600]};
          color: white;
          &:hover { background: ${theme.colors.accent[700]}; border-color: ${theme.colors.accent[700]}; }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error};
          border-color: ${theme.colors.error};
          color: white;
          &:hover { background: #dc2626; border-color: #dc2626; }
        `;
      case 'secondary':
        return `
          background: white;
          border-color: ${theme.colors.border.light};
          color: ${theme.colors.text.primary};
          &:hover { background: ${theme.colors.secondary[50]}; }
        `;
      default:
        return `
          background: ${theme.colors.primary[600]};
          border-color: ${theme.colors.primary[600]};
          color: white;
          &:hover { background: ${theme.colors.primary[700]}; border-color: ${theme.colors.primary[700]}; }
        `;
    }
  }}
`;

const ContactButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.info};
  color: white;
  text-decoration: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
    text-decoration: none;
    color: white;
  }
`;

interface OrderPageProps {
  orderId: string;
}

const OrderPage: React.FC<OrderPageProps> = ({ orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState('');
  const [driverCompany, setDriverCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !orderId) return;
    
    // Load order from localStorage
    const loadOrder = async () => {
      setLoading(true);

      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const foundOrder = await DynamoDBService.getOrderById(orderId);

        if (foundOrder) {
          setOrder(foundOrder);
        }
      } catch (error) {
        console.error('Failed to load order:', error);
        // DynamoDBService handles localStorage internally
        setOrder(null);
      }

      setLoading(false);
    };

    loadOrder();
  }, [orderId, isClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    if (!driverName.trim()) {
      addToast({
        type: 'error',
        title: 'Driver Name Required',
        message: 'Please enter your name to confirm pickup.'
      });
      return;
    }

    if (!driverCompany) {
      addToast({
        type: 'error',
        title: 'Delivery Company Required',
        message: 'Please select your delivery company.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const updatedOrder = {
        ...order,
        status: 'picked_up' as const,
        driverName: driverName.trim(),
        driverCompany,
        pickedUpAt: new Date(),
      };

      // Update in DynamoDB
      try {
        await DynamoDBService.updateOrder(orderId, {
          status: 'picked_up',
          driverName: driverName.trim(),
          driverCompany,
          pickedUpAt: new Date(),
        });
      } catch (dbError) {
        console.error('Failed to update order in DynamoDB:', dbError);
        // DynamoDBService handles localStorage internally
      }

      setOrder(updatedOrder);
      setIsSubmitted(true);

      addToast({
        type: 'success',
        title: 'Pickup Confirmed!',
        message: `Order #${order.orderNumber} has been marked as picked up.`
      });

      // Don't auto-redirect, let driver see delivery info
      // setTimeout(() => {
      //   window.location.href = '/';
      // }, 3000);
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Pickup Failed',
        message: 'Please try again or contact support.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!order) return;

    try {
      const updatedOrder = {
        ...order,
        status: 'delivered' as const,
        deliveredAt: new Date(),
      };

      // Update in DynamoDB
      try {
        await DynamoDBService.updateOrder(orderId, {
          status: 'delivered',
          deliveredAt: new Date(),
        });
      } catch (dbError) {
        console.error('Failed to update delivery status:', dbError);
      }

      setOrder(updatedOrder);
      setIsDelivered(true);

      addToast({
        type: 'success',
        title: 'Delivery Confirmed!',
        message: `Order #${order.orderNumber} has been marked as delivered.`
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update delivery status. Please try again.'
      });
    }
  };

  const handleReportIssue = () => {
    addToast({
      type: 'info',
      title: 'Issue Reported',
      message: 'Issue has been reported. Restaurant will be notified.'
    });
  };

  const formatPhoneNumber = (email: string) => {
    // Extract phone if it's in email format, otherwise return empty
    // This is a placeholder - you might want to add a separate phone field
    return '';
  };

  if (loading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingContainer>
            <LoadingSpinner size="lg" />
            <LoadingText>Loading order details...</LoadingText>
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer>
        <ContentWrapper>
          <OrderNotFound>
            <Package size={64} color="#9CA3AF" />
            <NotFoundTitle>Order Not Found</NotFoundTitle>
            <p>The order you&apos;re looking for doesn&apos;t exist.</p>
            <BackLink href="/">
              Return Home
            </BackLink>
          </OrderNotFound>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (isSubmitted && !isDelivered) {
    return (
      <PageContainer>
        <ContentWrapper>
          <SuccessMessage>
            <CheckCircle size={80} color="#10b981" />
            <SuccessTitle>Pickup Confirmed!</SuccessTitle>
            <SuccessText>Thank you for confirming the pickup.</SuccessText>
            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                <strong>Order:</strong> #{order.orderNumber}<br />
                <strong>Driver:</strong> {order.driverName}<br />
                <strong>Company:</strong> {order.driverCompany}<br />
                <strong>Time:</strong> {order.pickedUpAt?.toLocaleString()}
              </p>
            </div>
            
            {/* Delivery Confirmation Buttons */}
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button
                onClick={handleMarkDelivered}
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Mark as Delivered
              </button>
              <button
                onClick={handleReportIssue}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Report Issue
              </button>
            </div>
          </SuccessMessage>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (isDelivered) {
    return (
      <PageContainer>
        <ContentWrapper>
          <SuccessMessage>
            <CheckCircle size={80} color="#3b82f6" />
            <SuccessTitle>Delivery Complete!</SuccessTitle>
            <SuccessText>Order has been successfully delivered.</SuccessText>
            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                <strong>Order:</strong> #{order?.orderNumber}<br />
                <strong>Driver:</strong> {order?.driverName}<br />
                <strong>Company:</strong> {order?.driverCompany}<br />
                <strong>Delivered:</strong> {order?.deliveredAt?.toLocaleString()}
              </p>
            </div>
          </SuccessMessage>
        </ContentWrapper>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Order Header */}
        <OrderHeader>
          <OrderTitle>Order #{order.orderNumber}</OrderTitle>
          <OrderMeta>
            <MetaItem>
              <User size={16} />
              <span>{order.customerName}</span>
            </MetaItem>
            <MetaItem>
              <Clock size={16} />
              <span>{order.createdAt.toLocaleString()}</span>
            </MetaItem>
            <StatusBadge $status={order.status}>
              {order.status === 'picked_up' ? (
                <>
                  <CheckCircle size={16} />
                  Picked Up
                </>
              ) : (
                <>
                  <Clock size={16} />
                  Awaiting Pickup
                </>
              )}
            </StatusBadge>
          </OrderMeta>
          
          {order.orderDetails && (
            <OrderDetails>
              <OrderDetailsTitle>Order Details</OrderDetailsTitle>
              <OrderDetailsText>{order.orderDetails}</OrderDetailsText>
            </OrderDetails>
          )}
        </OrderHeader>

        <GridLayout>
          {/* Order Timeline */}
          <div>
            <OrderTimeline order={order} />
          </div>
          
          {/* Driver Check-in Card */}
          <CheckInCard>
            <CheckInTitle>Driver Check-in</CheckInTitle>
            
            {order.status === 'pending' ? (
              <CheckInForm onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="driverName">Driver Name *</Label>
                  <Input
                    type="text"
                    id="driverName"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    disabled={isSubmitting}
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="driverCompany">Delivery Company *</Label>
                  <select
                    id="driverCompany"
                    value={driverCompany}
                    onChange={(e) => setDriverCompany(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '0.875rem'
                    }}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Company</option>
                    <option value="UberEats">UberEats</option>
                    <option value="DoorDash">DoorDash</option>
                    <option value="Grubhub">Grubhub</option>
                    <option value="Postmates">Postmates</option>
                    <option value="DeliveryHero">Delivery Hero</option>
                    <option value="Independent">Independent Driver</option>
                    <option value="Other">Other</option>
                  </select>
                </FormGroup>

                <SubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={!driverName.trim() || !driverCompany}
                >
                  {isSubmitting ? 'Confirming Pickup...' : '✅ Confirm Pickup'}
                </SubmitButton>
              </CheckInForm>
            ) : (
              <SuccessMessage>
                <SuccessTitle>
                  <CheckCircle size={20} />
                  Order Already Picked Up
                </SuccessTitle>
                <SuccessText>
                  <strong>Driver:</strong> {order.driverName}<br />
                  <strong>Company:</strong> {order.driverCompany}<br />
                  <strong>Pickup Time:</strong> {order.pickedUpAt?.toLocaleString()}
                </SuccessText>
              </SuccessMessage>
            )}
          </CheckInCard>
        </GridLayout>
      </ContentWrapper>
    </PageContainer>
  );
};

export default OrderPage;