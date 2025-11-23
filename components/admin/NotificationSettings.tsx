import React, { useState } from 'react'
import styled from 'styled-components'
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { SettingsSection, SettingsItem } from '../ui/SettingsComponents'

interface NotificationPreferences {
  email: {
    enabled: boolean
    newOrders: boolean
    orderUpdates: boolean
    customerMessages: boolean
    dailySummary: boolean
    weeklyReport: boolean
  }
  sms: {
    enabled: boolean
    urgentOrders: boolean
    orderReady: boolean
    customerArrival: boolean
  }
  push: {
    enabled: boolean
    newOrders: boolean
    orderUpdates: boolean
    systemAlerts: boolean
    lowInventory: boolean
  }
}

interface NotificationSettingsProps {
  preferences: NotificationPreferences
  onUpdatePreferences: (prefs: NotificationPreferences) => void
}

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    border-radius: 24px;
    transition: 0.3s;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: 0.3s;
    }
  }
  
  input:checked + span {
    background-color: #667eea;
  }
  
  input:checked + span:before {
    transform: translateX(24px);
  }
  
  input:disabled + span {
    opacity: 0.5;
    cursor: not-allowed;
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
  margin-top: 16px;
  
  &:hover {
    background: #5568d3;
  }
  
  &:active {
    transform: translateY(1px);
  }
`

const SubSection = styled.div`
  margin-left: 24px;
  padding-left: 16px;
  border-left: 2px solid #e5e7eb;
  margin-top: 8px;
`

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  preferences,
  onUpdatePreferences
}) => {
  const [localPrefs, setLocalPrefs] = useState(preferences)

  const handleToggle = (
    category: 'email' | 'sms' | 'push',
    field: string,
    value: boolean
  ) => {
    setLocalPrefs(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    onUpdatePreferences(localPrefs)
  }

  return (
    <>
      <SettingsSection title="Email Notifications" icon={<Mail size={20} />}>
        <SettingsItem 
          label="Enable Email Notifications" 
          description="Receive notifications via email"
        >
          <Switch>
            <input
              type="checkbox"
              checked={localPrefs.email.enabled}
              onChange={(e) => handleToggle('email', 'enabled', e.target.checked)}
            />
            <span />
          </Switch>
        </SettingsItem>

        {localPrefs.email.enabled && (
          <SubSection>
            <SettingsItem 
              label="New Orders" 
              description="Get notified when new orders are placed"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.email.newOrders}
                  onChange={(e) => handleToggle('email', 'newOrders', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="Order Updates" 
              description="Notifications for order status changes"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.email.orderUpdates}
                  onChange={(e) => handleToggle('email', 'orderUpdates', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="Customer Messages" 
              description="When customers send you a message"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.email.customerMessages}
                  onChange={(e) => handleToggle('email', 'customerMessages', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="Daily Summary" 
              description="Daily report of orders and activities"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.email.dailySummary}
                  onChange={(e) => handleToggle('email', 'dailySummary', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="Weekly Report" 
              description="Weekly analytics and performance report"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.email.weeklyReport}
                  onChange={(e) => handleToggle('email', 'weeklyReport', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>
          </SubSection>
        )}
      </SettingsSection>

      <SettingsSection title="SMS Alerts" icon={<MessageSquare size={20} />}>
        <SettingsItem 
          label="Enable SMS Alerts" 
          description="Receive urgent notifications via SMS"
        >
          <Switch>
            <input
              type="checkbox"
              checked={localPrefs.sms.enabled}
              onChange={(e) => handleToggle('sms', 'enabled', e.target.checked)}
            />
            <span />
          </Switch>
        </SettingsItem>

        {localPrefs.sms.enabled && (
          <SubSection>
            <SettingsItem 
              label="Urgent Orders" 
              description="ASAP orders and rush requests"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.sms.urgentOrders}
                  onChange={(e) => handleToggle('sms', 'urgentOrders', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="Order Ready" 
              description="When orders are ready for pickup"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.sms.orderReady}
                  onChange={(e) => handleToggle('sms', 'orderReady', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="Customer Arrival" 
              description="When customer arrives for pickup"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.sms.customerArrival}
                  onChange={(e) => handleToggle('sms', 'customerArrival', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>
          </SubSection>
        )}
      </SettingsSection>

      <SettingsSection title="Push Notifications" icon={<Smartphone size={20} />}>
        <SettingsItem 
          label="Enable Push Notifications" 
          description="Receive real-time notifications in the app"
        >
          <Switch>
            <input
              type="checkbox"
              checked={localPrefs.push.enabled}
              onChange={(e) => handleToggle('push', 'enabled', e.target.checked)}
            />
            <span />
          </Switch>
        </SettingsItem>

        {localPrefs.push.enabled && (
          <SubSection>
            <SettingsItem 
              label="New Orders" 
              description="Instant notification for new orders"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.push.newOrders}
                  onChange={(e) => handleToggle('push', 'newOrders', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="Order Updates" 
              description="Status changes and order modifications"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.push.orderUpdates}
                  onChange={(e) => handleToggle('push', 'orderUpdates', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="System Alerts" 
              description="Important system notifications"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.push.systemAlerts}
                  onChange={(e) => handleToggle('push', 'systemAlerts', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>

            <SettingsItem 
              label="Low Inventory" 
              description="Alerts when items are running low"
            >
              <Switch>
                <input
                  type="checkbox"
                  checked={localPrefs.push.lowInventory}
                  onChange={(e) => handleToggle('push', 'lowInventory', e.target.checked)}
                />
                <span />
              </Switch>
            </SettingsItem>
          </SubSection>
        )}
      </SettingsSection>

      <div style={{ textAlign: 'right' }}>
        <SaveButton onClick={handleSave}>Save Notification Settings</SaveButton>
      </div>
    </>
  )
}

export default NotificationSettings
