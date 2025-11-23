'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import SettingsService, { type UserSettings } from '../../../../lib/settings';
import { 
  Lock,
  Shield,
  Eye,
  EyeOff,
  Key,
  Smartphone,
  History,
  LogOut,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  Trash2
} from 'lucide-react';

const SecurityContainer = styled.div`
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding-bottom: 100px; /* Space for bottom navigation */
`;

const Header = styled.div`
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

const SecuritySection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SectionDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.4;
`;

const SecurityItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const ItemTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ItemDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

const StatusBadge = styled.div<{ status: 'enabled' | 'disabled' | 'warning' }>`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  display: inline-block;
  
  ${props => {
    switch (props.status) {
      case 'enabled':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        `;
      case 'disabled':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
        `;
      case 'warning':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: #d97706;
        `;
    }
  }}
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #ed7734;
          color: white;
          border: none;
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          border: none;
        `;
      case 'secondary':
      default:
        return `
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
        `;
    }
  }}
  
  &:active {
    transform: scale(0.98);
  }
`;

const Toggle = styled.button<{ active: boolean }>`
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${props => props.active ? '#ed7734' : '#d1d5db'};
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
`;

const PasswordForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const PasswordInput = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  padding-right: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  cursor: pointer;
  color: #6b7280;
`;

const SessionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SessionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const SessionInfo = styled.div`
  flex: 1;
`;

const SessionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
`;

const SessionMeta = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const PasswordStrength = styled.div<{ strength: number }>`
  height: 4px;
  background: #f3f4f6;
  border-radius: 2px;
  margin-top: 0.5rem;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => props.strength}%;
    height: 100%;
    background: ${props => {
      if (props.strength < 30) return '#ef4444';
      if (props.strength < 60) return '#f59e0b';
      if (props.strength < 80) return '#eab308';
      return '#10b981';
    }};
    transition: all 0.3s ease;
  }
`;

interface MobileSecuritySettingsProps {
  className?: string;
}

