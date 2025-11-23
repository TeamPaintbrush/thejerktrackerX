/**
 * Page Duplication Detection Configuration
 * 
 * This module provides configuration options for customizing
 * the page duplication detection system behavior.
 */

export interface DuplicationDetectionConfig {
  // Global settings
  enabled: boolean;
  strict: boolean;
  logging: boolean;
  
  // Prevention thresholds
  preventionThreshold: {
    high: number;    // 0.8 - Almost certain duplication
    medium: number;  // 0.6 - Likely duplication
    low: number;     // 0.4 - Possible duplication
  };
  
  // Keyword matching sensitivity
  keywordMatching: {
    minOverlap: number;        // Minimum keyword overlap for similarity
    fuzzyMatching: boolean;    // Enable fuzzy string matching
    stemming: boolean;         // Enable word stemming
    synonyms: boolean;         // Use synonym matching
  };
  
  // Path analysis settings
  pathAnalysis: {
    maxSegments: number;       // Maximum path segments before flagging
    reservedPaths: string[];   // System reserved paths
    allowedPatterns: RegExp[]; // Patterns that bypass detection
    blockedPatterns: RegExp[]; // Patterns that are always blocked
  };
  
  // Redirect behavior
  redirectBehavior: {
    autoRedirect: boolean;     // Automatically redirect without prompt
    showAlternatives: boolean; // Show alternative pages
    allowForceCreate: boolean; // Allow users to force page creation
    defaultFallback: string;   // Default redirect path
  };
  
  // Categories and priorities
  categoryPriorities: {
    [key: string]: number;     // Priority weights for different page categories
  };
  
  // Custom rules
  customRules: DuplicationRule[];
  
  // Performance settings
  performance: {
    cacheResults: boolean;     // Cache prevention results
    cacheTtl: number;         // Cache time-to-live in minutes
    maxAlternatives: number;   // Maximum alternatives to show
  };
}

export interface DuplicationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  priority: number;
  condition: (path: string, prompt?: string) => boolean;
  action: 'prevent' | 'redirect' | 'warn' | 'allow';
  redirectTo?: string;
  message?: string;
}

// Default configuration
const DEFAULT_CONFIG: DuplicationDetectionConfig = {
  enabled: true,
  strict: false,
  logging: process.env.NODE_ENV === 'development',
  
  preventionThreshold: {
    high: 0.8,
    medium: 0.6,
    low: 0.4
  },
  
  keywordMatching: {
    minOverlap: 2,
    fuzzyMatching: true,
    stemming: false,
    synonyms: true
  },
  
  pathAnalysis: {
    maxSegments: 4,
    reservedPaths: [
      '/_next',
      '/api',
      '/public',
      '/static',
      '/assets',
      '/.well-known',
      '/node_modules',
      '/.git',
      '/.env'
    ],
    allowedPatterns: [
      /^\/orders\/[\w-]+$/,     // Dynamic order pages
      /^\/auth\/(signin|signup)$/, // Auth pages
    ],
    blockedPatterns: [
      /^\/admin-.*$/,           // Prevent admin variants
      /^\/dashboard-.*$/,       // Prevent dashboard variants
      /^\/.*-page$/,           // Prevent page suffix duplicates
      /^\/page-.*$/,           // Prevent page prefix duplicates
    ]
  },
  
  redirectBehavior: {
    autoRedirect: false,
    showAlternatives: true,
    allowForceCreate: true,
    defaultFallback: '/'
  },
  
  categoryPriorities: {
    'admin': 10,
    'auth': 9,
    'order': 8,
    'public': 7,
    'test': 3
  },
  
  customRules: [
    {
      id: 'admin-variants',
      name: 'Admin Page Variants',
      description: 'Prevent creation of admin dashboard variants',
      enabled: true,
      priority: 10,
      condition: (path) => /admin|dashboard|control|manage/i.test(path),
      action: 'redirect',
      redirectTo: '/admin',
      message: 'Admin functionality already exists'
    },
    {
      id: 'auth-variants',
      name: 'Authentication Variants',
      description: 'Prevent creation of authentication page variants',
      enabled: true,
      priority: 9,
      condition: (path) => /login|signin|register|signup|auth/i.test(path),
      action: 'redirect',
      redirectTo: '/auth/signin',
      message: 'Authentication system already exists'
    },
    {
      id: 'order-variants',
      name: 'Order Page Variants',
      description: 'Consolidate order-related pages',
      enabled: true,
      priority: 8,
      condition: (path) => /order|track|pickup|delivery/i.test(path) && !path.startsWith('/orders/'),
      action: 'redirect',
      redirectTo: '/admin',
      message: 'Order management available in admin dashboard'
    },
    {
      id: 'duplicate-functionality',
      name: 'Duplicate Functionality Prevention',
      description: 'Prevent pages that duplicate existing functionality',
      enabled: true,
      priority: 7,
      condition: (path, prompt) => {
        const duplicateKeywords = ['create', 'new', 'add', 'make', 'build'];
        return duplicateKeywords.some(keyword => 
          path.toLowerCase().includes(keyword) || 
          prompt?.toLowerCase().includes(keyword)
        );
      },
      action: 'warn',
      message: 'Similar functionality may already exist'
    }
  ],
  
  performance: {
    cacheResults: true,
    cacheTtl: 30, // 30 minutes
    maxAlternatives: 5
  }
};

