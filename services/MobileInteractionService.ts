import { Share, ShareOptions, ShareResult } from '@capacitor/share';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { buildTrackingUrl } from '@/lib/url';

/**
 * Mobile Share & Haptic Feedback Service
 * Provides native sharing capabilities and haptic feedback for mobile devices
 */
class MobileInteractionService {
  /**
   * Check if share is supported
   */
  isShareSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Check if haptics are supported
   */
  isHapticsSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Share text content
   */
  async shareText(text: string, title?: string): Promise<boolean> {
    if (!this.isShareSupported()) {
      console.log('Share not supported on this platform');
      return false;
    }

    try {
      const options: ShareOptions = {
        text,
        title: title || 'Share',
        dialogTitle: title || 'Share'
      };

      const result = await Share.share(options);
      return result.activityType !== undefined;
    } catch (error) {
      console.error('Error sharing text:', error);
      return false;
    }
  }

  /**
   * Share URL
   */
  async shareUrl(url: string, title?: string, text?: string): Promise<boolean> {
    if (!this.isShareSupported()) {
      console.log('Share not supported on this platform');
      return false;
    }

    try {
      const options: ShareOptions = {
        url,
        title: title || 'Share',
        text: text || url,
        dialogTitle: title || 'Share'
      };

      const result = await Share.share(options);
      return result.activityType !== undefined;
    } catch (error) {
      console.error('Error sharing URL:', error);
      return false;
    }
  }

  /**
   * Share order details
   */
  async shareOrder(orderNumber: string, trackingUrl: string): Promise<boolean> {
    const text = `Track your order #${orderNumber}: ${trackingUrl}`;
    const title = `Order #${orderNumber}`;
    
    return this.shareText(text, title);
  }

  /**
   * Share QR code tracking link
   */
  async shareQRTracking(orderId: string, baseUrl?: string): Promise<boolean> {
    const normalizedBase = baseUrl?.replace(/\/$/, '');
    const trackingUrl = normalizedBase
      ? `${normalizedBase}/qr-tracking/${orderId}`
      : buildTrackingUrl(`/qr-tracking/${orderId}`);
    const text = `Track your order: ${trackingUrl}`;
    const title = 'Order Tracking';
    
    return this.shareUrl(trackingUrl, title, text);
  }

  /**
   * Share analytics report
   */
  async shareAnalytics(summary: string): Promise<boolean> {
    const title = 'Business Analytics Report';
    return this.shareText(summary, title);
  }

  /**
   * Can share (check if user can share)
   */
  async canShare(): Promise<boolean> {
    if (!this.isShareSupported()) {
      return false;
    }

    try {
      // Share API is always available on native platforms
      return true;
    } catch (error) {
      return false;
    }
  }

  // ==================== HAPTIC FEEDBACK ====================

