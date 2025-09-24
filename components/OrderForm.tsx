'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { LoadingButton } from './Loading';
import { useToast } from './Toast';
import { Card, Heading, Grid, Flex } from '../styles/components';

const FormContainer = styled(Card)`
  background: white;
  padding: 1.5rem;
  border: 1px solid #e7e5e4;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGrid = styled(Grid)`
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #44403c;
  margin-bottom: 0.5rem;
`;

const Input = styled.input<{ disabled?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: ${props => props.disabled ? '#f5f5f4' : 'white'};
  color: ${props => props.disabled ? '#a8a29e' : '#1c1917'};

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }

  &::placeholder {
    color: #a8a29e;
  }
`;

const Textarea = styled.textarea<{ disabled?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: ${props => props.disabled ? '#f5f5f4' : 'white'};
  color: ${props => props.disabled ? '#a8a29e' : '#1c1917'};
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }

  &::placeholder {
    color: #a8a29e;
  }
`;

const SubmitButton = styled(LoadingButton)`
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDetails: string;
  status: 'pending' | 'picked_up';
  createdAt: Date;
  driverName?: string;
  driverCompany?: string;
  pickedUpAt?: Date;
}

interface OrderFormProps {
  onOrderCreated: (order: Order) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      addToast({
        type: 'error',
        title: 'Order Number Required',
        message: 'Please enter an order number to continue.'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newOrder: Order = {
        id: Date.now().toString(),
        orderNumber: orderNumber.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        orderDetails: orderDetails.trim(),
        status: 'pending',
        createdAt: new Date(),
      };

      onOrderCreated(newOrder);

      // Success toast
      addToast({
        type: 'success',
        title: 'Order Created Successfully!',
        message: `Order #${orderNumber} has been created and QR code generated.`
      });

      // Reset form
      setOrderNumber('');
      setCustomerName('');
      setCustomerEmail('');
      setOrderDetails('');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Create Order',
        message: 'Please try again or contact support if the issue persists.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <Heading as="h2" size="2xl" weight="bold" mb="1.5rem" color="#1c1917">
        Create New Order
      </Heading>
      <Form onSubmit={handleSubmit}>
        <FormGrid>
          <FormField>
            <Label htmlFor="orderNumber">
              Order Number *
            </Label>
            <Input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="Enter order number"
              required
              aria-describedby="orderNumber-error"
              disabled={isLoading}
            />
          </FormField>
          <FormField>
            <Label htmlFor="customerName">
              Customer Name
            </Label>
            <Input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              disabled={isLoading}
            />
          </FormField>
        </FormGrid>
        <FormGrid>
          <FormField>
            <Label htmlFor="customerEmail">
              Customer Email
            </Label>
            <Input
              type="email"
              id="customerEmail"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Enter customer email"
              disabled={isLoading}
            />
          </FormField>
          <FormField>
            <Label htmlFor="orderDetails">
              Order Details
            </Label>
            <Textarea
              id="orderDetails"
              value={orderDetails}
              onChange={(e) => setOrderDetails(e.target.value)}
              placeholder="Enter order details"
              rows={3}
              disabled={isLoading}
            />
          </FormField>
        </FormGrid>
        <SubmitButton
          type="submit"
          isLoading={isLoading}
        >
          {isLoading ? 'Creating Order...' : '✨ Create Order'}
        </SubmitButton>
      </Form>
    </FormContainer>
  );
};

export default OrderForm;