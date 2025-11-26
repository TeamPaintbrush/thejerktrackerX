'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ShoppingCart, CheckCircle, Plus, Minus, X, Search, ChevronDown, ChevronUp, Trash2, MapPin } from 'lucide-react';
import { MenuItem, Location } from '@/lib/dynamodb';
import { MobileDataService } from '@/mobile-android/shared/services/mobileDataService';
import { getAllFoodItemsByCategory, FOOD_CATEGORIES, formatPrice } from '../../../../lib/foodItems';
import { LocationVerificationService } from '../../../../lib/locationVerification';
import { initializeTestLocations } from '../../../../lib/test-data';
import { MobilePushNotificationService } from '../../../../lib/mobilePushNotifications';

const OrderContainer = styled.div`
  padding: 0.5rem 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding-bottom: 120px;
`;

const Header = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
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

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? '#ed7734' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#6b7280'};
`;

const SearchBox = styled.div`
  background: white;
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const CategorySection = styled.div`
  margin-bottom: 1.5rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CategoryTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const MenuItemCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MenuItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const MenuItemInfo = styled.div`
  flex: 1;
`;

const MenuItemName = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const MenuItemPrice = styled.p`
  font-size: 1rem;
  font-weight: 700;
  color: #ed7734;
  margin: 0;
`;

const MenuItemDescription = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
`;

const AddToCartButton = styled(motion.button)`
  padding: 0.5rem 1rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const CartSummary = styled(motion.div)`
  position: fixed;
  bottom: 80px;
  left: 1rem;
  right: 1rem;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
`;

const CartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CartTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CartItemInfo = styled.div`
  flex: 1;
`;

const CartItemName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const CartItemPrice = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #ed7734;
  }
`;

const Quantity = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  min-width: 20px;
  text-align: center;
`;

const CartTotal = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #f3f4f6;
  margin-top: 1rem;
`;

const TotalLabel = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
`;

const TotalAmount = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #ed7734;
`;

const CheckoutButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ed7734 0%, #dc6627 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const CustomerFormModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const CustomerForm = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
`;

const SuccessModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 1000;
`;

const SuccessModalCard = styled(motion.div)`
  width: 100%;
  max-width: 360px;
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.15);
`;

const SuccessIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
`;

const SuccessTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
`;

const SuccessDetails = styled.p`
  font-size: 0.95rem;
  color: #4b5563;
  margin: 0;
`;

const SuccessMeta = styled.div`
  margin: 1rem 0;
  padding: 0.85rem 1rem;
  background: #f9fafb;
  border-radius: 12px;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

const SuccessMetaLabel = styled.span`
  font-weight: 600;
  color: #111827;
`;

const SuccessActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const SuccessActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  min-width: 130px;
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
  background: ${props => props.$variant === 'primary' ? '#ed7734' : '#f3f4f6'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#111827'};

  &:active {
    transform: scale(0.98);
  }
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const FormField = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
`;

const LocationBanner = styled(motion.div)<{ $status: 'detecting' | 'success' | 'error' }>`
  background: ${props => 
    props.$status === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
    props.$status === 'error' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
    'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  };
  color: white;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
`;

const LocationInfo = styled.div`
  flex: 1;
`;

const LocationLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
`;

const LocationName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
`;