  /**
   * Light impact haptic feedback (for button taps)
   */
  async lightImpact(): Promise<void> {
    if (!this.isHapticsSupported()) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Medium impact haptic feedback (for selections)
   */
  async mediumImpact(): Promise<void> {
    if (!this.isHapticsSupported()) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Heavy impact haptic feedback (for important actions)
   */
  async heavyImpact(): Promise<void> {
    if (!this.isHapticsSupported()) return;

    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Success notification haptic (for successful actions)
   */
  async successHaptic(): Promise<void> {
    if (!this.isHapticsSupported()) return;

    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Warning notification haptic (for warnings)
   */
  async warningHaptic(): Promise<void> {
    if (!this.isHapticsSupported()) return;

    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Error notification haptic (for errors)
   */
  async errorHaptic(): Promise<void> {
    if (!this.isHapticsSupported()) return;

    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Selection changed haptic (for picker/selector changes)
   */
  async selectionChanged(): Promise<void> {
    if (!this.isHapticsSupported()) return;

    try {
      await Haptics.selectionChanged();
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  /**
   * Vibrate pattern (custom vibration)
   */
  async vibrate(duration: number = 100): Promise<void> {
    if (!this.isHapticsSupported()) return;

    try {
      await Haptics.vibrate({ duration });
    } catch (error) {
      console.error('Vibrate error:', error);
    }
  }

  // ==================== COMBINED ACTIONS ====================

  /**
   * Share with haptic feedback
   */
  async shareWithFeedback(options: ShareOptions): Promise<boolean> {
    await this.lightImpact();
    
    if (!this.isShareSupported()) {
      await this.errorHaptic();
      return false;
    }

    try {
      const result = await Share.share(options);
      await this.successHaptic();
      return result.activityType !== undefined;
    } catch (error) {
      await this.errorHaptic();
      console.error('Error sharing:', error);
      return false;
    }
  }

  /**
   * Button tap with haptic
   */
  async buttonTap(): Promise<void> {
    await this.lightImpact();
  }

  /**
   * Toggle switch with haptic
   */
  async toggleSwitch(): Promise<void> {
    await this.mediumImpact();
  }

  /**
   * Delete action with haptic
   */
  async deleteAction(): Promise<void> {
    await this.heavyImpact();
  }

  /**
   * Order created success with haptic
   */
  async orderCreatedSuccess(): Promise<void> {
    await this.successHaptic();
  }

  /**
   * Order transfer with haptic
   */
  async orderTransferred(): Promise<void> {
    await this.successHaptic();
    // Double tap for emphasis
    setTimeout(() => this.lightImpact(), 100);
  }

  /**
   * Scan QR code with haptic
   */
  async qrScanned(): Promise<void> {
    await this.successHaptic();
  }

  /**
   * Form error with haptic
   */
  async formError(): Promise<void> {
    await this.errorHaptic();
  }

  /**
   * Pull to refresh with haptic
   */
  async pullToRefresh(): Promise<void> {
    await this.lightImpact();
  }

  /**
   * Swipe action with haptic
   */
  async swipeAction(): Promise<void> {
    await this.selectionChanged();
  }

  /**
   * Long press action with haptic
   */
  async longPress(): Promise<void> {
    await this.mediumImpact();
  }
}

// Export singleton instance
export const mobileInteractionService = new MobileInteractionService();

// Convenience exports for haptic feedback
export const haptics = {
  light: () => mobileInteractionService.lightImpact(),
  medium: () => mobileInteractionService.mediumImpact(),
  heavy: () => mobileInteractionService.heavyImpact(),
  success: () => mobileInteractionService.successHaptic(),
  warning: () => mobileInteractionService.warningHaptic(),
  error: () => mobileInteractionService.errorHaptic(),
  selection: () => mobileInteractionService.selectionChanged(),
  
  // Semantic actions
  buttonTap: () => mobileInteractionService.buttonTap(),
  toggle: () => mobileInteractionService.toggleSwitch(),
  delete: () => mobileInteractionService.deleteAction(),
  orderCreated: () => mobileInteractionService.orderCreatedSuccess(),
  orderTransferred: () => mobileInteractionService.orderTransferred(),
  qrScanned: () => mobileInteractionService.qrScanned(),
  formError: () => mobileInteractionService.formError(),
  pullRefresh: () => mobileInteractionService.pullToRefresh(),
  swipe: () => mobileInteractionService.swipeAction(),
  longPress: () => mobileInteractionService.longPress()
};

// Convenience exports for sharing
export const share = {
  text: (text: string, title?: string) => mobileInteractionService.shareText(text, title),
  url: (url: string, title?: string, text?: string) => mobileInteractionService.shareUrl(url, title, text),
  order: (orderNumber: string, trackingUrl: string) => mobileInteractionService.shareOrder(orderNumber, trackingUrl),
  qrTracking: (orderId: string, baseUrl?: string) => mobileInteractionService.shareQRTracking(orderId, baseUrl),
  analytics: (summary: string) => mobileInteractionService.shareAnalytics(summary),
  canShare: () => mobileInteractionService.canShare()
};

export default mobileInteractionService;
