// Android Platform Detection Hook
// Provides platform-specific functionality for Android app

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AndroidHapticService } from '../services/hapticService';
import { AndroidGeolocationService } from '../services/geolocationService';
import { AndroidCameraService } from '../services/cameraService';

export interface AndroidCapabilities {
  isAndroid: boolean;
  isNative: boolean;
  haptics: boolean;
  geolocation: boolean;
  camera: boolean;
  deviceInfo?: {
    platform: string;
    model?: string;
    version?: string;
  };
}

export function useAndroidPlatform() {
  const [capabilities, setCapabilities] = useState<AndroidCapabilities>({
    isAndroid: false,
    isNative: false,
    haptics: false,
    geolocation: false,
    camera: false,
  });

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeAndroidFeatures = async () => {
      // Check if running on Android platform
      const isAndroid = Capacitor.getPlatform() === 'android';
      const isNative = Capacitor.isNativePlatform();

      if (!isAndroid || !isNative) {
        setCapabilities({
          isAndroid: false,
          isNative: false,
          haptics: false,
          geolocation: false,
          camera: false,
        });
        setIsReady(true);
        return;
      }

      // Initialize Android services
      const [hapticsReady, geoReady, cameraReady] = await Promise.all([
        AndroidHapticService.initialize(),
        AndroidGeolocationService.initialize(), 
        AndroidCameraService.initialize(),
      ]);

      setCapabilities({
        isAndroid: true,
        isNative: true,
        haptics: hapticsReady,
        geolocation: geoReady,
        camera: cameraReady,
        deviceInfo: {
          platform: 'android',
          // Additional device info could be added here
        },
      });

      setIsReady(true);
    };

    initializeAndroidFeatures();
  }, []);

  return {
    capabilities,
    isReady,
    // Service shortcuts
    haptics: AndroidHapticService,
    geolocation: AndroidGeolocationService,
    camera: AndroidCameraService,
  };
}