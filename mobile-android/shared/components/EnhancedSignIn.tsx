// 🔐 Platform-Aware Authentication Wrapper
// Uses mobile auth for Android app, NextAuth for web
// Same UI/UX on both platforms

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle, Smartphone } from 'lucide-react';
import { Container, Button, Heading, Text, Flex, Card } from '../../../styles/components';

// Platform detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if running in Capacitor (mobile app)
    const isCapacitor = !!(window as any).Capacitor;
    setIsMobile(isCapacitor);
  }, []);
  
  return isMobile;
}

// Import the proper mobile auth service
import { MobileAuth } from '../services/mobileAuth';
import { detectPlatform } from '../../../lib/platform';
import { getDefaultRoute as getWebDefaultRoute } from '../../../lib/roles';
import { signIn as nextAuthSignIn } from 'next-auth/react';

// Use the proper mobile auth service
function useMobileAuth() {
  const [user, setUser] = useState<any>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Get current user from auth service
    const currentUser = MobileAuth.getCurrentUser();
    setUser(currentUser);
  }, []);
  
  const signIn = async (email: string, password: string) => {
    if (isMobile) {
      // Mobile: Use Lambda API via MobileAuth
      const platform = detectPlatform();
      const result = await MobileAuth.signIn(email, password);
      if (result.success) {
        const currentUser = MobileAuth.getCurrentUser();
        
        // Update lastLoginPlatform
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            lastLoginPlatform: platform,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(`user_${currentUser.email}`, JSON.stringify(updatedUser));
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } else {
          setUser(currentUser);
        }
        return true;
      }
      return false;
    } else {
      // Web: Use NextAuth
      const result = await nextAuthSignIn('credentials', {
        email,
        password,
        redirect: false, // Don't redirect automatically
      });
      return result?.ok === true;
    }
  };
  
  return { user, signIn };
}

const SignInContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const SignInCard = styled(Card)`
  max-width: 400px;
  width: 100%;
  padding: 2.5rem;
  text-align: center;
`;

const Logo = styled.div`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0 auto 1.5rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e7e5e4;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 1;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #374151;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const MobileBadge = styled.div`
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TestCredentials = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: left;
`;

const SocialSignInSection = styled.div`
  margin-top: 1.5rem;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: #e5e7eb;
`;

const DividerText = styled.span`
  padding: 0 1rem;
  color: #6b7280;
  font-size: 0.875rem;
`;

const SocialButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SocialButton = styled.button<{ $provider: 'google' | 'facebook' | 'twitter' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: ${props => 
    props.$provider === 'google' ? '#ffffff' :
    props.$provider === 'facebook' ? '#1877f2' :
    props.$provider === 'twitter' ? '#000000' : '#ffffff'
  };
  color: ${props => 
    props.$provider === 'google' ? '#374151' :
    props.$provider === 'facebook' ? '#ffffff' :
    props.$provider === 'twitter' ? '#ffffff' : '#374151'
  };
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => 
      props.$provider === 'google' ? '#f9fafb' :
      props.$provider === 'facebook' ? '#166fe5' :
      props.$provider === 'twitter' ? '#1a1a1a' : '#f9fafb'
    };
    transform: translateY(-1px);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;

  &:hover {
    color: #374151;
  }
`;

