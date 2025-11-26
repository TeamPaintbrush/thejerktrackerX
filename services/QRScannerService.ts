import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Camera } from '@capacitor/camera';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner';

export interface ScanResult {
  text: string;
  format: string;
}

class QRScannerService {
  private isScanning = false;
  private hasPermission = false;

  /**
   * Check if QR scanner is supported (native platforms only)
   */
  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Request camera permission
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.log('QR Scanner not supported on this platform');
      return false;
    }

    try {
      const status = await Camera.requestPermissions({ permissions: ['camera'] });
      const granted = status.camera === 'granted' || status.camera === 'limited';
      this.hasPermission = granted;
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Start scanning for QR codes
   */
  async startScan(): Promise<ScanResult | null> {
    if (!this.isSupported()) {
      console.log('QR Scanner not supported');
      return null;
    }

    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.log('Camera permission not granted');
        return null;
      }
    }

    if (this.isScanning) {
      console.log('Already scanning');
      return null;
    }

    try {
      this.isScanning = true;

      // Prepare scanner (make background transparent to show camera)
      const result = await CapacitorBarcodeScanner.scanBarcode({
        hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
        scanInstructions: 'Align QR code within the frame',
        scanButton: true,
        scanText: 'Cancel',
      });

      this.isScanning = false;

      if (result?.ScanResult) {
        return {
          text: result.ScanResult,
          format: String(result.format ?? 'QR_CODE'),
        };
      }

      return null;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      this.isScanning = false;
      return null;
    }
  }

  /**
   * Stop scanning
   */
  async stopScan(): Promise<void> {
    if (!this.isScanning) return;

    try {
      this.isScanning = false;
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  }

  /**
   * Check current scanning status
   */
  isCurrentlyScanning(): boolean {
    return this.isScanning;
  }

  /**
   * Hide app content to show camera
   */
  private hideAppContent(): void {
    // Overlay handled natively by Capacitor plugin
  }

  private showAppContent(): void {
    // Overlay handled natively by Capacitor plugin
  }

  /**
   * Parse order tracking URL from QR code
   */
  parseOrderUrl(qrContent: string): string | null {
    try {
      // Handle full URLs
      if (qrContent.startsWith('http')) {
        const url = new URL(qrContent);
        const pathParts = url.pathname.split('/');
        const qrTrackingIndex = pathParts.indexOf('qr-tracking');
        
        if (qrTrackingIndex !== -1 && pathParts[qrTrackingIndex + 1]) {
          return pathParts[qrTrackingIndex + 1];
        }
      }

      // Handle direct order IDs
      if (qrContent.match(/^ORD-\d{4}-\d{3}$/)) {
        return qrContent;
      }

      // Handle tracking codes
      if (qrContent.match(/^[A-Z0-9]{8,}$/)) {
        return qrContent;
      }

      return null;
    } catch (error) {
      console.error('Error parsing QR content:', error);
      return null;
    }
  }

  /**
   * Scan and navigate to order
   */
  async scanAndNavigate(router: any): Promise<boolean> {
    try {
      const result = await this.startScan();
      
      if (!result) {
        return false;
      }

      const orderId = this.parseOrderUrl(result.text);
      
      if (orderId) {
        // Navigate to order tracking page
        router.push(`/mobile/qr-tracking/${orderId}`);
        return true;
      } else {
        console.log('Invalid QR code:', result.text);
        return false;
      }
    } catch (error) {
      console.error('Error in scanAndNavigate:', error);
      return false;
    }
  }

  /**
   * Get permission status
   */
  async getPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!this.isSupported()) {
      return 'denied';
    }

    try {
      const status = await Camera.checkPermissions();
      if (status.camera === 'granted' || status.camera === 'limited') {
        this.hasPermission = true;
        return 'granted';
      }
      if (status.camera === 'denied') {
        this.hasPermission = false;
        return 'denied';
      }
      return 'prompt';
    } catch (error) {
      console.error('Error checking permission:', error);
      return 'denied';
    }
  }

  /**
   * Open app settings (to enable camera permission)
   */
  async openSettings(): Promise<void> {
    try {
      await App.openSettings();
    } catch (error) {
      console.error('Error opening settings:', error);
    }
  }
}

// Export singleton instance
export const qrScannerService = new QRScannerService();

export default qrScannerService;