const LocationDistance = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 0.25rem;
`;

interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface MobileOrderCreationProps {
  className?: string;
  userRole?: string;
}

export default function MobileOrderCreation({ className, userRole = 'customer' }: MobileOrderCreationProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'menu' | 'cart'>('menu');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<{ [key: string]: MenuItem[] }>({});
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set<string>(FOOD_CATEGORIES as unknown as string[]));
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });
  
  // Location detection state
  const [detectedLocation, setDetectedLocation] = useState<Location | null>(null);
  const [locationStatus, setLocationStatus] = useState<'detecting' | 'success' | 'error'>('detecting');
  const [locationError, setLocationError] = useState<string>('');
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderId: string;
    orderNumber: string;
    locationName: string;
    total: number;
  } | null>(null);

  // Auto-detect location using GPS
  useEffect(() => {
    const detectLocation = async () => {
      try {
        setLocationStatus('detecting');
        
        const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mobile_auth_user') || '{}') : {};
        const businessId = user?.businessId || user?.id || 'default-business';
        
        console.log('🌍 Starting location detection for businessId:', businessId);
        
        // Initialize test locations if needed (for development)
        await initializeTestLocations();
        
        // Load all locations for this business
        const locations: Location[] = await MobileDataService.getLocationsByBusinessId(businessId);
        console.log('📍 Found locations:', locations.length);
        setAllLocations(locations);
        
        if (!locations || locations.length === 0) {
          setLocationStatus('error');
          setLocationError('No locations configured for your business');
          return;
        }
        
        // If only one location, auto-select it
        if (locations.length === 1) {
          setDetectedLocation(locations[0]);
          setLocationStatus('success');
          console.log('✅ Auto-selected single location:', locations[0].name);
          return;
        }
        
        // Multiple locations - use GPS to detect nearest
        console.log('📡 Getting GPS position...');
        const coords = await LocationVerificationService.getCurrentLocation();
        
        if (!coords) {
          setLocationStatus('error');
          setLocationError('Unable to access GPS. Please enable location services.');
          // Fallback to first active location
          const firstActive = locations.find(loc => loc.billing.isActive);
          if (firstActive) setDetectedLocation(firstActive);
          return;
        }
        
        console.log('📍 GPS coordinates:', coords);
        
        // Verify which location user is at
        const verificationResult = await LocationVerificationService.verifyLocationFromGPS(
          coords,
          locations.map((loc: Location) => ({
            id: loc.id,
            businessId: loc.businessId,
            name: loc.name,
            coordinates: loc.coordinates,
            billing: loc.billing
          }))
        );
        
        console.log('🔍 Verification result:', verificationResult);
        
        if (verificationResult.isValid && verificationResult.locationId) {
          const location = locations.find(loc => loc.id === verificationResult.locationId);
          if (location) {
            setDetectedLocation(location);
            setLocationStatus('success');
            console.log('✅ Location verified:', location.name, `(${verificationResult.distance}m away)`);
          }
        } else {
          setLocationStatus('error');
          setLocationError(verificationResult.error || 'Could not verify location');
          // Still show nearest location even if outside range
          if (verificationResult.locationId) {
            const location = locations.find(loc => loc.id === verificationResult.locationId);
            if (location) setDetectedLocation(location);
          }
        }
      } catch (error) {
        console.error('❌ Location detection failed:', error);
        setLocationStatus('error');
        setLocationError('Failed to detect location');
      }
    };
    
    detectLocation();
  }, []);

  // Load menu items
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('mobile_auth_user') || '{}') : {};
        const businessId = user?.businessId || user?.id || 'default-business';
        
        console.log('Loading menu for businessId:', businessId);
        
        // Load from DynamoDB (items created via Menu Management)
        const dbItems: MenuItem[] = await MobileDataService.getMenuItems(businessId);
        console.log('DB menu items:', dbItems?.length || 0);
        
        const organized: { [key: string]: MenuItem[] } = {};
        
        // Add DB items first (priority)
        (dbItems || []).forEach((item: MenuItem) => {
          const category = item.category;
          if (!organized[category]) {
            organized[category] = [];
          }
          organized[category].push(item);
        });
        
        // If no DB items, add some preset examples so menu isn't empty
        if (!dbItems || dbItems.length === 0) {
          console.log('No DB items found, adding preset examples');
          
          // Jerk Chicken preset
          const presetItems: MenuItem[] = [
            {
              id: 'preset-jerk-chicken',
              name: 'Jerk Chicken',
              description: 'Authentic Jamaican jerk chicken with rice & peas',
              price: 14.99,
              category: 'Main Course',
              businessId,
              availability: { isAvailable: true },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'preset-jerk-pork',
              name: 'Jerk Pork',
              description: 'Spicy jerk pork with plantains',
              price: 16.99,
              category: 'Main Course',
              businessId,
              availability: { isAvailable: true },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'preset-rice-peas',
              name: 'Rice & Peas',
              description: 'Traditional coconut rice with kidney beans',
              price: 5.99,
              category: 'Sides',
              businessId,
              availability: { isAvailable: true },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'preset-plantains',
              name: 'Fried Plantains',
              description: 'Sweet fried plantains',
              price: 4.99,
              category: 'Sides',
              businessId,
              availability: { isAvailable: true },
              createdAt: new Date(),
              updatedAt: new Date()
            },
            {
              id: 'preset-sorrel',
              name: 'Sorrel Drink',
              description: 'Refreshing hibiscus drink',
              price: 3.99,
              category: 'Beverages',
              businessId,
              availability: { isAvailable: true },
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ];
          
          presetItems.forEach(item => {
            if (!organized[item.category]) {
              organized[item.category] = [];
            }
            organized[item.category].push(item);
          });
        }
        
        console.log('Organized menu:', Object.keys(organized), 'categories');
        setMenuItems(organized);
      } catch (error) {
        console.error('Failed to load menu:', error);
        // Set empty menu on error
        setMenuItems({});
      }
    };
    
    loadMenu();
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const addToCart = async (item: MenuItem) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { 
        id: item.id, 
        name: item.name, 
        price: item.price, 
        quantity: 1 
      }];
    });
  };

  const updateQuantity = async (id: string, delta: number) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    
    setCart(prev => {
      const updated = prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter(item => item.quantity > 0);
      return updated;
    });
  };

  const removeFromCart = async (id: string) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
    
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Medium });
    }
    
    setShowCheckoutForm(true);
  };

  const handleCreateOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert('Please fill in customer name and phone number');
      return;
    }
    
    if (!detectedLocation) {
      alert('❌ Location not detected\n\nPlease enable GPS or ensure you are at a registered location.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const orderNumber = `ORDER-${Date.now()}`;
      const uniqueQrCodeId = detectedLocation.qrCodes.primary || `qr-${orderNumber}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Build order details from cart
      const orderDetails = cart.map(item => `${item.quantity}x ${item.name} @ ${formatPrice(item.price)}`).join('\n');
      
      const orderData = {
        orderNumber,
        customerName: customerInfo.name,
        customerEmail: customerInfo.phone,
        orderDetails,
        status: 'pending' as const,
        location: {
          locationId: detectedLocation.id,
          businessId: detectedLocation.businessId,
          qrCodeId: uniqueQrCodeId,
          verificationStatus: locationStatus === 'success' ? 'verified' as const : 'pending' as const,
          coordinates: detectedLocation.coordinates,
          deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Mobile App'
        }
      };
      
      const newOrder = await MobileDataService.createOrder(orderData);
      
      // Send push notification to managers about new order
      await MobilePushNotificationService.sendNotificationToRole('manager', {
        title: '🆕 New Order Received',
        body: `Order ${orderNumber} from ${customerInfo.name}`,
        data: {
          type: 'new_order',
          orderId: newOrder.id,
          orderNumber: newOrder.orderNumber
        }
      });
      
      // Success haptic feedback
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }
      
      // Reset form
      setCart([]);
      setCustomerInfo({ name: '', phone: '', address: '' });
      setShowCheckoutForm(false);
      
      setOrderSuccess({
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        locationName: detectedLocation.name,
        total: cartTotal
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`❌ Failed to create order\n\n${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessDismiss = () => {
    if (!orderSuccess) return;
    const orderId = orderSuccess.orderId;
    setOrderSuccess(null);
    router.push(`/mobile/orders/${orderId}`);
  };

  const handleGoToQr = () => {
    if (!orderSuccess) return;
    const orderId = orderSuccess.orderId;
    setOrderSuccess(null);
    const qrUrl = `/mobile/qr?tab=orders&orderId=${encodeURIComponent(orderId)}`;
    router.push(qrUrl);
  };

  const filteredMenu = Object.entries(menuItems).reduce((acc, [category, items]) => {
    if (!searchQuery) {
      acc[category] = items;
    } else {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
    }
    return acc;
  }, {} as { [key: string]: MenuItem[] });

  return (
    <OrderContainer className={className}>
      <Header>
        <Title>Create Order Tracker</Title>
        <Subtitle>Select items from menu & generate QR tracker</Subtitle>
      </Header>

      {/* Location Detection Banner */}
      <AnimatePresence>
        {locationStatus !== 'detecting' && (
          <LocationBanner
            $status={locationStatus}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MapPin size={24} />
            <LocationInfo>
              {locationStatus === 'success' && detectedLocation && (
                <>
                  <LocationLabel>📍 Auto-detected Location</LocationLabel>
                  <LocationName>{detectedLocation.name}</LocationName>
                  <LocationDistance>{detectedLocation.address.city}, {detectedLocation.address.state}</LocationDistance>
                </>
              )}
              {locationStatus === 'error' && (
                <>
                  <LocationLabel>⚠️ Location Detection</LocationLabel>
                  <LocationName>{locationError}</LocationName>
                  {detectedLocation && (
                    <LocationDistance>Using: {detectedLocation.name}</LocationDistance>
                  )}
                </>
              )}
            </LocationInfo>
          </LocationBanner>
        )}
      </AnimatePresence>

      <TabContainer>
        <Tab $active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}>
          Menu ({Object.values(menuItems).flat().length})
        </Tab>
        <Tab $active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>
          Cart ({cartItemCount})
        </Tab>
      </TabContainer>

      {activeTab === 'menu' && (
        <>
          <SearchBox>
            <Search size={18} color="#9ca3af" />
            <SearchInput
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>

          {Object.keys(filteredMenu).length === 0 ? (
            <EmptyState>
              <p>No menu items found</p>
            </EmptyState>
          ) : (
            Object.entries(filteredMenu).map(([category, items]) => (
              <CategorySection key={category}>
                <CategoryHeader onClick={() => toggleCategory(category)}>
                  <CategoryTitle>{category} ({items.length})</CategoryTitle>
                  {expandedCategories.has(category) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </CategoryHeader>
                
                <AnimatePresence>
                  {expandedCategories.has(category) && items.map(item => (
                    <MenuItemCard
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <MenuItemHeader>
                        <MenuItemInfo>
                          <MenuItemName>{item.name}</MenuItemName>
                          <MenuItemPrice>{formatPrice(item.price)}</MenuItemPrice>
                          {item.description && (
                            <MenuItemDescription>{item.description}</MenuItemDescription>
                          )}
                        </MenuItemInfo>
                        <AddToCartButton
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(item)}
                        >
                          <Plus size={16} />
                          Add
                        </AddToCartButton>
                      </MenuItemHeader>
                    </MenuItemCard>
                  ))}
                </AnimatePresence>
              </CategorySection>
            ))
          )}
        </>
      )}

      {activeTab === 'cart' && (
        <div style={{ paddingBottom: '200px' }}>
          {cart.length === 0 ? (
            <EmptyState>
              <ShoppingCart size={48} style={{ marginBottom: '1rem' }} />
              <p>Your cart is empty</p>
              <p style={{ fontSize: '0.875rem' }}>Add items from the menu to get started</p>
            </EmptyState>
          ) : (
            cart.map(item => (
              <CartItem key={item.id}>
                <CartItemInfo>
                  <CartItemName>{item.name}</CartItemName>
                  <CartItemPrice>{formatPrice(item.price)} each</CartItemPrice>
                </CartItemInfo>
                <QuantityControls>
                  <QuantityButton onClick={() => updateQuantity(item.id, -1)}>
                    <Minus size={14} />
                  </QuantityButton>
                  <Quantity>{item.quantity}</Quantity>
                  <QuantityButton onClick={() => updateQuantity(item.id, 1)}>
                    <Plus size={14} />
                  </QuantityButton>
                  <QuantityButton onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={14} color="#dc2626" />
                  </QuantityButton>
                </QuantityControls>
              </CartItem>
            ))
          )}
        </div>
      )}

      <AnimatePresence>
        {cart.length > 0 && (
          <CartSummary
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
          >
            <CartHeader>
              <CartTitle>
                <ShoppingCart size={20} style={{ display: 'inline', marginRight: '0.5rem' }} />
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </CartTitle>
            </CartHeader>
            
            <CartTotal>
              <TotalLabel>Total</TotalLabel>
              <TotalAmount>{formatPrice(cartTotal)}</TotalAmount>
            </CartTotal>
            
            <CheckoutButton
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
            >
              <CheckCircle size={20} />
              Proceed to Checkout
            </CheckoutButton>
          </CartSummary>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckoutForm && (
          <CustomerFormModal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !submitting && setShowCheckoutForm(false)}
          >
            <CustomerForm
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <FormHeader>
                <FormTitle>Customer Details</FormTitle>
                <CloseButton onClick={() => setShowCheckoutForm(false)} disabled={submitting}>
                  <X size={18} />
                </CloseButton>
              </FormHeader>

              <FormField>
                <Label>Customer Name *</Label>
                <Input
                  type="text"
                  placeholder="Enter customer name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  disabled={submitting}
                />
              </FormField>
              
              <FormField>
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  disabled={submitting}
                />
              </FormField>
              
              <FormField>
                <Label>Delivery Address (Optional)</Label>
                <Input
                  type="text"
                  placeholder="Enter delivery address"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  disabled={submitting}
                />
              </FormField>

              <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Items:</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{cartItemCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700 }}>Total:</span>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ed7734' }}>{formatPrice(cartTotal)}</span>
                </div>
              </div>
              
              <CheckoutButton
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                onClick={handleCreateOrder}
                disabled={submitting}
                style={{ marginTop: '1.5rem' }}
              >
                {submitting ? (
                  <>
                    <ShoppingCart size={20} />
                    Creating Order...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Create QR Code Order Tracker
                  </>
                )}
              </CheckoutButton>
            </CustomerForm>
          </CustomerFormModal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {orderSuccess && (
          <SuccessModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SuccessModalCard
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={event => event.stopPropagation()}
            >
              <SuccessIcon>
                <CheckCircle size={28} />
              </SuccessIcon>
              <SuccessTitle>Order Tracker created successfully!</SuccessTitle>
              <SuccessDetails>QR code is ready for driver pickup tracking.</SuccessDetails>
              <SuccessMeta>
                <div>
                  <SuccessMetaLabel>Order:</SuccessMetaLabel> #{orderSuccess.orderNumber}
                </div>
                <div>
                  <SuccessMetaLabel>Location:</SuccessMetaLabel> {orderSuccess.locationName}
                </div>
                <div>
                  <SuccessMetaLabel>Total:</SuccessMetaLabel> {formatPrice(orderSuccess.total)}
                </div>
              </SuccessMeta>
              <SuccessActions>
                <SuccessActionButton type="button" onClick={handleSuccessDismiss}>
                  OK
                </SuccessActionButton>
                <SuccessActionButton type="button" $variant="primary" onClick={handleGoToQr}>
                  Go to QR Tracker
                </SuccessActionButton>
              </SuccessActions>
            </SuccessModalCard>
          </SuccessModalOverlay>
        )}
      </AnimatePresence>
    </OrderContainer>
  );
}