export default function EnhancedSignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const isMobile = useIsMobile();
  const { user, signIn } = useMobileAuth();

  // Get default route based on platform (web vs mobile)
  const getDefaultRoute = (role?: string): string => {
    const platform = detectPlatform();
    
    if (platform === 'mobile') {
      // Mobile app - use mobile routes
      return MobileAuth.getDefaultRoute(role || 'customer');
    } else {
      // Web browser - use web routes
      const userRole = (role || 'customer') as 'admin' | 'manager' | 'driver' | 'customer' | 'user';
      return getWebDefaultRoute(userRole);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('📋 Form submitted!', { email, password: '***' });
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Determine redirect route based on platform and user role
      let redirectRoute = '/customer'; // default
      
      if (isMobile) {
        // Mobile: Use MobileAuth
        const success = await signIn(email, password);
        
        if (success) {
          const currentUser = MobileAuth.getCurrentUser();
          redirectRoute = getDefaultRoute(currentUser?.role);
          console.log('✅ Mobile sign in successful - redirecting to:', redirectRoute);
          window.location.href = redirectRoute;
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Web: First get user role from Lambda, then call NextAuth with redirect
        const API_BASE_URL = (process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL || '').trim().replace(/\/$/, '');
        const loginUrl = API_BASE_URL ? `${API_BASE_URL}/auth/login` : '/api/mobile-auth/login';
        
        const response = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, platform: 'web' })
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
          // Get the correct redirect route based on user role
          redirectRoute = getDefaultRoute(data.user.role || 'customer');
          console.log('✅ User role detected:', data.user.role, '- will redirect to:', redirectRoute);
          
          // Now call NextAuth signIn with the correct redirect URL
          const result = await signIn(email, password);
          
          if (result) {
            // Force redirect to the role-specific dashboard
            console.log('✅ NextAuth sign in successful - redirecting to:', redirectRoute);
            window.location.href = redirectRoute;
          } else {
            setError('Invalid email or password');
          }
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignInContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SignInCard>
          <BackLink href="/">
            <ArrowLeft size={16} />
            Back to Home
          </BackLink>

          <Logo>JT</Logo>

          <Heading as="h1" $size="2xl" $mb="0.5rem" $color="#1c1917">
            Welcome Back
          </Heading>

          <Text $color="#6b7280" $mb="1rem">
            Sign in to access your restaurant dashboard
          </Text>

          {/* New User Notice */}
          <div style={{
            background: 'linear-gradient(135deg, #fef7ee 0%, #fed7aa 100%)',
            color: '#78716c',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: '1px solid #fbbf24'
          }}>
            🎉 New here? <Link href="/auth/signup" style={{ color: '#ed7734', textDecoration: 'none', fontWeight: 'bold' }}>Create a free account</Link> - takes 30 seconds!
          </div>

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <IconWrapper>
                <Mail size={20} />
              </IconWrapper>
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup>

            <InputGroup>
              <IconWrapper>
                <Lock size={20} />
              </IconWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputGroup>

            <button
              type="submit"
              disabled={isLoading}
              onClick={(e) => {
                console.log('🔘 Simple button clicked!', e);
              }}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                backgroundColor: '#ed7734',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.125rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                pointerEvents: 'auto',
                zIndex: 10
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </Form>

          {/* Social Sign-In Options */}
          <SocialSignInSection>
            <Divider>
              <DividerLine />
              <DividerText>or continue with</DividerText>
              <DividerLine />
            </Divider>
            
            <SocialButtonsContainer>
              <SocialButton 
                onClick={() => setError('Social sign-in coming soon!')}
                $provider="google"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.64 9.20454C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20454Z" fill="#4285F4"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z" fill="#FBBC04"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </SocialButton>
              
              <SocialButton 
                onClick={() => setError('Social sign-in coming soon!')}
                $provider="facebook"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M18 9C18 4.02943 13.9706 0 9 0C4.02943 0 0 4.02943 0 9C0 13.4816 3.29107 17.1312 7.59375 17.8794V11.6016H5.30859V9H7.59375V7.01719C7.59375 4.76156 8.93707 3.51563 10.9932 3.51563C11.9779 3.51563 13.0078 3.69141 13.0078 3.69141V5.90625H11.873C10.7549 5.90625 10.4062 6.60007 10.4062 7.3125V9H12.9023L12.5033 11.6016H10.4062V17.8794C14.7089 17.1312 18 13.4816 18 9Z" fill="#1877F2"/>
                </svg>
                Continue with Facebook
              </SocialButton>
              
              <SocialButton 
                onClick={() => setError('Social sign-in coming soon!')}
                $provider="twitter"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M14.258 0h2.78L11.124 7.63L18 16.615h-5.594L8.061 10.82L2.538 16.615H-.243L6.44 8.31L0 0h5.734L9.928 5.04L14.258 0zM13.273 14.945h1.541L4.86 1.566H3.198l10.075 13.379z" fill="#000000"/>
                </svg>
                Continue with X
              </SocialButton>
            </SocialButtonsContainer>
          </SocialSignInSection>

          <div style={{ marginTop: '2rem' }}>
            <Text $color="#6b7280" $size="sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" style={{ color: '#ed7734', fontWeight: 'medium' }}>
                Sign up
              </Link>
            </Text>
          </div>
        </SignInCard>
      </motion.div>
    </SignInContainer>
  );
}