import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    orderId?: string;
    type?: 'order_status' | 'new_order' | 'transfer' | 'alert';
    [key: string]: any;
  };
}

class PushNotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;

  /**
   * Initialize push notifications (mobile only)
   * Call this on app startup after user authentication
   */
  async initialize(): Promise<void> {
    // Only available on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    if (this.isInitialized) {
      console.log('Push notifications already initialized');
      return;
    }

    try {
      // Request permission
      const permission = await PushNotifications.requestPermissions();
      
      if (permission.receive === 'granted') {
        // Register with FCM
        await PushNotifications.register();

        // Listen for registration success
        await PushNotifications.addListener('registration', (token: Token) => {
          this.fcmToken = token.value;
          console.log('Push registration success, token:', token.value);
          
          // Send token to backend for storage
          this.sendTokenToBackend(token.value);
        });

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error: any) => {
          console.error('Push registration error:', error);
        });

        // Listen for notifications received (app in foreground)
        await PushNotifications.addListener(
          'pushNotificationReceived',
          (notification: PushNotificationSchema) => {
            console.log('Push notification received:', notification);
            this.handleForegroundNotification(notification);
          }
        );

        // Listen for notification actions (user tapped notification)
        await PushNotifications.addListener(
          'pushNotificationActionPerformed',
          (notification: ActionPerformed) => {
            console.log('Push notification action performed:', notification);
            this.handleNotificationAction(notification);
          }
        );

        this.isInitialized = true;
        console.log('Push notifications initialized successfully');
      } else {
        console.log('Push notification permission not granted');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  /**
   * Get the current FCM token
   */
  getToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Handle notification received while app is in foreground
   */
  private handleForegroundNotification(notification: PushNotificationSchema): void {
    const { title, body, data } = notification;

    // Show custom in-app notification
    if (typeof window !== 'undefined') {
      // Display toast or custom notification UI
      console.log('Foreground notification:', { title, body, data });
      
      // Example: Show browser notification if on web
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title || 'New Notification', {
          body: body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: data?.orderId || 'general'
        });
      }
    }
  }

  /**
   * Handle notification tap (opens app from notification)
   */
  private handleNotificationAction(action: ActionPerformed): void {
    const { notification } = action;
    const data = notification.data;

    console.log('Notification tapped:', data);

    // Navigate to appropriate screen based on notification type
    if (typeof window !== 'undefined') {
      if (data?.orderId) {
        // Navigate to order detail page
        window.location.href = `/mobile/orders/${data.orderId}`;
      } else if (data?.type === 'new_order') {
        // Navigate to orders list
        window.location.href = '/mobile/orders';
      } else if (data?.type === 'alert') {
        // Navigate to alerts/notifications
        window.location.href = '/mobile/notifications';
      }
    }
  }

  /**
   * Send FCM token to backend for storage
   * This allows backend to send targeted notifications
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('mobile_auth_user');
      if (!userStr) return;

      const user = JSON.parse(userStr);

      // Send to your backend API
      const response = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          fcmToken: token,
          platform: Capacitor.getPlatform()
        })
      });

      if (response.ok) {
        console.log('FCM token registered with backend');
      } else {
        console.error('Failed to register FCM token with backend');
      }
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  /**
   * Remove all listeners and clean up
   */
  async cleanup(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await PushNotifications.removeAllListeners();
      this.isInitialized = false;
      console.log('Push notifications cleaned up');
    } catch (error) {
      console.error('Error cleaning up push notifications:', error);
    }
  }

  /**
   * Get list of delivered notifications (iOS only)
   */
  async getDeliveredNotifications(): Promise<PushNotificationSchema[]> {
    if (!Capacitor.isNativePlatform()) return [];

    try {
      const result = await PushNotifications.getDeliveredNotifications();
      return result.notifications;
    } catch (error) {
      console.error('Error getting delivered notifications:', error);
      return [];
    }
  }

  /**
   * Remove delivered notifications (iOS only)
   */
  async removeDeliveredNotifications(notifications: PushNotificationSchema[]): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await PushNotifications.removeDeliveredNotifications({ 
        notifications 
      });
      console.log('Delivered notifications removed');
    } catch (error) {
      console.error('Error removing delivered notifications:', error);
    }
  }

  /**
   * Remove all delivered notifications
   */
  async removeAllDeliveredNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    try {
      const delivered = await this.getDeliveredNotifications();
      if (delivered.length > 0) {
        await this.removeDeliveredNotifications(delivered);
      }
    } catch (error) {
      console.error('Error removing all delivered notifications:', error);
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Convenience export
export default pushNotificationService;
