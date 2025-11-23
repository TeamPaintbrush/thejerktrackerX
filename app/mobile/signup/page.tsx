'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';
import { MobileAuth } from '@/mobile-android/shared/services/mobileAuth';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding: 2rem 1rem;
`;

const Card = styled.div`
  max-width: 400px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.5rem;
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
  bottom: 0.875rem;
  color: #6b7280;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  bottom: 0.875rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #374151;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #dc2626;
  padding: 0.875rem;
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
  padding: 0.875rem;
  border-radius: 0.5rem;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const Footer = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;

  a {
    color: #ed7734;
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const RoleSelector = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const RoleOption = styled.button<{ $selected: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$selected ? '#ed7734' : '#e5e7eb'};
  background: ${props => props.$selected ? '#fef7ee' : 'white'};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.$selected ? '#ed7734' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ed7734;
  }
`;

export default function MobileSignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as 'customer' | 'driver',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);

    try {
      const result = await MobileAuth.signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );

      if (result.success) {
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
          router.push('/mobile/dashboard');
        }, 1500);
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <Container>
        <Card>
          <Logo>JT</Logo>
          <Title>Create Account</Title>
          <Subtitle>Join The JERK Tracker today</Subtitle>

          <Form onSubmit={handleSubmit}>
            <div>
              <Label>I am a:</Label>
              <RoleSelector>
                <RoleOption
                  type="button"
                  $selected={formData.role === 'customer'}
                  onClick={() => setFormData({ ...formData, role: 'customer' })}
                >
                  Customer
                </RoleOption>
                <RoleOption
                  type="button"
                  $selected={formData.role === 'driver'}
                  onClick={() => setFormData({ ...formData, role: 'driver' })}
                >
                  Driver
                </RoleOption>
              </RoleSelector>
            </div>

            <InputGroup>
              <Label>Full Name</Label>
              <IconWrapper>
                <User size={20} />
              </IconWrapper>
              <Input
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </InputGroup>

            <InputGroup>
              <Label>Email</Label>
              <IconWrapper>
                <Mail size={20} />
              </IconWrapper>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
            </InputGroup>

            <InputGroup>
              <Label>Password</Label>
              <IconWrapper>
                <Lock size={20} />
              </IconWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputGroup>

            <InputGroup>
              <Label>Confirm Password</Label>
              <IconWrapper>
                <Lock size={20} />
              </IconWrapper>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputGroup>

            {error && (
              <ErrorMessage>
                <AlertCircle size={20} />
                {error}
              </ErrorMessage>
            )}

            {success && (
              <SuccessMessage>
                <CheckCircle size={20} />
                {success}
              </SuccessMessage>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form>

          <Footer>
            Already have an account? <a href="/mobile/login">Sign in</a>
          </Footer>
        </Card>
      </Container>
    </MobileLayout>
  );
}
