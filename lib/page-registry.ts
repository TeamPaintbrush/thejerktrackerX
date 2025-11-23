/**
 * Page Registry Service
 * 
 * This service provides page duplication detection to prevent the system from
 * creating new pages when similar functionality already exists.
 */

export interface PageDefinition {
  path: string;
  name: string;
  description: string;
  keywords: string[];
  component: string;
  isDynamic: boolean;
  requiresAuth: boolean;
  category: 'public' | 'auth' | 'admin' | 'order' | 'test';
  purpose: string;
  aliases?: string[];
}

export interface RoutePattern {
  pattern: RegExp;
  description: string;
  redirectTo?: string;
}

class PageRegistryService {
  private static instance: PageRegistryService;
  private registeredPages: Map<string, PageDefinition> = new Map();
  private routePatterns: RoutePattern[] = [];
  private initialized = false;

  private constructor() {
    this.initializeRegistry();
  }

  public static getInstance(): PageRegistryService {
    if (!PageRegistryService.instance) {
      PageRegistryService.instance = new PageRegistryService();
    }
    return PageRegistryService.instance;
  }

  private initializeRegistry(): void {
    if (this.initialized) return;

    // Register all existing pages
    const pages: PageDefinition[] = [
      {
        path: '/',
        name: 'Home',
        description: 'Landing page with features, hero section, and navigation',
        keywords: ['home', 'landing', 'main', 'index', 'welcome', 'intro'],
        component: 'app/page.tsx',
        isDynamic: false,
        requiresAuth: false,
        category: 'public',
        purpose: 'Main landing page showcasing TheJERKTracker features and benefits'
      },
      {
        path: '/admin',
        name: 'Admin Dashboard',
        description: 'Administrative dashboard for order management, QR generation, and analytics',
        keywords: ['admin', 'dashboard', 'management', 'orders', 'control', 'panel', 'backend'],
        component: 'app/admin/page.tsx',
        isDynamic: false,
        requiresAuth: true,
        category: 'admin',
        purpose: 'Complete order management system with create, view, and track functionality'
      },
      {
        path: '/auth/signin',
        name: 'Sign In',
        description: 'User authentication login page',
        keywords: ['signin', 'login', 'auth', 'authenticate', 'access', 'enter'],
        component: 'app/auth/signin/page.tsx',
        isDynamic: false,
        requiresAuth: false,
        category: 'auth',
        purpose: 'User authentication for accessing protected areas'
      },
      {
        path: '/auth/signup',
        name: 'Sign Up',
        description: 'User registration page for new accounts',
        keywords: ['signup', 'register', 'create account', 'new user', 'join'],
        component: 'app/auth/signup/page.tsx',
        isDynamic: false,
        requiresAuth: false,
        category: 'auth',
        purpose: 'New user registration with validation and account creation'
      },
      {
        path: '/orders/[id]',
        name: 'Order Details',
        description: 'Dynamic order tracking page for customers and drivers',
        keywords: ['order', 'tracking', 'details', 'status', 'pickup', 'driver', 'customer'],
        component: 'app/orders/[id]/page.tsx',
        isDynamic: true,
        requiresAuth: false,
        category: 'order',
        purpose: 'Public order tracking interface accessed via QR codes'
      },
      {
        path: '/order',
        name: 'Order Legacy',
        description: 'Legacy order page with query parameters (redirects to new structure)',
        keywords: ['order', 'legacy', 'query', 'old'],
        component: 'app/order/page.tsx',
        isDynamic: false,
        requiresAuth: false,
        category: 'order',
        purpose: 'Legacy support for old order URLs with query parameters'
      },
      {
        path: '/how-it-works',
        name: 'How It Works',
        description: 'Detailed explanation of the system features and workflow',
        keywords: ['how', 'works', 'features', 'explanation', 'guide', 'tutorial', 'about'],
        component: 'app/how-it-works/page.tsx',
        isDynamic: false,
        requiresAuth: false,
        category: 'public',
        purpose: 'Educational page explaining system workflow and benefits'
      },
      {
        path: '/pricing',
        name: 'Pricing',
        description: 'Pricing plans and subscription information',
        keywords: ['pricing', 'plans', 'cost', 'subscription', 'payment', 'tiers'],
        component: 'app/pricing/page.tsx',
        isDynamic: false,
        requiresAuth: false,
        category: 'public',
        purpose: 'Pricing information and subscription plans'
      },
      {
        path: '/qr-test',
        name: 'QR Test',
        description: 'Testing interface for QR code functionality and system diagnostics',
        keywords: ['qr', 'test', 'testing', 'debug', 'diagnostic', 'validation'],
        component: 'app/qr-test/page.tsx',
        isDynamic: false,
        requiresAuth: false,
        category: 'test',
        purpose: 'Development and testing tools for QR code system validation'
      },
      {
        path: '/qr-tracking',
        name: 'QR Tracking Redirect',
        description: 'Redirect page that forwards to admin QR section',
        keywords: ['qr', 'tracking', 'redirect'],
        component: 'app/qr-tracking/page.tsx',
        isDynamic: false,
        requiresAuth: false,
        category: 'public',
        purpose: 'Redirect helper for QR tracking functionality'
      }
    ];

    // Register all pages
    pages.forEach(page => {
      this.registeredPages.set(page.path, page);
      
      // Also register by aliases if they exist
      if (page.aliases) {
        page.aliases.forEach(alias => {
          this.registeredPages.set(alias, page);
        });
      }
    });

    // Define route patterns for intelligent routing
    this.routePatterns = [
      {
        pattern: /^\/orders?\/[\w-]+$/,
        description: 'Order tracking pages',
        redirectTo: '/orders/[id]'
      },
      {
        pattern: /^\/admin\/?/,
        description: 'Admin related pages',
        redirectTo: '/admin'
      },
      {
        pattern: /^\/auth\/(login|signin)$/,
        description: 'Authentication pages',
        redirectTo: '/auth/signin'
      },
      {
        pattern: /^\/auth\/(register|signup)$/,
        description: 'Registration pages', 
        redirectTo: '/auth/signup'
      },
      {
        pattern: /^\/(dashboard|control|manage)$/,
        description: 'Dashboard aliases',
        redirectTo: '/admin'
      },
      {
        pattern: /^\/(home|main|index)$/,
        description: 'Home page aliases',
        redirectTo: '/'
      },
      {
        pattern: /^\/qr[_-]?(test|testing|debug)$/,
        description: 'QR testing pages',
        redirectTo: '/qr-test'
      },
      {
        pattern: /^\/(about|info|how)$/,
        description: 'Information pages',
        redirectTo: '/how-it-works'
      },
      {
        pattern: /^\/(cost|price|pricing|plans)$/,
        description: 'Pricing related pages',
        redirectTo: '/pricing'
      }
    ];

    this.initialized = true;
  }

