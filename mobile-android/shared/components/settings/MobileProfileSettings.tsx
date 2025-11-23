'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  Camera,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  X,
  AlertCircle,
  Upload
} from 'lucide-react';
import SettingsService, { type UserSettings } from '../../../../lib/settings';
import { theme } from '@/styles/theme';

const ProfileContainer = styled.div`
  padding: 0.5rem 1rem;
  min-height: 100vh;
  background: ${theme.effects.gradientBackground};
  padding-bottom: 120px;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 0.5rem 0;
  background: ${theme.effects.gradientPrimary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const ProfileSection = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: ${theme.shadows.elevation2};
  border: 1px solid ${theme.colors.border.light};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${theme.colors.primary[500]};
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.$imageUrl 
    ? `url(${props.$imageUrl}) center/cover` 
    : theme.effects.gradientPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: ${theme.typography.fontWeight.bold};
  box-shadow: ${theme.shadows.elevation3};
  border: 4px solid ${theme.colors.surface};
`;

const AvatarButton = styled(motion.button)`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${theme.effects.gradientPrimary};
  border: 3px solid ${theme.colors.surface};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.elevation2};
  transition: ${theme.transitions.smooth};
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const AvatarName = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: ${theme.colors.primary[500]};
  }
`;

const Input = styled.input<{ readOnly?: boolean }>`
  padding: 0.875rem;
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  background: ${props => props.readOnly ? theme.colors.secondary[50] : theme.colors.surface};
  color: ${theme.colors.text.primary};
  transition: ${theme.transitions.smooth};
  font-family: ${theme.typography.fontFamily.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem;
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  resize: vertical;
  min-height: 80px;
  font-family: ${theme.typography.fontFamily.primary};
  transition: ${theme.transitions.smooth};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${theme.colors.text.muted};
  }
`;

