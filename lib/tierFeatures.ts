/**
 * Tier-based Feature Gating
 * Manages access control for Professional and Enterprise exclusive features
 */

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface TierFeatures {
  // Core features
  maxOrders: number | 'unlimited';
  maxLocations: number | 'unlimited';
  qrCodeGeneration: boolean;
  analytics: 'basic' | 'advanced' | 'comprehensive';
  support: 'email' | 'priority-email' | '24-7-phone';
  
  // Professional+ exclusive features
  branding: {
    customLogo: boolean;
    customColors: boolean;
    customQRStyle: boolean;
    logoOnQRCode: boolean;
    brandedReports: boolean;
  };
  
  // Advanced features
  apiAccess: boolean;
  webhooks: boolean;
  customDomain: boolean;
  whiteLabel: boolean;
  multiLocation: boolean;
  advancedReporting: boolean;
  customIntegrations: boolean;
  dedicatedSupport: boolean;
}

export const TIER_FEATURES: Record<SubscriptionTier, TierFeatures> = {
  free: {
    maxOrders: 100,
    maxLocations: 1,
    qrCodeGeneration: true,
    analytics: 'basic',
    support: 'email',
    branding: {
      customLogo: false,
      customColors: false,
      customQRStyle: false,
      logoOnQRCode: false,
      brandedReports: false,
    },
    apiAccess: false,
    webhooks: false,
    customDomain: false,
    whiteLabel: false,
    multiLocation: false,
    advancedReporting: false,
    customIntegrations: false,
    dedicatedSupport: false,
  },
  
  starter: {
    maxOrders: 250,
    maxLocations: 1,
    qrCodeGeneration: true,
    analytics: 'basic',
    support: 'email',
    branding: {
      customLogo: false,
      customColors: false,
      customQRStyle: false,
      logoOnQRCode: false,
      brandedReports: false,
    },
    apiAccess: false,
    webhooks: false,
    customDomain: false,
    whiteLabel: false,
    multiLocation: false,
    advancedReporting: false,
    customIntegrations: false,
    dedicatedSupport: false,
  },
  
  professional: {
    maxOrders: 'unlimited',
    maxLocations: 'unlimited',
    qrCodeGeneration: true,
    analytics: 'advanced',
    support: 'priority-email',
    branding: {
      customLogo: true,           // ✅ EXCLUSIVE: Upload brand logo
      customColors: true,          // ✅ EXCLUSIVE: Custom brand colors
      customQRStyle: true,         // ✅ EXCLUSIVE: Styled QR codes
      logoOnQRCode: true,          // ✅ EXCLUSIVE: Logo embedded in QR
      brandedReports: true,        // ✅ EXCLUSIVE: Reports with branding
    },
    apiAccess: true,
    webhooks: false,
    customDomain: false,
    whiteLabel: false,
    multiLocation: true,
    advancedReporting: true,
    customIntegrations: false,
    dedicatedSupport: false,
  },
  
  enterprise: {
    maxOrders: 'unlimited',
    maxLocations: 'unlimited',
    qrCodeGeneration: true,
    analytics: 'comprehensive',
    support: '24-7-phone',
    branding: {
      customLogo: true,
      customColors: true,
      customQRStyle: true,
      logoOnQRCode: true,
      brandedReports: true,
    },
    apiAccess: true,
    webhooks: true,
    customDomain: true,
    whiteLabel: true,
    multiLocation: true,
    advancedReporting: true,
    customIntegrations: true,
    dedicatedSupport: true,
  },
};

/**
 * Check if user has access to a specific feature based on their tier
 */
export function hasFeatureAccess(
  userTier: SubscriptionTier,
  feature: keyof TierFeatures
): boolean {
  return TIER_FEATURES[userTier][feature] !== false;
}

/**
 * Check if user has access to branding features (Professional+)
 */
export function hasBrandingAccess(userTier: SubscriptionTier): boolean {
  return userTier === 'professional' || userTier === 'enterprise';
}

/**
 * Check specific branding feature access
 */
export function hasBrandingFeature(
  userTier: SubscriptionTier,
  feature: keyof TierFeatures['branding']
): boolean {
  return TIER_FEATURES[userTier].branding[feature] === true;
}

/**
 * Get upgrade message for locked features
 */
export function getUpgradeMessage(feature: string): string {
  return `Upgrade to Professional or Enterprise to unlock ${feature}`;
}

/**
 * Check if tier allows custom logo
 */
export function canUploadLogo(userTier: SubscriptionTier): boolean {
  return hasBrandingFeature(userTier, 'customLogo');
}

/**
 * Check if tier allows custom colors
 */
export function canCustomizeColors(userTier: SubscriptionTier): boolean {
  return hasBrandingFeature(userTier, 'customColors');
}

/**
 * Check if tier allows custom QR styling
 */
export function canCustomizeQRStyle(userTier: SubscriptionTier): boolean {
  return hasBrandingFeature(userTier, 'customQRStyle');
}

/**
 * Check if tier allows logo on QR code
 */
export function canEmbedLogoInQR(userTier: SubscriptionTier): boolean {
  return hasBrandingFeature(userTier, 'logoOnQRCode');
}
