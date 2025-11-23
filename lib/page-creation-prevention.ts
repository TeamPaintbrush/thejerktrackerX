/**
 * Page Creation Prevention Utility
 * 
 * This utility provides functions to prevent duplicate page creation
 * and intelligently handle requests that might result in unnecessary pages.
 */

import { PageRegistry, PageDefinition } from './page-registry';

export interface PreventionResult {
  shouldPrevent: boolean;
  reason?: string;
  suggestedAlternative?: string;
  redirectUrl?: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface IntentAnalysis {
  primaryIntent: string;
  category: 'navigation' | 'action' | 'information' | 'creation' | 'management';
  keywords: string[];
  context?: string;
  urgency: 'high' | 'normal' | 'low';
}

class PageCreationPreventionService {
  private static instance: PageCreationPreventionService;
  private registry = PageRegistry;

  private constructor() {}

  public static getInstance(): PageCreationPreventionService {
    if (!PageCreationPreventionService.instance) {
      PageCreationPreventionService.instance = new PageCreationPreventionService();
    }
    return PageCreationPreventionService.instance;
  }

  /**
   * Analyze user intent from a request or prompt
   */
  public analyzeIntent(input: string, currentPath?: string): IntentAnalysis {
    const lowerInput = input.toLowerCase().trim();
    const words = lowerInput.split(/\s+/);
    
    // Extract keywords
    const keywords = this.extractKeywords(lowerInput);
    
    // Determine primary intent
    let primaryIntent = 'unknown';
    let category: IntentAnalysis['category'] = 'navigation';
    let urgency: IntentAnalysis['urgency'] = 'normal';
    
    // Navigation intents
    if (this.hasPatterns(lowerInput, ['go to', 'navigate to', 'show me', 'take me to', 'redirect to'])) {
      category = 'navigation';
      primaryIntent = 'navigate';
    }
    
    // Creation intents (these are the ones we want to prevent)
    else if (this.hasPatterns(lowerInput, ['create', 'new', 'add', 'make', 'build', 'generate'])) {
      category = 'creation';
      primaryIntent = 'create';
      urgency = 'high'; // High urgency to prevent
    }
    
    // Action intents
    else if (this.hasPatterns(lowerInput, ['do', 'perform', 'execute', 'run', 'start', 'begin'])) {
      category = 'action';
      primaryIntent = 'action';
    }
    
    // Information intents
    else if (this.hasPatterns(lowerInput, ['what', 'how', 'why', 'explain', 'tell me', 'show', 'help'])) {
      category = 'information';
      primaryIntent = 'information';
    }
    
    // Management intents
    else if (this.hasPatterns(lowerInput, ['manage', 'edit', 'update', 'modify', 'change', 'configure'])) {
      category = 'management';
      primaryIntent = 'manage';
    }

    return {
      primaryIntent,
      category,
      keywords,
      context: currentPath,
      urgency
    };
  }

  /**
   * Check if page creation should be prevented based on intent analysis
   */
  public shouldPreventPageCreation(
    requestedPath: string, 
    intent?: IntentAnalysis,
    userPrompt?: string
  ): PreventionResult {
    
    // Always prevent creation if similar page exists
    const existingCheck = this.registry.shouldPreventCreation(requestedPath);
    if (existingCheck.prevent) {
      return {
        shouldPrevent: true,
        reason: existingCheck.reason,
        redirectUrl: existingCheck.redirectTo,
        suggestedAlternative: existingCheck.suggestedPage?.name,
        confidence: 'high'
      };
    }

    // Analyze intent if provided
    if (intent && intent.category === 'creation') {
      const bestRedirect = this.findBestRedirectForCreation(intent, requestedPath);
      return {
        shouldPrevent: true,
        reason: 'Creation intent detected - redirecting to existing functionality',
        redirectUrl: bestRedirect.url,
        suggestedAlternative: bestRedirect.description,
        confidence: bestRedirect.confidence
      };
    }

    // Check for common duplication patterns
    const patternCheck = this.checkCommonDuplicationPatterns(requestedPath, userPrompt);
    if (patternCheck.shouldPrevent) {
      return patternCheck;
    }

    // Check for problematic path structures
    const structureCheck = this.checkProblematicStructures(requestedPath);
    if (structureCheck.shouldPrevent) {
      return structureCheck;
    }

    return { shouldPrevent: false, confidence: 'low' };
  }

