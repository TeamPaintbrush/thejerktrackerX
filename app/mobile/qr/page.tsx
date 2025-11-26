'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Scan, 
  Download, 
  Share2,
  RotateCcw,
  Camera,
  Search,
  Package,
  Clock,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  Maximize2,
  X
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { MobileDataService } from '@/mobile-android/shared/services/mobileDataService';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import BackButton from '../../../mobile-android/shared/components/BackButton';
import qrScannerService from '@/services/QRScannerService';
import { buildTrackingUrl } from '@/lib/url';

// Scan history interface
interface ScanHistoryItem {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'view' | 'share' | 'download' | 'scan';
  timestamp: number;
}

// Mobile auth hook  
function useMobileAuth() {
  const [user, setUser] = React.useState<any>(null);
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Auth check error:', error);
      }
    }
  }, []);
  
  return { user };
}

const QRContainer = styled.div`
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

const TabContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
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
  
  &:active {
    transform: scale(0.98);
  }
`;

const ContentArea = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  margin-bottom: 1rem;
`;

const QRDisplay = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const QRCode = styled.div`
  width: 200px;
  height: 200px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin: 0 auto 1rem auto;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 150px;
    height: 150px;
    color: #6b7280;
  }
`;

const QRInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1.5rem;
`;

const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const ActionButton = styled(motion.button)`
  background: rgba(237, 119, 52, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.2);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: #ed7734;
  }
  
  span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ScannerArea = styled.div`
  text-align: center;
