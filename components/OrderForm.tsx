'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LoadingButton } from './Loading';
import { Card, Heading, Grid, Flex } from '../styles/components';
import FoodItemSelector from './FoodItemSelector';
import { FoodItem, formatPrice } from '../lib/foodItems';
import { LocationVerificationService, LocationVerificationResult } from '../lib/locationVerification';
import { DynamoDBService, Location, Order as OrderType } from '../lib/dynamodb';
import { showSuccess, showError, showInfo, showLoading, dismissToast } from '../lib/toast';

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

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  background: white;
  color: #1c1917;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const LocationSelector = styled.div`
  margin-bottom: 1.5rem;
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

const LocationStatus = styled.div<{ $status: 'verified' | 'pending' | 'failed' | 'loading' }>`
  background: ${props => {
    switch (props.$status) {
      case 'verified': return '#dcfce7';
      case 'pending': return '#fef3c7';
      case 'failed': return '#fee2e2';
      case 'loading': return '#f3f4f6';
      default: return '#f3f4f6';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'verified': return '#16a34a';
      case 'pending': return '#f59e0b';
      case 'failed': return '#dc2626';
      case 'loading': return '#6b7280';
      default: return '#6b7280';
    }
  }};
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LocationStatusIcon = styled.div<{ $status: 'verified' | 'pending' | 'failed' | 'loading' }>`
  font-size: 1.25rem;
  
  &::before {
    content: ${props => {
      switch (props.$status) {
        case 'verified': return '"✅"';
        case 'pending': return '"⏳"';
        case 'failed': return '"❌"';
        case 'loading': return '"⏺️"';
        default: return '"❓"';
      }
    }};
  }
`;

const LocationStatusText = styled.div`
  flex: 1;
  
  .title {
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #1f2937;
  }
  
  .details {
    font-size: 0.875rem;
    color: #6b7280;
    margin: 0;
  }
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

interface SelectedFoodItem extends FoodItem {
  quantity: number;
}

interface OrderFormProps {
  onOrderCreated: (order: OrderType) => void;
  qrCodeId?: string; // QR code ID for location verification
  businessId?: string; // Business ID for location lookup
  userSession?: any; // User session to auto-populate customer info
}

// Helper function to get client IP address
async function getClientIP(): Promise<string> {
  try {
    // In production, you might use a service like ipify
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return 'unknown';
  }
}

const OrderForm: React.FC<OrderFormProps> = ({ onOrderCreated, qrCodeId, businessId, userSession }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderType, setOrderType] = useState<'preset' | 'custom'>('preset');
  const [selectedFoodItems, setSelectedFoodItems] = useState<SelectedFoodItem[]>([]);
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  // Auto-populate customer info from session
  useEffect(() => {
    if (userSession?.user) {
      if (userSession.user.name && !customerName) {
        setCustomerName(userSession.user.name);
      }
      if (userSession.user.email && !customerEmail) {
        setCustomerEmail(userSession.user.email);
      }
    }
  }, [userSession]);

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

  // Load available locations
  useEffect(() => {
    const loadLocations = async () => {
      if (businessId) {
        try {
          const locations = await DynamoDBService.getLocationsByBusinessId(businessId);
          setAvailableLocations(locations);
          
          // If QR code is provided, pre-select that location
          if (qrCodeId && locations.length > 0) {
            const matchedLocation = locations.find(loc => 
              loc.qrCodes.primary === qrCodeId || loc.qrCodes.backup === qrCodeId
            );
            if (matchedLocation) {
              setSelectedLocationId(matchedLocation.id);
            }
          }
        } catch (error) {
          console.error('Failed to load locations:', error);
        }
      }
    };

    loadLocations();
  }, [businessId, qrCodeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      showError('Please enter an order number to continue.');
      return;
    }

    if (orderType === 'preset' && selectedFoodItems.length === 0) {
      showError('Please select at least one food item or switch to custom order.');
      return;
    }

    if (orderType === 'custom' && !orderDetails.trim()) {
      showError('Please enter order details or select preset items.');
      return;
    }

    setIsLoading(true);

    try {
      // Validate location selection if multiple locations exist
      if (availableLocations.length > 0 && !selectedLocationId) {
        showError('Please select a location for this order.');
        setIsLoading(false);
        return;
      }

      // Get selected location details
      const selectedLocation = availableLocations.find(loc => loc.id === selectedLocationId);
      const locationId = selectedLocationId || 'default';
      const locationBusinessId = selectedLocation?.businessId || businessId || 'default';
      const locationName = selectedLocation?.name || 'Default Location';

      // Create order with location information
      const newOrder: OrderType = {
        id: Date.now().toString(),
        orderNumber: orderNumber.trim(),
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        orderDetails: orderDetails.trim(),
        status: 'pending',
        createdAt: new Date(),
        location: {
          locationId: locationId,
          locationName: locationName,
          businessId: locationBusinessId,
          qrCodeId: qrCodeId,
          verificationStatus: 'manual',
          ipAddress: await getClientIP(),
          deviceInfo: LocationVerificationService.getDeviceFingerprint()
        }
      };

      // Update location usage for billing
      if (selectedLocationId && selectedLocation) {
        await DynamoDBService.updateLocationUsage(selectedLocationId, 1);
      }

      // Save order to database
      const savedOrder = await DynamoDBService.createOrder(newOrder);
      
      onOrderCreated(savedOrder);

      // Success toast
      showSuccess(`Order #${orderNumber} created successfully!`);

      // Reset form
      setOrderNumber('');
      setCustomerName('');
      setCustomerEmail('');
      setOrderDetails('');
      setSelectedFoodItems([]);
      setOrderType('preset');
    } catch (error) {
      showError('Failed to create order. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalOrderValue = selectedFoodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <FormContainer>
      <h2 style={{ 
        fontSize: '1.75rem', 
        fontWeight: 'bold', 
        marginBottom: '1.5rem', 
        color: '#1c1917',
        margin: 0 
      }}>
        Create New Order Tracker
      </h2>

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

      {/* Location Selection - shows which location this order is for */}
      {availableLocations.length > 0 && (
        <LocationSelector>
          <Label htmlFor="location">Location *</Label>
          <Select
            id="location"
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            required
          >
            <option value="">Select a location</option>
            {availableLocations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.address.city}, {location.address.state}
              </option>
            ))}
          </Select>
        </LocationSelector>
      )}

      {/* Food Item Selector - only show for preset orders */}
      {orderType === 'preset' && (
        <FoodItemSelector
          selectedItems={selectedFoodItems}
          onItemSelect={handleFoodItemSelect}
          onItemRemove={handleFoodItemRemove}
          onClearAll={handleClearAllFoodItems}
          businessId={businessId}
          includePresets={true}
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