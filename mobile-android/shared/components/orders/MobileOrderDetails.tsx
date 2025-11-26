'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Package,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Phone,
  QrCode,
  Download,
  Share2,
  ArrowLeft,
  Truck,
  Building
} from 'lucide-react';
import { MobileDataService } from '@/mobile-android/shared/services/mobileDataService';
import { buildTrackingUrl } from '@/lib/url';

const OrderDetailsContainer = styled.div`
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding-bottom: 100px; /* Space for bottom navigation */
`;

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const OrderId = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const StatusSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => {
    switch (props.$status) {
      case 'pending':
        return 'background: #fef3c7; color: #d97706;';
      case 'preparing':
        return 'background: #dbeafe; color: #2563eb;';
      case 'ready':
        return 'background: #dcfce7; color: #16a34a;';
      case 'completed':
        return 'background: #dcfce7; color: #16a34a;';
      case 'cancelled':
        return 'background: #fee2e2; color: #dc2626;';
      default:
        return 'background: #f3f4f6; color: #6b7280;';
    }
  }}
`;

const QRSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  text-align: center;
`;

const QRPlaceholder = styled.div`
  width: 200px;
  height: 200px;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  color: #6b7280;
  flex-direction: column;
  gap: 0.5rem;
`;

const QRActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  margin-top: 1rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  border: 1px solid #ed7734;
  border-radius: 8px;
  background: white;
  color: #ed7734;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #ed7734;
    color: white;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const InfoSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #4b5563;

  &:last-child {
    margin-bottom: 0;
  }

  svg {
    width: 16px;
    height: 16px;
    color: #ed7734;
    flex-shrink: 0;
  }
`;

const OrderItemsSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ItemDetails = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #ed7734;
`;

// Driver Check-In Styled Components
const DriverCheckInSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
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
  font-size: 0.875rem;
  background: white;
  
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
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const CheckInButton = styled(motion.button)`
  width: 100%;
  padding: 0.75rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CheckInStatus = styled.div`
  background: #dcfce7;
  color: #16a34a;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
`;

interface MobileOrderDetailsProps {
  orderId: string;
}

// Mock order data - replace with actual data fetching
const getMockOrderData = (orderId: string) => {
  return {
    id: orderId,
    status: 'preparing',
    customerName: 'John Doe',
    customerPhone: '+1 (555) 123-4567',
    pickupLocation: '123 Main St, Restaurant Name',
    estimatedTime: '15 minutes',
    placedAt: '2:45 PM',
    items: [
      { name: 'Jerk Chicken Plate', quantity: 1, price: 16.99, notes: 'Extra spicy' },
      { name: 'Rice & Peas', quantity: 2, price: 8.99, notes: '' },
      { name: 'Plantain', quantity: 1, price: 4.99, notes: 'Well done' }
    ],
    total: 30.97,
    qrCode: `https://app.jerktrackerx.com/track/${orderId}`
  };
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending': return Clock;
    case 'preparing': return Package;
    case 'ready': return CheckCircle;
    case 'completed': return CheckCircle;
    case 'cancelled': return XCircle;
    default: return Clock;
  }
};

