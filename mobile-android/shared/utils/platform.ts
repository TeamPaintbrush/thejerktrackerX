// 🌐 Platform Detection Utility
// Preserves EXACT same UI while enabling mobile capabilities
// NO visual changes - just enhanced functionality underneath

import React from 'react';

export interface PlatformCapabilities {
  isWeb: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isMobile: boolean;
  hasHaptics: boolean;
  hasCamera: boolean;
  hasGeolocation: boolean;
  hasBiometric: boolean;
  hasOfflineStorage: boolean;
  canReceivePush: boolean;
}

export class PlatformDetection {
  private static capabilities: PlatformCapabilities | null = null;
  private static isCapacitor = false;

  /**
   * Detect platform and capabilities
   * Returns same UI behavior with optional mobile enhancements
   */
  static async getCapabilities(): Promise<PlatformCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    // Check if running in Capacitor
    this.isCapacitor = !!(window as any).Capacitor;

    // Detect platform
    const isAndroid = this.isCapacitor && (window as any).Capacitor?.getPlatform?.() === 'android';
    const isIOS = this.isCapacitor && (window as any).Capacitor?.getPlatform?.() === 'ios';
    const isWeb = !this.isCapacitor;
    const isMobile = isAndroid || isIOS;

    // Detect capabilities (gracefully degrade on web)
    let hasHaptics = false;
    let hasCamera = false;
    let hasGeolocation = false;
    let hasBiometric = false;
    let hasOfflineStorage = true; // Always available via localStorage
    let canReceivePush = false;

    if (this.isCapacitor) {
      try {
        // Check for Capacitor plugins availability
        hasHaptics = !!(window as any).Capacitor?.Plugins?.Haptics;
        hasCamera = !!(window as any).Capacitor?.Plugins?.Camera;
        hasGeolocation = !!(window as any).Capacitor?.Plugins?.Geolocation;
        canReceivePush = !!(window as any).Capacitor?.Plugins?.PushNotifications;
        // Biometric would need additional checking
      } catch (error) {
        console.log('[Platform] Capacitor plugins check failed, using web fallbacks');
      }
    } else {
      // Web fallbacks
      hasCamera = !!(navigator.mediaDevices?.getUserMedia);
      hasGeolocation = !!navigator.geolocation;
      canReceivePush = 'serviceWorker' in navigator && 'PushManager' in window;
    }

    this.capabilities = {
      isWeb,
      isAndroid,
      isIOS,
      isMobile,
      hasHaptics,
      hasCamera,
      hasGeolocation,
      hasBiometric,
      hasOfflineStorage,
      canReceivePush
    };

    console.log('[Platform] Detected capabilities:', this.capabilities);
    return this.capabilities;
  }

  /**
   * Check if running on mobile (Android/iOS app)
   */
  static async isMobile(): Promise<boolean> {
    const caps = await this.getCapabilities();
    return caps.isMobile;
  }

  /**
   * Check if running on Android app
   */
  static async isAndroid(): Promise<boolean> {
    const caps = await this.getCapabilities();
    return caps.isAndroid;
  }

  /**
   * Check if running on web
   */
  static async isWeb(): Promise<boolean> {
    const caps = await this.getCapabilities();
    return caps.isWeb;
  }

  /**
   * Get platform-specific class names for styling
   * Maintains exact same visual appearance
   */
  static async getPlatformClasses(): Promise<string> {
    const caps = await this.getCapabilities();
    const classes = [];
    
    if (caps.isWeb) classes.push('platform-web');
    if (caps.isAndroid) classes.push('platform-android');
    if (caps.isIOS) classes.push('platform-ios');
    if (caps.isMobile) classes.push('platform-mobile');
    
    return classes.join(' ');
  }

  /**
   * Execute function only on specific platform
   * Preserves web behavior, enhances mobile
   */
  static async executeOnPlatform<T>(
    platform: 'web' | 'android' | 'ios' | 'mobile',
    mobileFunction: () => T,
    webFallback?: () => T
  ): Promise<T | void> {
    const caps = await this.getCapabilities();
    
    let shouldExecute = false;
    switch (platform) {
      case 'web':
        shouldExecute = caps.isWeb;
        break;
      case 'android':
        shouldExecute = caps.isAndroid;
        break;
      case 'ios':
        shouldExecute = caps.isIOS;
        break;
      case 'mobile':
        shouldExecute = caps.isMobile;
        break;
    }
    
    if (shouldExecute) {
      return mobileFunction();
    } else if (webFallback) {
      return webFallback();
    }
  }
}

/**
 * React Hook for platform detection
 * Use this to conditionally enable features while keeping same UI
 */
export function usePlatform() {
  const [capabilities, setCapabilities] = React.useState<PlatformCapabilities | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    PlatformDetection.getCapabilities().then((caps) => {
      setCapabilities(caps);
      setLoading(false);
    });
  }, []);

  return {
    capabilities,
    loading,
    isWeb: capabilities?.isWeb || false,
    isAndroid: capabilities?.isAndroid || false,
    isMobile: capabilities?.isMobile || false,
    hasHaptics: capabilities?.hasHaptics || false,
    hasCamera: capabilities?.hasCamera || false,
    hasGeolocation: capabilities?.hasGeolocation || false
  };
}

// Usage Examples - Same UI, Enhanced Features:
/*
// In a component - exact same appearance, optional mobile enhancements
const { capabilities, hasHaptics, hasCamera } = usePlatform();

// Same button appearance, optional haptic feedback on mobile
const handleOrderComplete = async () => {
  // Core functionality (same on all platforms)
  await completeOrder(orderId);
  
  // Optional mobile enhancement - no visual change
  if (hasHaptics) {
    await AndroidHapticService.success();
  }
  
  // Same success message UI on all platforms
  showToast("Order completed!");
};

// Same QR scanner UI, enhanced camera on mobile
const handleScanQR = async () => {
  if (hasCamera && capabilities?.isAndroid) {
    // Use enhanced Android camera service
    const result = await AndroidCameraService.scanQRCode();
    return result;
  } else {
    // Use web camera fallback - same UI
    return await webQRScanner();
  }
};
*/