'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { 
  Bell,
  Smartphone,
  Mail,
  MessageSquare,
  Package,
  Truck,
  AlertCircle,
  Volume2,
  VolumeX,
  Clock,
  Star
} from 'lucide-react';
import SettingsService, { type UserSettings } from '../../../../lib/settings';

const NotificationsContainer = styled.div`
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

const NotificationSection = styled(motion.div)`
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

const NotificationItem = styled.div`
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

const TimeSelector = styled.div`
  margin-top: 1rem;
`;

const TimeRange = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const TimeInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px rgba(237, 119, 52, 0.1);
  }
`;

const PresetButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const PresetButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.active ? '#ed7734' : '#d1d5db'};
  background: ${props => props.active ? '#ed7734' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
  }
`;

const TestButton = styled(motion.button)`
  width: 100%;
  padding: 0.75rem;
  background: rgba(237, 119, 52, 0.1);
  color: #ed7734;
  border: 1px solid #ed7734;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
`;

interface NotificationSettings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  promotions: boolean;
  systemAlerts: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface MobileNotificationSettingsProps {
  className?: string;
}

export default function MobileNotificationSettings({ className }: MobileNotificationSettingsProps) {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    deliveryUpdates: true,
    promotions: false,
    systemAlerts: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00',
    soundEnabled: true,
    vibrationEnabled: true
  });

  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    // Load notification settings from SettingsService
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
              
              // Map UserSettings to NotificationSettings
              setSettings({
                pushNotifications: userSettings.notifications.push || false,
                emailNotifications: userSettings.notifications.email || false,
                smsNotifications: userSettings.notifications.sms || false,
                orderUpdates: userSettings.notifications.orderUpdates || false,
                deliveryUpdates: userSettings.notifications.orderUpdates || false, // Using orderUpdates for delivery
                promotions: userSettings.notifications.promotions || false,
                systemAlerts: userSettings.notifications.orderUpdates || false, // Using orderUpdates for system
                quietHours: false, // Not in UserSettings yet
                quietStart: '22:00',
                quietEnd: '08:00',
                soundEnabled: true,
                vibrationEnabled: true
              });
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
            }
          }
        } catch (error) {
          console.error('Error loading notification settings:', error);
        }
      }
      
      setLoading(false);
    };
    
    loadSettings();
  }, []);

  const updateSetting = async (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to SettingsService
    if (typeof window !== 'undefined') {
      setSaving(true);
      
      try {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Update notification settings via SettingsService
          const updatedSettings = await SettingsService.updateNotifications(userData.email, {
            push: newSettings.pushNotifications,
            email: newSettings.emailNotifications,
            sms: newSettings.smsNotifications,
            orderUpdates: newSettings.orderUpdates,
            promotions: newSettings.promotions,
            newsletter: false // Not exposed in mobile UI yet
          });
          
          if (updatedSettings) {
            setUserSettings(updatedSettings);
          }
        }
      } catch (error) {
        console.error('Error saving notification settings:', error);
      }
      
      setSaving(false);
    }
  };

  const applyPreset = async (preset: string) => {
    setSelectedPreset(preset);
    setSaving(true);
    
    let presetSettings: Partial<NotificationSettings>;
    
    switch (preset) {
      case 'all':
        presetSettings = {
          pushNotifications: true,
          emailNotifications: true,
          smsNotifications: true,
          orderUpdates: true,
          deliveryUpdates: true,
          promotions: true,
          systemAlerts: true
        };
        break;
      case 'essential':
        presetSettings = {
          pushNotifications: true,
          emailNotifications: false,
          smsNotifications: false,
          orderUpdates: true,
          deliveryUpdates: true,
          promotions: false,
          systemAlerts: true
        };
        break;
      case 'minimal':
        presetSettings = {
          pushNotifications: true,
          emailNotifications: false,
          smsNotifications: false,
          orderUpdates: true,
          deliveryUpdates: false,
          promotions: false,
          systemAlerts: false
        };
        break;
      case 'none':
        presetSettings = {
          pushNotifications: false,
          emailNotifications: false,
          smsNotifications: false,
          orderUpdates: false,
          deliveryUpdates: false,
          promotions: false,
          systemAlerts: false
        };
        break;
      default:
        setSaving(false);
        return;
    }
    
    const newSettings = { ...settings, ...presetSettings };
    setSettings(newSettings);
    
    // Save preset to SettingsService
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('mobile_auth_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          const updatedSettings = await SettingsService.updateNotifications(userData.email, {
            push: newSettings.pushNotifications,
            email: newSettings.emailNotifications,
            sms: newSettings.smsNotifications,
            orderUpdates: newSettings.orderUpdates,
            promotions: newSettings.promotions,
            newsletter: false
          });
          
          if (updatedSettings) {
            setUserSettings(updatedSettings);
            addToast({
              type: 'success',
              title: 'Preset Applied',
              message: `"${preset}" settings synced across all devices`,
              duration: 3000
            });
          }
        }
      } catch (error) {
        console.error('Error applying preset:', error);
        addToast({
          type: 'error',
          title: 'Save Failed',
          message: 'Failed to save preset',
          duration: 5000
        });
      }
    }
    
    setSaving(false);
  };

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from JERK TrackerX!',
          icon: '/icons/icon-192x192.svg'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Test Notification', {
              body: 'This is a test notification from JERK TrackerX!',
              icon: '/icons/icon-192x192.svg'
            });
          }
        });
      }
    } else {
      addToast({
        type: 'warning',
        title: 'Not Supported',
        message: 'Browser notifications are not supported on this device',
        duration: 4000
      });
    }
  };

  const notificationChannels = [
    {
      id: 'orderUpdates',
      icon: Package,
      title: 'Order Updates',
      description: 'Notifications when your order status changes'
    },
    {
      id: 'deliveryUpdates',
      icon: Truck,
      title: 'Delivery Updates',
      description: 'Real-time delivery tracking and arrival notifications'
    },
    {
      id: 'promotions',
      icon: Star,
      title: 'Promotions & Offers',
      description: 'Special deals, discounts, and promotional content'
    },
    {
      id: 'systemAlerts',
      icon: AlertCircle,
      title: 'System Alerts',
      description: 'Important system updates and maintenance notices'
    }
  ];

  const communicationChannels = [
    {
      id: 'pushNotifications',
      icon: Smartphone,
      title: 'Push Notifications',
      description: 'Instant notifications on your device'
    },
    {
      id: 'emailNotifications',
      icon: Mail,
      title: 'Email Notifications',
      description: 'Receive updates via email'
    },
    {
      id: 'smsNotifications',
      icon: MessageSquare,
      title: 'SMS Notifications',
      description: 'Text message alerts for urgent updates'
    }
  ];

  const presets = [
    { id: 'all', name: 'All Notifications' },
    { id: 'essential', name: 'Essential Only' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'none', name: 'None' }
  ];

  return (
    <NotificationsContainer className={className}>
      {loading ? (
        <NotificationSection
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#666' }}>Loading notification settings...</p>
          </div>
        </NotificationSection>
      ) : (
        <>
      <Header>
        <Title>Notification Settings</Title>
        <Subtitle>Manage how you receive updates</Subtitle>
      </Header>

      <NotificationSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle>
          <Bell size={20} />
          Quick Presets
        </SectionTitle>
        <SectionDescription>
          Choose a notification preset that matches your preferences
        </SectionDescription>

        <PresetButtons>
          {presets.map(preset => (
            <PresetButton
              key={preset.id}
              active={selectedPreset === preset.id}
              onClick={() => applyPreset(preset.id)}
              disabled={saving}
              style={{ opacity: saving ? 0.6 : 1 }}
            >
              {preset.name}
            </PresetButton>
          ))}
        </PresetButtons>
        
        {saving && (
          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666' }}>
            Saving settings...
          </div>
        )}

        <TestButton
          whileTap={{ scale: saving ? 1 : 0.98 }}
          onClick={testNotification}
          disabled={saving}
          style={{ opacity: saving ? 0.6 : 1 }}
        >
          Test Notification
        </TestButton>
      </NotificationSection>

      <NotificationSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionTitle>
          <Smartphone size={20} />
          Communication Channels
        </SectionTitle>
        <SectionDescription>
          Choose how you want to receive notifications
        </SectionDescription>

        {communicationChannels.map(channel => {
          const IconComponent = channel.icon;
          return (
            <NotificationItem key={channel.id}>
              <ItemInfo>
                <ItemTitle>
                  <IconComponent size={16} />
                  {channel.title}
                </ItemTitle>
                <ItemDescription>{channel.description}</ItemDescription>
              </ItemInfo>
              <Toggle
                active={settings[channel.id as keyof NotificationSettings] as boolean}
                onClick={() => updateSetting(
                  channel.id as keyof NotificationSettings,
                  !settings[channel.id as keyof NotificationSettings]
                )}
              />
            </NotificationItem>
          );
        })}
      </NotificationSection>

      <NotificationSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <SectionTitle>
          <Package size={20} />
          Notification Types
        </SectionTitle>
        <SectionDescription>
          Select which types of notifications you want to receive
        </SectionDescription>

        {notificationChannels.map(channel => {
          const IconComponent = channel.icon;
          return (
            <NotificationItem key={channel.id}>
              <ItemInfo>
                <ItemTitle>
                  <IconComponent size={16} />
                  {channel.title}
                </ItemTitle>
                <ItemDescription>{channel.description}</ItemDescription>
              </ItemInfo>
              <Toggle
                active={settings[channel.id as keyof NotificationSettings] as boolean}
                onClick={() => updateSetting(
                  channel.id as keyof NotificationSettings,
                  !settings[channel.id as keyof NotificationSettings]
                )}
              />
            </NotificationItem>
          );
        })}
      </NotificationSection>

      <NotificationSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <SectionTitle>
          <Clock size={20} />
          Quiet Hours
        </SectionTitle>
        <SectionDescription>
          Set quiet hours when you don't want to receive notifications
        </SectionDescription>

        <NotificationItem>
          <ItemInfo>
            <ItemTitle>Enable Quiet Hours</ItemTitle>
            <ItemDescription>Mute notifications during specified hours</ItemDescription>
          </ItemInfo>
          <Toggle
            active={settings.quietHours}
            onClick={() => updateSetting('quietHours', !settings.quietHours)}
          />
        </NotificationItem>

        {settings.quietHours && (
          <TimeSelector>
            <TimeRange>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>From:</div>
              <TimeInput
                type="time"
                value={settings.quietStart}
                onChange={(e) => updateSetting('quietStart', e.target.value)}
              />
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>To:</div>
              <TimeInput
                type="time"
                value={settings.quietEnd}
                onChange={(e) => updateSetting('quietEnd', e.target.value)}
              />
            </TimeRange>
          </TimeSelector>
        )}
      </NotificationSection>

      <NotificationSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <SectionTitle>
          <Volume2 size={20} />
          Sound & Vibration
        </SectionTitle>
        <SectionDescription>
          Configure how notifications alert you
        </SectionDescription>

        <NotificationItem>
          <ItemInfo>
            <ItemTitle>
              {settings.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              Notification Sound
            </ItemTitle>
            <ItemDescription>Play sound when notifications arrive</ItemDescription>
          </ItemInfo>
          <Toggle
            active={settings.soundEnabled}
            onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
          />
        </NotificationItem>

        <NotificationItem>
          <ItemInfo>
            <ItemTitle>
              <Smartphone size={16} />
              Vibration
            </ItemTitle>
            <ItemDescription>Vibrate device for notifications</ItemDescription>
          </ItemInfo>
          <Toggle
            active={settings.vibrationEnabled}
            onClick={() => updateSetting('vibrationEnabled', !settings.vibrationEnabled)}
          />
        </NotificationItem>
      </NotificationSection>
      </>
      )}
    </NotificationsContainer>
  );
}