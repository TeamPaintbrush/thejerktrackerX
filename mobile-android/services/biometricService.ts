// 🔒 Android Biometric Authentication Service
// Priority Feature #5 - Enhanced Security
// Based on: MOBILE-IMPROVEMENTS-PROPOSAL.md - Biometric Authentication

import { Device } from '@capacitor/device';

export interface BiometricAuthOptions {
  reason?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  fallbackTitle?: string;
  negativeText?: string;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  biometryType?: 'fingerprint' | 'face' | 'iris' | 'voice';
}

export interface BiometricCapabilities {
  available: boolean;
  enrolled: boolean;
  biometryType: string[];
  strongBiometrics: boolean;
  deviceCredential: boolean;
}

class AndroidBiometricAuthService {
  private static instance: AndroidBiometricAuthService;
  private isInitialized = false;
  private capabilities: BiometricCapabilities | null = null;

  static getInstance(): AndroidBiometricAuthService {
    if (!AndroidBiometricAuthService.instance) {
      AndroidBiometricAuthService.instance = new AndroidBiometricAuthService();
    }
    return AndroidBiometricAuthService.instance;
  }

  /**
   * Initialize biometric authentication service
   */
  async initialize(): Promise<void> {
    try {
      this.capabilities = await this.checkCapabilities();
      this.isInitialized = true;
      console.log('[AndroidBiometric] Service initialized', this.capabilities);
    } catch (error) {
      console.error('[AndroidBiometric] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Check device biometric capabilities
   */
  async checkCapabilities(): Promise<BiometricCapabilities> {
    try {
      const deviceInfo = await Device.getInfo();
      
      // Mock implementation - replace with actual biometric plugin
      const capabilities: BiometricCapabilities = {
        available: deviceInfo.platform === 'android',
        enrolled: true, // Would check actual enrollment status
        biometryType: ['fingerprint'], // Would detect actual types
        strongBiometrics: true,
        deviceCredential: true
      };

      return capabilities;
    } catch (error) {
      console.error('[AndroidBiometric] Failed to check capabilities:', error);
      return {
        available: false,
        enrolled: false,
        biometryType: [],
        strongBiometrics: false,
        deviceCredential: false
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(options: BiometricAuthOptions = {}): Promise<BiometricResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.capabilities?.available) {
      return {
        success: false,
        error: 'Biometric authentication not available'
      };
    }

    try {
      const authOptions = {
        reason: options.reason || 'Authenticate to access your orders',
        title: options.title || 'JERK Tracker Authentication',
        subtitle: options.subtitle || 'Use your fingerprint or face',
        description: options.description || 'Secure access to your account',
        fallbackTitle: options.fallbackTitle || 'Use PIN',
        negativeText: options.negativeText || 'Cancel',
        ...options
      };

      // Mock successful authentication - replace with actual plugin
      // Example: const result = await BiometricAuth.authenticate(authOptions);
      
      console.log('[AndroidBiometric] Authentication requested', authOptions);
      
      // Simulate authentication delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        biometryType: 'fingerprint'
      };
      
    } catch (error) {
      console.error('[AndroidBiometric] Authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Quick authentication for order access
   */
  async authenticateForOrders(): Promise<BiometricResult> {
    return this.authenticate({
      reason: 'Access your order history and tracking',
      title: 'Order Access',
      subtitle: 'Verify your identity',
      description: 'Quick and secure access to your orders'
    });
  }

  /**
   * Authentication for payment/admin features
   */
  async authenticateForPayment(): Promise<BiometricResult> {
    return this.authenticate({
      reason: 'Confirm payment information',
      title: 'Payment Verification',
      subtitle: 'Secure payment access',
      description: 'Protect your payment details'
    });
  }

  /**
   * Admin authentication
   */
  async authenticateForAdmin(): Promise<BiometricResult> {
    return this.authenticate({
      reason: 'Access admin dashboard',
      title: 'Admin Access',
      subtitle: 'Administrative privileges',
      description: 'Verify admin credentials'
    });
  }

  /**
   * Check if biometrics are available and enrolled
   */
  async isAvailable(): Promise<boolean> {
    if (!this.capabilities) {
      await this.initialize();
    }
    return this.capabilities?.available && this.capabilities?.enrolled || false;
  }

  /**
   * Get current capabilities
   */
  getCapabilities(): BiometricCapabilities | null {
    return this.capabilities;
  }

  /**
   * Check if strong biometrics are available (Class 3)
   */
  hasStrongBiometrics(): boolean {
    return this.capabilities?.strongBiometrics || false;
  }

  /**
   * Check if device credential (PIN/Pattern/Password) is set
   */
  hasDeviceCredential(): boolean {
    return this.capabilities?.deviceCredential || false;
  }

  /**
   * Get supported biometry types
   */
  getSupportedBiometryTypes(): string[] {
    return this.capabilities?.biometryType || [];
  }
}

// Export singleton instance
export const AndroidBiometricService = AndroidBiometricAuthService.getInstance();

// Usage Examples:
/*
// Initialize service
await AndroidBiometricService.initialize();

// Check availability
const isAvailable = await AndroidBiometricService.isAvailable();

// Authenticate for orders
const orderAuth = await AndroidBiometricService.authenticateForOrders();
if (orderAuth.success) {
  // Navigate to orders
}

// Admin authentication
const adminAuth = await AndroidBiometricService.authenticateForAdmin();
if (adminAuth.success) {
  // Access admin features
}

// Custom authentication
const customAuth = await AndroidBiometricService.authenticate({
  reason: 'Delete order confirmation',
  title: 'Confirm Action',
  subtitle: 'This action cannot be undone'
});
*/