// 🔐 Mobile Authentication Hook
// React hook for mobile authentication - same UX as web version
// No API routes needed - works with static export

'use client';

import { useState, useEffect, useCallback } from 'react';
import { MobileAuth, AuthState, User } from '../services/mobileAuth';

export function useMobileAuth() {
  const [authState, setAuthState] = useState<AuthState>(MobileAuth.getAuthState());

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = MobileAuth.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return await MobileAuth.signIn(email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, role: 'customer' | 'driver' = 'customer') => {
    return await MobileAuth.signUp(email, password, name, role);
  }, []);

  const signOut = useCallback(async () => {
    await MobileAuth.signOut();
  }, []);

  const getDefaultRoute = useCallback((role: string) => {
    return MobileAuth.getDefaultRoute(role);
  }, []);

  return {
    // Auth state
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    
    // Auth actions
    signIn,
    signUp,
    signOut,
    getDefaultRoute,
    
    // Utility
    isReady: !authState.loading
  };
}

// Platform-aware session provider for compatibility with existing code
export function useSession() {
  const mobileAuth = useMobileAuth();
  
  // Return NextAuth-compatible interface for existing components
  return {
    data: mobileAuth.user ? {
      user: {
        id: mobileAuth.user.id,
        email: mobileAuth.user.email,
        name: mobileAuth.user.name,
        role: mobileAuth.user.role
      }
    } : null,
    status: mobileAuth.loading ? 'loading' : mobileAuth.isAuthenticated ? 'authenticated' : 'unauthenticated'
  };
}

// Export test credentials for demo purposes
export { TEST_CREDENTIALS } from '../services/mobileAuth';