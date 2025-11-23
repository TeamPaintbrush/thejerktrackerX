/**
 * Shared Settings Service
 * Provides unified settings management for both web and mobile apps
 * Uses DynamoDBService for persistence with memory fallback
 */

import { DynamoDBService } from './dynamodb';

export interface UserSettings {
  userId: string;
  
  // Profile Settings
  profile: {
    name: string;
    email: string;
    phone: string;
    role: string;
    bio?: string;
    location?: string;
    avatar?: string;
  };
  
  // Notification Settings
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  
  // Security Settings
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    biometricEnabled?: boolean; // mobile only
  };
  
  // Preferences
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
  };
  
  // Platform
  platform?: 'web' | 'mobile';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export class SettingsService {
  private static SETTINGS_PREFIX = 'settings_';
  private static memoryCache = new Map<string, UserSettings>();

  /**
   * Get user settings by user ID
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      // Check memory cache first
      const cacheKey = `${this.SETTINGS_PREFIX}${userId}`;
      if (this.memoryCache.has(cacheKey)) {
        console.log('[SettingsService] Returning from cache:', userId);
        return this.memoryCache.get(cacheKey)!;
      }

      // Try to get from DynamoDB via user lookup
      // Since we don't have a separate settings table yet, we'll use the user's data
      const user = await DynamoDBService.getUserByEmail(userId); // Using email as userId for now
      
      if (user && (user as any).settings) {
        const settings = (user as any).settings as UserSettings;
        this.memoryCache.set(cacheKey, settings);
        return settings;
      }

      // Return null if no settings found
      return null;
    } catch (error) {
      console.error('[SettingsService] Error getting user settings:', error);
      return null;
    }
  }

  /**
   * Create default settings for a new user
   */
  static createDefaultSettings(userId: string, userEmail: string, userName: string = 'User'): UserSettings {
    return {
      userId,
      profile: {
        name: userName,
        email: userEmail,
        phone: '',
        role: 'customer',
        bio: '',
        location: ''
      },
      notifications: {
        email: true,
        push: true,
        sms: false,
        orderUpdates: true,
        promotions: false,
        newsletter: false
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 30,
        biometricEnabled: false
      },
      preferences: {
        language: 'en',
        timezone: 'America/New_York',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(
    userId: string, 
    updates: Partial<UserSettings>
  ): Promise<UserSettings | null> {
    try {
      // Get current settings or create default
      let currentSettings = await this.getUserSettings(userId);
      
      if (!currentSettings) {
        // Create default settings if they don't exist
        currentSettings = this.createDefaultSettings(userId, userId);
      }

      // Merge updates with current settings
      const updatedSettings: UserSettings = {
        ...currentSettings,
        ...updates,
        userId, // Ensure userId doesn't change
        updatedAt: new Date()
      };

      // Update in memory cache
      const cacheKey = `${this.SETTINGS_PREFIX}${userId}`;
      this.memoryCache.set(cacheKey, updatedSettings);

      // Try to persist to database
      // For now, we'll store settings as part of the user object
      try {
        const user = await DynamoDBService.getUserByEmail(userId);
        if (user) {
          await DynamoDBService.updateUser(user.id, {
            settings: updatedSettings
          } as any);
        }
      } catch (dbError) {
        console.log('[SettingsService] Database update failed, using memory cache:', dbError);
      }

      console.log('[SettingsService] Settings updated:', userId);
      return updatedSettings;
    } catch (error) {
      console.error('[SettingsService] Error updating settings:', error);
      return null;
    }
  }

  /**
   * Update profile settings only
   */
  static async updateProfile(
    userId: string,
    profile: Partial<UserSettings['profile']>
  ): Promise<UserSettings | null> {
    const currentSettings = await this.getUserSettings(userId);
    if (!currentSettings) return null;

    return this.updateUserSettings(userId, {
      profile: {
        ...currentSettings.profile,
        ...profile
      }
    });
  }

  /**
   * Update notification settings only
   */
  static async updateNotifications(
    userId: string,
    notifications: Partial<UserSettings['notifications']>
  ): Promise<UserSettings | null> {
    const currentSettings = await this.getUserSettings(userId);
    if (!currentSettings) return null;

    return this.updateUserSettings(userId, {
      notifications: {
        ...currentSettings.notifications,
        ...notifications
      }
    });
  }

  /**
   * Update security settings only
   */
  static async updateSecurity(
    userId: string,
    security: Partial<UserSettings['security']>
  ): Promise<UserSettings | null> {
    const currentSettings = await this.getUserSettings(userId);
    if (!currentSettings) return null;

    return this.updateUserSettings(userId, {
      security: {
        ...currentSettings.security,
        ...security
      }
    });
  }

  /**
   * Update preferences only
   */
  static async updatePreferences(
    userId: string,
    preferences: Partial<UserSettings['preferences']>
  ): Promise<UserSettings | null> {
    const currentSettings = await this.getUserSettings(userId);
    if (!currentSettings) return null;

    return this.updateUserSettings(userId, {
      preferences: {
        ...currentSettings.preferences,
        ...preferences
      }
    });
  }

  /**
   * Clear settings cache (useful for logout)
   */
  static clearCache(userId?: string) {
    if (userId) {
      const cacheKey = `${this.SETTINGS_PREFIX}${userId}`;
      this.memoryCache.delete(cacheKey);
    } else {
      this.memoryCache.clear();
    }
  }

  /**
   * Initialize settings for a user (call on login/signup)
   */
  static async initializeSettings(
    userId: string,
    userEmail: string,
    userName?: string,
    platform?: 'web' | 'mobile'
  ): Promise<UserSettings> {
    let settings = await this.getUserSettings(userId);
    
    if (!settings) {
      settings = this.createDefaultSettings(userId, userEmail, userName);
      settings.platform = platform;
      await this.updateUserSettings(userId, settings);
    }
    
    return settings;
  }
}

export default SettingsService;
