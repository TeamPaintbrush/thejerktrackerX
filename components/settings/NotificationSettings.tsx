'use client'

import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { 
  Bell,
  Smartphone,
  Mail,
  MessageSquare,
  Package,
  Truck,
  Star
} from 'lucide-react'
import SettingsService, { type UserSettings } from '../../lib/settings'
import { DynamoDBService } from '@/lib/dynamodb'
import { useSession } from 'next-auth/react'
import { showSuccess, showError, showInfo } from '@/lib/toast'
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

const Toggle = styled.button<{ enabled: boolean }>`
  position: relative;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${props => props.enabled ? '#ed7734' : '#d6d3d1'};

  &::after {
    content: '';
    position: absolute;
    top: 0.125rem;
    left: ${props => props.enabled ? 'calc(100% - 1.375rem)' : '0.125rem'};
    width: 1.25rem;
    height: 1.25rem;
    background: white;
    border-radius: 9999px;
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
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

export default function NotificationSettings() {
  const { data: session } = useSession()
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    promotions: false,
    newsletter: false
  })

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }

      const user = await DynamoDBService.getUserById(session.user.id)
      if (user && user.settings) {
        setSettings(user.settings)
        setNotifications(user.settings.notifications)
      } else {
        const defaultSettings = SettingsService.createDefaultSettings(
          session.user.id,
          session.user.email || '',
          session.user.name || ''
        )
        setSettings(defaultSettings)
        setNotifications(defaultSettings.notifications)
      }
    } catch (error) {
      showError('Failed to load notification settings')
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (key: keyof typeof notifications) => {
    if (!session?.user?.id) return

    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    
    setSaving(true)
    try {
      await DynamoDBService.updateUserSettings(session.user.id, {
        ...settings,
        notifications: updated,
        updatedAt: new Date()
      })
      showInfo('Notification preferences updated')
    } catch (error) {
      showError('Failed to save notification settings')
      console.error('Failed to save:', error)
      // Revert on error
      setNotifications(notifications)
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
            <Bell size={24} />
          </IconWrapper>
          <div>
            <Title>Notification Settings</Title>
            <Description>Configure how you receive notifications</Description>
          </div>
        </div>
      </Header>

      {/* Channels */}
      <Section>
        <SectionTitle>
          <Smartphone size={20} />
          Notification Channels
        </SectionTitle>
        <SectionHint>Choose how you want to be notified</SectionHint>

        <SettingRow>
          <SettingInfo>
            <SettingIcon color="#3b82f6">
              <Bell size={20} />
            </SettingIcon>
            <SettingText>
              <SettingTitle>Push Notifications</SettingTitle>
              <SettingDescription>Receive notifications on this device</SettingDescription>
            </SettingText>
          </SettingInfo>
          <Toggle enabled={notifications.push} onClick={() => handleToggle('push')} />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingIcon color="#f97316">
              <Mail size={20} />
            </SettingIcon>
            <SettingText>
              <SettingTitle>Email Notifications</SettingTitle>
              <SettingDescription>Receive updates via email</SettingDescription>
            </SettingText>
          </SettingInfo>
          <Toggle enabled={notifications.email} onClick={() => handleToggle('email')} />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingIcon color="#10b981">
              <MessageSquare size={20} />
            </SettingIcon>
            <SettingText>
              <SettingTitle>SMS Notifications</SettingTitle>
              <SettingDescription>Receive text messages for important updates</SettingDescription>
            </SettingText>
          </SettingInfo>
          <Toggle enabled={notifications.sms} onClick={() => handleToggle('sms')} />
        </SettingRow>
      </Section>

      {/* Notification Types */}
      <Section>
        <SectionTitle>
          <Package size={20} />
          Notification Types
        </SectionTitle>
        <SectionHint>Select which notifications you want to receive</SectionHint>

        <SettingRow>
          <SettingInfo>
            <SettingIcon color="#3b82f6">
              <Truck size={20} />
            </SettingIcon>
            <SettingText>
              <SettingTitle>Order Updates</SettingTitle>
              <SettingDescription>Status changes, delivery updates, and confirmations</SettingDescription>
            </SettingText>
          </SettingInfo>
          <Toggle enabled={notifications.orderUpdates} onClick={() => handleToggle('orderUpdates')} />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingIcon color="#eab308">
              <Star size={20} />
            </SettingIcon>
            <SettingText>
              <SettingTitle>Promotions</SettingTitle>
              <SettingDescription>Special offers, discounts, and promotions</SettingDescription>
            </SettingText>
          </SettingInfo>
          <Toggle enabled={notifications.promotions} onClick={() => handleToggle('promotions')} />
        </SettingRow>

        <SettingRow>
          <SettingInfo>
            <SettingIcon color="#f97316">
              <Mail size={20} />
            </SettingIcon>
            <SettingText>
              <SettingTitle>Newsletter</SettingTitle>
              <SettingDescription>Weekly updates and company news</SettingDescription>
            </SettingText>
          </SettingInfo>
          <Toggle enabled={notifications.newsletter} onClick={() => handleToggle('newsletter')} />
        </SettingRow>
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
