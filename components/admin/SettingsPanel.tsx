import React, { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { 
  Bell,
  Shield,
  Palette,
  Smartphone,
  HelpCircle
} from 'lucide-react'
import LocationCard from '../locations/LocationCard'
import LocationForm from '../locations/LocationForm'
import PlanCard from '../billing/PlanCard'
import UsageMeter from '../billing/UsageMeter'
import BillingSummary from '../billing/BillingSummary'
import Switch from '../ui/Switch'
import { SettingsSection, SettingsItem } from '../ui/SettingsComponents'
import UserProfile from '../ui/UserProfile'

interface MobileSettings {
  notifications: {
    pushNotifications: boolean
    orderUpdates: boolean
    promotions: boolean
    soundEnabled: boolean
    vibrationEnabled: boolean
  }
  privacy: {
    locationTracking: boolean
    dataCollection: boolean
    biometricAuth: boolean
    twoFactorAuth: boolean
  }
  appearance: {
    theme: 'light' | 'dark' | 'system'
    language: string
    currency: string
    fontSize: 'small' | 'medium' | 'large'
  }
  permissions: {
    camera: boolean
    location: boolean
    microphone: boolean
    contacts: boolean
  }
}

interface SettingsPanelProps {
  mobileSettings: MobileSettings
  onUpdateMobileSettings: (settings: MobileSettings) => void
}

const SettingsContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;

  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    margin: 0 -0.5rem;
    border-radius: 8px;
  }
`

const SettingsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 1.5rem 0;
  color: #1c1917;
`

const SectionSpacer = styled.div`
  margin-bottom: 2rem;
`

const SectionHeading = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #374151;
`

const LocationGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`

const BillingGrid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`

const SelectField = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const ActionButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const VersionText = styled.span`
  font-size: 14px;
  color: #6b7280;
