// Android Geolocation Service
// Based on MOBILE-IMPROVEMENTS-PROPOSAL.md - Critical Priority Feature
// Supports real-time driver tracking, ETAs, and geofencing

import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface GeofenceRegion {
  id: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  name?: string;
}

export class AndroidGeolocationService {
  private static watchId: string | null = null;
  private static isTracking = false;
  private static geofences: GeofenceRegion[] = [];

  static async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      console.warn('Geolocation only available on Android platform');
      return false;
    }

    try {
      // Request permissions
      const permissions = await Geolocation.requestPermissions();
      
      if (permissions.location === 'granted') {
        console.log('Android geolocation permissions granted');
        return true;
      } else {
        console.warn('Geolocation permissions denied');
        return false;
      }
    } catch (error) {
      console.error('Failed to initialize geolocation:', error);
      return false;
    }
  }

  // Get current position (one-time)
  static async getCurrentPosition(): Promise<LocationCoordinates | null> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1 minute cache
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude || undefined,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        timestamp: position.timestamp,
      };
    } catch (error) {
      console.error('Failed to get current position:', error);
      return null;
    }
  }

  // Start continuous location tracking (for drivers)
  static async startTracking(
    callback: (location: LocationCoordinates) => void,
    options?: {
      enableHighAccuracy?: boolean;
      timeout?: number;
      maximumAge?: number;
    }
  ): Promise<boolean> {
    if (this.isTracking) {
      console.warn('Already tracking location');
      return true;
    }

    try {
      this.watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: options?.enableHighAccuracy ?? true,
          timeout: options?.timeout ?? 5000,
          maximumAge: options?.maximumAge ?? 10000, // 10 seconds for real-time tracking
        },
        (position) => {
          if (position) {
            const location: LocationCoordinates = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              timestamp: position.timestamp,
            };

            callback(location);
            this.checkGeofences(location);
          }
        }
      );

      this.isTracking = true;
      console.log('Started location tracking');
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  // Stop location tracking
  static async stopTracking(): Promise<void> {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
      this.isTracking = false;
      console.log('Stopped location tracking');
    }
  }

  // Calculate distance between two points (Haversine formula)
  static calculateDistance(
    from: LocationCoordinates,
    to: LocationCoordinates
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (from.latitude * Math.PI) / 180;
    const φ2 = (to.latitude * Math.PI) / 180;
    const Δφ = ((to.latitude - from.latitude) * Math.PI) / 180;
    const Δλ = ((to.longitude - from.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Calculate ETA based on distance and average speed
  static calculateETA(
    from: LocationCoordinates,
    to: LocationCoordinates,
    averageSpeedKmh: number = 40 // Default 40 km/h for city driving
  ): number {
    const distanceMeters = this.calculateDistance(from, to);
    const distanceKm = distanceMeters / 1000;
    const timeHours = distanceKm / averageSpeedKmh;
    const timeMinutes = timeHours * 60;
    
    return Math.round(timeMinutes);
  }

  // Add geofence region
  static addGeofence(region: GeofenceRegion): void {
    this.geofences.push(region);
    console.log(`Added geofence: ${region.name || region.id}`);
  }

  // Remove geofence region
  static removeGeofence(id: string): void {
    this.geofences = this.geofences.filter(fence => fence.id !== id);
    console.log(`Removed geofence: ${id}`);
  }

  // Check if current location is within any geofence
  private static checkGeofences(location: LocationCoordinates): void {
    this.geofences.forEach(fence => {
      const distance = this.calculateDistance(location, {
        latitude: fence.latitude,
        longitude: fence.longitude,
        timestamp: location.timestamp,
      });

      if (distance <= fence.radius) {
        // Entered geofence
        this.onGeofenceEnter(fence, location);
      }
    });
  }

  // Geofence enter event
  private static onGeofenceEnter(fence: GeofenceRegion, location: LocationCoordinates): void {
    console.log(`Entered geofence: ${fence.name || fence.id}`);
    
    // Trigger haptic feedback
    import('./hapticService').then(({ AndroidHapticService }) => {
      AndroidHapticService.notification();
    });

    // Dispatch custom event for app to handle
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('geofenceEnter', {
        detail: { fence, location }
      }));
    }
  }

  // Get tracking status
  static isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Get all active geofences
  static getGeofences(): GeofenceRegion[] {
    return [...this.geofences];
  }
}