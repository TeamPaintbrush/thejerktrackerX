// 🔐 Platform-Aware Sign-Up Component
// Uses mobile auth for Android app, NextAuth for web
// Same UI/UX on both platforms

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { Container, Button, Heading, Text, Flex, Card } from '../../../styles/components';
import { detectPlatform } from '../../../lib/platform';
import { signIn as nextAuthSignIn } from 'next-auth/react';

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

// Simplified mobile auth hook
function useMobileAuth() {
  const [user, setUser] = useState<any>(null);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Auth check error:', error);
      }
    }
  }, []);
  
  const signUp = async (name: string, email: string, password: string) => {
    if (typeof window === 'undefined') return false;
    
    try {
      const platform = detectPlatform();
      
      // Call the API to create user in DynamoDB
      const API_BASE_URL = (process.env.NEXT_PUBLIC_MOBILE_API_BASE_URL || '').replace(/\/$/, '');
      const signupUrl = API_BASE_URL ? `${API_BASE_URL}/auth/signup` : '/api/mobile-auth/signup';
      
      console.log('🚀 Signing up via:', signupUrl);
      
      const response = await fetch(signupUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          role: 'customer' // Default role for new signups
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        // Store user data locally for BOTH web and mobile (bypasses NextAuth)
        const newUser = {
          ...data.user,
          platform,
          lastLoginPlatform: platform,
        };
        
        // Store in localStorage for persistence
        localStorage.setItem('mobile_auth_user', JSON.stringify(newUser));
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        setUser(newUser);
        
        return true;
      } else {
        console.error('Signup failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };
  
  return { user, signUp };
}

const SignUpContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const SignUpCard = styled(Card)`
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

const Select = styled.select`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e7e5e4;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
  box-sizing: border-box;
  background: white;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
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

const SuccessMessage = styled.div`
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #bbf7d0;
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

const InfoBox = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: left;
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

const SocialSignInSection = styled.div`
  margin-top: 1.5rem;
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
  padding: 0.875rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  background: white;
  color: #374151;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${props => {
      if (props.$provider === 'google') return '#4285F4';
      if (props.$provider === 'facebook') return '#1877F2';
      return '#000000';
    }};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    flex-shrink: 0;
  }
`;

export default function EnhancedSignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();
  
  const isMobile = useIsMobile();
  const { user, signUp } = useMobileAuth();

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Valid email address is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const success = await signUp(fullName, email, password);
      
      if (success) {
        setSuccess('Welcome! Redirecting to your dashboard...');
        // Auto-redirect to customer dashboard after successful signup
        setTimeout(() => {
          window.location.href = '/customer';
        }, 1500);
      } else {
        setError('Sign up failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SignUpContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <SignUpCard>
          <BackLink href="/">
            <ArrowLeft size={16} />
            Back to Home
          </BackLink>

          <Logo>JT</Logo>

          <Heading as="h1" $size="2xl" $mb="0.5rem" $color="#1c1917">
            Create Account
          </Heading>

          <Text $color="#6b7280" $mb="2rem">
            Join the JERK Tracker community
          </Text>

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          {success && (
            <SuccessMessage>
              <CheckCircle size={16} />
              {success}
            </SuccessMessage>
          )}

          <Form onSubmit={handleSubmit}>
            <InputGroup>
              <IconWrapper>
                <User size={20} />
              </IconWrapper>
              <Input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </InputGroup>

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
                placeholder="Password (min 6 characters)"
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

            <InputGroup>
              <IconWrapper>
                <Lock size={20} />
              </IconWrapper>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputGroup>

            <Button
              type="submit"
              $variant="primary"
              $size="lg"
              $fullWidth
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form>

          {/* Social Sign-In Options */}
          <SocialSignInSection>
            <Divider>
              <DividerLine />
              <DividerText>or sign up with</DividerText>
              <DividerLine />
            </Divider>
            
            <SocialButtonsContainer>
              <SocialButton 
                onClick={() => setError('Social sign-up coming soon!')}
                $provider="google"
                type="button"
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
                onClick={() => setError('Social sign-up coming soon!')}
                $provider="facebook"
                type="button"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M18 9C18 4.02943 13.9706 0 9 0C4.02943 0 0 4.02943 0 9C0 13.4816 3.29107 17.1312 7.59375 17.8794V11.6016H5.30859V9H7.59375V7.01719C7.59375 4.76156 8.93707 3.51563 10.9932 3.51563C11.9779 3.51563 13.0078 3.69141 13.0078 3.69141V5.90625H11.873C10.7549 5.90625 10.4062 6.60007 10.4062 7.3125V9H12.9023L12.5033 11.6016H10.4062V17.8794C14.7089 17.1312 18 13.4816 18 9Z" fill="#1877F2"/>
                </svg>
                Continue with Facebook
              </SocialButton>
              
              <SocialButton 
                onClick={() => setError('Social sign-up coming soon!')}
                $provider="twitter"
                type="button"
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
              Already have an account?{' '}
              <Link href="/auth/signin" style={{ color: '#ed7734', fontWeight: 'medium' }}>
                Sign in
              </Link>
            </Text>
          </div>
        </SignUpCard>
      </motion.div>
    </SignUpContainer>
  );
}