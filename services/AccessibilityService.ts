/**
 * Accessibility Enhancement Utilities
 * Provides keyboard navigation, ARIA labels, and high contrast mode support
 */

// High Contrast Mode Detection and Management
export class AccessibilityService {
  private static instance: AccessibilityService;
  private highContrastMode: boolean = false;
  private keyboardNavigationEnabled: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.detectHighContrastMode();
      this.setupKeyboardNavigation();
    }
  }

  static getInstance(): AccessibilityService {
    if (!AccessibilityService.instance) {
      AccessibilityService.instance = new AccessibilityService();
    }
    return AccessibilityService.instance;
  }

  /**
   * Detect if user has high contrast mode enabled
   */
  private detectHighContrastMode(): void {
    // Check for Windows High Contrast Mode
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    this.highContrastMode = mediaQuery.matches;

    // Listen for changes
    mediaQuery.addEventListener('change', (e) => {
      this.highContrastMode = e.matches;
      this.applyHighContrastStyles();
    });

    if (this.highContrastMode) {
      this.applyHighContrastStyles();
    }
  }

  /**
   * Apply high contrast styles
   */
  private applyHighContrastStyles(): void {
    if (this.highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }

  /**
   * Setup keyboard navigation listeners
   */
  private setupKeyboardNavigation(): void {
    // Show focus outlines when user uses Tab key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Hide focus outlines when user uses mouse
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  /**
   * Check if high contrast mode is enabled
   */
  isHighContrastMode(): boolean {
    return this.highContrastMode;
  }

  /**
   * Toggle high contrast mode programmatically
   */
  toggleHighContrastMode(): void {
    this.highContrastMode = !this.highContrastMode;
    this.applyHighContrastStyles();
    
    // Store preference
    localStorage.setItem('high-contrast-mode', this.highContrastMode.toString());
  }
}

/**
 * ARIA Label Helpers
 */
export const ariaLabels = {
  // Navigation
  mainNavigation: 'Main navigation',
  userMenu: 'User account menu',
  mobileMenu: 'Mobile navigation menu',
  breadcrumb: 'Breadcrumb navigation',

  // Forms
  searchForm: 'Search orders',
  orderForm: 'Create new order form',
  loginForm: 'Sign in form',
  
  // Buttons
  closeModal: 'Close modal dialog',
  openMenu: 'Open menu',
  submitForm: 'Submit form',
  createOrder: 'Create new order',
  transferOrder: 'Transfer order to different location',
  
  // Status
  orderStatus: (status: string) => `Order status: ${status}`,
  loadingContent: 'Loading content',
  
  // Notifications
  successMessage: 'Success notification',
  errorMessage: 'Error notification',
  warningMessage: 'Warning notification',
  
  // Data
  orderCard: (orderNumber: string) => `Order ${orderNumber}`,
  locationCard: (locationName: string) => `Location: ${locationName}`,
  
  // Analytics
  metricsCard: (label: string, value: string) => `${label}: ${value}`,
  chart: (type: string) => `${type} chart`,
};

/**
 * Keyboard Navigation Helper
 */
export class KeyboardNavigationHelper {
  /**
   * Handle Escape key to close modals/menus
   */
  static handleEscapeKey(callback: () => void): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };
  }

  /**
   * Handle Enter/Space key for button-like elements
   */
  static handleActivation(callback: () => void): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
      }
    };
  }

  /**
   * Handle arrow key navigation in lists
   */
  static handleArrowNavigation(
    items: HTMLElement[],
    currentIndex: number,
    setCurrentIndex: (index: number) => void
  ): (e: KeyboardEvent) => void {
    return (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        setCurrentIndex(nextIndex);
        items[nextIndex]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + items.length) % items.length;
        setCurrentIndex(prevIndex);
        items[prevIndex]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentIndex(0);
        items[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        const lastIndex = items.length - 1;
        setCurrentIndex(lastIndex);
        items[lastIndex]?.focus();
      }
    };
  }

  /**
   * Trap focus within a modal or dialog
   */
  static trapFocus(containerElement: HTMLElement): () => void {
    const focusableElements = containerElement.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  }
}

/**
 * Screen Reader Announcements
 */
export class ScreenReaderAnnouncer {
  private static liveRegion: HTMLElement | null = null;

  /**
   * Create or get live region for announcements
   */
  private static getLiveRegion(): HTMLElement {
    if (!this.liveRegion) {
      this.liveRegion = document.createElement('div');
      this.liveRegion.setAttribute('role', 'status');
      this.liveRegion.setAttribute('aria-live', 'polite');
      this.liveRegion.setAttribute('aria-atomic', 'true');
      this.liveRegion.className = 'sr-only';
      this.liveRegion.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(this.liveRegion);
    }
    return this.liveRegion;
  }

  /**
   * Announce message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const liveRegion = this.getLiveRegion();
    liveRegion.setAttribute('aria-live', priority);
    
    // Clear previous message
    liveRegion.textContent = '';
    
    // Announce new message after brief delay
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  }

  /**
   * Announce route change
   */
  static announceRouteChange(routeName: string): void {
    this.announce(`Navigated to ${routeName}`, 'assertive');
  }

  /**
   * Announce loading state
   */
  static announceLoading(isLoading: boolean): void {
    if (isLoading) {
      this.announce('Loading content', 'polite');
    } else {
      this.announce('Content loaded', 'polite');
    }
  }

  /**
   * Announce form errors
   */
  static announceFormError(fieldName: string, error: string): void {
    this.announce(`Error in ${fieldName}: ${error}`, 'assertive');
  }

  /**
   * Announce success message
   */
  static announceSuccess(message: string): void {
    this.announce(`Success: ${message}`, 'polite');
  }
}

/**
 * Focus Management
 */
export class FocusManager {
  private static focusHistory: HTMLElement[] = [];

  /**
   * Save current focus
   */
  static saveFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      this.focusHistory.push(activeElement);
    }
  }

  /**
   * Restore previous focus
   */
  static restoreFocus(): void {
    const previousElement = this.focusHistory.pop();
    if (previousElement && typeof previousElement.focus === 'function') {
      previousElement.focus();
    }
  }

  /**
   * Focus first error in form
   */
  static focusFirstError(formElement: HTMLElement): void {
    const errorElement = formElement.querySelector<HTMLElement>('[aria-invalid="true"]');
    if (errorElement) {
      errorElement.focus();
      ScreenReaderAnnouncer.announce('Please fix form errors', 'assertive');
    }
  }

  /**
   * Set focus to element after delay (for modals, etc.)
   */
  static setFocusAfterDelay(element: HTMLElement | null, delay: number = 100): void {
    if (!element) return;
    setTimeout(() => {
      element.focus();
    }, delay);
  }
}

/**
 * Color Contrast Checker
 */
export class ContrastChecker {
  /**
   * Calculate relative luminance
   */
  private static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio
   */
  static getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
    const lum1 = this.getLuminance(...rgb1);
    const lum2 = this.getLuminance(...rgb2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if contrast meets WCAG AA standards (4.5:1 for normal text)
   */
  static meetsWCAG_AA(foreground: [number, number, number], background: [number, number, number]): boolean {
    return this.getContrastRatio(foreground, background) >= 4.5;
  }

  /**
   * Check if contrast meets WCAG AAA standards (7:1 for normal text)
   */
  static meetsWCAG_AAA(foreground: [number, number, number], background: [number, number, number]): boolean {
    return this.getContrastRatio(foreground, background) >= 7;
  }
}

// Initialize accessibility service on import
if (typeof window !== 'undefined') {
  AccessibilityService.getInstance();
}

export default AccessibilityService;