class ConfigurationManager {
  private static instance: ConfigurationManager;
  private config: DuplicationDetectionConfig;
  private cache: Map<string, { result: any; timestamp: number }> = new Map();

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.loadFromEnvironment();
  }

  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Get current configuration
   */
  public getConfig(): DuplicationDetectionConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(updates: Partial<DuplicationDetectionConfig>): void {
    this.config = { ...this.config, ...updates };
    this.clearCache();
    this.log('Configuration updated', updates);
  }

  /**
   * Add custom rule
   */
  public addCustomRule(rule: DuplicationRule): void {
    const existingIndex = this.config.customRules.findIndex(r => r.id === rule.id);
    if (existingIndex >= 0) {
      this.config.customRules[existingIndex] = rule;
    } else {
      this.config.customRules.push(rule);
    }
    this.clearCache();
    this.log('Custom rule added/updated', rule);
  }

  /**
   * Remove custom rule
   */
  public removeCustomRule(ruleId: string): void {
    this.config.customRules = this.config.customRules.filter(r => r.id !== ruleId);
    this.clearCache();
    this.log('Custom rule removed', { ruleId });
  }

  /**
   * Check if system is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Check if strict mode is enabled
   */
  public isStrict(): boolean {
    return this.config.strict;
  }

  /**
   * Get prevention threshold for confidence level
   */
  public getThreshold(confidence: 'high' | 'medium' | 'low'): number {
    return this.config.preventionThreshold[confidence];
  }

  /**
   * Check if path should be allowed (bypass detection)
   */
  public isPathAllowed(path: string): boolean {
    return this.config.pathAnalysis.allowedPatterns.some(pattern => pattern.test(path));
  }

  /**
   * Check if path should be blocked
   */
  public isPathBlocked(path: string): boolean {
    return this.config.pathAnalysis.blockedPatterns.some(pattern => pattern.test(path));
  }

  /**
   * Check if path is reserved
   */
  public isPathReserved(path: string): boolean {
    return this.config.pathAnalysis.reservedPaths.some(reserved => path.startsWith(reserved));
  }

  /**
   * Get applicable custom rules for path/prompt
   */
  public getApplicableRules(path: string, prompt?: string): DuplicationRule[] {
    return this.config.customRules
      .filter(rule => rule.enabled && rule.condition(path, prompt))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Cache result if caching is enabled
   */
  public cacheResult(key: string, result: any): void {
    if (this.config.performance.cacheResults) {
      this.cache.set(key, {
        result,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get cached result if available and not expired
   */
  public getCachedResult(key: string): any | null {
    if (!this.config.performance.cacheResults) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const ttlMs = this.config.performance.cacheTtl * 60 * 1000;
    if (Date.now() - cached.timestamp > ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.result;
  }

  /**
   * Clear all cached results
   */
  public clearCache(): void {
    this.cache.clear();
    this.log('Cache cleared');
  }

  /**
   * Get category priority
   */
  public getCategoryPriority(category: string): number {
    return this.config.categoryPriorities[category] || 0;
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): void {
    const env = process.env;
    
    // Load boolean settings
    if (env.DUPLICATION_DETECTION_ENABLED !== undefined) {
      this.config.enabled = env.DUPLICATION_DETECTION_ENABLED === 'true';
    }
    
    if (env.DUPLICATION_DETECTION_STRICT !== undefined) {
      this.config.strict = env.DUPLICATION_DETECTION_STRICT === 'true';
    }
    
    if (env.DUPLICATION_DETECTION_LOGGING !== undefined) {
      this.config.logging = env.DUPLICATION_DETECTION_LOGGING === 'true';
    }
    
    // Load numeric settings
    if (env.DUPLICATION_MAX_ALTERNATIVES) {
      this.config.performance.maxAlternatives = parseInt(env.DUPLICATION_MAX_ALTERNATIVES, 10);
    }
    
    if (env.DUPLICATION_CACHE_TTL) {
      this.config.performance.cacheTtl = parseInt(env.DUPLICATION_CACHE_TTL, 10);
    }
    
    // Load redirect behavior
    if (env.DUPLICATION_AUTO_REDIRECT !== undefined) {
      this.config.redirectBehavior.autoRedirect = env.DUPLICATION_AUTO_REDIRECT === 'true';
    }
    
    if (env.DUPLICATION_DEFAULT_FALLBACK) {
      this.config.redirectBehavior.defaultFallback = env.DUPLICATION_DEFAULT_FALLBACK;
    }
  }

  /**
   * Export configuration for debugging
   */
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  public importConfig(jsonConfig: string): void {
    try {
      const imported = JSON.parse(jsonConfig);
      this.config = { ...DEFAULT_CONFIG, ...imported };
      this.clearCache();
      this.log('Configuration imported successfully');
    } catch (error) {
      this.log('Failed to import configuration', error);
      throw new Error('Invalid configuration JSON');
    }
  }

  /**
   * Reset to default configuration
   */
  public resetToDefault(): void {
    this.config = { ...DEFAULT_CONFIG };
    this.clearCache();
    this.log('Configuration reset to default');
  }

  /**
   * Log message if logging is enabled
   */
  private log(message: string, data?: any): void {
    if (this.config.logging) {
      console.log(`[DuplicationDetection] ${message}`, data || '');
    }
  }

  /**
   * Generate configuration report
   */
  public generateReport(): {
    enabled: boolean;
    rulesCount: number;
    cacheSize: number;
    performance: any;
    lastUpdated: string;
  } {
    return {
      enabled: this.config.enabled,
      rulesCount: this.config.customRules.filter(r => r.enabled).length,
      cacheSize: this.cache.size,
      performance: this.config.performance,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const DuplicationConfig = ConfigurationManager.getInstance();
export default DuplicationConfig;