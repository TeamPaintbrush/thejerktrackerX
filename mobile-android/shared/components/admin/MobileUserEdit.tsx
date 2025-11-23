'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { 
  User,
  Mail,
  Phone,
  Shield,
  Save,
  X,
  Eye,
  EyeOff,
  MapPin,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle
} from 'lucide-react';

const EditContainer = styled.div`
  padding: 0.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const Form = styled(motion.form)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
  
  &:disabled {
    background: #f9fafb;
    color: #6b7280;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const StatusToggle = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const StatusButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.active ? '#ed7734' : '#d1d5db'};
  background: ${props => props.active ? '#ed7734' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  
  &:active {
    transform: scale(0.98);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => {
    if (props.variant === 'danger') return '#dc2626';
    if (props.variant === 'primary') return '#ed7734';
    return '#d1d5db';
  }};
  background: ${props => {
    if (props.variant === 'danger') return '#dc2626';
    if (props.variant === 'primary') return '#ed7734';
    return 'white';
  }};
  color: ${props => {
    if (props.variant === 'danger') return 'white';
    if (props.variant === 'primary') return 'white';
    return '#6b7280';
  }};
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const UserInfo = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #1f2937;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalMessage = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive: string;
  ordersCount: number;
  location?: string;
}

interface MobileUserEditProps {
  userId: string;
  className?: string;
}

export default function MobileUserEdit({ userId, className }: MobileUserEditProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [user, setUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer' as 'admin' | 'manager' | 'driver' | 'customer'
  });

  // Fetch user data from API
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load user');
        }
        
        const apiUser = data.user;
        const mappedUser: User = {
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phone || 'N/A',
          status: 'active', // Could add this field to User model
          joinDate: new Date(apiUser.createdAt).toISOString().split('T')[0],
          lastActive: calculateLastActive(apiUser.updatedAt || apiUser.createdAt),
          ordersCount: 0 // TODO: Get from orders API
        };
        
        setUser(mappedUser);
        setFormData({
          name: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phone || '',
          role: apiUser.role
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        setErrors({ fetch: error instanceof Error ? error.message : 'Failed to load user data' });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const calculateLastActive = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStatusChange = (status: 'active' | 'inactive') => {
    setFormData(prev => ({
      ...prev,
      status
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user');
      }
      
      // Navigate back to users list
      router.push('/mobile/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to update user. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setSaving(true);
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete user');
      }
      
      addToast({
        type: 'success',
        title: 'User Deleted',
        message: 'User has been successfully removed',
        duration: 3000
      });
      
      // Navigate back to users list
      setTimeout(() => router.push('/mobile/admin/users'), 500);
    } catch (error) {
      console.error('Error deleting user:', error);
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: error instanceof Error ? error.message : 'Failed to delete user. Please try again.',
        duration: 5000
      });
      setErrors({ 
        submit: error instanceof Error ? error.message : 'Failed to delete user. Please try again.' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <EditContainer className={className}>
        <Header>
          <Title>Loading User...</Title>
        </Header>
      </EditContainer>
    );
  }

  if (!user) {
    return (
      <EditContainer className={className}>
        <Header>
          <Title>User Not Found</Title>
          <Subtitle>The requested user could not be loaded</Subtitle>
        </Header>
      </EditContainer>
    );
  }

  return (
    <EditContainer className={className}>
      <Header>
        <Title>Edit User</Title>
        <Subtitle>Update user information and settings</Subtitle>
      </Header>

      <UserInfo>
        <InfoRow>
          <InfoLabel>User ID:</InfoLabel>
          <InfoValue>{user.id}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Joined:</InfoLabel>
          <InfoValue>{new Date(user.joinDate).toLocaleDateString()}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Last Active:</InfoLabel>
          <InfoValue>{user.lastActive}</InfoValue>
        </InfoRow>
        <InfoRow>
          <InfoLabel>Total Orders:</InfoLabel>
          <InfoValue>{user.ordersCount}</InfoValue>
        </InfoRow>
      </UserInfo>

      <Form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
      >
        <FormGroup>
          <Label htmlFor="name">Full Name *</Label>
          <InputContainer>
            <InputIcon>
              <User size={16} />
            </InputIcon>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </InputContainer>
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">Email Address *</Label>
          <InputContainer>
            <InputIcon>
              <Mail size={16} />
            </InputIcon>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleInputChange}
            />
          </InputContainer>
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phone">Phone Number *</Label>
          <InputContainer>
            <InputIcon>
              <Phone size={16} />
            </InputIcon>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </InputContainer>
          {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="role">User Role *</Label>
          <InputContainer>
            <InputIcon>
              <Shield size={16} />
            </InputIcon>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            >
              <option value="customer">Customer</option>
              <option value="driver">Driver</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </Select>
          </InputContainer>
        </FormGroup>

        {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}

        <ButtonGroup>
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            whileTap={{ scale: 0.98 }}
          >
            <X size={16} />
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDeleteClick}
            disabled={saving}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={16} />
            Delete
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </ButtonGroup>
      </Form>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <ModalContent
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <ModalTitle>
              <AlertTriangle size={20} style={{ color: '#ef4444' }} />
              Delete User?
            </ModalTitle>
            <ModalMessage>
              Are you sure you want to delete this user? This action cannot be undone and all associated data will be permanently removed.
            </ModalMessage>
            <ModalButtons>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
                whileTap={{ scale: 0.98 }}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                whileTap={{ scale: 0.98 }}
                style={{ flex: 1 }}
              >
                <Trash2 size={16} />
                Delete
              </Button>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </EditContainer>
  );
}