  /**
   * Check if a page with similar functionality already exists
   */
  public findSimilarPage(requestedPath: string, keywords: string[] = []): PageDefinition | null {
    // Direct path match
    const directMatch = this.registeredPages.get(requestedPath);
    if (directMatch) {
      return directMatch;
    }

    // Check route patterns
    for (const pattern of this.routePatterns) {
      if (pattern.pattern.test(requestedPath) && pattern.redirectTo) {
        const targetPage = this.registeredPages.get(pattern.redirectTo);
        if (targetPage) {
          return targetPage;
        }
      }
    }

    // Keyword-based similarity matching
    if (keywords.length > 0) {
      const normalizedKeywords = keywords.map(k => k.toLowerCase().trim());
      
      for (const [path, page] of this.registeredPages.entries()) {
        const pageKeywords = page.keywords.map(k => k.toLowerCase());
        
        // Check for keyword overlap
        const overlap = normalizedKeywords.filter(k => 
          pageKeywords.some(pk => pk.includes(k) || k.includes(pk))
        );
        
        // If significant overlap, suggest this page
        if (overlap.length >= Math.min(2, normalizedKeywords.length)) {
          return page;
        }
      }
    }

    return null;
  }

  /**
   * Check if a route should be prevented from creation
   */
  public shouldPreventCreation(requestedPath: string, purpose?: string): {
    prevent: boolean;
    reason?: string;
    suggestedPage?: PageDefinition;
    redirectTo?: string;
  } {
    // Check for existing functionality
    const similarPage = this.findSimilarPage(requestedPath);
    
    if (similarPage) {
      return {
        prevent: true,
        reason: `Similar functionality already exists in ${similarPage.name} (${similarPage.path})`,
        suggestedPage: similarPage,
        redirectTo: similarPage.path
      };
    }

    // Check route patterns
    for (const pattern of this.routePatterns) {
      if (pattern.pattern.test(requestedPath)) {
        const targetPage = this.registeredPages.get(pattern.redirectTo || '/');
        return {
          prevent: true,
          reason: `Path matches existing route pattern: ${pattern.description}`,
          suggestedPage: targetPage,
          redirectTo: pattern.redirectTo || '/'
        };
      }
    }

    // Check for reserved/system paths
    const reservedPaths = ['/api', '/_next', '/public', '/static', '/assets'];
    if (reservedPaths.some(reserved => requestedPath.startsWith(reserved))) {
      return {
        prevent: true,
        reason: 'Path conflicts with system reserved paths',
        redirectTo: '/'
      };
    }

    return { prevent: false };
  }

