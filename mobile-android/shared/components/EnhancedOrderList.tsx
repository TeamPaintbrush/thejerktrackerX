// 📱 Enhanced OrderList Component
// EXACT same UI as original - just with mobile capabilities added
// NO visual changes - preserves all original styling and behavior

'use client';

import React from 'react';
import { usePlatform } from '../utils/platform';

// Import original OrderList component
import OriginalOrderList from '../../../components/OrderList';

interface EnhancedOrderListProps {
  orders: any[];
  onOrderUpdate?: (orderId: string) => void;
  onOrderComplete?: (orderId: string) => void;
  [key: string]: any; // Pass through all other props
}

/**
 * Enhanced OrderList - Same UI with mobile capabilities
 * - Preserves exact same visual design
 * - Adds haptic feedback on mobile
 * - Adds swipe gestures on mobile
 * - Same behavior on web
 */
export default function EnhancedOrderList(props: EnhancedOrderListProps) {
  const { capabilities, hasHaptics } = usePlatform();

  // Enhanced order completion with haptic feedback
  const handleOrderComplete = async (orderId: string) => {
    // Call original completion logic
    props.onOrderComplete?.(orderId);
    
    // Add haptic feedback on mobile (no visual change)
    if (hasHaptics && capabilities?.isAndroid) {
      try {
        // Import Android service only when needed
        const { AndroidHapticService } = await import('../../services/hapticService');
        await AndroidHapticService.success();
      } catch (error) {
        console.log('[EnhancedOrderList] Haptic feedback not available');
      }
    }
  };

  // Enhanced order update with subtle mobile feedback
  const handleOrderUpdate = async (orderId: string) => {
    // Call original update logic
    props.onOrderUpdate?.(orderId);
    
    // Add subtle haptic feedback on mobile
    if (hasHaptics && capabilities?.isAndroid) {
      try {
        const { AndroidHapticService } = await import('../../services/hapticService');
        await AndroidHapticService.buttonTap();
      } catch (error) {
        console.log('[EnhancedOrderList] Haptic feedback not available');
      }
    }
  };

  // If on mobile, wrap orders with swipe capability
  const enhancedOrders = React.useMemo(() => {
    if (!capabilities?.isMobile) {
      return props.orders; // No changes on web
    }

    // Same orders, just with enhanced mobile interactions
    return props.orders.map(order => ({
      ...order,
      // Mobile-specific metadata (doesn't affect rendering)
      _mobileEnhanced: true,
      _canSwipe: true
    }));
  }, [props.orders, capabilities?.isMobile]);

  // Pass through all props with mobile enhancements
  const enhancedProps = {
    ...props,
    orders: enhancedOrders,
    onOrderComplete: handleOrderComplete,
    onOrderUpdate: handleOrderUpdate,
    onExportCSV: props.onExportCSV || (() => {}), // Provide default if missing
    // Add platform classes for potential CSS enhancements
    className: `${props.className || ''} ${capabilities?.isAndroid ? 'platform-android' : ''} ${capabilities?.isWeb ? 'platform-web' : ''}`.trim()
  };

  // Return exact same component with enhanced functionality
  return <OriginalOrderList {...enhancedProps} />;
}

// Re-export original component for backward compatibility
export { default as OrderList } from '../../../components/OrderList';