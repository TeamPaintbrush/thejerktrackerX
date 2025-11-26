'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Briefcase
} from 'lucide-react'
import SettingsService, { type UserSettings } from '../../lib/settings'
import { DynamoDBService } from '@/lib/dynamodb'
import { useSession } from 'next-auth/react'
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast'
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
  justify-content: space-between;
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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #57534e;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }

  &:disabled {
    background: #f5f5f4;
    color: #a8a29e;
    cursor: not-allowed;
  }
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }

  &:disabled {
    background: #f5f5f4;
    color: #a8a29e;
    cursor: not-allowed;
  }
`

const InfoBox = styled.div`
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #93c5fd;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: start;
  gap: 0.75rem;
`

const InfoContent = styled.div`
  flex: 1;
`

const InfoTitle = styled.div`
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 0.25rem;
`

const InfoText = styled.div`
  font-size: 0.875rem;
  color: #1e40af;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
`

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' }>`
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

  ${props => props.variant === 'success' && `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }
`

const Hint = styled.p`
  font-size: 0.75rem;
  color: #a8a29e;
  margin: 0.25rem 0 0 0;
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

export default function ProfileSettings() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    role: 'customer'
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      const user = await DynamoDBService.getUserById(session.user.id)
      if (user) {
        const userSettings: UserSettings = user.settings || SettingsService.createDefaultSettings(
          user.id,
          user.email,
          user.name
        )
        setSettings(userSettings)
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          bio: userSettings.profile?.bio || '',
          location: userSettings.profile?.location || '',
          role: user.role
        })
      }
    } catch (error) {
      showError('Failed to load profile')
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!session?.user?.id) return

    const toastId = showLoading('Saving profile changes...')
    setSaving(true)
    
    try {
      const updates = {
        name: formData.name,
        phone: formData.phone,
        settings: {
          ...settings,
          profile: {
            ...settings?.profile,
            ...formData,
            updatedAt: new Date()
          },
          updatedAt: new Date()
        }
      }
      
      await DynamoDBService.updateUser(session.user.id, updates)
      
      dismissToast(toastId)
      showSuccess('Profile updated successfully!')
      setIsEditing(false)
      await loadProfile()
    } catch (error) {
      dismissToast(toastId)
      showError('Failed to save profile')
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (settings?.profile) {
      setFormData({
        name: settings.profile.name || '',
        email: settings.profile.email || '',
        phone: settings.profile.phone || '',
        bio: settings.profile.bio || '',
        location: settings.profile.location || '',
        role: settings.profile.role || 'customer'
      })
    }
    setIsEditing(false)
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
            <User size={24} />
          </IconWrapper>
          <div>
            <Title>Profile Settings</Title>
            <Description>Manage your account information</Description>
          </div>
        </div>
        {!isEditing ? (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            <Edit3 size={16} />
            Edit Profile
          </Button>
        ) : (
          <ButtonGroup>
            <Button variant="secondary" onClick={handleCancel}>
              <X size={16} />
              Cancel
            </Button>
            <Button variant="success" onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </ButtonGroup>
        )}
      </Header>

      <Section>
        <SectionTitle>
          <User size={20} />
          Personal Information
        </SectionTitle>
        
        <FormGrid>
          <FormField>
            <Label>
              <User size={14} />
              Full Name
            </Label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
          </FormField>

          <FormField>
            <Label>
              <Mail size={14} />
              Email Address
            </Label>
            <Input
              type="email"
              value={formData.email}
              disabled
            />
            <Hint>Email cannot be changed</Hint>
          </FormField>

          <FormField>
            <Label>
              <Phone size={14} />
              Phone Number
            </Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="(555) 123-4567"
            />
          </FormField>

          <FormField>
            <Label>
              <MapPin size={14} />
              Location
            </Label>
            <Input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              disabled={!isEditing}
              placeholder="City, State"
            />
          </FormField>
        </FormGrid>

        <FormField>
          <Label>
            <Briefcase size={14} />
            Bio
          </Label>
          <TextArea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!isEditing}
            placeholder="Tell us about yourself..."
          />
        </FormField>
      </Section>

      <InfoBox>
        <User size={20} style={{ color: '#1e3a8a', flexShrink: 0 }} />
        <InfoContent>
          <InfoTitle>Account Role</InfoTitle>
          <InfoText>
            Your current role: <strong style={{ textTransform: 'capitalize' }}>{formData.role}</strong>
          </InfoText>
        </InfoContent>
      </InfoBox>
    </Container>
  )
}