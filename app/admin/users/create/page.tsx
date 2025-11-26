'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { ArrowLeft, Save, X } from 'lucide-react';
import { LoadingOverlay } from '@/components/Loading';
import { DynamoDBService } from '@/lib/dynamodb';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast';
import { Toaster } from 'react-hot-toast';
import { FormValidator } from '@/lib/validation';

const Container = styled.div`
  min-height: 100vh;
  background: #fafaf9;
  padding: 2rem;
`;

const ContentCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e7e5e4;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e7e5e4;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f5f5f4;
  border: none;
  border-radius: 0.5rem;
  color: #44403c;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1c1917;
  margin: 0 0 0.5rem 0;
`;

const Description = styled.p`
  color: #78716c;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #1c1917;
  font-size: 0.9375rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  font-size: 0.9375rem;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background: ${props => props.$variant === 'primary' 
    ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)' 
    : '#f5f5f4'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#44403c'};

  &:hover {
    opacity: ${props => props.$variant === 'primary' ? 0.9 : 1};
    background: ${props => props.$variant === 'secondary' ? '#e7e5e4' : undefined};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.9375rem;
`;

const FieldError = styled.span`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export default function CreateUserPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer' as 'admin' | 'manager' | 'driver' | 'customer'
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/admin');
      return;
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    // Validate form
    const validation = FormValidator.validateUserForm(formData);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      const firstError = Object.values(validation.errors)[0];
      showError(firstError);
      return;
    }

    setIsLoading(true);
    const toastId = showLoading('Creating user...');

    try {
      const newUser = await DynamoDBService.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        platform: 'web'
      });

      dismissToast(toastId);
      showSuccess(`User "${newUser.name}" created successfully!`);
      setTimeout(() => router.push('/admin/users'), 1000);
    } catch (err: any) {
      dismissToast(toastId);
      const errorMsg = err.message || 'Failed to create user';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Loading...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  return (
    <Container>
      <Toaster />
      <ContentCard>
        <Header>
          <BackButton onClick={() => router.push('/admin/users')}>
            <ArrowLeft />
            <span>Back to Users</span>
          </BackButton>
          
          <Title>Create New User</Title>
          <Description>
            Add a new user to the system
          </Description>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Full Name</Label>
            <InputWrapper>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                }}
                placeholder="John Doe"
                required
              />
              {fieldErrors.name && <FieldError>{fieldErrors.name}</FieldError>}
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <InputWrapper>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                placeholder="john@example.com"
                required
              />
              {fieldErrors.email && <FieldError>{fieldErrors.email}</FieldError>}
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <InputWrapper>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                }}
                placeholder="Min. 8 characters"
                minLength={8}
                required
              />
              {fieldErrors.password && <FieldError>{fieldErrors.password}</FieldError>}
            </InputWrapper>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="role">Role</Label>
            <InputWrapper>
              <Select
                id="role"
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value as any });
                  if (fieldErrors.role) setFieldErrors({ ...fieldErrors, role: '' });
                }}
                required
              >
                <option value="customer">Customer</option>
                <option value="driver">Driver</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </Select>
              {fieldErrors.role && <FieldError>{fieldErrors.role}</FieldError>}
            </InputWrapper>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={() => router.push('/admin/users')}>
              <X />
              Cancel
            </Button>
            <Button type="submit" $variant="primary" disabled={isLoading}>
              <Save />
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </ButtonGroup>
        </Form>
      </ContentCard>
    </Container>
  );
}
