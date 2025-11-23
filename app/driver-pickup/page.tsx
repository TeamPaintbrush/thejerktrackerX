'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Package, User, Building2, CheckCircle } from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding: 2rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Icon = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(237, 119, 52, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  
  svg {
    width: 32px;
    height: 32px;
    color: #ed7734;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const OrderInfo = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
`;

const OrderLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const OrderValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #1f2937;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc6627;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
`;

const SuccessMessage = styled(motion.div)`
  text-align: center;
  padding: 2rem;
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  
  svg {
    width: 40px;
    height: 40px;
    color: #10b981;
  }
`;

const SuccessTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const SuccessText = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

function DriverPickupContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [driverName, setDriverName] = useState('');
  const [deliveryCompany, setDeliveryCompany] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      setError('No order ID provided');
      setLoading(false);
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const { DynamoDBService } = await import('../../lib/dynamodb');
      const orderData = await DynamoDBService.getOrderById(orderId!);

      if (orderData) {
        setOrder(orderData);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Failed to load order:', err);
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverName.trim() || !deliveryCompany.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const { DynamoDBService } = await import('../../lib/dynamodb');
      
      await DynamoDBService.updateOrder(orderId!, {
        status: 'picked_up',
        driverName: driverName.trim(),
        driverCompany: deliveryCompany.trim(),
        pickedUpAt: new Date()
      });

      // TODO: Send notification to restaurant
      console.log(`📱 Order #${order.orderNumber} picked up by ${driverName} (${deliveryCompany})`);

      setSuccess(true);
    } catch (err) {
      console.error('Failed to update order:', err);
      alert('Failed to confirm pickup. Please try again or contact the restaurant.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1rem', color: '#6b7280' }}>Loading order...</div>
          </div>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem' }}>
              ❌ Error
            </div>
            <div style={{ fontSize: '1rem', color: '#6b7280' }}>{error}</div>
          </div>
        </Card>
      </Container>
    );
  }

  if (success) {
    return (
      <Container>
        <Card>
          <SuccessMessage
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <SuccessIcon>
              <CheckCircle />
            </SuccessIcon>
            <SuccessTitle>Pickup Confirmed!</SuccessTitle>
            <SuccessText>
              Order #{order.orderNumber} has been marked as picked up.
              <br />
              The restaurant has been notified.
            </SuccessText>
          </SuccessMessage>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Header>
          <Icon>
            <Package />
          </Icon>
          <Title>Order Pickup</Title>
          <Subtitle>Confirm pickup details</Subtitle>
        </Header>

        <OrderInfo>
          <OrderLabel>Order Number</OrderLabel>
          <OrderValue>#{order.orderNumber}</OrderValue>
        </OrderInfo>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Driver Name
            </Label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              required
              autoFocus
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <Building2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Delivery Company
            </Label>
            <Select
              value={deliveryCompany}
              onChange={(e) => setDeliveryCompany(e.target.value)}
              required
            >
              <option value="">Select your company</option>
              <option value="DoorDash">DoorDash</option>
              <option value="Uber Eats">Uber Eats</option>
              <option value="GrubHub">GrubHub</option>
              <option value="Postmates">Postmates</option>
              <option value="Independent">Independent Contractor</option>
              <option value="Other">Other</option>
            </Select>
          </FormGroup>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Confirming...' : 'Confirm Pickup'}
          </Button>
        </form>
      </Card>
    </Container>
  );
}

export default function DriverPickupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DriverPickupContent />
    </Suspense>
  );
}
