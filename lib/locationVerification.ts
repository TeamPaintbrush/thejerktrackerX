// Location detection and verification service
// Handles GPS location verification for order placement

interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationVerificationResult {
  isValid: boolean;
  locationId?: string;
  businessId?: string;
  distance?: number;
  error?: string;
  coordinates?: LocationCoordinates;
  method: 'gps' | 'qr_code' | 'ip_address' | 'manual';
}

export class LocationVerificationService {
  private static readonly MAX_DISTANCE_METERS = 100; // 100 meters radius for location verification
  private static readonly GEOLOCATION_TIMEOUT = 10000; // 10 seconds timeout
  
  /**
   * Get user's current GPS location
   */
  static async getCurrentLocation(): Promise<LocationCoordinates | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: this.GEOLOCATION_TIMEOUT,
          maximumAge: 60000 // Cache location for 1 minute
        }
      );
    });
  }

  /**
   * Calculate distance between two coordinates in meters
   */
  static calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Verify if user is at a registered location
   */
  static async verifyLocationFromGPS(
    userCoordinates: LocationCoordinates,
    registeredLocations: Array<{
      id: string;
      businessId: string;
      name: string;
      coordinates: { latitude: number; longitude: number };
      billing: { isActive: boolean };
    }>
  ): Promise<LocationVerificationResult> {
    try {
      // Find the closest active location
      let closestLocation: any = null;
      let minDistance = Infinity;

      for (const location of registeredLocations) {
        if (!location.billing.isActive) continue;

        const distance = this.calculateDistance(
          userCoordinates.latitude,
          userCoordinates.longitude,
          location.coordinates.latitude,
          location.coordinates.longitude
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestLocation = location;
        }
      }

      if (!closestLocation) {
        return {
          isValid: false,
          error: 'No active locations found',
          method: 'gps',
          coordinates: userCoordinates
        };
      }

      // Check if within acceptable distance
      if (minDistance <= this.MAX_DISTANCE_METERS) {
        return {
          isValid: true,
          locationId: closestLocation.id,
          businessId: closestLocation.businessId,
          distance: Math.round(minDistance),
          method: 'gps',
          coordinates: userCoordinates
        };
      } else {
        return {
          isValid: false,
          locationId: closestLocation.id,
          businessId: closestLocation.businessId,
          distance: Math.round(minDistance),
          error: `Location verification failed. You are ${Math.round(minDistance)}m away from ${closestLocation.name}. Please be within ${this.MAX_DISTANCE_METERS}m to place an order.`,
          method: 'gps',
          coordinates: userCoordinates
        };
      }
    } catch (error) {
      console.error('Error verifying location:', error);
      return {
        isValid: false,
        error: 'Failed to verify location',
        method: 'gps',
        coordinates: userCoordinates
      };
    }
  }

  /**
   * Verify location from QR code scan
   */
  static async verifyLocationFromQRCode(
    qrCodeId: string,
    registeredLocations: Array<{
      id: string;
      businessId: string;
      name: string;
      qrCodes: { primary: string; backup?: string };
      billing: { isActive: boolean };
    }>
  ): Promise<LocationVerificationResult> {
    try {
      const location = registeredLocations.find(loc => 
        loc.billing.isActive && 
        (loc.qrCodes.primary === qrCodeId || loc.qrCodes.backup === qrCodeId)
      );

      if (location) {
        return {
          isValid: true,
          locationId: location.id,
          businessId: location.businessId,
          method: 'qr_code'
        };
      } else {
        return {
          isValid: false,
          error: 'Invalid QR code or location not active',
          method: 'qr_code'
        };
      }
    } catch (error) {
      console.error('Error verifying QR code location:', error);
      return {
        isValid: false,
        error: 'Failed to verify QR code location',
        method: 'qr_code'
      };
    }
  }

  /**
   * Get location information from IP address (fallback method)
   */
  static async verifyLocationFromIP(): Promise<LocationVerificationResult> {
    try {
      // In a real implementation, you would use a service like:
      // - IPGeolocation API
      // - MaxMind GeoIP
      // - IP-API
      
      // For now, return a mock result
      const mockIPLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York',
        country: 'US'
      };

      return {
        isValid: true, // This would be determined by checking against registered locations
        method: 'ip_address',
        coordinates: {
          latitude: mockIPLocation.latitude,
          longitude: mockIPLocation.longitude
        }
      };
    } catch (error) {
      console.error('Error getting IP location:', error);
      return {
        isValid: false,
        error: 'Failed to determine location from IP',
        method: 'ip_address'
      };
    }
  }

  /**
   * Comprehensive location verification with fallback methods
   */
  static async verifyLocationForOrder(
    qrCodeId?: string,
    registeredLocations?: Array<{
      id: string;
      businessId: string;
      name: string;
      coordinates: { latitude: number; longitude: number };
      qrCodes: { primary: string; backup?: string };
      billing: { isActive: boolean };
    }>
  ): Promise<LocationVerificationResult> {
    try {
      // Method 1: QR Code verification (most reliable)
      if (qrCodeId && registeredLocations) {
        const qrResult = await this.verifyLocationFromQRCode(qrCodeId, registeredLocations);
        if (qrResult.isValid) {
          return qrResult;
        }
      }

      // Method 2: GPS location verification
      if (registeredLocations) {
        const coordinates = await this.getCurrentLocation();
        if (coordinates) {
          const gpsResult = await this.verifyLocationFromGPS(coordinates, registeredLocations);
          if (gpsResult.isValid) {
            return gpsResult;
          }
          // Return GPS result even if invalid to show distance error
          return gpsResult;
        }
      }

      // Method 3: IP-based location (fallback)
      const ipResult = await this.verifyLocationFromIP();
      return {
        ...ipResult,
        isValid: false, // For security, require GPS or QR verification
        error: 'Please enable location services or scan a valid QR code to place an order'
      };
    } catch (error) {
      console.error('Comprehensive location verification failed:', error);
      return {
        isValid: false,
        error: 'Unable to verify your location. Please try again.',
        method: 'manual'
      };
    }
  }

  /**
   * Get device information for fraud detection
   */
  static getDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString();
  }

  /**
   * Check if location verification is required based on business settings
   */
  static isLocationVerificationRequired(businessSettings?: {
    requireLocationVerification?: boolean;
    allowIPFallback?: boolean;
    maxDistanceMeters?: number;
  }): boolean {
    // Default to requiring verification for billing accuracy
    return businessSettings?.requireLocationVerification !== false;
  }
}

export type { LocationCoordinates, LocationVerificationResult };