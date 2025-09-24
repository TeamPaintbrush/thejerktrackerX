'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LoadingButton } from './Loading';
import { useToast } from './Toast';
import { Card, Heading, Grid, Flex } from '../styles/components';
import FoodItemSelector from './FoodItemSelector';
import { FoodItem, formatPrice } from '../lib/foodItems';

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

const OrderTypeToggle = styled.div`
  display: flex;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$active ? '#ed7734' : 'white'};
  color: ${props => props.$active ? 'white' : '#57534e'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#de5d20' : '#f5f5f4'};
  }
`;

const OrderSummary = styled.div`
  background: #f5f5f4;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const SummaryTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #44403c;
  margin: 0 0 0.75rem 0;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e7e5e4;

  &:last-child {
    border-bottom: none;
    font-weight: 600;
    color: #1c1917;
  }
`;

const ItemName = styled.span`
  font-size: 0.875rem;
  color: #44403c;
`;

const ItemPrice = styled.span`
  font-size: 0.875rem;
  color: #57534e;
  font-weight: 500;
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

interface SelectedFoodItem extends FoodItem {
  quantity: number;
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
  const [orderType, setOrderType] = useState<'preset' | 'custom'>('preset');
  const [selectedFoodItems, setSelectedFoodItems] = useState<SelectedFoodItem[]>([]);
  const { addToast } = useToast();

  // Food item handlers
  const handleFoodItemSelect = (item: FoodItem) => {
    const existingItem = selectedFoodItems.find(selected => selected.id === item.id);
    
    if (existingItem) {
      setSelectedFoodItems(prev => 
        prev.map(selected => 
          selected.id === item.id 
            ? { ...selected, quantity: selected.quantity + 1 }
            : selected
        )
      );
    } else {
      setSelectedFoodItems(prev => [...prev, { ...item, quantity: 1 }]);
    }
  };

  const handleFoodItemRemove = (itemId: string) => {
    const existingItem = selectedFoodItems.find(selected => selected.id === itemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setSelectedFoodItems(prev => 
        prev.map(selected => 
          selected.id === itemId 
            ? { ...selected, quantity: selected.quantity - 1 }
            : selected
        )
      );
    } else {
      setSelectedFoodItems(prev => prev.filter(selected => selected.id !== itemId));
    }
  };

  const handleClearAllFoodItems = () => {
    setSelectedFoodItems([]);
  };

  // Auto-generate order details when food items change
  useEffect(() => {
    if (orderType === 'preset' && selectedFoodItems.length > 0) {
      const orderSummary = selectedFoodItems
        .map(item => `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`)
        .join('\n');
      
      const totalPrice = selectedFoodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const orderText = `${orderSummary}\n\nTotal: ${formatPrice(totalPrice)}`;
      
      setOrderDetails(orderText);
    }
  }, [selectedFoodItems, orderType]);

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

    if (orderType === 'preset' && selectedFoodItems.length === 0) {
      addToast({
        type: 'error',
        title: 'No Items Selected',
        message: 'Please select at least one food item or switch to custom order.'
      });
      return;
    }

    if (orderType === 'custom' && !orderDetails.trim()) {
      addToast({
        type: 'error',
        title: 'Order Details Required',
        message: 'Please enter order details or select preset items.'
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
      setSelectedFoodItems([]);
      setOrderType('preset');
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

  const totalOrderValue = selectedFoodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <FormContainer>
      <Heading as="h2" size="2xl" weight="bold" mb="1.5rem" color="#1c1917">
        Create New Order
      </Heading>

      {/* Order Type Toggle */}
      <OrderTypeToggle>
        <ToggleButton 
          type="button"
          $active={orderType === 'preset'} 
          onClick={() => setOrderType('preset')}
        >
          🍽️ Select from Menu
        </ToggleButton>
        <ToggleButton 
          type="button"
          $active={orderType === 'custom'} 
          onClick={() => setOrderType('custom')}
        >
          ✏️ Custom Order
        </ToggleButton>
      </OrderTypeToggle>

      {/* Food Item Selector - only show for preset orders */}
      {orderType === 'preset' && (
        <FoodItemSelector
          selectedItems={selectedFoodItems}
          onItemSelect={handleFoodItemSelect}
          onItemRemove={handleFoodItemRemove}
          onClearAll={handleClearAllFoodItems}
        />
      )}

      {/* Order Summary - only show when items are selected */}
      {orderType === 'preset' && selectedFoodItems.length > 0 && (
        <OrderSummary>
          <SummaryTitle>Order Summary</SummaryTitle>
          {selectedFoodItems.map((item) => (
            <SummaryItem key={item.id}>
              <ItemName>{item.quantity}x {item.name}</ItemName>
              <ItemPrice>{formatPrice(item.price * item.quantity)}</ItemPrice>
            </SummaryItem>
          ))}
          <SummaryItem>
            <ItemName>Total</ItemName>
            <ItemPrice>{formatPrice(totalOrderValue)}</ItemPrice>
          </SummaryItem>
        </OrderSummary>
      )}

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
              Order Details {orderType === 'custom' && '*'}
            </Label>
            <Textarea
              id="orderDetails"
              value={orderDetails}
              onChange={(e) => setOrderDetails(e.target.value)}
              placeholder={orderType === 'preset' 
                ? "Order details will be auto-generated from selected items" 
                : "Enter custom order details"
              }
              rows={3}
              disabled={isLoading || orderType === 'preset'}
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