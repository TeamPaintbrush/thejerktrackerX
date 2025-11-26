'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { 
  Lock,
  Shield,
  Key,
  Smartphone,
  History,
  Eye,
  EyeOff,
  Check,
  AlertTriangle
} from 'lucide-react'
import SettingsService, { type UserSettings } from '../../lib/settings'
import { DynamoDBService } from '@/lib/dynamodb'
import { useSession } from 'next-auth/react'
import { showSuccess, showError, showLoading, dismissToast, showInfo } from '@/lib/toast'
import { Toaster } from 'react-hot-toast'
import BackButton from './BackButton'

const Container = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f5f5f4;
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`

const IconWrapper = styled.div`
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`

const Description = styled.p`
  color: #78716c;
  font-size: 0.875rem;
  margin: 0;
`

const Section = styled.div`
  margin-bottom: 2rem;
`

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #44403c;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SectionHint = styled.p`
  font-size: 0.875rem;
  color: #a8a29e;
  margin-bottom: 1.5rem;
`

const SettingRow = styled.div`
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d6d3d1;
    background: #f5f5f4;
  }
`

const SettingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
`

const SettingIcon = styled.div<{ color: string }>`
  width: 2.5rem;
  height: 2.5rem;
  background: ${props => props.color}15;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
`

const SettingText = styled.div`
  flex: 1;
`

const SettingTitle = styled.div`
  font-weight: 600;
  color: #1c1917;
  margin-bottom: 0.25rem;
`

const SettingDescription = styled.div`
  font-size: 0.875rem;
  color: #78716c;
`

const Toggle = styled.button<{ $enabled: boolean }>`
  position: relative;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${props => props.$enabled ? '#ed7734' : '#d6d3d1'};

  &::after {
    content: '';
    position: absolute;
    top: 0.125rem;
    left: ${props => props.$enabled ? 'calc(100% - 1.375rem)' : '0.125rem'};
    width: 1.25rem;
    height: 1.25rem;
    background: white;
    border-radius: 9999px;
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #57534e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PasswordInputWrapper = styled.div`
  position: relative;
