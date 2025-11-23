// 📱 Mobile Push Notifications Service (Capacitor)
// Handles native push notifications for Android/iOS using @capacitor/push-notifications

import { Capacitor } from '@capacitor/core';
import { 
  PushNotifications, 
  PushNotificationSchema, 
  Token,
  ActionPerformed 
} from '@capacitor/push-notifications';

export interface MobilePushConfig {
  userId: string;
  userRole: 'admin' | 'manager' | 'driver' | 'customer';
  deviceToken?: string;
}

export interface OrderNotification {
  orderId: string;
  orderNumber: string;
  type: 'new_order' | 'status_change' | 'ready_for_pickup' | 'delivered' | 'cancelled';
  message: string;
}

export interface FraudNotification {
  claimId: string;
  claimNumber: string;
  type: 'new_claim' | 'claim_resolved';
  message: string;
}

export class MobilePushNotificationService {
  private static deviceToken: string | null = null;
  private static userId: string | null = null;
  private static userRole: string | null = null;
  private static listeners: any[] = [];

  /**
   * Initialize push notifications with user context
   */
  static async initialize(config: MobilePushConfig): Promise<boolean> {
    // Only works on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return false;
    }

    this.userId = config.userId;
    this.userRole = config.userRole;

    try {
      // Request permission
      const permissionStatus = await PushNotifications.requestPermissions();
      
      if (permissionStatus.receive === 'granted') {
        // Register with FCM/APNs
        await PushNotifications.register();
        
        // Setup listeners
        this.setupListeners();
        
        console.log('✅ Push notifications initialized successfully');
        return true;
      } else {
        console.warn('⚠️ Push notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Setup notification listeners
   */
  private static setupListeners() {
    // Registration success - receive device token
    const registrationListener = PushNotifications.addListener(
      'registration',
      async (token: Token) => {
        this.deviceToken = token.value;
        console.log('📱 Device token received:', token.value);
        
        // Send token to backend
        await this.registerDeviceWithBackend(token.value);
      }
    );
    this.listeners.push(registrationListener);

    // Registration failed
    const errorListener = PushNotifications.addListener(
      'registrationError',
      (error: any) => {
        console.error('❌ Push registration error:', error);
      }
    );
    this.listeners.push(errorListener);

    // Notification received while app is in foreground
    const receivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('🔔 Notification received (foreground):', notification);
        this.handleForegroundNotification(notification);
      }
    );
    this.listeners.push(receivedListener);

    // Notification action performed (user tapped notification)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('👆 Notification action:', action);
        this.handleNotificationAction(action);
      }
    );
    this.listeners.push(actionListener);
  }

  /**
   * Register device token with backend
   */
  private static async registerDeviceWithBackend(token: string): Promise<void> {
    if (!this.userId || !this.userRole) {
      console.warn('User info not set, skipping backend registration');
      return;
    }

    try {
      const response = await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          userRole: this.userRole,
          deviceToken: token,
          platform: Capacitor.getPlatform(),
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Device registered with backend');
      } else {
        console.error('❌ Failed to register device with backend');
      }
    } catch (error) {
      console.error('❌ Error registering device:', error);
    }
  }

  /**
   * Handle notification received while app is in foreground
   */
  private static handleForegroundNotification(notification: PushNotificationSchema) {
    // Show custom in-app notification UI
    const notificationData = notification.data;
    
    // You can show a custom toast or banner here
    console.log('Foreground notification:', {
      title: notification.title,
      body: notification.body,
      data: notificationData
    });

    // Optionally navigate based on notification type
    if (notificationData?.type && notificationData?.orderId) {
      this.handleOrderNotification(notificationData);
    }
  }

  /**
   * Handle notification tap (app opened from notification)
   */
  private static handleNotificationAction(action: ActionPerformed) {
    const notification = action.notification;
    const data = notification.data;

    console.log('User tapped notification:', data);

    // Navigate to appropriate screen based on notification type
    if (data.type && data.orderId) {
      this.navigateToOrder(data.orderId);
    } else if (data.type && data.claimId) {
      this.navigatToFraudClaim(data.claimId);
    }
  }

  /**
   * Handle order-related notifications
   */
  private static handleOrderNotification(data: any) {
    // Emit event or call callback to update UI
    const event = new CustomEvent('orderNotificationReceived', { 
      detail: data 
    });
    window.dispatchEvent(event);
  }

  /**
   * Navigate to order details
   */
  private static navigateToOrder(orderId: string) {
    // Use Next.js router if available
    if (typeof window !== 'undefined') {
      window.location.href = `/mobile/orders/${orderId}`;
    }
  }

  /**
   * Navigate to fraud claim details
   */
  private static navigatToFraudClaim(claimId: string) {
    if (typeof window !== 'undefined') {
      window.location.href = `/mobile/fraud-claims?claim=${claimId}`;
    }
  }

  /**
   * Send notification to specific user (backend call)
   */
  static async sendNotificationToUser(
    targetUserId: string,
    notification: {
      title: string;
      body: string;
      data?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId,
          notification
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Send notification to role (e.g., all managers)
   */
  static async sendNotificationToRole(
    role: 'admin' | 'manager' | 'driver' | 'customer',
    notification: {
      title: string;
      body: string;
      data?: Record<string, any>;
    }
  ): Promise<boolean> {
    try {
      const response = await fetch('/api/push/send-to-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          notification
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send notification to role:', error);
      return false;
    }
  }

  /**
   * Get notification delivery channels (what notifications user can receive)
   */
  static async getDeliveryChannels() {
    const channels = await PushNotifications.listChannels();
    return channels.channels;
  }

  /**
   * Create notification channel (Android only)
   */
  static async createChannel(
    id: string,
    name: string,
    importance: 1 | 2 | 3 | 4 | 5 = 4
  ) {
    if (Capacitor.getPlatform() === 'android') {
      await PushNotifications.createChannel({
        id,
        name,
        importance: importance as 1 | 2 | 3 | 4 | 5,
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#ED7734' // JERK Tracker orange
      });
    }
  }

  /**
   * Setup default notification channels
   */
  static async setupDefaultChannels() {
    if (Capacitor.getPlatform() === 'android') {
      // Orders channel
      await this.createChannel(
        'orders',
        'Order Updates',
        5 // High importance
      );

      // Fraud claims channel
      await this.createChannel(
        'fraud',
        'Fraud Alerts',
        5 // High importance
      );

      // General channel
      await this.createChannel(
        'general',
        'General Notifications',
        3 // Default importance
      );
    }
  }

  /**
   * Get current device token
   */
  static getDeviceToken(): string | null {
    return this.deviceToken;
  }

  /**
   * Check if push notifications are available
   */
  static isAvailable(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Cleanup listeners
   */
  static cleanup() {
    this.listeners.forEach(listener => listener.remove());
    this.listeners = [];
  }

  /**
   * Helper: Send order status notification
   */
  static async notifyOrderStatus(
    orderId: string,
    orderNumber: string,
    status: string,
    customerId: string
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      'pending': '📋 Your order has been received',
      'in_progress': '👨‍🍳 Your order is being prepared',
      'ready': '✅ Your order is ready for pickup!',
      'picked_up': '🚗 Your order has been picked up',
      'delivered': '🎉 Your order has been delivered!',
      'cancelled': '❌ Your order has been cancelled'
    };

    return await this.sendNotificationToUser(customerId, {
      title: `Order ${orderNumber}`,
      body: statusMessages[status] || 'Order status updated',
      data: {
        type: 'order_status',
        orderId,
        orderNumber,
        status
      }
    });
  }

  /**
   * Helper: Send new fraud claim notification to admins
   */
  static async notifyNewFraudClaim(
    claimNumber: string,
    orderNumber: string
  ): Promise<boolean> {
    return await this.sendNotificationToRole('admin', {
      title: '🚨 New Fraud Claim',
      body: `Claim ${claimNumber} filed for order ${orderNumber}`,
      data: {
        type: 'new_fraud_claim',
        claimNumber,
        orderNumber
      }
    });
  }
}

/**
 * React Hook for using push notifications
 */
export function usePushNotifications(config?: MobilePushConfig) {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [deviceToken, setDeviceToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (config && !isInitialized) {
      MobilePushNotificationService.initialize(config).then((success) => {
        setIsInitialized(success);
        if (success) {
          setDeviceToken(MobilePushNotificationService.getDeviceToken());
        }
      });
    }

    return () => {
      MobilePushNotificationService.cleanup();
    };
  }, [config, isInitialized]);

  return {
    isInitialized,
    deviceToken,
    isAvailable: MobilePushNotificationService.isAvailable()
  };
}

// Export React for the hook
import React from 'react';
