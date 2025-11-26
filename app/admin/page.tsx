'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { DynamoDBService, Order } from '../../lib/dynamodb';
import { LoadingOverlay } from '@/components/Loading';
import { 
  Home, 
  PlusCircle, 
  Package, 
  BarChart3, 
  Settings, 
  QrCode, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Menu,
  X,
  Search,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  List,
  LayoutGrid,
  Calendar as CalendarIcon
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Container, Button, Heading, Text, Flex, Grid, Card } from '../../styles/components';
import OrderForm from '../../components/OrderForm';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import OrderList from '../../components/OrderList';
import OrderBoard from '../../components/OrderBoard';
import MenuManagementDashboard from '../../components/MenuManagementDashboard';
import { PRESET_FOOD_ITEMS, FOOD_CATEGORIES, formatPrice } from '../../lib/foodItems';
import RestaurantSettings from '../../components/admin/RestaurantSettings';
import OrderSettings from '../../components/admin/OrderSettings';
import NotificationSettings from '../../components/admin/NotificationSettings';
import UserProfileSettings from '../../components/admin/UserProfileSettings';
import SystemSettings from '../../components/admin/SystemSettings';
import BillingSettings from '../../components/admin/BillingSettings';
import LocationSettings from '../../components/admin/LocationSettings';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #fafaf9;
`;

// Top Navigation Bar Components
const TopNavBar = styled.header`
  background: white;
  border-bottom: 2px solid #e7e5e4;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const NavContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(237, 119, 52, 0.3);
`;

const NavMenu = styled.nav`
  display: none;
  
  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavItem = styled.li`
  display: inline-flex;
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' : '#f5f5f4'};
    color: ${props => props.$active ? 'white' : '#1c1917'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SearchContainer = styled.div`
  position: relative;
  display: none;
  
  @media (min-width: 768px) {
    display: block;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a8a29e;
  width: 16px;
  height: 16px;
`;

const SearchInput = styled.input`
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  width: 200px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
    width: 256px;
  }
`;

const IconButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: #78716c;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    color: #1c1917;
    background: #f5f5f4;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
`;

const NotificationDropdown = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 360px;
  max-height: 480px;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid #e7e5e4;
  overflow: hidden;
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  z-index: 100;

  @media (max-width: 480px) {
    width: calc(100vw - 2rem);
    right: -1rem;
  }
`;

const NotificationHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e7e5e4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fafaf9;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1c1917;
  margin: 0;
`;

const MarkAllRead = styled.button`
  font-size: 0.75rem;
  color: #ed7734;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const NotificationList = styled.div`
  overflow-y: auto;
  max-height: 400px;
