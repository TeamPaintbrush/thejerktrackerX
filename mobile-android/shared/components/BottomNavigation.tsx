'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { 
  LayoutDashboard, 
  Package2, 
  QrCode, 
  Settings,
  // New food-themed icons
  ChefHat,
  Truck,
  ScanLine,
  UserCog,
  Home,
  ClipboardList,
  ScanBarcode,
  Settings2
} from 'lucide-react';

function useIsMobileApp() {
  const [isMobileApp, setIsMobileApp] = React.useState(false);
  
  React.useEffect(() => {
    // Check multiple times to ensure Capacitor is loaded
    const checkCapacitor = () => {
      const isCapacitor = !!(window as any).Capacitor;
      console.log('🔍 Capacitor Check:', {
        hasWindow: typeof window !== 'undefined',
        hasCapacitor: isCapacitor,
        capacitorObj: (window as any).Capacitor
      });
      setIsMobileApp(isCapacitor);
      return isCapacitor;
    };
    
    // Check immediately
    if (!checkCapacitor()) {
      // If not found, check again after a short delay (Capacitor might still be loading)
      const timer = setTimeout(checkCapacitor, 100);
      return () => clearTimeout(timer);
    }
  }, []);
  
  return isMobileApp;
}

function useShouldShowNavigation() {
  const pathname = usePathname();
  const isMobileApp = useIsMobileApp();
  
  // Show navigation on all authenticated mobile pages, but not on:
  // - Main homepage (/mobile or /mobile/) - splash page with hero section
  // - Settings hub page (/mobile/settings) - has its own navigation
  // - Settings subpages (/mobile/settings/*) - to avoid covering settings content
  const isHomePage = pathname === '/mobile' || pathname === '/mobile/';
  const isSettingsPage = pathname?.startsWith('/mobile/settings');
  
  const shouldShow = isMobileApp && 
                    (pathname?.startsWith('/mobile/') || pathname === '/mobile') && 
                    !isSettingsPage &&
                    !isHomePage;
  
  // Debug logging for mobile navigation
  if (typeof window !== 'undefined') {
    console.log('Navigation Debug:', {
      pathname,
      isMobileApp,
      isHomePage,
      isSettingsPage,
      shouldShow,
      isCapacitor: !!(window as any).Capacitor
    });
  }
  
  return shouldShow;
}

const NavigationContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.98) 100%);
  backdrop-filter: blur(30px);
  border-top: 1px solid rgba(237, 119, 52, 0.1);
  box-shadow: 0 -10px 30px -5px rgba(0, 0, 0, 0.1), 0 -2px 10px rgba(237, 119, 52, 0.05);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(to right, transparent, rgba(237, 119, 52, 0.3), transparent);
  }
`;

const NavigationContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0.75rem 1rem;
  max-width: 500px;
  margin: 0 auto;
`;

const NavItem = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.6rem 0.9rem;
  border-radius: 16px;
  text-decoration: none;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 70px;
  position: relative;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, rgba(237, 119, 52, 0.15) 0%, rgba(246, 188, 137, 0.12) 100%)' 
    : 'transparent'};
  
  /* Active indicator line */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: 50%;
    transform: translateX(-50%) scaleX(${props => props.$active ? '1' : '0'});
    width: 32px;
    height: 3px;
    background: linear-gradient(to right, #ed7734, #f59e0b);
    border-radius: 0 0 3px 3px;
    transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  /* Glow effect for active state */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(237, 119, 52, 0.2), rgba(246, 188, 137, 0.2));
    opacity: ${props => props.$active ? '1' : '0'};
    filter: blur(8px);
    z-index: -1;
    transition: opacity 300ms ease;
  }
  
  svg {
    width: 26px;
    height: 26px;
    color: ${props => props.$active ? '#ed7734' : '#78716c'};
    transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
    filter: ${props => props.$active 
      ? 'drop-shadow(0 2px 4px rgba(237, 119, 52, 0.3))' 
      : 'none'};
  }
  
  span {
    font-size: 0.7rem;
    font-weight: ${props => props.$active ? '600' : '500'};
    color: ${props => props.$active ? '#ed7734' : '#78716c'};
    transition: all 300ms ease;
    letter-spacing: 0.02em;
  }
  
  &:active {
    transform: scale(0.92);
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, rgba(237, 119, 52, 0.2) 0%, rgba(246, 188, 137, 0.15) 100%)' 
      : 'rgba(245, 245, 244, 0.8)'};
  }
  
  &:hover {
    background: ${props => props.$active 
      ? 'linear-gradient(135deg, rgba(237, 119, 52, 0.18) 0%, rgba(246, 188, 137, 0.14) 100%)' 
      : 'rgba(243, 244, 246, 0.8)'};
    transform: translateY(-2px);
    
    svg {
      transform: scale(1.1);
      color: ${props => props.$active ? '#ed7734' : '#ed7734'};
    }
    
    span {
      color: ${props => props.$active ? '#ed7734' : '#ed7734'};
    }
  }
`;

const navigationItems = [
  {
    path: '/mobile/dashboard',
    label: 'Dashboard',
    icon: <Home />
  },
  {
    path: '/mobile/orders-hub',
    label: 'Orders',
    icon: <ClipboardList />
  },
  {
    path: '/mobile/scan',
    label: 'Scan QR',
    icon: <ScanLine />
  },
  {
    path: '/mobile/qr',
    label: 'QR Code',
    icon: <ScanBarcode />
  },
  {
    path: '/mobile/settings',
    label: 'Settings',
    icon: <Settings2 />
  }
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const isMobileApp = useIsMobileApp();
  const shouldShow = useShouldShowNavigation();
  
  // CRITICAL DEBUG: Log even if not showing
  React.useEffect(() => {
    console.log('🚨 BottomNavigation Component Render:', {
      pathname,
      isMobileApp,
      shouldShow,
      hasCapacitor: !!(window as any).Capacitor,
      windowObject: typeof window
    });
  });
  
  if (!shouldShow) {
    console.log('❌ BottomNavigation returning null - shouldShow is false');
    return null;
  }
  
  console.log('✅ BottomNavigation RENDERING WITH', navigationItems.length, 'items');
  
  
  return (
    <NavigationContainer>
      <NavigationContent>
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <NavItem
              key={item.path}
              href={item.path}
              $active={isActive}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavItem>
          );
        })}
      </NavigationContent>
    </NavigationContainer>
  );
}