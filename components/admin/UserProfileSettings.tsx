import React, { useState } from 'react'
import styled from 'styled-components'
import { User, Lock, Settings as SettingsIcon } from 'lucide-react'
import { SettingsSection, SettingsItem } from '../ui/SettingsComponents'

interface UserInfo {
  name: string
  email: string
  phone: string
  role: string
  avatar?: string
}

interface UserPreferences {
  language: string
  timezone: string
  dateFormat: string
  currency: string
  notifications: boolean
}

interface UserProfileSettingsProps {
  userInfo: UserInfo
  preferences: UserPreferences
  onUpdateInfo: (info: UserInfo) => void
  onUpdatePreferences: (prefs: UserPreferences) => void
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>
}

const InputField = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const SaveButton = styled.button`
  background: #667eea;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #5568d3;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`

const PasswordForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 14px;
  margin-top: 4px;
`

const SuccessMessage = styled.div`
  color: #16a34a;
  font-size: 14px;
  margin-top: 4px;
`

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  userInfo,
  preferences,
  onUpdateInfo,
  onUpdatePreferences,
  onChangePassword
}) => {
  const [localInfo, setLocalInfo] = useState(userInfo)
  const [localPrefs, setLocalPrefs] = useState(preferences)
  
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const handleInfoChange = (field: keyof UserInfo, value: string) => {
    setLocalInfo(prev => ({ ...prev, [field]: value }))
  }

  const handlePrefChange = (field: keyof UserPreferences, value: string | boolean) => {
    setLocalPrefs(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveInfo = () => {
    onUpdateInfo(localInfo)
  }

  const handleSavePreferences = () => {
    onUpdatePreferences(localPrefs)
  }

  const handlePasswordSubmit = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    setIsChangingPassword(true)
    try {
      await onChangePassword(oldPassword, newPassword)
      setPasswordSuccess('Password changed successfully!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <>
      <SettingsSection title="Account Information" icon={<User size={20} />}>
        <SettingsItem label="Full Name" description="Your display name">
          <InputField
            type="text"
            value={localInfo.name}
            onChange={(e) => handleInfoChange('name', e.target.value)}
            placeholder="John Doe"
          />
        </SettingsItem>

        <SettingsItem label="Email Address" description="Your account email">
          <InputField
            type="email"
            value={localInfo.email}
            onChange={(e) => handleInfoChange('email', e.target.value)}
            placeholder="john@example.com"
          />
        </SettingsItem>

        <SettingsItem label="Phone Number" description="Contact phone number">
          <InputField
            type="tel"
            value={localInfo.phone}
            onChange={(e) => handleInfoChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </SettingsItem>

        <SettingsItem label="Role" description="Your account role">
          <InputField
            type="text"
            value={localInfo.role}
            disabled
          />
        </SettingsItem>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <SaveButton onClick={handleSaveInfo}>Save Account Info</SaveButton>
        </div>
      </SettingsSection>

      <SettingsSection title="Change Password" icon={<Lock size={20} />}>
        <PasswordForm>
          <div>
            <InputField
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Current password"
            />
          </div>
          
          <div>
            <InputField
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
            />
          </div>
          
          <div>
            <InputField
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          {passwordError && <ErrorMessage>{passwordError}</ErrorMessage>}
          {passwordSuccess && <SuccessMessage>{passwordSuccess}</SuccessMessage>}

          <div style={{ textAlign: 'right' }}>
            <SaveButton 
              onClick={handlePasswordSubmit}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </SaveButton>
          </div>
        </PasswordForm>
      </SettingsSection>

      <SettingsSection title="Preferences" icon={<SettingsIcon size={20} />}>
        <SettingsItem label="Language" description="Display language">
          <Select
            value={localPrefs.language}
            onChange={(e) => handlePrefChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </Select>
        </SettingsItem>

        <SettingsItem label="Time Zone" description="Your local time zone">
          <Select
            value={localPrefs.timezone}
            onChange={(e) => handlePrefChange('timezone', e.target.value)}
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Phoenix">Arizona (MST)</option>
            <option value="America/Anchorage">Alaska (AKT)</option>
            <option value="Pacific/Honolulu">Hawaii (HST)</option>
          </Select>
        </SettingsItem>

        <SettingsItem label="Date Format" description="How dates are displayed">
          <Select
            value={localPrefs.dateFormat}
            onChange={(e) => handlePrefChange('dateFormat', e.target.value)}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY (01/12/2025)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (12/01/2025)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (2025-01-12)</option>
          </Select>
        </SettingsItem>

        <SettingsItem label="Currency" description="Default currency format">
          <Select
            value={localPrefs.currency}
            onChange={(e) => handlePrefChange('currency', e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD ($)</option>
          </Select>
        </SettingsItem>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <SaveButton onClick={handleSavePreferences}>Save Preferences</SaveButton>
        </div>
      </SettingsSection>
    </>
  )
}

export default UserProfileSettings