  /**
   * Find the best redirect for creation intents
   */
  private findBestRedirectForCreation(
    intent: IntentAnalysis, 
    requestedPath: string
  ): { url: string; description: string; confidence: 'high' | 'medium' | 'low' } {
    
    const keywords = intent.keywords;
    
    // Order creation
    if (this.hasKeywords(keywords, ['order', 'track', 'pickup', 'delivery'])) {
      return {
        url: '/admin',
        description: 'Admin Dashboard - Create and manage orders',
        confidence: 'high'
      };
    }
    
    // User/Auth creation
    if (this.hasKeywords(keywords, ['user', 'account', 'auth', 'login', 'register'])) {
      return {
        url: '/auth/signup',
        description: 'Sign Up - Create new user account',
        confidence: 'high'
      };
    }
    
    // QR Code creation
    if (this.hasKeywords(keywords, ['qr', 'code', 'scan', 'generate'])) {
      return {
        url: '/admin',
        description: 'Admin Dashboard - QR code generation available',
        confidence: 'high'
      };
    }
    
    // Testing/Debug creation
    if (this.hasKeywords(keywords, ['test', 'debug', 'validate'])) {
      return {
        url: '/qr-test',
        description: 'QR Test Page - Testing and validation tools',
        confidence: 'high'
      };
    }
    
    // Information page creation
    if (this.hasKeywords(keywords, ['help', 'guide', 'how', 'tutorial', 'info'])) {
      return {
        url: '/how-it-works',
        description: 'How It Works - Comprehensive feature guide',
        confidence: 'high'
      };
    }
    
    // Pricing page creation
    if (this.hasKeywords(keywords, ['price', 'cost', 'plan', 'subscription', 'billing'])) {
      return {
        url: '/pricing',
        description: 'Pricing - Plans and cost information',
        confidence: 'high'
      };
    }
    
    // Default to admin for management-type creation
    return {
      url: '/admin',
      description: 'Admin Dashboard - Central management hub',
      confidence: 'medium'
    };
  }

  /**
   * Check for common duplication patterns in requests
   */
  private checkCommonDuplicationPatterns(requestedPath: string, userPrompt?: string): PreventionResult {
    const path = requestedPath.toLowerCase();
    const prompt = userPrompt?.toLowerCase() || '';
    
    // Duplicate functionality patterns
    const duplicatePatterns = [
      {
        pattern: /\/dashboard|\/admin|\/control|\/manage/,
        redirect: '/admin',
        reason: 'Admin dashboard already exists with comprehensive management features'
      },
      {
        pattern: /\/login|\/signin|\/auth/,
        redirect: '/auth/signin',
        reason: 'Authentication system already exists'
      },
      {
        pattern: /\/register|\/signup|\/join/,
        redirect: '/auth/signup',
        reason: 'User registration system already exists'
      },
      {
        pattern: /\/order|\/track|\/pickup/,
        redirect: '/admin',
        reason: 'Order management functionality available in admin dashboard'
      },
      {
        pattern: /\/qr|\/code|\/scan/,
        redirect: '/admin',
        reason: 'QR code functionality available in admin dashboard'
      },
      {
        pattern: /\/help|\/guide|\/how|\/tutorial/,
        redirect: '/how-it-works',
        reason: 'Comprehensive guide already exists'
      },
      {
        pattern: /\/price|\/pricing|\/cost|\/plan/,
        redirect: '/pricing',
        reason: 'Pricing information already available'
      }
    ];

    for (const pattern of duplicatePatterns) {
      if (pattern.pattern.test(path) || pattern.pattern.test(prompt)) {
        return {
          shouldPrevent: true,
          reason: pattern.reason,
          redirectUrl: pattern.redirect,
          confidence: 'high'
        };
      }
    }

    return { shouldPrevent: false, confidence: 'low' };
  }

