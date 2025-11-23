// Android Camera Service  
// Based on MOBILE-FEATURE-COMPARISON.md - Multi-mode camera (QR, Photo, Receipt, Barcode)
// Supports all camera modes mentioned in mobile enhancement docs

import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export enum AndroidCameraMode {
  QR_SCANNER = 'qr',
  PHOTO_CAPTURE = 'photo', 
  RECEIPT_SCAN = 'receipt',
  BARCODE_SCAN = 'barcode'
}

export interface CameraOptions {
  mode: AndroidCameraMode;
  quality?: number; // 0-100
  allowEditing?: boolean;
  saveToGallery?: boolean;
  enableFlash?: boolean;
}

export interface CameraResult {
  success: boolean;
  data?: string; // base64 or file path
  error?: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
    exif?: any;
  };
}

export class AndroidCameraService {
  private static supportedCache: boolean | null = null;

  static async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      console.warn('Camera only available on Android platform');
      return false;
    }

    try {
      // Request camera permissions
      const permissions = await Camera.requestPermissions();
      
      if (permissions.camera === 'granted') {
        this.supportedCache = true;
        console.log('Android camera permissions granted');
        return true;
      } else {
        console.warn('Camera permissions denied');
        this.supportedCache = false;
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      this.supportedCache = false;
      return false;
    }
  }

  // Capture photo with specified mode
  static async capturePhoto(options: CameraOptions): Promise<CameraResult> {
    if (this.supportedCache === null) {
      await this.initialize();
    }

    if (!this.supportedCache) {
      return {
        success: false,
        error: 'Camera not available or permissions denied'
      };
    }

    try {
      const cameraOptions = {
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        // Android-specific optimizations based on mode
        ...this.getModeSpecificOptions(options.mode),
        // User preferences can override defaults
        ...(options.quality && { quality: options.quality }),
        ...(options.allowEditing !== undefined && { allowEditing: options.allowEditing }),
        ...(options.saveToGallery !== undefined && { saveToGallery: options.saveToGallery })
      };

      const photo: Photo = await Camera.getPhoto(cameraOptions);

      // Trigger haptic feedback for successful capture
      import('./hapticService').then(({ AndroidHapticService }) => {
        AndroidHapticService.scanSuccess();
      });

      return {
        success: true,
        data: photo.base64String,
        metadata: {
          format: photo.format
        }
      };

    } catch (error) {
      console.error('Camera capture error:', error);
      
      // Trigger error haptic feedback
      import('./hapticService').then(({ AndroidHapticService }) => {
        AndroidHapticService.error();
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Camera capture failed'
      };
    }
  }

  // Get mode-specific camera options
  private static getModeSpecificOptions(mode: AndroidCameraMode) {
    switch (mode) {
      case AndroidCameraMode.QR_SCANNER:
        return {
          quality: 70, // Lower quality for faster processing
          allowEditing: false,
          saveToGallery: false,
          // Optimize for QR code scanning
          correctOrientation: true
        };

      case AndroidCameraMode.PHOTO_CAPTURE:
        return {
          quality: 90, // High quality for photos
          allowEditing: true,
          saveToGallery: true,
          correctOrientation: true
        };

      case AndroidCameraMode.RECEIPT_SCAN:
        return {
          quality: 80, // Good quality for OCR processing
          allowEditing: false,
          saveToGallery: false,
          correctOrientation: true
        };

      case AndroidCameraMode.BARCODE_SCAN:
        return {
          quality: 70, // Lower quality for faster processing
          allowEditing: false,
          saveToGallery: false,
          correctOrientation: true
        };

      default:
        return {
          quality: 80,
          allowEditing: false,
          saveToGallery: false
        };
    }
  }

  // QR Code Scanner (enhanced from current implementation)
  static async scanQRCode(): Promise<CameraResult> {
    return this.capturePhoto({
      mode: AndroidCameraMode.QR_SCANNER,
      quality: 70,
      allowEditing: false,
      saveToGallery: false
    });
  }

  // Photo capture for order documentation
  static async captureOrderPhoto(): Promise<CameraResult> {
    return this.capturePhoto({
      mode: AndroidCameraMode.PHOTO_CAPTURE,
      quality: 90,
      allowEditing: true,
      saveToGallery: true
    });
  }

  // Receipt scanning for expense tracking
  static async scanReceipt(): Promise<CameraResult> {
    return this.capturePhoto({
      mode: AndroidCameraMode.RECEIPT_SCAN,
      quality: 80,
      allowEditing: false,
      saveToGallery: false
    });
  }

  // Barcode scanning for inventory
  static async scanBarcode(): Promise<CameraResult> {
    return this.capturePhoto({
      mode: AndroidCameraMode.BARCODE_SCAN,
      quality: 70,
      allowEditing: false,
      saveToGallery: false
    });
  }

  // Check if camera is supported
  static isSupported(): boolean {
    return this.supportedCache || false;
  }

  // Process captured image for specific modes
  static async processImage(
    imageData: string, 
    mode: AndroidCameraMode
  ): Promise<any> {
    // This would integrate with image processing libraries
    // for QR/barcode recognition, OCR for receipts, etc.
    
    switch (mode) {
      case AndroidCameraMode.QR_SCANNER:
        // Process QR code (would use qr-scanner library)
        return this.processQRCode(imageData);
        
      case AndroidCameraMode.RECEIPT_SCAN:
        // Process receipt text (would use OCR library)
        return this.processReceiptOCR(imageData);
        
      case AndroidCameraMode.BARCODE_SCAN:
        // Process barcode (would use barcode scanner library)
        return this.processBarcode(imageData);
        
      default:
        return { processed: true, data: imageData };
    }
  }

  // Placeholder for QR code processing
  private static async processQRCode(imageData: string): Promise<any> {
    // TODO: Integrate QR code recognition library
    console.log('Processing QR code...');
    return { type: 'qr', data: 'placeholder_qr_data' };
  }

  // Placeholder for receipt OCR processing
  private static async processReceiptOCR(imageData: string): Promise<any> {
    // TODO: Integrate OCR library for receipt text extraction
    console.log('Processing receipt OCR...');
    return { type: 'receipt', text: 'placeholder_receipt_text' };
  }

  // Placeholder for barcode processing
  private static async processBarcode(imageData: string): Promise<any> {
    // TODO: Integrate barcode recognition library
    console.log('Processing barcode...');
    return { type: 'barcode', data: 'placeholder_barcode_data' };
  }
}