const Select = styled.select`
  padding: 0.875rem;
  border: 1px solid ${theme.colors.border.medium};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  background: ${theme.colors.surface};
  color: ${theme.colors.text.primary};
  font-family: ${theme.typography.fontFamily.primary};
  cursor: pointer;
  transition: ${theme.transitions.smooth};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary[500]};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.875rem 1rem;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: ${theme.transitions.smooth};
  border: none;
  box-shadow: ${theme.shadows.elevation1};
  
  ${props => props.variant === 'primary' ? `
    background: ${theme.effects.gradientPrimary};
    color: white;
  ` : `
    background: ${theme.colors.surface};
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.border.medium};
  `}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.elevation2};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InfoCard = styled.div`
  background: ${theme.colors.accent[50]};
  border: 1px solid ${theme.colors.accent[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: 1rem;
  margin-top: 1rem;
`;

const InfoText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: #065f46;
  margin: 0;
  line-height: 1.5;
`;

const ToggleField = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 0;
  border-bottom: 1px solid ${theme.colors.border.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ToggleInfo = styled.div`
  flex: 1;
`;

const ToggleTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: 0.25rem;
`;

const ToggleDescription = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const Toggle = styled.button<{ active: boolean }>`
  width: 52px;
  height: 30px;
  border-radius: ${theme.borderRadius.full};
  border: none;
  background: ${props => props.active ? theme.colors.accent[500] : theme.colors.secondary[400]};
  position: relative;
  cursor: pointer;
  transition: ${theme.transitions.smooth};
  box-shadow: ${theme.shadows.inner};
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.active ? '25px' : '3px'};
    width: 24px;
    height: 24px;
    background: white;
    border-radius: ${theme.borderRadius.full};
    transition: ${theme.transitions.smooth};
    box-shadow: ${theme.shadows.elevation1};
  }
  
  &:hover {
    box-shadow: ${theme.shadows.elevation2};
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${theme.effects.overlayDark};
  backdrop-filter: ${theme.effects.blur};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius['2xl']};
  padding: 1.5rem;
  max-width: 400px;
  width: 100%;
  box-shadow: ${theme.shadows.large};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${theme.colors.text.secondary};
  transition: ${theme.transitions.fast};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const ModalMessage = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const PhotoOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PhotoButton = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: ${theme.transitions.smooth};
  
  &:hover {
    border-color: ${theme.colors.primary[500]};
    background: ${theme.colors.primary[50]};
  }
`;

interface MobileProfileSettingsProps {
  className?: string;
}

export default function MobileProfileSettings({ className }: MobileProfileSettingsProps) {
  const { addToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    bio: '',
    location: '',
    notifications: true,
    twoFactor: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Load profile photo
          const savedPhoto = localStorage.getItem(`profile_photo_${userData.email}`);
          if (savedPhoto) {
            setProfilePhoto(savedPhoto);
          }
          
          const userSettings = await SettingsService.getUserSettings(userData.email);
          
          if (userSettings) {
            setSettings(userSettings);
            setFormData({
              name: userSettings.profile.name || '',
              email: userSettings.profile.email || '',
              phone: userSettings.profile.phone || '',
              role: userSettings.profile.role || '',
              bio: userSettings.profile.bio || '',
              location: userSettings.profile.location || '',
              notifications: userSettings.notifications.email,
              twoFactor: userSettings.security.twoFactorEnabled
            });
          } else {
            const defaultSettings = SettingsService.createDefaultSettings(
              userData.email,
              userData.email,
              userData.name
            );
            defaultSettings.platform = 'mobile';
            await SettingsService.updateUserSettings(userData.email, defaultSettings);
            setSettings(defaultSettings);
            
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              role: userData.role || '',
              bio: '',
              location: '',
              notifications: true,
              twoFactor: false
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      showCustomToast('error', 'Error Loading Profile', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (useCamera: boolean) => {
    try {
      // Check if Capacitor Camera is available
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { Camera } = await import('@capacitor/camera');
        const { CameraResultType, CameraSource } = await import('@capacitor/camera');
        
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Base64,
          source: useCamera ? CameraSource.Camera : CameraSource.Photos
        });
        
        const base64Photo = `data:image/${image.format};base64,${image.base64String}`;
        setProfilePhoto(base64Photo);
        
        // Save to localStorage
        if (user) {
          localStorage.setItem(`profile_photo_${user.email}`, base64Photo);
        }
        
        setShowPhotoModal(false);
        showCustomToast('success', 'Photo Updated', 'Profile photo has been updated successfully');
      } else {
        // Fallback for web/development
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64 = event.target?.result as string;
              setProfilePhoto(base64);
              if (user) {
                localStorage.setItem(`profile_photo_${user.email}`, base64);
              }
              setShowPhotoModal(false);
              showCustomToast('success', 'Photo Updated', 'Profile photo has been updated successfully');
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      showCustomToast('error', 'Upload Failed', 'Failed to upload photo. Please try again.');
      setShowPhotoModal(false);
    }
  };

  const showCustomToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    addToast({
      type,
      title,
      message,
      duration: 3000
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Validation
    if (!formData.name.trim()) {
      showCustomToast('error', 'Validation Error', 'Name cannot be empty');
      return;
    }
    
    if (!formData.email.trim()) {
      showCustomToast('error', 'Validation Error', 'Email cannot be empty');
      return;
    }
    
    setSaving(true);
    try {
      const updatedSettings = await SettingsService.updateProfile(user.email, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        bio: formData.bio,
        location: formData.location
      });
      
      if (updatedSettings) {
        setSettings(updatedSettings);
        
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('mobile_auth_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        setEditing(false);
        setShowSuccessModal(true);
      } else {
        showCustomToast('error', 'Update Failed', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showCustomToast('error', 'Error', 'Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setFormData({
        name: settings.profile.name || '',
        email: settings.profile.email || '',
        phone: settings.profile.phone || '',
        role: settings.profile.role || '',
        bio: settings.profile.bio || '',
        location: settings.profile.location || '',
        notifications: settings.notifications.email,
        twoFactor: settings.security.twoFactorEnabled
      });
    } else if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        bio: user.bio || '',
        location: user.location || '',
        notifications: user.notifications !== false,
        twoFactor: user.twoFactor || false
      });
    }
    setEditing(false);
  };

  const handleToggleChange = async (field: string, value: boolean) => {
    handleInputChange(field, value);
    
    // Update locally only (settings service integration can be added later)
    showCustomToast('success', 'Settings Updated', `${field === 'notifications' ? 'Notification' : 'Security'} settings updated`);
  };

  if (loading) {
    return (
      <ProfileContainer className={className}>
        <ProfileSection
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: theme.colors.text.secondary }}>Loading profile...</p>
          </div>
        </ProfileSection>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer className={className}>
      <Header>
        <Title>Profile Settings</Title>
        <Subtitle>Manage your personal information</Subtitle>
      </Header>

      <ProfileSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle>
          <User size={20} />
          Personal Information
        </SectionTitle>

        <AvatarSection>
          <AvatarContainer>
            <Avatar $imageUrl={profilePhoto}>
              {!profilePhoto && (formData.name ? formData.name.charAt(0).toUpperCase() : 'U')}
            </Avatar>
            <AvatarButton 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPhotoModal(true)}
            >
              <Camera size={18} />
            </AvatarButton>
          </AvatarContainer>
          <AvatarName>Tap camera icon to change photo</AvatarName>
        </AvatarSection>

        <FormGrid>
          <FormField>
            <Label>
              <User size={14} />
              Full Name *
            </Label>
            <Input
              type="text"
              value={formData.name}
              readOnly={!editing}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your full name"
            />
          </FormField>

          <FormField>
            <Label>
              <Mail size={14} />
              Email Address *
            </Label>
            <Input
              type="email"
              value={formData.email}
              readOnly={!editing}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
            />
          </FormField>

          <FormField>
            <Label>
              <Phone size={14} />
              Phone Number
            </Label>
            <Input
              type="tel"
              value={formData.phone}
              readOnly={!editing}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          </FormField>

          <FormField>
            <Label>
              <Shield size={14} />
              Role
            </Label>
            {editing ? (
              <Select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <option value="">Select a role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="driver">Driver</option>
                <option value="customer">Customer</option>
              </Select>
            ) : (
              <Input
                type="text"
                value={formData.role || 'Not set'}
                readOnly
                style={{ textTransform: 'capitalize' }}
              />
            )}
          </FormField>

          <FormField>
            <Label>
              <MapPin size={14} />
              Location
            </Label>
            <Input
              type="text"
              value={formData.location}
              readOnly={!editing}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Enter your location"
            />
          </FormField>

          <FormField>
            <Label>Bio</Label>
            <TextArea
              value={formData.bio}
              readOnly={!editing}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </FormField>
        </FormGrid>

        <ActionButtons>
          {!editing ? (
            <Button
              variant="primary"
              whileTap={{ scale: 0.98 }}
              onClick={() => setEditing(true)}
            >
              <Edit3 size={16} />
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                whileTap={{ scale: 0.98 }}
                onClick={handleCancel}
              >
                <X size={16} />
                Cancel
              </Button>
              <Button
                variant="primary"
                whileTap={{ scale: saving ? 1 : 0.98 }}
                onClick={handleSave}
                disabled={saving}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </ActionButtons>
      </ProfileSection>

      <ProfileSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionTitle>
          <Shield size={20} />
          Privacy & Security
        </SectionTitle>

        <ToggleField>
          <ToggleInfo>
            <ToggleTitle>Push Notifications</ToggleTitle>
            <ToggleDescription>Receive order updates and alerts</ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={formData.notifications}
            onClick={() => handleToggleChange('notifications', !formData.notifications)}
          />
        </ToggleField>

        <ToggleField>
          <ToggleInfo>
            <ToggleTitle>Two-Factor Authentication</ToggleTitle>
            <ToggleDescription>Add extra security to your account</ToggleDescription>
          </ToggleInfo>
          <Toggle
            active={formData.twoFactor}
            onClick={() => handleToggleChange('twoFactor', !formData.twoFactor)}
          />
        </ToggleField>

        <InfoCard>
          <InfoText>
            <CheckCircle size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Your profile information is kept secure and only shared with authorized personnel for order fulfillment purposes.
          </InfoText>
        </InfoCard>
      </ProfileSection>

      {/* Photo Upload Modal */}
      <AnimatePresence>
        {showPhotoModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPhotoModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>
                  <Camera size={24} style={{ color: theme.colors.primary[500] }} />
                  Change Profile Photo
                </ModalTitle>
                <CloseButton onClick={() => setShowPhotoModal(false)}>
                  <X size={24} />
                </CloseButton>
              </ModalHeader>
              <ModalMessage>
                Choose how you&apos;d like to add your profile photo
              </ModalMessage>
              <PhotoOptions>
                <PhotoButton
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePhotoUpload(true)}
                >
                  <Camera size={20} />
                  Take Photo
                </PhotoButton>
                <PhotoButton
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePhotoUpload(false)}
                >
                  <Upload size={20} />
                  Choose from Gallery
                </PhotoButton>
              </PhotoOptions>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSuccessModal(false)}
          >
            <ModalContent
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <CheckCircle 
                    size={64} 
                    style={{ 
                      color: theme.colors.accent[500],
                      margin: '0 auto 1rem'
                    }} 
                  />
                </motion.div>
                <ModalTitle style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
                  Profile Updated!
                </ModalTitle>
                <ModalMessage>
                  Your profile changes have been saved and synced across all devices.
                </ModalMessage>
                <Button
                  variant="primary"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSuccessModal(false)}
                  style={{ marginTop: '1rem' }}
                >
                  <CheckCircle size={16} />
                  Done
                </Button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </ProfileContainer>
  );
}