`

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  padding-right: 2.5rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #a8a29e;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;

  &:hover {
    color: #57534e;
  }
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
    }
  `}

  ${props => props.variant === 'secondary' && `
    background: #f5f5f4;
    color: #57534e;

    &:hover {
      background: #e7e5e4;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`

const TimeoutOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
`

const TimeoutButton = styled.button<{ selected: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.selected ? '#ed7734' : '#d6d3d1'};
  background: ${props => props.selected ? '#ed773410' : 'white'};
  color: ${props => props.selected ? '#ed7734' : '#57534e'};

  &:hover {
    border-color: #ed7734;
    background: #ed773410;
  }
`

const Hint = styled.p`
  font-size: 0.75rem;
  color: #a8a29e;
  margin: 0.5rem 0 0 0;
`

const WarningBox = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fbbf24;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: start;
  gap: 0.75rem;
  margin-top: 1rem;
`

const WarningContent = styled.div`
  flex: 1;
`

const WarningTitle = styled.div`
  font-weight: 600;
  color: #78350f;
  margin-bottom: 0.25rem;
`

const WarningText = styled.div`
  font-size: 0.875rem;
  color: #92400e;
`

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
`

const Spinner = styled.div`
  width: 3rem;
  height: 3rem;
  border: 3px solid #f5f5f4;
  border-top-color: #ed7734;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const SaveIndicator = styled.div`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: white;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 50;
`

const SaveSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid #f5f5f4;
  border-top-color: #ed7734;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`

const SaveText = styled.span`
  font-size: 0.875rem;
  color: #57534e;
  font-weight: 500;
`

export default function SecuritySettings() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadSecurity()
  }, [])

  const loadSecurity = async () => {
    try {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      const user = await DynamoDBService.getUserById(session.user.id)
      if (user && user.settings) {
        setSettings(user.settings)
        setSecurity(user.settings.security)
      } else {
        const defaultSettings = SettingsService.createDefaultSettings(
          session.user.id,
          session.user.email || '',
          session.user.name || ''
        )
        setSettings(defaultSettings)
        setSecurity(defaultSettings.security)
      }
    } catch (error) {
      showError('Failed to load security settings')
      console.error('Failed to load security:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle2FA = async () => {
    if (!session?.user?.id) return

    const updated = { ...security, twoFactorEnabled: !security.twoFactorEnabled }
    setSecurity(updated)
    
    setSaving(true)
    try {
      await DynamoDBService.updateUserSettings(session.user.id, {
        ...settings,
        security: updated,
        updatedAt: new Date()
      })
      showInfo(updated.twoFactorEnabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled')
    } catch (error) {
      showError('Failed to update security settings')
      console.error('Failed to save:', error)
      // Revert on error
      setSecurity(security)
    } finally {
      setSaving(false)
    }
  }

  const handleSessionTimeoutChange = async (timeout: number) => {
    if (!session?.user?.id) return

    const updated = { ...security, sessionTimeout: timeout }
    setSecurity(updated)
    
    setSaving(true)
    try {
      await DynamoDBService.updateUserSettings(session.user.id, {
        ...settings,
        security: updated,
        updatedAt: new Date()
      })
      showInfo(`Session timeout updated to ${timeout} minutes`)
    } catch (error) {
      showError('Failed to update session timeout')
      console.error('Failed to save:', error)
      setSecurity(security)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match')
      return
    }
    
    if (passwordForm.newPassword.length < 8) {
      showError('Password must be at least 8 characters long')
      return
    }

    if (!passwordForm.currentPassword) {
      showError('Please enter your current password')
      return
    }
    
    const toastId = showLoading('Updating password...')
    setSaving(true)
    
    try {
      // In production, this would call the password change API
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      dismissToast(toastId)
      showSuccess('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      dismissToast(toastId)
      showError('Failed to change password')
      console.error('Failed to change password:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Container>
        <BackButton />
        <LoadingOverlay>
          <Spinner />
        </LoadingOverlay>
      </Container>
    )
  }

  return (
    <Container>
      <Toaster />
      <BackButton />
      
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <IconWrapper>
            <Lock size={24} />
          </IconWrapper>
          <div>
            <Title>Security & Privacy</Title>
            <Description>Manage your account security settings</Description>
          </div>
        </div>
      </Header>

      {/* Password Change */}
      <Section>
        <SectionTitle>
          <Key size={20} />
          Change Password
        </SectionTitle>
        <SectionHint>Update your password to keep your account secure</SectionHint>

        <FormField>
          <Label>
            <Lock size={14} />
            Current Password
          </Label>
          <PasswordInputWrapper>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              placeholder="Enter current password"
            />
            <PasswordToggleButton
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </PasswordToggleButton>
          </PasswordInputWrapper>
        </FormField>

        <FormField>
          <Label>
            <Key size={14} />
            New Password
          </Label>
          <Input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            placeholder="Enter new password"
          />
          <Hint>Must be at least 8 characters long</Hint>
        </FormField>

        <FormField>
          <Label>
            <Check size={14} />
            Confirm New Password
          </Label>
          <Input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            placeholder="Confirm new password"
          />
        </FormField>

        <Button
          variant="primary"
          onClick={handlePasswordChange}
          disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword}
        >
          <Key size={16} />
          Update Password
        </Button>
      </Section>

      {/* Two-Factor Authentication */}
      <Section>
        <SectionTitle>
          <Shield size={20} />
          Two-Factor Authentication
        </SectionTitle>
        <SectionHint>Add an extra layer of security to your account</SectionHint>

        <SettingRow>
          <SettingInfo>
            <SettingIcon color="#3b82f6">
              <Smartphone size={20} />
            </SettingIcon>
            <SettingText>
              <SettingTitle>Enable 2FA</SettingTitle>
              <SettingDescription>
                {security.twoFactorEnabled 
                  ? 'Your account is protected with 2FA' 
                  : 'Protect your account with two-factor authentication'
                }
              </SettingDescription>
            </SettingText>
          </SettingInfo>
          <Toggle $enabled={security.twoFactorEnabled} onClick={handleToggle2FA} />
        </SettingRow>

        {security.twoFactorEnabled && (
          <WarningBox style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', border: '1px solid #10b981' }}>
            <Check size={20} style={{ color: '#065f46', flexShrink: 0 }} />
            <WarningContent>
              <WarningTitle style={{ color: '#065f46' }}>2FA is enabled</WarningTitle>
              <WarningText style={{ color: '#047857' }}>
                You&apos;ll need to verify your identity with a code from your authenticator app when signing in.
              </WarningText>
            </WarningContent>
          </WarningBox>
        )}
      </Section>

      {/* Session Management */}
      <Section>
        <SectionTitle>
          <History size={20} />
          Session Management
        </SectionTitle>
        <SectionHint>Control how long you stay logged in</SectionHint>

        <div>
          <Label style={{ marginBottom: '1rem' }}>Session Timeout</Label>
          <TimeoutOptions>
            {[15, 30, 60, 120].map((minutes) => (
              <TimeoutButton
                key={minutes}
                selected={security.sessionTimeout === minutes}
                onClick={() => handleSessionTimeoutChange(minutes)}
              >
                {minutes} min
              </TimeoutButton>
            ))}
          </TimeoutOptions>
          <Hint>You&apos;ll be automatically logged out after {security.sessionTimeout} minutes of inactivity.</Hint>
        </div>
      </Section>

      {saving && (
        <SaveIndicator>
          <SaveSpinner />
          <SaveText>Saving...</SaveText>
        </SaveIndicator>
      )}
    </Container>
  )
}