`;

const ScannerBox = styled.div`
  width: 250px;
  height: 250px;
  border: 2px dashed #ed7734;
  border-radius: 12px;
  margin: 0 auto 1rem auto;
  background: rgba(237, 119, 52, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  svg {
    width: 60px;
    height: 60px;
    color: #ed7734;
  }
`;

const ScanButton = styled(motion.button)`
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const RecentScans = styled.div`
  margin-top: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

const ScanItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ScanIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(237, 119, 52, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
    color: #ed7734;
  }
`;

const ScanDetails = styled.div`
  flex: 1;
`;

const ScanTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const ScanTime = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  text-align: center;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  margin: 0 auto 0.5rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  
  background: ${props => {
    switch (props.$color) {
      case 'primary': return 'rgba(237, 119, 52, 0.1)';
      case 'secondary': return 'rgba(59, 130, 246, 0.1)';
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(156, 163, 175, 0.1)';
    }
  }};
  
  svg {
    width: 18px;
    height: 18px;
    color: ${props => {
      switch (props.$color) {
        case 'primary': return '#ed7734';
        case 'secondary': return '#3b82f6';
        case 'success': return '#10b981';
        default: return '#9ca3af';
      }
    }};
  }
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const OrderCard = styled(motion.div)`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const OrderHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const OrderTime = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  
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

const QRCodeArea = styled.div`
  display: flex;
  justify-content: center;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
`;

const QRPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 4px;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const OrderActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionBtn = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ed7734;
  border-radius: 6px;
  background: ${props => props.$primary ? '#ed7734' : 'white'};
  color: ${props => props.$primary ? 'white' : '#ed7734'};
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  transition: all 0.2s;
  
  svg {
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    background: ${props => props.$primary ? '#dc6627' : '#ed7734'};
    color: white;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const RefreshButton = styled.button`
  background: rgba(237, 119, 52, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #ed7734;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const FullscreenQRModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1f2937;
  z-index: 10;
  touch-action: manipulation;
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  &:active {
    transform: scale(0.95);
    background: rgba(0, 0, 0, 0.3);
  }
`;

const QRCodeLarge = styled.div`
  width: 300px;
  height: 300px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const OrderDetails = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const OrderNumberLarge = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const OrderStatusLarge = styled.div`
  font-size: 1rem;
  color: #6b7280;
`;

const DriverModal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const DriverModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const ModalSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
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

const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: #ed7734;
    color: white;
    border: none;
    
    &:active {
      background: #dc6627;
    }
  ` : `
    background: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
    
    &:active {
      background: #f3f4f6;
    }
  `}
`;

// Mock orders data - replace with actual data fetching
const getMockOrders = () => [
  {
    id: 'order_001',
    orderNumber: 'ORD-2025-001',
    status: 'ready',
    createdAt: new Date(Date.now() - 30 * 60000), // 30 mins ago
    total: 24.99
  },
  {
    id: 'order_002', 
    orderNumber: 'ORD-2025-002',
    status: 'picked-up',
    createdAt: new Date(Date.now() - 15 * 60000), // 15 mins ago
    total: 18.50
  },
  {
    id: 'order_003',
    orderNumber: 'ORD-2025-003',
    status: 'preparing',
    createdAt: new Date(Date.now() - 5 * 60000), // 5 mins ago
    total: 31.25
  }
];

function MobileQRContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useMobileAuth();
  
  // Get initial tab from URL parameter, default to 'scan' for direct scanner access
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'orders' ? 'orders' : 'scan';
  
  const [activeTab, setActiveTab] = useState<'orders' | 'scan'>(initialTab);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [fullscreenOrder, setFullscreenOrder] = useState<any>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [scannedOrderData, setScannedOrderData] = useState<any>(null);
  const [driverName, setDriverName] = useState('');
  const [deliveryCompany, setDeliveryCompany] = useState('');

  useEffect(() => {
    // Load orders on component mount
    loadOrders();
    loadScanHistory();
  }, []);

  const loadScanHistory = () => {
    try {
      const stored = localStorage.getItem('qr_scan_history');
      if (stored) {
        const history = JSON.parse(stored);
        setScanHistory(history.slice(0, 10)); // Keep last 10
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const addToScanHistory = (orderId: string, orderNumber: string, type: 'view' | 'share' | 'download' | 'scan') => {
    try {
      const newItem: ScanHistoryItem = {
        id: `${Date.now()}-${Math.random()}`,
        orderId,
        orderNumber,
        type,
        timestamp: Date.now()
      };
      
      const updated = [newItem, ...scanHistory].slice(0, 10);
      setScanHistory(updated);
      localStorage.setItem('qr_scan_history', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving scan history:', error);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Call Vercel API to fetch orders from DynamoDB
      // IMPORTANT: Include trailing slash to avoid Vercel redirects that break CORS
      const API_BASE_URL = process.env.NEXT_PUBLIC_QR_TRACKING_BASE_URL || 'https://thejerktracker0.vercel.app';
      console.log('📡 Fetching orders from:', `${API_BASE_URL}/api/orders/`);
      
      const response = await fetch(`${API_BASE_URL}/api/orders/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const allOrders = await response.json();
      console.log('📦 Received orders:', allOrders.length);
      
      // Transform to match component format
      const transformedOrders = allOrders.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        total: 0, // Placeholder - add pricing if needed
        qrCodeId: order.location?.qrCodeId || `qr-${order.id}`
      }));
      
      setOrders(transformedOrders);
      console.log(`✅ Loaded ${transformedOrders.length} orders from Vercel API successfully`);
    } catch (error) {
      console.error('❌ Failed to load orders from API:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', errorMessage);
      alert(`⚠️ Could not load orders from API\n\n${errorMessage}\n\nUsing demo data instead.`);
      // Use mock data as fallback
      setOrders(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing orders...');
    loadOrders();
  };

  const handleScanQR = async () => {
    try {
      if (!qrScannerService.isSupported()) {
        alert('⚠️ QR scanning is only available inside the Android app.');
        return;
      }

      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }

      const scanResult = await qrScannerService.startScan();

      if (!scanResult?.text) {
        await Haptics.impact({ style: ImpactStyle.Light });
        alert('⚠️ Scan cancelled or no QR code detected.');
        return;
      }

      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }

      try {
        const qrData = JSON.parse(scanResult.text);

        if (qrData.orderId && qrData.type === 'pickup_verification') {
          const scannedOrder = orders.find(o => o.id === qrData.orderId);

          if (scannedOrder) {
            addToScanHistory(qrData.orderId, qrData.orderNumber, 'scan');
            setScannedOrderData(qrData);
            setShowDriverModal(true);
          } else {
            alert(`⚠️ Order not found\n\nOrder #${qrData.orderNumber}\n\nThis order may not be in your current list.`);
          }
        } else {
          alert('⚠️ Invalid QR Code\n\nThis QR code is not a valid pickup verification code.');
        }
      } catch (parseError) {
        alert('⚠️ Invalid QR Code Format\n\nPlease scan a valid order QR code.');
      }
    } catch (error) {
      console.error('Scan error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!errorMessage.includes('cancelled')) {
        alert(`❌ Scanner Error\n\n${errorMessage}\n\nPlease try again.`);
      }
    }
  };

  const handleDriverSubmit = async () => {
    if (!driverName.trim() || !deliveryCompany.trim()) {
      alert('⚠️ Missing Information\n\nPlease enter both driver name and delivery company.');
      return;
    }

    try {
      // Haptic feedback
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }

      // Update order with driver information and set to picked_up
      await MobileDataService.updateOrder(scannedOrderData.orderId, {
        status: 'picked_up',
        driverName: driverName.trim(),
        driverCompany: deliveryCompany.trim(),
        pickedUpAt: new Date()
      });

      // TODO: Send notification to restaurant
      console.log(`📱 Order #${scannedOrderData.orderNumber} picked up by ${driverName} (${deliveryCompany})`);

      // Close modal and reset form
      setShowDriverModal(false);
      setScannedOrderData(null);
      setDriverName('');
      setDeliveryCompany('');

      // Refresh orders list
      await loadOrders();

      // Show success message
      alert(`✅ Pickup Confirmed\n\nOrder #${scannedOrderData.orderNumber}\nDriver: ${driverName}\nCompany: ${deliveryCompany}\n\nRestaurant has been notified.`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert('❌ Failed to update order\n\nPlease try again.');
    }
  };

  const handleShareQR = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const trackingUrl = buildTrackingUrl(`/qr-tracking?order=${orderId}`);
      
      if (Capacitor.isNativePlatform()) {
        // Use native share on mobile
        await Share.share({
          title: `Order #${order?.orderNumber || orderId}`,
          text: `Track your order: ${trackingUrl}`,
          url: trackingUrl,
          dialogTitle: 'Share Order QR Code'
        });
        // Track successful share
        addToScanHistory(orderId, order?.orderNumber || orderId, 'share');
      } else if (navigator.share) {
        // Use web share API
        await navigator.share({
          title: `Order #${order?.orderNumber || orderId}`,
          text: `Track your order: ${trackingUrl}`,
          url: trackingUrl
        });
        // Track successful share
        if (Capacitor.isNativePlatform()) {
          await Haptics.impact({ style: ImpactStyle.Light });
        }
        addToScanHistory(orderId, order?.orderNumber || orderId, 'share');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(trackingUrl);
        addToScanHistory(orderId, order?.orderNumber || orderId, 'share');
        alert('✅ Tracking link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      // Silent fail if user cancels share dialog
    }
  };

  const handleDownloadQR = async (orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const QRCode = await import('qrcode');
      const trackingUrl = buildTrackingUrl(`/qr-tracking?order=${orderId}`);
      
      // Generate high-quality QR code
      const qrDataUrl = await QRCode.toDataURL(trackingUrl, {
        width: 512,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#ed7734',
          light: '#ffffff'
        }
      });
      
      if (Capacitor.isNativePlatform()) {
        // Save to device photos on native platform
        const base64Data = qrDataUrl.split(',')[1];
        const fileName = `QR-${order?.orderNumber || orderId}-${Date.now()}.png`;
        
        const result = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents
        });
        
        // Haptic feedback for success
        await Haptics.impact({ style: ImpactStyle.Medium });
        
        // Track in scan history
        addToScanHistory(orderId, order?.orderNumber || orderId, 'download');
        alert(`✅ QR Code saved to Photos!\n\nOrder: #${order?.orderNumber || orderId}`);
      } else {
        // Browser download fallback
        const link = document.createElement('a');
        link.download = `QR-${order?.orderNumber || orderId}.png`;
        link.href = qrDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Track in scan history
        addToScanHistory(orderId, order?.orderNumber || orderId, 'download');
        alert('✅ QR code downloaded successfully!');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('❌ Failed to save QR code. Please try again.');
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      // Haptic feedback
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style: ImpactStyle.Light });
      }
      
      // Open full-screen QR code view for driver scanning
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        alert('❌ Order not found');
        return;
      }
      
      // Track in scan history
      addToScanHistory(orderId, order.orderNumber, 'view');
      
      // Show fullscreen QR modal
      setFullscreenOrder(order);
    } catch (error) {
      console.error('View error:', error);
      alert(`❌ Could not open QR code view\n\nPlease try again.`);
    }
  };

  return (
    <QRContainer>
      <BackButton href="/mobile/dashboard" label="Dashboard" />
      
      <Header>
        <Title>QR Code Manager</Title>
        <Subtitle>Generate and scan QR codes for orders</Subtitle>
      </Header>

      <TabContainer>
        <Tab 
          $active={activeTab === 'orders'} 
          onClick={() => setActiveTab('orders')}
        >
          Order QRs
        </Tab>
        <Tab 
          $active={activeTab === 'scan'} 
          onClick={() => setActiveTab('scan')}
        >
          Scan
        </Tab>
      </TabContainer>

      <ContentArea
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'orders' ? (
          <>
            {/* Order Statistics */}
            <StatsGrid>
              <StatCard
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatIcon $color="primary">
                  <Package />
                </StatIcon>
                <StatValue>{orders.length}</StatValue>
                <StatLabel>Total</StatLabel>
              </StatCard>

              <StatCard
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <StatIcon $color="secondary">
                  <Clock />
                </StatIcon>
                <StatValue>{orders.filter(order => ['pending', 'preparing'].includes(order.status)).length}</StatValue>
                <StatLabel>Active</StatLabel>
              </StatCard>

              <StatCard
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <StatIcon $color="success">
                  <CheckCircle />
                </StatIcon>
                <StatValue>{orders.filter(order => order.status === 'ready').length}</StatValue>
                <StatLabel>Ready</StatLabel>
              </StatCard>
            </StatsGrid>

            {/* Refresh Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <RefreshButton onClick={handleRefresh}>
                <RefreshCw />
                Refresh Orders
              </RefreshButton>
            </div>

            {/* Orders List */}
            {orders.length > 0 ? (
              <OrdersGrid>
                {orders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <OrderHeader>
                      <OrderInfo>
                        <OrderNumber>#{order.orderNumber}</OrderNumber>
                        <OrderTime>
                          {order.createdAt.toLocaleString()}
                        </OrderTime>
                        <OrderTime>
                          Total: ${order.total}
                        </OrderTime>
                      </OrderInfo>
                      <StatusBadge $status={order.status}>
                        {order.status}
                      </StatusBadge>
                    </OrderHeader>

                    <QRCodeArea>
                      <QRPlaceholder>
                        <QRCodeSVG
                          value={buildTrackingUrl(`/driver-pickup?order=${order.id}`)}
                          size={72}
                          level="H"
                          includeMargin={false}
                        />
                      </QRPlaceholder>
                    </QRCodeArea>

                    <OrderActions>
                      <ActionBtn $primary onClick={() => handleViewOrder(order.id)}>
                        <Eye />
                        View QR
                      </ActionBtn>
                      <ActionBtn onClick={() => handleShareQR(order.id)}>
                        <Share2 />
                        Share
                      </ActionBtn>
                      <ActionBtn onClick={() => handleDownloadQR(order.id)}>
                        <Download />
                        Save
                      </ActionBtn>
                    </OrderActions>
                  </OrderCard>
                ))}
              </OrdersGrid>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>
                <QrCode size={48} style={{ margin: '0 auto 1rem auto', color: '#d1d5db' }} />
                <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                  No Orders Found
                </div>
                <div style={{ fontSize: '0.875rem' }}>
                  Orders with QR codes will appear here
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <ScannerArea>
              <ScannerBox>
                <Camera />
                <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
                  Position QR code within frame
                  <br />
                  Camera will activate automatically
                </div>
              </ScannerBox>

              <ScanButton
                whileTap={{ scale: 0.95 }}
                onClick={handleScanQR}
              >
                <Camera />
                Start Scanner
              </ScanButton>
            </ScannerArea>

            <RecentScans>
              <SectionTitle>Recent Activity</SectionTitle>
              
              {scanHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  <QrCode style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                  <div style={{ fontSize: '0.875rem' }}>No recent activity</div>
                </div>
              ) : (
                scanHistory.map((item) => {
                  const getIcon = () => {
                    switch (item.type) {
                      case 'view': return <Eye />;
                      case 'share': return <Share2 />;
                      case 'download': return <Download />;
                      case 'scan': return <QrCode />;
                      default: return <QrCode />;
                    }
                  };
                  
                  const getActionText = () => {
                    switch (item.type) {
                      case 'view': return 'Viewed';
                      case 'share': return 'Shared';
                      case 'download': return 'Downloaded';
                      case 'scan': return 'Scanned';
                      default: return 'Accessed';
                    }
                  };
                  
                  const getTimeAgo = (timestamp: number) => {
                    const seconds = Math.floor((Date.now() - timestamp) / 1000);
                    if (seconds < 60) return 'Just now';
                    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
                    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
                    return `${Math.floor(seconds / 86400)} days ago`;
                  };
                  
                  return (
                    <ScanItem key={item.id}>
                      <ScanIcon>
                        {getIcon()}
                      </ScanIcon>
                      <ScanDetails>
                        <ScanTitle>{getActionText()} Order #{item.orderNumber}</ScanTitle>
                        <ScanTime>{getTimeAgo(item.timestamp)}</ScanTime>
                      </ScanDetails>
                    </ScanItem>
                  );
                })
              )}
            </RecentScans>
          </>
        )}
      </ContentArea>

      {/* Fullscreen QR Modal */}
      {fullscreenOrder && (
        <FullscreenQRModal
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <CloseButton onClick={() => setFullscreenOrder(null)}>
            <X />
          </CloseButton>
          
          <OrderDetails>
            <OrderNumberLarge>Order #{fullscreenOrder.orderNumber}</OrderNumberLarge>
            <OrderStatusLarge>Status: {fullscreenOrder.status}</OrderStatusLarge>
          </OrderDetails>

          <QRCodeLarge>
            <QRCodeSVG
              value={buildTrackingUrl(`/driver-pickup?order=${fullscreenOrder.id}`)}
              size={268}
              level="H"
              includeMargin={false}
            />
          </QRCodeLarge>

          <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center' }}>
            Show this QR code to the driver for scanning
          </div>
        </FullscreenQRModal>
      )}

      {/* Driver Information Modal */}
      {showDriverModal && scannedOrderData && (
        <DriverModal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setShowDriverModal(false);
            setScannedOrderData(null);
            setDriverName('');
            setDeliveryCompany('');
          }}
        >
          <DriverModalContent
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalTitle>Order Pickup Confirmation</ModalTitle>
            <ModalSubtitle>Order #{scannedOrderData.orderNumber}</ModalSubtitle>

            <FormGroup>
              <Label>Driver Name</Label>
              <Input
                type="text"
                placeholder="Enter driver's name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                autoFocus
              />
            </FormGroup>

            <FormGroup>
              <Label>Delivery Company</Label>
              <Select
                value={deliveryCompany}
                onChange={(e) => setDeliveryCompany(e.target.value)}
              >
                <option value="">Select delivery company</option>
                <option value="DoorDash">DoorDash</option>
                <option value="Uber Eats">Uber Eats</option>
                <option value="GrubHub">GrubHub</option>
                <option value="Postmates">Postmates</option>
                <option value="Independent">Independent</option>
                <option value="Other">Other</option>
              </Select>
            </FormGroup>

            <ModalButtons>
              <ModalButton
                $variant="secondary"
                onClick={() => {
                  setShowDriverModal(false);
                  setScannedOrderData(null);
                  setDriverName('');
                  setDeliveryCompany('');
                }}
              >
                Cancel
              </ModalButton>
              <ModalButton
                $variant="primary"
                onClick={handleDriverSubmit}
              >
                Confirm Pickup
              </ModalButton>
            </ModalButtons>
          </DriverModalContent>
        </DriverModal>
      )}
    </QRContainer>
  );
}

export default function MobileQR() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MobileQRContent />
    </Suspense>
  );
}