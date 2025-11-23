// Android Haptic Feedback Service
// Based on QUICK-MOBILE-IMPLEMENTATION.md - Top Priority Feature #1

import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export enum AndroidHapticPattern {
  SUCCESS = 'success',
  ERROR = 'error', 
  WARNING = 'warning',
  BUTTON_TAP = 'light',
  SELECTION = 'medium',
  NOTIFICATION = 'heavy',
  ORDER_READY = 'success',
  SCAN_SUCCESS = 'light',
  DRIVER_ARRIVED = 'heavy'
}

export class AndroidHapticService {
  private static isSupported: boolean | null = null;

  static async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      this.isSupported = false;
      return false;
    }

    try {
      // Test if haptics are available
      await Haptics.impact({ style: ImpactStyle.Light });
      this.isSupported = true;
      return true;
    } catch (error) {
      console.warn('Android haptics not supported:', error);
      this.isSupported = false;
      return false;
    }
  }

  static async vibrate(pattern: AndroidHapticPattern): Promise<boolean> {
    if (this.isSupported === null) {
      await this.initialize();
    }

    if (!this.isSupported) {
      return false;
    }

    try {
      switch (pattern) {
        case AndroidHapticPattern.SUCCESS:
        case AndroidHapticPattern.ORDER_READY:
          // Double tap for success
          await Haptics.impact({ style: ImpactStyle.Medium });
          await new Promise(resolve => setTimeout(resolve, 100));
          await Haptics.impact({ style: ImpactStyle.Light });
          break;

        case AndroidHapticPattern.ERROR:
          // Triple buzz for errors
          await Haptics.impact({ style: ImpactStyle.Heavy });
          await new Promise(resolve => setTimeout(resolve, 100));
          await Haptics.impact({ style: ImpactStyle.Heavy });
          await new Promise(resolve => setTimeout(resolve, 100));
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;

        case AndroidHapticPattern.WARNING:
          // Medium pulse
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;

        case AndroidHapticPattern.BUTTON_TAP:
        case AndroidHapticPattern.SCAN_SUCCESS:
          // Light tap
          await Haptics.impact({ style: ImpactStyle.Light });
          break;

        case AndroidHapticPattern.SELECTION:
          // Medium tap
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;

        case AndroidHapticPattern.NOTIFICATION:
        case AndroidHapticPattern.DRIVER_ARRIVED:
          // Heavy notification
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;

        default:
          await Haptics.impact({ style: ImpactStyle.Light });
      }
      return true;
    } catch (error) {
      console.error('Android haptic feedback error:', error);
      return false;
    }
  }

  // Convenience methods for common actions
  static async success(): Promise<void> {
    await this.vibrate(AndroidHapticPattern.SUCCESS);
  }

  static async error(): Promise<void> {
    await this.vibrate(AndroidHapticPattern.ERROR);
  }

  static async buttonTap(): Promise<void> {
    await this.vibrate(AndroidHapticPattern.BUTTON_TAP);
  }

  static async notification(): Promise<void> {
    await this.vibrate(AndroidHapticPattern.NOTIFICATION);
  }

  static async orderReady(): Promise<void> {
    await this.vibrate(AndroidHapticPattern.ORDER_READY);
  }

  static async scanSuccess(): Promise<void> {
    await this.vibrate(AndroidHapticPattern.SCAN_SUCCESS);
  }

  static async driverArrived(): Promise<void> {
    await this.vibrate(AndroidHapticPattern.DRIVER_ARRIVED);
  }
}