`

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  mobileSettings,
  onUpdateMobileSettings
}) => {
  const updateSetting = (category: keyof MobileSettings, key: string, value: any) => {
    onUpdateMobileSettings({
      ...mobileSettings,
      [category]: {
        ...mobileSettings[category],
        [key]: value
      }
    })
  }

  return (
    <SettingsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <SettingsTitle>Settings</SettingsTitle>
      
      {/* User Profile Section */}
      <SectionSpacer>
        <UserProfile
          user={{
            id: 'user-123',
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'admin',
            joinDate: new Date('2024-01-01')
          }}
          onUpdateProfile={(data) => console.log('Update profile:', data)}
          onChangePassword={() => console.log('Change password')}
          onDeleteAccount={() => console.log('Delete account')}
        />
      </SectionSpacer>

      {/* Location Management Section */}
      <SectionSpacer>
        <SectionHeading>Location Management</SectionHeading>
        <LocationGrid>
          <LocationCard
            location={{
              id: 'main-location',
              businessId: 'business-123',
              name: 'Main Location',
              address: {
                street: '123 Main St',
                city: 'Downtown',
                state: 'CA',
                zipCode: '12345',
                country: 'US'
              },
              coordinates: {
                latitude: 37.7749,
                longitude: -122.4194
              },
              businessInfo: {
                businessName: 'The JERK Tracker',
                businessType: 'restaurant',
                businessPhone: '(555) 123-4567',
                businessEmail: 'info@jerktracker.com'
              },
              verification: {
                status: 'verified',
                method: 'manual',
                verifiedAt: new Date()
              },
              qrCodes: {
                primary: 'qr-main-001',
                generated: new Date(),
                lastUsed: new Date()
              },
              billing: {
                isActive: true,
                activatedAt: new Date(),
                monthlyUsage: 26
              },
              settings: {
                isActive: true,
                timezone: 'America/Los_Angeles',
                operatingHours: {
                  monday: { open: '08:00', close: '18:00' },
                  tuesday: { open: '08:00', close: '18:00' },
                  wednesday: { open: '08:00', close: '18:00' },
                  thursday: { open: '08:00', close: '18:00' },
                  friday: { open: '08:00', close: '20:00' },
                  saturday: { open: '10:00', close: '20:00' },
                  sunday: null
                },
                maxOrdersPerDay: 100
              },
              createdAt: new Date(),
              updatedAt: new Date()
            }}
            onEdit={(location) => console.log('Edit location:', location)}
            onToggleStatus={(id, status) => console.log('Toggle status:', id, status)}
            onViewQR={(location) => console.log('View QR:', location)}
          />
        </LocationGrid>
        <div style={{ marginTop: '1rem' }}>
          <LocationForm 
            onSubmit={(location) => console.log('New location:', location)}
            onCancel={() => console.log('Form canceled')}
          />
        </div>
      </SectionSpacer>

      {/* Billing Overview Section */}
      <SectionSpacer>
        <SectionHeading>Billing Overview</SectionHeading>
        <BillingGrid>
          <PlanCard
            plan={{
              id: 'pro-plan',
              name: 'Pro Plan',
              description: 'Perfect for growing businesses',
              monthlyPrice: 49,
              yearlyPrice: 490,
              features: [
                'Up to 5 locations',
                'Unlimited orders',
                'Advanced analytics',
                'Priority support'
              ],
              limits: {
                locations: 5,
                support: 'priority',
                analytics: true,
                customBranding: true
              }
            }}
            isSelected={true}
            onSelect={(plan) => console.log('Select plan:', plan)}
          />
        </BillingGrid>
        <div style={{ marginTop: '1.5rem' }}>
          <UsageMeter
            title="Locations Used"
            current={1}
            limit={5}
            unit="locations"
            description="Active locations in your current plan"
            color="blue"
          />
        </div>
      </SectionSpacer>

      {/* Billing Summary Section */}
      <SectionSpacer>
        <BillingSummary
          usage={{
            businessId: 'business-123',
            billingPeriod: {
              start: new Date('2024-01-01'),
              end: new Date('2024-01-31')
            },
            locations: [
              {
                locationId: 'main-location',
                locationName: 'Main Location',
                ordersCount: 26,
                isActive: true,
                activatedAt: new Date('2024-01-01')
              }
            ],
            totals: {
              activeLocations: 1,
              totalOrders: 26,
              baseCharge: 49,
              locationCharges: 0,
              totalAmount: 49
            },
            subscription: {
              planId: 'pro-plan',
              isActive: true,
              nextBillingDate: new Date('2024-02-01')
            }
          }}
          onDownloadInvoice={() => console.log('Download invoice')}
          onViewDetails={() => console.log('View billing details')}
        />
      </SectionSpacer>

      {/* Notification Settings */}
      <SettingsSection title="Notifications" icon={<Bell />}>
        <SettingsItem 
          label="Push Notifications" 
          description="Receive notifications about new orders and updates"
        >
          <Switch 
            checked={mobileSettings.notifications.pushNotifications}
            onChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Order Updates" 
          description="Get notified when order status changes"
        >
          <Switch 
            checked={mobileSettings.notifications.orderUpdates}
            onChange={(checked) => updateSetting('notifications', 'orderUpdates', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Promotions & Marketing" 
          description="Receive promotional offers and marketing updates"
        >
          <Switch 
            checked={mobileSettings.notifications.promotions}
            onChange={(checked) => updateSetting('notifications', 'promotions', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Sound" 
          description="Play sound for notifications"
        >
          <Switch 
            checked={mobileSettings.notifications.soundEnabled}
            onChange={(checked) => updateSetting('notifications', 'soundEnabled', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Vibration" 
          description="Use vibration for notifications"
        >
          <Switch 
            checked={mobileSettings.notifications.vibrationEnabled}
            onChange={(checked) => updateSetting('notifications', 'vibrationEnabled', checked)}
          />
        </SettingsItem>
      </SettingsSection>

      {/* Privacy & Security Settings */}
      <SettingsSection title="Privacy & Security" icon={<Shield />}>
        <SettingsItem 
          label="Location Tracking" 
          description="Allow app to access your location for order delivery"
        >
          <Switch 
            checked={mobileSettings.privacy.locationTracking}
            onChange={(checked) => updateSetting('privacy', 'locationTracking', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Data Collection" 
          description="Allow anonymous analytics to improve app performance"
        >
          <Switch 
            checked={mobileSettings.privacy.dataCollection}
            onChange={(checked) => updateSetting('privacy', 'dataCollection', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Biometric Authentication" 
          description="Use fingerprint or face ID to unlock the app"
        >
          <Switch 
            checked={mobileSettings.privacy.biometricAuth}
            onChange={(checked) => updateSetting('privacy', 'biometricAuth', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Two-Factor Authentication" 
          description="Add extra security with 2FA"
        >
          <Switch 
            checked={mobileSettings.privacy.twoFactorAuth}
            onChange={(checked) => updateSetting('privacy', 'twoFactorAuth', checked)}
          />
        </SettingsItem>
      </SettingsSection>

      {/* App Appearance Settings */}
      <SettingsSection title="Appearance" icon={<Palette />}>
        <SettingsItem 
          label="Theme" 
          description="Choose your preferred color scheme"
        >
          <SelectField 
            value={mobileSettings.appearance.theme}
            onChange={(e) => updateSetting('appearance', 'theme', e.target.value as 'light' | 'dark' | 'system')}
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </SelectField>
        </SettingsItem>
        <SettingsItem 
          label="Language" 
          description="Select your preferred language"
        >
          <SelectField 
            value={mobileSettings.appearance.language}
            onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </SelectField>
        </SettingsItem>
        <SettingsItem 
          label="Currency" 
          description="Select your preferred currency"
        >
          <SelectField 
            value={mobileSettings.appearance.currency}
            onChange={(e) => updateSetting('appearance', 'currency', e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="JPY">JPY (¥)</option>
          </SelectField>
        </SettingsItem>
        <SettingsItem 
          label="Font Size" 
          description="Adjust text size for better readability"
        >
          <SelectField 
            value={mobileSettings.appearance.fontSize}
            onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value as 'small' | 'medium' | 'large')}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </SelectField>
        </SettingsItem>
      </SettingsSection>

      {/* Permission Settings */}
      <SettingsSection title="Permissions" icon={<Smartphone />}>
        <SettingsItem 
          label="Camera Access" 
          description="Allow app to access camera for QR code scanning"
        >
          <Switch 
            checked={mobileSettings.permissions.camera}
            onChange={(checked) => updateSetting('permissions', 'camera', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Location Access" 
          description="Allow app to access your location"
        >
          <Switch 
            checked={mobileSettings.permissions.location}
            onChange={(checked) => updateSetting('permissions', 'location', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Microphone Access" 
          description="Allow app to access microphone for voice notes"
        >
          <Switch 
            checked={mobileSettings.permissions.microphone}
            onChange={(checked) => updateSetting('permissions', 'microphone', checked)}
          />
        </SettingsItem>
        <SettingsItem 
          label="Contacts Access" 
          description="Allow app to access contacts for easy sharing"
        >
          <Switch 
            checked={mobileSettings.permissions.contacts}
            onChange={(checked) => updateSetting('permissions', 'contacts', checked)}
          />
        </SettingsItem>
      </SettingsSection>

      {/* Support & Information */}
      <SettingsSection title="Support & Information" icon={<HelpCircle />}>
        <SettingsItem 
          label="Help Center" 
          description="Get help and find answers to common questions"
        >
          <ActionButton onClick={() => console.log('Open help center')}>
            Open
          </ActionButton>
        </SettingsItem>
        <SettingsItem 
          label="Contact Support" 
          description="Get in touch with our support team"
        >
          <ActionButton onClick={() => console.log('Contact support')}>
            Contact
          </ActionButton>
        </SettingsItem>
        <SettingsItem 
          label="Privacy Policy" 
          description="Read our privacy policy"
        >
          <ActionButton onClick={() => console.log('Open privacy policy')}>
            View
          </ActionButton>
        </SettingsItem>
        <SettingsItem 
          label="Terms of Service" 
          description="Read our terms of service"
        >
          <ActionButton onClick={() => console.log('Open terms of service')}>
            View
          </ActionButton>
        </SettingsItem>
        <SettingsItem 
          label="App Version" 
          description="Current version: 2.1.3 (Build 2025.10)"
        >
          <VersionText>v2.1.3</VersionText>
        </SettingsItem>
      </SettingsSection>
    </SettingsContainer>
  )
}

export default SettingsPanel
export type { MobileSettings }