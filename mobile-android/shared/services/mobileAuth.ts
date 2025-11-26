// 🔐 Mobile Authentication Service
// Client-side authentication for Android app (no API routes needed)
// Preserves same UI/UX as web version

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'driver' | 'manager' | 'admin';
  businessId?: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

class MobileAuthService {
  private static instance: MobileAuthService;
  private authState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null
  };
  private listeners: ((state: AuthState) => void)[] = [];

  static getInstance(): MobileAuthService {
    if (!MobileAuthService.instance) {
      MobileAuthService.instance = new MobileAuthService();
    }
    return MobileAuthService.instance;
  }

  constructor() {
    // Load saved authentication state
    this.loadAuthState();
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Always use Lambda endpoint for production
      const API_BASE_URL = (process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL || '').trim().replace(/\/$/, '');
      if (!API_BASE_URL) {
        throw new Error('Lambda API endpoint not configured');
      }
      
      const loginUrl = `${API_BASE_URL}/auth/login`;

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await this.setAuthenticated(data.user);
        return { success: true };
      } else {
        this.setError(data.error || 'Invalid email or password');
        return { success: false, error: data.error || 'Invalid email or password' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      this.setError(errorMessage);
      
      // Fallback to test accounts ONLY in development mode
      if (process.env.NODE_ENV === 'development') {
        const testAccount = this.getTestAccount(email, password);
        if (testAccount) {
          await this.setAuthenticated(testAccount);
          return { success: true };
        }
      }
      
      return { success: false, error: errorMessage };
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get test account (development only)
   * Test accounts for local development when Lambda is unavailable
   */
  private getTestAccount(email: string, password: string): User | null {
    const testAccounts = [
      {
        id: 'test_admin',
        email: 'admin@jerktrackerx.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin' as const
      },
      {
        id: 'test_manager',
        email: 'manager@jerktrackerx.com',
        password: 'manager123',
        name: 'Manager User',
        role: 'manager' as const
      },
      {
        id: 'test_driver',
        email: 'driver@jerktrackerx.com',
        password: 'driver123',
        name: 'Driver User',
        role: 'driver' as const
      },
      {
        id: 'test_customer',
        email: 'customer@jerktrackerx.com',
        password: 'customer123',
        name: 'Customer User',
        role: 'customer' as const
      }
    ];

    const account = testAccounts.find(acc => acc.email === email && acc.password === password);
    if (!account) return null;

    return {
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role,
      businessId: 'test_business',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, name: string, role: 'customer' | 'driver' = 'customer'): Promise<{ success: boolean; error?: string }> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Always use Lambda endpoint for production
      const API_BASE_URL = (process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL || '').trim().replace(/\/$/, '');
      if (!API_BASE_URL) {
        throw new Error('Lambda API endpoint not configured');
      }
      
      const signupUrl = `${API_BASE_URL}/auth/signup`;

      console.log('🚀 Signup URL:', signupUrl);
      console.log('📦 Signup data:', { email, password: '***', name, role });

      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📄 Response data:', data);

      if (response.ok && data.success) {
        await this.setAuthenticated(data.user);
        return { success: true };
      } else {
        this.setError(data.error || 'Sign up failed');
        return { success: false, error: data.error || 'Sign up failed' };
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      this.setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    this.authState = {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null
    };

    // Clear stored auth data
    localStorage.removeItem('mobile_auth_user');
    localStorage.removeItem('mobile_auth_token');

    this.notifyListeners();
  }

  /**
   * Get current authentication state
   */
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authState.user;
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Load auth state from storage
   */
  private loadAuthState(): void {
    // Skip during SSR/build time
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const savedUser = localStorage.getItem('mobile_auth_user');
      const savedToken = localStorage.getItem('mobile_auth_token');

      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser);
        this.authState = {
          isAuthenticated: true,
          user,
          loading: false,
          error: null
        };
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }

  /**
   * Set user as authenticated
   */
  private async setAuthenticated(user: User): Promise<void> {
    const token = 'mock_token_' + Date.now(); // Mock token

    this.authState = {
      isAuthenticated: true,
      user,
      loading: false,
      error: null
    };

    // Save to storage
    localStorage.setItem('mobile_auth_user', JSON.stringify(user));
    localStorage.setItem('mobile_auth_token', token);

    this.notifyListeners();
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.authState = { ...this.authState, loading };
    this.notifyListeners();
  }

  /**
   * Set error state
   */
  private setError(error: string | null): void {
    this.authState = { ...this.authState, error };
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.authState }));
  }

  /**
   * Get default route based on user role - Mobile App Version
   */
  getDefaultRoute(role: string): string {
    switch (role) {
      case 'admin': return '/mobile/dashboard'; // Mobile admin dashboard with admin stats/actions
      case 'manager': return '/mobile/orders'; // Mobile orders management  
      case 'driver': return '/mobile/orders'; // Mobile orders for drivers
      case 'customer': return '/mobile/dashboard'; // Mobile customer dashboard (restored)
      default: return '/mobile'; // Default to mobile homepage
    }
  }
}

// Export singleton instance
export const MobileAuth = MobileAuthService.getInstance();

// Test credentials for demo:
export const TEST_CREDENTIALS = {
  admin: { email: 'admin@jerktrackerx.com', password: 'admin123' },
  manager: { email: 'manager@jerktrackerx.com', password: 'manager123' },
  driver: { email: 'driver@jerktrackerx.com', password: 'driver123' },
  customer: { email: 'customer@jerktrackerx.com', password: 'customer123' }
};

// Usage Example:
/*
// Sign in
const result = await MobileAuth.signIn('admin@jerktrackerx.com', 'admin123');
if (result.success) {
  const user = MobileAuth.getCurrentUser();
  const defaultRoute = MobileAuth.getDefaultRoute(user!.role);
  router.push(defaultRoute);
}

// Subscribe to auth changes
const unsubscribe = MobileAuth.subscribe((authState) => {
  if (authState.isAuthenticated) {
    console.log('User signed in:', authState.user);
  }
});
*/