  /**
   * Check for problematic path structures
   */
  private checkProblematicStructures(requestedPath: string): PreventionResult {
    // Very long paths (likely auto-generated or complex)
    if (requestedPath.split('/').length > 4) {
      return {
        shouldPrevent: true,
        reason: 'Complex path structure - redirecting to appropriate section',
        redirectUrl: '/',
        confidence: 'medium'
      };
    }

    // Paths with special characters or encoded content
    if (/[^a-zA-Z0-9\/\-_.]/.test(requestedPath)) {
      return {
        shouldPrevent: true,
        reason: 'Invalid path characters detected',
        redirectUrl: '/',
        confidence: 'high'
      };
    }

    // System or reserved paths
    const reservedPatterns = [
      /^\/_next/,
      /^\/api/,
      /^\/public/,
      /^\/static/,
      /^\/node_modules/,
      /^\/.git/,
      /^\/.env/
    ];

    for (const pattern of reservedPatterns) {
      if (pattern.test(requestedPath)) {
        return {
          shouldPrevent: true,
          reason: 'Reserved system path',
          redirectUrl: '/',
          confidence: 'high'
        };
      }
    }

    return { shouldPrevent: false, confidence: 'low' };
  }

  /**
   * Extract meaningful keywords from input
   */
  private extractKeywords(input: string): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
      'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
      'to', 'was', 'will', 'with', 'i', 'you', 'me', 'we', 'they',
      'this', 'that', 'these', 'those', 'can', 'could', 'should', 'would'
    ]);

    return input
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Limit to 10 keywords
  }

  /**
   * Check if input contains any of the given patterns
   */
  private hasPatterns(input: string, patterns: string[]): boolean {
    return patterns.some(pattern => input.includes(pattern));
  }

  /**
   * Check if keywords array contains any of the given words
   */
  private hasKeywords(keywords: string[], searchWords: string[]): boolean {
    return searchWords.some(word => 
      keywords.some(keyword => 
        keyword.includes(word) || word.includes(keyword)
      )
    );
  }

  /**
   * Generate a prevention report for debugging
   */
  public generatePreventionReport(requestedPath: string, userPrompt?: string): {
    analysis: IntentAnalysis;
    prevention: PreventionResult;
    recommendations: string[];
    alternatives: PageDefinition[];
  } {
    const analysis = this.analyzeIntent(userPrompt || requestedPath, requestedPath);
    const prevention = this.shouldPreventPageCreation(requestedPath, analysis, userPrompt);
    
    const alternatives = this.registry.getAllPages()
      .filter(page => {
        if (!userPrompt) return false;
        const keywords = analysis.keywords;
        return page.keywords.some(pk => 
          keywords.some(k => pk.toLowerCase().includes(k) || k.includes(pk.toLowerCase()))
        );
      })
      .slice(0, 3);

    const recommendations = [
      prevention.shouldPrevent ? 
        `Redirect to ${prevention.redirectUrl} - ${prevention.reason}` :
        'Allow page creation with caution',
      `Intent: ${analysis.primaryIntent} (${analysis.category})`,
      `Confidence: ${prevention.confidence}`,
      alternatives.length > 0 ? 
        `Similar pages: ${alternatives.map(p => p.name).join(', ')}` :
        'No similar pages found'
    ];

    return {
      analysis,
      prevention,
      recommendations,
      alternatives
    };
  }
}

// Export singleton instance
export const PageCreationPrevention = PageCreationPreventionService.getInstance();
export default PageCreationPrevention;