export default function MobileOrderDetails({ orderId }: MobileOrderDetailsProps) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Driver Check-In State
  const [driverName, setDriverName] = useState('');
  const [deliveryCompany, setDeliveryCompany] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    // Load order from database
    const loadOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch order from database (uses memory fallback if DynamoDB not configured)
        const orderData = await MobileDataService.getOrderById(orderId);
        
        if (!orderData) {
          setError('Order not found');
          return;
        }
        
        // Transform to component format
        const transformedOrder = {
          id: orderData.id,
          orderNumber: orderData.orderNumber,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: orderData.customerEmail, // Using email as placeholder
          orderDetails: orderData.orderDetails,
          status: orderData.status,
          createdAt: orderData.createdAt.toISOString(),
          pickedUpAt: orderData.pickedUpAt?.toISOString(),
          deliveredAt: orderData.deliveredAt?.toISOString(),
          driverName: orderData.driverName,
          driverCompany: orderData.driverCompany,
          location: orderData.location,
          qrCode: buildTrackingUrl(`/orders/${orderData.id}`)
        };
        
        setOrder(transformedOrder);
      } catch (err) {
        console.error('Failed to load order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <OrderDetailsContainer>
        <Header>
          <Title>Loading Order...</Title>
        </Header>
      </OrderDetailsContainer>
    );
  }

  if (error || !order) {
    return (
      <OrderDetailsContainer>
        <Header>
          <Title>Error</Title>
          <OrderId>{error || 'Order not found'}</OrderId>
        </Header>
      </OrderDetailsContainer>
    );
  }

  const StatusIcon = getStatusIcon(order.status);

  const handleDownloadQR = () => {
    try {
      // Get the QR code canvas element
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        alert('QR code not found');
        return;
      }
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `order-${order.orderNumber}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert('✅ QR code downloaded successfully!');
      });
    } catch (error) {
      console.error('Failed to download QR code:', error);
      alert('❌ Failed to download QR code');
    }
  };

  const handleShareQR = async () => {
    try {
      // Try to use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `Order ${order.orderNumber} - JERK Tracker`,
          text: `Track your order: ${order.orderNumber}`,
          url: order.qrCode
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(order.qrCode);
        alert('✅ Tracking link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share QR code:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(order.qrCode);
        alert('✅ Tracking link copied to clipboard!');
      } catch (clipboardError) {
        alert('❌ Failed to share link');
      }
    }
  };

  // Delivery Companies List
  const deliveryCompanies = [
    'Uber Eats',
    'DoorDash', 
    'Grubhub',
    'Postmates',
    'Independent Driver',
    'Restaurant Delivery',
    'Other'
  ];

  // Driver Check-In Handler
  const handleDriverCheckIn = async () => {
    if (!driverName.trim() || !deliveryCompany) {
      alert('Please fill in all required fields');
      return;
    }

    setCheckingIn(true);
    
    try {
      // Simulate API call to update order with driver info
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update order with driver information
      setOrder((prevOrder: any) => ({
        ...prevOrder,
        driverName,
        driverCompany: deliveryCompany,
        status: 'picked-up'
      }));
      
      setIsCheckedIn(true);
      alert('✅ Driver check-in successful!');
    } catch (error) {
      console.error('Driver check-in failed:', error);
      alert('❌ Failed to check in driver');
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <OrderDetailsContainer>
      <Header>
        <Title>Order Details</Title>
        <OrderId>#{order.id}</OrderId>
      </Header>

      <StatusSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <StatusHeader>
          <StatusBadge $status={order.status}>
            <StatusIcon size={16} />
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </StatusBadge>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {order.estimatedTime}
          </div>
        </StatusHeader>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Placed at {order.placedAt}
        </div>
      </StatusSection>

      <QRSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionTitle>QR Code</SectionTitle>
        <QRPlaceholder>
          <QRCodeCanvas
            value={order.qrCode}
            size={200}
            level="H"
            includeMargin={true}
            style={{ display: 'block', margin: '0 auto' }}
          />
        </QRPlaceholder>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
          Scan to track order status
        </div>
        <QRActions>
          <ActionButton onClick={handleDownloadQR}>
            <Download size={16} />
            Download
          </ActionButton>
          <ActionButton onClick={handleShareQR}>
            <Share2 size={16} />
            Share
          </ActionButton>
        </QRActions>
      </QRSection>

      <DriverCheckInSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <SectionTitle>
          <Truck style={{ marginRight: '0.5rem' }} />
          Driver Check-In
        </SectionTitle>
        
        {!isCheckedIn && !order.driverName ? (
          <>
            <FormGroup>
              <Label htmlFor="driverName">Driver Name *</Label>
              <Input
                id="driverName"
                type="text"
                placeholder="Enter driver's full name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="deliveryCompany">Delivery Company *</Label>
              <Select
                id="deliveryCompany"
                value={deliveryCompany}
                onChange={(e) => setDeliveryCompany(e.target.value)}
              >
                <option value="">Select delivery company</option>
                {deliveryCompanies.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <CheckInButton
              onClick={handleDriverCheckIn}
              disabled={checkingIn || !driverName.trim() || !deliveryCompany}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Truck size={16} />
              {checkingIn ? 'Checking In...' : 'Check In Driver'}
            </CheckInButton>
          </>
        ) : (
          <CheckInStatus>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={20} />
              <strong>Driver Checked In</strong>
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              <strong>Driver:</strong> {order.driverName || driverName}
            </div>
            <div style={{ fontSize: '0.875rem' }}>
              <strong>Company:</strong> {order.driverCompany || deliveryCompany}
            </div>
          </CheckInStatus>
        )}
      </DriverCheckInSection>

      <InfoSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <SectionTitle>Order Details</SectionTitle>
        <InfoRow>
          <User />
          <span>{order.customerName}</span>
        </InfoRow>
        <InfoRow>
          <Phone />
          <span>{order.customerPhone}</span>
        </InfoRow>
        <InfoRow>
          <MapPin />
          <span>{order.pickupLocation}</span>
        </InfoRow>
      </InfoSection>

      <OrderItemsSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <SectionTitle>Order Items</SectionTitle>
        {order.items.map((item: any, index: number) => (
          <OrderItem key={index}>
            <ItemInfo>
              <ItemName>
                {item.quantity}x {item.name}
              </ItemName>
              {item.notes && (
                <ItemDetails>Note: {item.notes}</ItemDetails>
              )}
            </ItemInfo>
            <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
          </OrderItem>
        ))}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '2px solid #ed7734',
          fontWeight: 600,
          fontSize: '1.125rem'
        }}>
          <span>Total</span>
          <span>${order.total.toFixed(2)}</span>
        </div>
      </OrderItemsSection>
    </OrderDetailsContainer>
  );
}