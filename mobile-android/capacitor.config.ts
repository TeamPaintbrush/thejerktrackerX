import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thejerktrackerx.app',
  appName: 'JERK Tracker X',
  webDir: 'out', // Next.js static export directory
  bundledWebRuntime: false,
  
  // Android-specific configuration
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },

  // Plugin configurations based on mobile enhancement docs
  plugins: {
    // Top Priority Features (from QUICK-MOBILE-IMPLEMENTATION.md)
    
    // 1. Haptic Feedback
    Haptics: {
      // Enable haptic feedback patterns
    },
    
    // 2. Geolocation (Critical Priority)
    Geolocation: {
      permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
      // For real-time driver tracking
    },
    
    // 3. Camera (Multi-mode from MOBILE-FEATURE-COMPARISON.md)
    Camera: {
      permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
      // QR, Photo, Receipt, Barcode scanning
    },
    
    // 4. Enhanced Offline (from MOBILE-IMPROVEMENTS-PROPOSAL.md)
    Network: {
      // Network status monitoring for smart sync
    },
    
    // 5. Biometric Auth (Security enhancement)
    BiometricAuth: {
      // Face ID / Fingerprint authentication
    },
    
    // Push Notifications (from current PWA features)
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    
    // Local Notifications
    LocalNotifications: {
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#ed7734', // JERK Tracker brand color
      sound: 'beep.wav',
    },
    
    // Keyboard (for accessibility)
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    
    // Status Bar
    StatusBar: {
      style: 'dark',
      backgroundColor: '#ed7734',
    },
    
    // Splash Screen
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ed7734',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
  
  // Server configuration for development
  server: {
    androidScheme: 'https',
    // Allow clear text for local development
    cleartext: true,
  },
};

export default config;