  /**
   * Get all registered pages
   */
  public getAllPages(): PageDefinition[] {
    return Array.from(this.registeredPages.values())
      .filter((page, index, array) => 
        // Remove duplicates (caused by aliases)
        array.findIndex(p => p.path === page.path) === index
      );
  }

  /**
   * Get pages by category
   */
  public getPagesByCategory(category: PageDefinition['category']): PageDefinition[] {
    return this.getAllPages().filter(page => page.category === category);
  }

  /**
   * Register a new page (for dynamic registration)
   */
  public registerPage(page: PageDefinition): boolean {
    const existingCheck = this.shouldPreventCreation(page.path);
    if (existingCheck.prevent) {
      console.warn(`Page registration prevented: ${existingCheck.reason}`);
      return false;
    }

    this.registeredPages.set(page.path, page);
    return true;
  }

  /**
   * Generate page usage report
   */
  public generateUsageReport(): {
    totalPages: number;
    byCategory: Record<string, number>;
    publicPages: number;
    protectedPages: number;
    dynamicPages: number;
  } {
    const pages = this.getAllPages();
    
    const byCategory = pages.reduce((acc, page) => {
      acc[page.category] = (acc[page.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPages: pages.length,
      byCategory,
      publicPages: pages.filter(p => !p.requiresAuth).length,
      protectedPages: pages.filter(p => p.requiresAuth).length,
      dynamicPages: pages.filter(p => p.isDynamic).length,
    };
  }

  /**
   * Find best redirect for difficult prompts
   */
  public findBestRedirect(intent: string, context?: string): string {
    const lowerIntent = intent.toLowerCase();
    
    // Order-related intents
    if (lowerIntent.includes('order') || lowerIntent.includes('track') || lowerIntent.includes('pickup')) {
      return '/admin';  // Admin can create/manage orders
    }
    
    // Authentication intents
    if (lowerIntent.includes('login') || lowerIntent.includes('signin') || lowerIntent.includes('auth')) {
      return '/auth/signin';
    }
    
    // Registration intents
    if (lowerIntent.includes('register') || lowerIntent.includes('signup') || lowerIntent.includes('account')) {
      return '/auth/signup';
    }
    
    // Information/help intents
    if (lowerIntent.includes('help') || lowerIntent.includes('how') || lowerIntent.includes('guide') || lowerIntent.includes('tutorial')) {
      return '/how-it-works';
    }
    
    // Pricing intents
    if (lowerIntent.includes('price') || lowerIntent.includes('cost') || lowerIntent.includes('plan') || lowerIntent.includes('subscription')) {
      return '/pricing';
    }
    
    // Testing/development intents
    if (lowerIntent.includes('test') || lowerIntent.includes('debug') || lowerIntent.includes('qr')) {
      return '/qr-test';
    }
    
    // Admin/management intents
    if (lowerIntent.includes('admin') || lowerIntent.includes('manage') || lowerIntent.includes('dashboard') || lowerIntent.includes('control')) {
      return '/admin';
    }
    
    // Default to home for unclear intents
    return '/';
  }
}

// Export singleton instance
export const PageRegistry = PageRegistryService.getInstance();
export default PageRegistry;