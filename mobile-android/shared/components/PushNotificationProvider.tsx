'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MobilePushNotificationService } from '../../../lib/mobilePushNotifications';

interface PushNotificationProviderProps {
  children: React.ReactNode;
  userId?: string;
  userRole?: 'admin' | 'manager' | 'driver' | 'customer';
}

/**
 * Push Notification Provider Component
 * Initializes push notifications and handles background setup
 */
export default function PushNotificationProvider({ 
  children, 
  userId, 
  userRole 
}: PushNotificationProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Only initialize if we have user context
    if (!userId || !userRole) {
      console.log('Push notifications: Waiting for user context...');
      return;
    }

    // Initialize push notifications
    const initializePush = async () => {
      console.log(`🔔 Initializing push notifications for ${userRole}: ${userId}`);
      
      const success = await MobilePushNotificationService.initialize({
        userId,
        userRole
      });

      if (success) {
        // Setup default notification channels (Android)
        await MobilePushNotificationService.setupDefaultChannels();
        console.log('✅ Push notifications ready');
      } else {
        console.log('⚠️ Push notifications not available or permission denied');
      }
    };

    initializePush();

    // Listen for custom notification events
    const handleOrderNotification = (event: any) => {
      console.log('Order notification received:', event.detail);
      // Could show a toast or in-app notification here
    };

    window.addEventListener('orderNotificationReceived', handleOrderNotification);

    // Cleanup
    return () => {
      window.removeEventListener('orderNotificationReceived', handleOrderNotification);
      MobilePushNotificationService.cleanup();
    };
  }, [userId, userRole, router]);

  return <>{children}</>;
}