`;

const NotificationItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'unread',
})<{ unread?: boolean }>`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f5f5f4;
  cursor: pointer;
  transition: background 0.2s;
  background: ${props => props.unread ? '#fef7ee' : 'white'};
  
  &:hover {
    background: #fafaf9;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const NotificationIcon = styled.div<{ color: string }>`
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NotificationText = styled.div`
  flex: 1;
`;

const NotificationMessage = styled.p.withConfig({
  shouldForwardProp: (prop) => prop !== 'unread',
})<{ unread?: boolean }>`
  font-size: 0.875rem;
  color: #1c1917;
  margin: 0 0 0.25rem 0;
  font-weight: ${props => props.unread ? '600' : '400'};
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: #78716c;
`;

const EmptyNotifications = styled.div`
  padding: 3rem 1.25rem;
  text-align: center;
  color: #78716c;
`;

const NotificationWrapper = styled.div`
  position: relative;
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  border: 1px solid #e7e5e4;
  background: white;
  color: #44403c;
  cursor: pointer;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: #f5f5f4;
    border-color: #d6d3d1;
  }

  span {
    display: none;
    
    @media (min-width: 640px) {
      display: inline;
    }
  }
`;

const MobileMenuButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: none;
  color: #78716c;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f4;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

// Mobile Menu Overlay
const MobileMenuOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
`;

const MobileMenu = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease-in-out;
  z-index: 50;
  overflow-y: auto;
`;

const MobileMenuHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e7e5e4;
`;

const MobileMenuNav = styled.nav`
  padding: 1rem;
`;

const MobileNavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MobileNavItem = styled.li`
  width: 100%;
`;

const MobileNavButton = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 0.5rem;
  border: none;
  text-align: left;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  background: ${props => props.$active ? '#ed773410' : 'transparent'};
  color: ${props => props.$active ? '#ed7734' : '#44403c'};
  font-size: 0.9375rem;

  &:hover {
    background: ${props => props.$active ? '#ed773410' : '#f5f5f4'};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: none;
  background: none;
  color: #78716c;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f4;
  }
`;

const MainContent = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
`;

const MainContainer = styled.main`
  padding: 1.5rem;
`;

const StatsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled(Card)`
  padding: 1.5rem;
  background: white;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  background: ${props => {
    switch(props.color) {
      case 'primary': return 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)';
      case 'secondary': return 'linear-gradient(135deg, #78716c 0%, #57534e 100%)';
      case 'accent': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'success': return 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
      default: return 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)';
    }
  }};
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatTrend = styled.div<{ trend: 'up' | 'down' }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.trend === 'up' ? '#22c55e' : '#ef4444'};
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 0.25rem;
`;

const StatTitle = styled.div`
  color: #78716c;
  font-size: 0.875rem;
`;

const SectionCard = styled(Card)`
  background: white;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const QuickActionsGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px dashed #d6d3d1;
  border-radius: 0.75rem;
  background: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #44403c;

  &:hover {
    border-color: #ed7734;
    background: #ed773410;
  }
`;

const RecentOrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RecentOrderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
`;

const StatusBadge = styled.span<{ status: 'pending' | 'picked_up' | 'delivered' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    if (props.status === 'pending') return '#f59e0b20';
    if (props.status === 'picked_up') return '#22c55e20';
    return '#3b82f620'; // delivered - blue
  }};
  color: ${props => {
    if (props.status === 'pending') return '#f59e0b';
    if (props.status === 'picked_up') return '#22c55e';
    return '#3b82f6'; // delivered - blue
  }};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ViewAllButton = styled.button`
  color: #ed7734;
  background: none;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #de5d20;
  }
`;

const ActionButtonsGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f5f5f4;
  color: #44403c;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #de5d20;
  }
`;

const ViewModeToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  background: #f5f5f4;
  padding: 0.25rem;
  border-radius: 0.5rem;
`;

const ViewModeButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#ed7734' : '#78716c'};
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};

  &:hover {
    background: ${props => props.$active ? 'white' : '#e7e5e4'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isClient, setIsClient] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [ordersViewMode, setOrdersViewMode] = useState<'list' | 'board' | 'timeline'>('list');
  
  // Mock notifications - in a real app, this would come from an API or database
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: 'New order #1234 received',
      time: '5 minutes ago',
      unread: true,
      icon: <Package size={18} />,
      color: '#ed7734'
    },
    {
      id: 2,
      message: 'Order #1230 has been delivered',
      time: '1 hour ago',
      unread: true,
      icon: <CheckCircle size={18} />,
      color: '#22c55e'
    },
    {
      id: 3,
      message: 'Order #1228 is ready for pickup',
      time: '2 hours ago',
      unread: false,
      icon: <Clock size={18} />,
      color: '#f59e0b'
    }
  ]);

  // Restaurant Settings State
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'The JERK Tracker',
    address: '123 Main Street, City, State 12345',
    phone: '(555) 123-4567',
    email: 'contact@thejerktrackerx.com',
    website: 'https://thejerktrackerx.com'
  });

  const [operatingHours, setOperatingHours] = useState({
    Monday: { open: '09:00', close: '21:00', closed: false },
    Tuesday: { open: '09:00', close: '21:00', closed: false },
    Wednesday: { open: '09:00', close: '21:00', closed: false },
    Thursday: { open: '09:00', close: '21:00', closed: false },
    Friday: { open: '09:00', close: '22:00', closed: false },
    Saturday: { open: '10:00', close: '22:00', closed: false },
    Sunday: { open: '10:00', close: '20:00', closed: false }
  });

  // Order Settings State
  const [orderConfig, setOrderConfig] = useState({
    defaultStatus: 'pending',
    autoCompleteTimer: 30,
    orderNumberFormat: 'sequential',
    orderNumberPrefix: 'ORD',
    enableAutoComplete: true,
    enableOrderTracking: true
  });

  // Notification Settings State
  const [notificationPreferences, setNotificationPreferences] = useState({
    email: {
      enabled: true,
      newOrders: true,
      orderUpdates: true,
      customerMessages: true,
      dailySummary: false,
      weeklyReport: true
    },
    sms: {
      enabled: false,
      urgentOrders: false,
      orderReady: false,
      customerArrival: false
    },
    push: {
      enabled: true,
      newOrders: true,
      orderUpdates: true,
      systemAlerts: true,
      lowInventory: false
    }
  });

  // User Profile Settings State
  const [userInfo, setUserInfo] = useState({
    name: 'Admin User',
    email: 'admin@thejerktrackerx.com',
    phone: '(555) 987-6543',
    role: 'Administrator'
  });

  const [userPreferences, setUserPreferences] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    notifications: true
  });

  // System Settings State
  const [systemConfig, setSystemConfig] = useState({
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h' as '12h' | '24h',
    firstDayOfWeek: 'sunday' as 'sunday' | 'monday'
  });

  // Billing Settings State
  const [billingInfo, setBillingInfo] = useState({
    currentPlan: 'professional' as 'free' | 'basic' | 'professional' | 'enterprise',
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    nextBillingDate: 'February 15, 2025',
    paymentMethod: {
      type: 'card' as 'card' | 'paypal' | 'none',
      last4: '4242',
      expiryDate: '12/25'
    }
  });

  // Location Settings State
  const [locationInfo, setLocationInfo] = useState({
    businessAddress: {
      street: '123 Jerk Street',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'United States'
    },
    coordinates: {
      latitude: 25.7617,
      longitude: -80.1918
    },
    deliveryZones: [
      { id: '1', name: 'Downtown Miami', radius: 5, active: true },
      { id: '2', name: 'South Beach', radius: 3, active: true },
      { id: '3', name: 'Coral Gables', radius: 7, active: false }
    ],
    enableGeolocation: true
  });

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    // TODO: Implement password change logic
    console.log('Password change requested');
    return Promise.resolve();
  };

  // Settings update handlers
  const handleUpdateRestaurantInfo = (info: any) => {
    setRestaurantInfo(info);
    // Settings are persisted automatically via state management
  };

  const handleUpdateOperatingHours = (hours: any) => {
    setOperatingHours(hours as any);
  };

  const handleUpdateOrderConfig = (config: any) => {
    setOrderConfig(config);
  };

  const handleUpdateNotificationPreferences = (prefs: any) => {
    setNotificationPreferences(prefs);
  };

  const handleUpdateUserInfo = (info: any) => {
    setUserInfo(info);
  };

  const handleUpdateUserPreferences = (prefs: any) => {
    setUserPreferences(prefs);
  };

  const handleUpdateSystemConfig = (config: any) => {
    setSystemConfig(config);
  };

  const handleUpdateBilling = (info: any) => {
    setBillingInfo(prev => ({ ...prev, ...info }));
  };

  const handleUpdateLocation = (info: any) => {
    setLocationInfo(prev => ({ ...prev, ...info }));
  };

  // Notification handlers
  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
    setNotificationsOpen(false);
    // Navigate to relevant page or show detail
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  // Authentication check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/'); // Redirect if not an admin
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (notificationsOpen && !target.closest('[data-notification-wrapper]')) {
        setNotificationsOpen(false);
      }
    };

    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notificationsOpen]);

  useEffect(() => {
    if (!isClient) return;
    
    // Load orders from localStorage
    const loadOrders = async () => {
      try {
        const ordersFromDB = await DynamoDBService.getAllOrders();
        setOrders(ordersFromDB);
        if (ordersFromDB.length > 0) {
          setLatestOrder(ordersFromDB[ordersFromDB.length - 1]);
        }
      } catch (error) {
        console.error('Failed to load orders:', error);
        setOrders([]);
      }
    };
    loadOrders();

    // Start auto-complete timer for overdue orders
    DynamoDBService.startAutoCompleteTimer();
  }, [isClient]);

  const handleOrderCreated = async (newOrder: Order) => {
    try {
      // Save to DynamoDB
      await DynamoDBService.createOrder(newOrder);
      // Update local state
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      setLatestOrder(newOrder);
    } catch (error) {
      console.error('Failed to create order:', error);
      // DynamoDBService handles localStorage internally
      const updatedOrders = [...orders, newOrder];
      setOrders(updatedOrders);
      setLatestOrder(newOrder);
    }
  };

  const refreshOrders = async () => {
    try {
      // Reload orders from DynamoDB
      const ordersFromDB = await DynamoDBService.getAllOrders();
      setOrders(ordersFromDB);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      // DynamoDBService handles localStorage internally, so just try again
      setOrders([]);
    }
  };

  const handleOrderStatusUpdate = async (orderId: string, newStatus: 'pending' | 'picked_up' | 'delivered') => {
    try {
      await DynamoDBService.updateOrderStatus(orderId, newStatus);
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Refresh to get current state
      await refreshOrders();
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Order Number', 'Customer Name', 'Status', 'Created At', 'Driver Name', 'Driver Company', 'Picked Up At'],
      ...orders.map(order => [
        order.orderNumber,
        order.customerName || '',
        order.status,
        order.createdAt.toISOString(),
        order.driverName || '',
        order.driverCompany || '',
        order.pickedUpAt ? order.pickedUpAt.toISOString() : '',
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const completedOrders = orders.filter(order => order.status === 'picked_up').length;
  const todayOrders = orders.filter(order => {
    const today = new Date();
    const orderDate = new Date(order.createdAt);
    return orderDate.toDateString() === today.toDateString();
  }).length;

  const sidebarItems = [
    { id: 'dashboard', icon: <BarChart3 size={20} />, label: 'Dashboard' },
    { id: 'orders', icon: <Package size={20} />, label: 'Orders' },
    { id: 'create', icon: <PlusCircle size={20} />, label: 'Create Order' },
    { id: 'menu', icon: <Menu size={20} />, label: 'Menu Items' },
    { id: 'qr', icon: <QrCode size={20} />, label: 'QR Codes', href: '/qr-tracking' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const statCards = [
    {
      title: 'Total Orders',
      value: totalOrders,
      change: '+12%',
      trend: 'up' as const,
      icon: <Package size={24} />,
      color: 'primary'
    },
    {
      title: 'Today\'s Orders',
      value: todayOrders,
      change: '+8%',
      trend: 'up' as const,
      icon: <Clock size={24} />,
      color: 'secondary'
    },
    {
      title: 'Pending',
      value: pendingOrders,
      change: '-5%',
      trend: 'down' as const,
      icon: <Clock size={24} />,
      color: 'accent'
    },
    {
      title: 'Completed',
      value: completedOrders,
      change: '+15%',
      trend: 'up' as const,
      icon: <CheckCircle size={24} />,
      color: 'success'
    }
  ];

  // Loading state
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingOverlay isLoading={true} message="Loading admin dashboard...">
          <div />
        </LoadingOverlay>
      </div>
    );
  }

  return (
    <DashboardContainer>
      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MobileMenuOverlay onClick={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen}>
        <MobileMenuHeader>
          <Logo href="/">
            <LogoIcon>JT</LogoIcon>
            <div>
              <Heading as="h1" $size="lg" $mb="0" $weight="bold" $color="#1c1917">TheJERKTracker</Heading>
              <Text $size="xs" $color="#78716c">Admin Panel</Text>
            </div>
          </Logo>
          <CloseButton onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </CloseButton>
        </MobileMenuHeader>

        <MobileMenuNav>
          <MobileNavList>
            {sidebarItems.map((item) => (
              <MobileNavItem key={item.id}>
                {item.href ? (
                  <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
                    <MobileNavButton
                      $active={false}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </MobileNavButton>
                  </Link>
                ) : (
                  <MobileNavButton
                    $active={activeTab === item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </MobileNavButton>
                )}
              </MobileNavItem>
            ))}
          </MobileNavList>

          {/* Mobile Menu Footer */}
          <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #e7e5e4' }}>
            <Link href="/" style={{ textDecoration: 'none', width: '100%', display: 'block' }}>
              <MobileNavButton $active={false} onClick={() => setMobileMenuOpen(false)}>
                <Home size={20} />
                <span>Back to Home</span>
              </MobileNavButton>
            </Link>
            
            <MobileNavButton
              $active={false}
              onClick={async () => {
                setMobileMenuOpen(false);
                await signOut({ callbackUrl: '/' });
              }}
              style={{ color: '#dc2626' }}
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </MobileNavButton>
          </div>
        </MobileMenuNav>
      </MobileMenu>

      {/* Top Navigation Bar */}
      <TopNavBar>
        <NavContainer>
          <NavLeft>
            {/* Logo */}
            <Logo href="/">
              <LogoIcon>JT</LogoIcon>
              <div>
                <Heading as="h1" $size="lg" $mb="0" $weight="bold" $color="#1c1917">TheJERKTracker</Heading>
                <Text $size="xs" $color="#78716c" style={{ marginTop: '-2px' }}>Admin Panel</Text>
              </div>
            </Logo>

            {/* Desktop Navigation Menu */}
            <NavMenu>
              <NavList>
                {sidebarItems.map((item) => (
                  <NavItem key={item.id}>
                    {item.href ? (
                      <Link href={item.href} style={{ textDecoration: 'none' }}>
                        <NavButton $active={false} onClick={() => {}}>
                          {item.icon}
                          <span>{item.label}</span>
                        </NavButton>
                      </Link>
                    ) : (
                      <NavButton
                        $active={activeTab === item.id}
                        onClick={() => setActiveTab(item.id)}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </NavButton>
                    )}
                  </NavItem>
                ))}
              </NavList>
            </NavMenu>
          </NavLeft>

          <NavRight>
            {/* Search */}
            <SearchContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder="Search orders..."
              />
            </SearchContainer>

            {/* Notifications */}
            <NotificationWrapper data-notification-wrapper>
              <IconButton onClick={() => setNotificationsOpen(!notificationsOpen)}>
                <Bell size={20} />
                {unreadCount > 0 && <NotificationBadge />}
              </IconButton>
              
              <NotificationDropdown isOpen={notificationsOpen}>
                <NotificationHeader>
                  <NotificationTitle>Notifications</NotificationTitle>
                  {unreadCount > 0 && (
                    <MarkAllRead onClick={handleMarkAllAsRead}>
                      Mark all as read
                    </MarkAllRead>
                  )}
                </NotificationHeader>
                
                <NotificationList>
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        unread={notification.unread}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <NotificationContent>
                          <NotificationIcon color={notification.color}>
                            {notification.icon}
                          </NotificationIcon>
                          <NotificationText>
                            <NotificationMessage unread={notification.unread}>
                              {notification.message}
                            </NotificationMessage>
                            <NotificationTime>{notification.time}</NotificationTime>
                          </NotificationText>
                        </NotificationContent>
                      </NotificationItem>
                    ))
                  ) : (
                    <EmptyNotifications>
                      <Bell size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                      <p>No notifications</p>
                    </EmptyNotifications>
                  )}
                </NotificationList>
              </NotificationDropdown>
            </NotificationWrapper>

            {/* User Menu */}
            <UserMenuButton onClick={async () => {
              if (confirm('Are you sure you want to sign out?')) {
                await signOut({ callbackUrl: '/' });
              }
            }}>
              <User size={18} />
              <span>Admin</span>
            </UserMenuButton>

            {/* Mobile Menu Button */}
            <MobileMenuButton onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </MobileMenuButton>
          </NavRight>
        </NavContainer>
      </TopNavBar>

      {/* Main content */}
      <MainContent>
        <MainContainer>
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Stats Cards */}
              <StatsGrid>
                {statCards.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <StatCard>
                      <StatHeader>
                        <StatIcon color={stat.color}>
                          {stat.icon}
                        </StatIcon>
                        <StatTrend trend={stat.trend}>
                          {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          <span>{stat.change}</span>
                        </StatTrend>
                      </StatHeader>
                      <StatValue>{stat.value}</StatValue>
                      <StatTitle>{stat.title}</StatTitle>
                    </StatCard>
                  </motion.div>
                ))}
              </StatsGrid>

              {/* Quick Actions */}
              <SectionCard>
                <Heading as="h3" $size="lg" $weight="bold" $mb="1rem" $color="#1c1917">Quick Actions</Heading>
                <QuickActionsGrid>
                  <QuickActionButton onClick={() => setActiveTab('create')}>
                    <PlusCircle size={24} color="#ed7734" />
                    <span>Create New Order</span>
                  </QuickActionButton>
                  <QuickActionButton onClick={handleExportCSV}>
                    <Download size={24} color="#ed7734" />
                    <span>Export Orders</span>
                  </QuickActionButton>
                  <QuickActionButton onClick={refreshOrders}>
                    <RefreshCw size={24} color="#ed7734" />
                    <span>Refresh Data</span>
                  </QuickActionButton>
                </QuickActionsGrid>
              </SectionCard>

              {/* Recent Orders Preview */}
              <SectionCard>
                <SectionHeader>
                  <Heading as="h3" $size="lg" $weight="bold" $mb="0" $color="#1c1917">Recent Orders</Heading>
                  <ViewAllButton onClick={() => setActiveTab('orders')}>
                    View All
                  </ViewAllButton>
                </SectionHeader>
                <RecentOrdersList>
                  {orders.slice(0, 5).map((order) => (
                    <RecentOrderItem key={order.id}>
                      <div>
                        <Text $size="base" $weight="medium" $color="#1c1917">#{order.orderNumber}</Text>
                        <Text $size="sm" $color="#78716c">{order.customerName}</Text>
                      </div>
                      <StatusBadge status={order.status}>
                        {order.status === 'pending' ? 'Pending' : 
                         order.status === 'picked_up' ? 'Picked Up' : 'Delivered'}
                      </StatusBadge>
                    </RecentOrderItem>
                  ))}
                </RecentOrdersList>
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'create' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" $size="xl" $weight="bold" $mb="1.5rem" $color="#1c1917">Create New Order</Heading>
                <OrderForm onOrderCreated={handleOrderCreated} />
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <SectionHeader>
                  <Heading as="h3" $size="xl" $weight="bold" $mb="0" $color="#1c1917">All Orders</Heading>
                  <ActionButtonsGroup>
                    <ViewModeToggle>
                      <ViewModeButton 
                        $active={ordersViewMode === 'list'}
                        onClick={() => setOrdersViewMode('list')}
                        title="List View"
                      >
                        <List />
                        <span>List</span>
                      </ViewModeButton>
                      <ViewModeButton 
                        $active={ordersViewMode === 'board'}
                        onClick={() => setOrdersViewMode('board')}
                        title="Kanban Board"
                      >
                        <LayoutGrid />
                        <span>Board</span>
                      </ViewModeButton>
                      <ViewModeButton 
                        $active={ordersViewMode === 'timeline'}
                        onClick={() => setOrdersViewMode('timeline')}
                        title="Timeline View"
                      >
                        <CalendarIcon />
                        <span>Timeline</span>
                      </ViewModeButton>
                    </ViewModeToggle>
                    <RefreshButton onClick={refreshOrders}>
                      <RefreshCw size={16} />
                      <span>Refresh</span>
                    </RefreshButton>
                    <ExportButton onClick={handleExportCSV}>
                      <Download size={16} />
                      <span>Export CSV</span>
                    </ExportButton>
                  </ActionButtonsGroup>
                </SectionHeader>
                
                {ordersViewMode === 'list' && (
                  <OrderList orders={orders} onExportCSV={handleExportCSV} onRefresh={refreshOrders} />
                )}
                
                {ordersViewMode === 'board' && (
                  <OrderBoard orders={orders} onOrderUpdate={handleOrderStatusUpdate} />
                )}
                
                {ordersViewMode === 'timeline' && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#78716c' }}>
                    <CalendarIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <Heading as="h4" $size="lg" $color="#44403c" $mb="0.5rem">Timeline View</Heading>
                    <Text $size="base" $color="#78716c">
                      Timeline view shows order progression over time. This feature will display orders chronologically with status milestones.
                    </Text>
                  </div>
                )}
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'qr' && isClient && latestOrder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" $size="xl" $weight="bold" $mb="1.5rem" $color="#1c1917">Latest QR Code</Heading>
                <QRCodeDisplay
                  orderId={latestOrder.id}
                  orderNumber={latestOrder.orderNumber}
                />
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'qr' && (!isClient || !latestOrder) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" $size="xl" $weight="bold" $mb="1.5rem" $color="#1c1917">QR Code</Heading>
                <Text $size="base" $color="#78716c">
                  {!isClient ? 'Loading...' : 'No orders found. Create an order first to generate a QR code.'}
                </Text>
              </SectionCard>
            </motion.div>
          )}

          {activeTab === 'menu' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <MenuManagementDashboard 
                businessId="admin"
                showPresetItems={true}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionCard>
                <Heading as="h3" $size="xl" $weight="bold" $mb="1.5rem" $color="#1c1917">Settings</Heading>
                
                {/* Restaurant Settings */}
                <RestaurantSettings
                  restaurantInfo={restaurantInfo}
                  operatingHours={operatingHours}
                  onUpdateInfo={handleUpdateRestaurantInfo}
                  onUpdateHours={handleUpdateOperatingHours}
                />

                {/* Order Settings */}
                <div style={{ marginTop: '2rem' }}>
                  <OrderSettings
                    orderConfig={orderConfig}
                    onUpdateConfig={handleUpdateOrderConfig}
                  />
                </div>

                {/* Notification Settings */}
                <div style={{ marginTop: '2rem' }}>
                  <NotificationSettings
                    preferences={notificationPreferences}
                    onUpdatePreferences={handleUpdateNotificationPreferences}
                  />
                </div>

                {/* User Profile Settings */}
                <div style={{ marginTop: '2rem' }}>
                  <UserProfileSettings
                    userInfo={userInfo}
                    preferences={userPreferences}
                    onUpdateInfo={handleUpdateUserInfo}
                    onUpdatePreferences={handleUpdateUserPreferences}
                    onChangePassword={handleChangePassword}
                  />
                </div>

                {/* System Settings */}
                <div style={{ marginTop: '2rem' }}>
                  <SystemSettings
                    systemConfig={systemConfig}
                    onUpdateConfig={handleUpdateSystemConfig}
                  />
                </div>

                {/* Billing Settings */}
                <div style={{ marginTop: '2rem' }}>
                  <BillingSettings
                    billingInfo={billingInfo}
                    onUpdateBilling={handleUpdateBilling}
                  />
                </div>

                {/* Location Settings */}
                <div style={{ marginTop: '2rem' }}>
                  <LocationSettings
                    locationInfo={locationInfo}
                    onUpdateLocation={handleUpdateLocation}
                  />
                </div>
              </SectionCard>
            </motion.div>
          )}
        </MainContainer>
      </MainContent>
    </DashboardContainer>
  );
}