export default function MobileSecuritySettings({ className }: MobileSecuritySettingsProps) {
  const { addToast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Mock sessions data
  const [activeSessions] = useState([
    {
      id: 1,
      device: 'iPhone 14 Pro',
      location: 'Kingston, Jamaica',
      lastActive: '2 minutes ago',
      current: true
    },
    {
      id: 2,
      device: 'Chrome on Windows',
      location: 'Spanish Town, Jamaica',
      lastActive: '2 hours ago',
      current: false
    },
    {
      id: 3,
      device: 'Samsung Galaxy S23',
      location: 'Montego Bay, Jamaica',
      lastActive: '1 day ago',
      current: false
    }
  ]);

  useEffect(() => {
    // Load security settings from SettingsService
    const loadSettings = async () => {
      setLoading(true);
      
      if (typeof window !== 'undefined') {
        try {
          // Get user from localStorage
          const storedUser = localStorage.getItem('mobile_auth_user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            
            // Load settings from SettingsService
            const userSettings = await SettingsService.getUserSettings(userData.email);
            
            if (userSettings) {
              setUserSettings(userSettings);
              
              // Map UserSettings to security state
              setTwoFactorEnabled(userSettings.security.twoFactorEnabled || false);
              setBiometricsEnabled(userSettings.security.biometricEnabled || false);
              setSessionTimeout(userSettings.security.sessionTimeout || 30);
            } else {
              // Create default settings if none exist
              const defaultSettings = SettingsService.createDefaultSettings(
                userData.email,
                userData.email,
                userData.name || 'User'
              );
              
              defaultSettings.platform = 'mobile';
              await SettingsService.updateUserSettings(
                userData.email,
                defaultSettings
              );
              
              setUserSettings(defaultSettings);
              setTwoFactorEnabled(defaultSettings.security.twoFactorEnabled);
              setBiometricsEnabled(defaultSettings.security.biometricEnabled || false);
              setSessionTimeout(defaultSettings.security.sessionTimeout);
            }
          }
        } catch (error) {
          console.error('Error loading security settings:', error);
        }
      }
      
      setLoading(false);
    };
    
    loadSettings();
  }, []);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    if (password.length >= 12) strength += 10;
    
    return Math.min(strength, 100);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    
    if (field === 'new') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const updateSecuritySetting = async (setting: string, value: boolean) => {
    setSaving(true);
    
    if (setting === 'twoFactor') {
      setTwoFactorEnabled(value);
    } else if (setting === 'biometrics') {
      setBiometricsEnabled(value);
    }
    
    // Save to SettingsService
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Update security settings via SettingsService
          const updatedSettings = await SettingsService.updateSecurity(userData.email, {
            twoFactorEnabled: setting === 'twoFactor' ? value : twoFactorEnabled,
            biometricEnabled: setting === 'biometrics' ? value : biometricsEnabled,
            sessionTimeout: sessionTimeout
          });
          
          if (updatedSettings) {
            setUserSettings(updatedSettings);
            addToast({
              type: 'success',
              title: 'Security Updated',
              message: 'Changes synced across all devices',
              duration: 3000
            });
          }
        }
      } catch (error) {
        console.error('Error saving security settings:', error);
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: 'Failed to save security settings',
          duration: 5000
        });
      }
    }
    
    setSaving(false);
  };

  const handleChangePassword = () => {
    if (passwords.new !== passwords.confirm) {
      addToast({
        type: 'error',
        title: 'Password Mismatch',
        message: 'New passwords do not match',
        duration: 4000
      });
      return;
    }
    
    if (passwordStrength < 50) {
      addToast({
        type: 'warning',
        title: 'Weak Password',
        message: 'Please choose a stronger password',
        duration: 4000
      });
      return;
    }
    
    // Simulate password change
    addToast({
      type: 'success',
      title: 'Password Changed',
      message: 'Your password has been updated successfully',
      duration: 3000
    });
    setPasswords({ current: '', new: '', confirm: '' });
    setShowPasswordForm(false);
  };

  const terminateSession = (sessionId: number) => {
    addToast({
      type: 'success',
      title: 'Session Terminated',
      message: `Session ${sessionId} has been ended`,
      duration: 3000
    });
  };

  const terminateAllSessions = () => {
    addToast({
      type: 'success',
      title: 'Sessions Terminated',
      message: 'All other sessions have been ended',
      duration: 3000
    });
  };

  return (
    <SecurityContainer className={className}>
      {loading ? (
        <SecuritySection
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#666' }}>Loading security settings...</p>
          </div>
        </SecuritySection>
      ) : (
        <>
      <Header>
        <Title>Security & Privacy</Title>
        <Subtitle>Protect your account and data</Subtitle>
      </Header>
      
      {saving && (
        <div style={{ 
          textAlign: 'center', 
          padding: '0.75rem', 
          background: '#fef7ee', 
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#ed7734' 
        }}>
          Saving security settings...
        </div>
      )}

      <SecuritySection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle>
          <Lock size={20} />
          Account Security
        </SectionTitle>
        <SectionDescription>
          Secure your account with additional protection layers
        </SectionDescription>

        <SecurityItem>
          <ItemInfo>
            <ItemTitle>
              <Key size={16} />
              Two-Factor Authentication
            </ItemTitle>
            <ItemDescription>Add an extra security step to your login process</ItemDescription>
            <StatusBadge status={twoFactorEnabled ? 'enabled' : 'disabled'}>
              {twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </StatusBadge>
          </ItemInfo>
          <Toggle
            active={twoFactorEnabled}
            onClick={() => updateSecuritySetting('twoFactor', !twoFactorEnabled)}
          />
        </SecurityItem>

        <SecurityItem>
          <ItemInfo>
            <ItemTitle>
              <Smartphone size={16} />
              Biometric Login
            </ItemTitle>
            <ItemDescription>Use fingerprint or face recognition to sign in</ItemDescription>
            <StatusBadge status={biometricsEnabled ? 'enabled' : 'warning'}>
              {biometricsEnabled ? 'Enabled' : 'Available'}
            </StatusBadge>
          </ItemInfo>
          <Toggle
            active={biometricsEnabled}
            onClick={() => updateSecuritySetting('biometrics', !biometricsEnabled)}
          />
        </SecurityItem>

        <SecurityItem>
          <ItemInfo>
            <ItemTitle>
              <Lock size={16} />
              Change Password
            </ItemTitle>
            <ItemDescription>Update your account password regularly for better security</ItemDescription>
          </ItemInfo>
          <ActionButton
            variant="secondary"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            <Key size={12} />
            Change
          </ActionButton>
        </SecurityItem>

        {showPasswordForm && (
          <PasswordForm>
            <FormField>
              <Label>Current Password</Label>
              <PasswordInput>
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => handlePasswordChange('current', e.target.value)}
                  placeholder="Enter current password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordInput>
            </FormField>

            <FormField>
              <Label>New Password</Label>
              <PasswordInput>
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange('new', e.target.value)}
                  placeholder="Enter new password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordInput>
              <PasswordStrength strength={passwordStrength} />
            </FormField>

            <FormField>
              <Label>Confirm New Password</Label>
              <PasswordInput>
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                  placeholder="Confirm new password"
                />
                <PasswordToggle
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </PasswordToggle>
              </PasswordInput>
            </FormField>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <ActionButton
                variant="secondary"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="primary"
                onClick={handleChangePassword}
              >
                <Check size={12} />
                Update Password
              </ActionButton>
            </div>
          </PasswordForm>
        )}
      </SecuritySection>

      <SecuritySection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionTitle>
          <History size={20} />
          Active Sessions
        </SectionTitle>
        <SectionDescription>
          Manage devices that are currently signed in to your account
        </SectionDescription>

        <SessionList>
          {activeSessions.map(session => (
            <SessionItem key={session.id}>
              <SessionInfo>
                <SessionTitle>
                  {session.device}
                  {session.current && (
                    <span style={{ 
                      marginLeft: '0.5rem', 
                      fontSize: '0.75rem', 
                      background: '#dcfce7', 
                      color: '#16a34a', 
                      padding: '0.125rem 0.375rem', 
                      borderRadius: '4px' 
                    }}>
                      Current
                    </span>
                  )}
                </SessionTitle>
                <SessionMeta>
                  {session.location} • {session.lastActive}
                </SessionMeta>
              </SessionInfo>
              
              {!session.current && (
                <ActionButton
                  variant="danger"
                  onClick={() => terminateSession(session.id)}
                >
                  <X size={12} />
                  End
                </ActionButton>
              )}
            </SessionItem>
          ))}
        </SessionList>

        <ActionButton
          variant="danger"
          onClick={terminateAllSessions}
          style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
        >
          <LogOut size={12} />
          Sign Out All Other Sessions
        </ActionButton>
      </SecuritySection>

      <SecuritySection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <SectionTitle>
          <Shield size={20} />
          Privacy Settings
        </SectionTitle>
        <SectionDescription>
          Control how your data is used and shared
        </SectionDescription>

        <SecurityItem>
          <ItemInfo>
            <ItemTitle>Data Collection</ItemTitle>
            <ItemDescription>Allow anonymous usage data to help improve the app</ItemDescription>
          </ItemInfo>
          <ActionButton variant="secondary">
            Manage
          </ActionButton>
        </SecurityItem>

        <SecurityItem>
          <ItemInfo>
            <ItemTitle>Location Tracking</ItemTitle>
            <ItemDescription>Share location for delivery and analytics purposes</ItemDescription>
          </ItemInfo>
          <ActionButton variant="secondary">
            Configure
          </ActionButton>
        </SecurityItem>

        <SecurityItem>
          <ItemInfo>
            <ItemTitle>
              <AlertTriangle size={16} />
              Delete Account
            </ItemTitle>
            <ItemDescription>Permanently delete your account and all associated data</ItemDescription>
          </ItemInfo>
          <ActionButton
            variant="danger"
            onClick={() => addToast({
              type: 'info',
              title: 'Email Verification Required',
              message: 'Account deletion requires email verification. Feature coming soon.',
              duration: 5000
            })}
          >
            <Trash2 size={12} />
            Delete
          </ActionButton>
        </SecurityItem>
      </SecuritySection>
      </>
      )}
    </SecurityContainer>
  );
}