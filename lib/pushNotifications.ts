// Push notification service for The JERK Tracker
// Handles subscription management and notification sending

import { useState, useEffect } from 'react';

export interface NotificationPayload {
  title: string;
  body: string;
  type: 'new-order' | 'order-update' | 'driver-assigned' | 'delivery-complete' | 'general';
  orderId?: string;
  role?: string;
  requireInteraction?: boolean;
  data?: any;
}

export interface PushSubscription {
  userId: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent?: string;
  createdAt: Date;
}

export class PushNotificationService {
  private static vapidPublicKey: string | null = null;

  // Initialize push notifications
  static async initialize(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Get VAPID public key
      this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
      if (!this.vapidPublicKey) {
        console.warn('VAPID public key not configured');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', registration);

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Request permission and subscribe to push notifications
  static async requestPermissionAndSubscribe(userId: string): Promise<PushSubscription | null> {
    try {
      // Check if already granted
      if (Notification.permission === 'granted') {
        return await this.subscribe(userId);
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return await this.subscribe(userId);
      }

      console.warn('Notification permission denied');
      return null;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }

  // Subscribe to push notifications
  static async subscribe(userId: string): Promise<PushSubscription | null> {
    try {
      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not available');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource
      });

      const pushSubscription: PushSubscription = {
        userId,
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          }
        },
        userAgent: navigator.userAgent,
        createdAt: new Date()
      };

      // Send subscription to server
      await this.sendSubscriptionToServer(pushSubscription);
      
      return pushSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  static async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Notify server of unsubscription
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Get current subscription status
  static async getSubscriptionStatus(): Promise<{ subscribed: boolean; subscription?: PushSubscription }> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return { subscribed: false };
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const pushSubscription: PushSubscription = {
          userId: '', // This would need to be stored or retrieved
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
            }
          },
          createdAt: new Date()
        };

        return { subscribed: true, subscription: pushSubscription };
      }

      return { subscribed: false };
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return { subscribed: false };
    }
  }

  // Send test notification (for development)
  static async sendTestNotification(): Promise<boolean> {
    try {
      const response = await fetch('/api/push/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  }

  // Show local notification (fallback for when push isn't available)
  static showLocalNotification(payload: NotificationPayload): boolean {
    try {
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/icons/icon-192x192.svg',
          badge: '/icons/icon-72x72.svg',
          tag: 'jerk-tracker-local'
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error showing local notification:', error);
      return false;
    }
  }

  // Private helper methods
  private static async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscription)
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Notification templates for different scenarios
export const NotificationTemplates = {
  newOrder: (orderNumber: string, customerName: string): NotificationPayload => ({
    title: 'New Order Available',
    body: `Order #${orderNumber} from ${customerName} is ready for pickup`,
    type: 'new-order',
    requireInteraction: true
  }),

  orderAssigned: (orderNumber: string, driverName: string): NotificationPayload => ({
    title: 'Driver Assigned',
    body: `${driverName} has been assigned to your order #${orderNumber}`,
    type: 'driver-assigned'
  }),

  orderPickedUp: (orderNumber: string): NotificationPayload => ({
    title: 'Order Picked Up',
    body: `Your order #${orderNumber} has been picked up and is on the way`,
    type: 'order-update'
  }),

  orderDelivered: (orderNumber: string): NotificationPayload => ({
    title: 'Order Delivered',
    body: `Your order #${orderNumber} has been delivered successfully`,
    type: 'delivery-complete'
  }),

  driverStatusChange: (driverName: string, status: string): NotificationPayload => ({
    title: 'Driver Status Update',
    body: `${driverName} is now ${status}`,
    type: 'general'
  })
};

// Hook for React components to use push notifications
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSupport();
  }, []);

  const checkSupport = async () => {
    const supported = await PushNotificationService.initialize();
    setIsSupported(supported);

    if (supported) {
      const status = await PushNotificationService.getSubscriptionStatus();
      setIsSubscribed(status.subscribed);
    }

    setIsLoading(false);
  };

  const subscribe = async (userId: string) => {
    setIsLoading(true);
    const subscription = await PushNotificationService.requestPermissionAndSubscribe(userId);
    setIsSubscribed(!!subscription);
    setIsLoading(false);
    return subscription;
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    const success = await PushNotificationService.unsubscribe();
    if (success) {
      setIsSubscribed(false);
    }
    setIsLoading(false);
    return success;
  };

  const sendTest = async () => {
    return await PushNotificationService.sendTestNotification();
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    sendTest
  };
}

