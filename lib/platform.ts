/**
 * Platform Detection Utilities
 * Detects whether the user is on web or mobile app
 */

export type Platform = 'web' | 'mobile';

/**
 * Detects the current platform
 * @returns 'mobile' if running in Capacitor, 'web' otherwise
 */
export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'web'; // Server-side rendering defaults to web
  }

  // Check if running in Capacitor (mobile app)
  const isCapacitor = !!(window as any).Capacitor;
  
  return isCapacitor ? 'mobile' : 'web';
}

/**
 * Checks if the current platform is mobile
 */
export function isMobilePlatform(): boolean {
  return detectPlatform() === 'mobile';
}

/**
 * Checks if the current platform is web
 */
export function isWebPlatform(): boolean {
  return detectPlatform() === 'web';
}

/**
 * Gets a human-readable platform name
 */
export function getPlatformName(): string {
  const platform = detectPlatform();
  return platform === 'mobile' ? 'Mobile App' : 'Web Application';
}
