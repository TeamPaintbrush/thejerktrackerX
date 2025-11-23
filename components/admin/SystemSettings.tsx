import React, { useState } from 'react'
import styled from 'styled-components'
import { Globe, Clock } from 'lucide-react'
import { SettingsSection, SettingsItem } from '../ui/SettingsComponents'

interface SystemConfig {
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  firstDayOfWeek: 'sunday' | 'monday'
}

interface SystemSettingsProps {
  systemConfig: SystemConfig
  onUpdateConfig: (config: SystemConfig) => void
}

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
`

const PreviewBox = styled.div<{ $theme: string }>`
  margin-top: 12px;
  padding: 16px;
  border-radius: 8px;
  background: ${props => {
    if (props.$theme === 'dark') return '#1f2937'
    if (props.$theme === 'light') return '#ffffff'
    return 'linear-gradient(135deg, #ffffff 50%, #1f2937 50%)'
  }};
  border: 1px solid #e5e7eb;
  color: ${props => props.$theme === 'dark' ? '#ffffff' : '#374151'};
  font-size: 14px;
  text-align: center;
`

const SystemSettings: React.FC<SystemSettingsProps> = ({
  systemConfig,
  onUpdateConfig
}) => {
  const [localConfig, setLocalConfig] = useState(systemConfig)

  const handleChange = (field: keyof SystemConfig, value: string) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onUpdateConfig(localConfig)
  }

  const formatPreview = () => {
    const now = new Date()
    const dateFormats = {
      'MM/DD/YYYY': now.toLocaleDateString('en-US'),
      'DD/MM/YYYY': now.toLocaleDateString('en-GB'),
      'YYYY-MM-DD': now.toISOString().split('T')[0]
    }
    const timeFormat = localConfig.timeFormat === '12h' 
      ? now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    
    return `${dateFormats[localConfig.dateFormat as keyof typeof dateFormats]} ${timeFormat}`
  }

  return (
    <>
      <SettingsSection title="Localization" icon={<Globe size={20} />}>
        <SettingsItem 
          label="Language" 
          description="Display language for the application"
        >
          <Select
            value={localConfig.language}
            onChange={(e) => handleChange('language', e.target.value)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="it">Italiano</option>
            <option value="pt">Português</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
          </Select>
        </SettingsItem>

        <SettingsItem 
          label="Time Zone" 
          description="Your local time zone"
        >
          <Select
            value={localConfig.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
          >
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Phoenix">Arizona (MST)</option>
            <option value="America/Anchorage">Alaska (AKT)</option>
            <option value="Pacific/Honolulu">Hawaii (HST)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
          </Select>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="Date & Time Format" icon={<Clock size={20} />}>
        <SettingsItem 
          label="Date Format" 
          description="How dates are displayed"
        >
          <Select
            value={localConfig.dateFormat}
            onChange={(e) => handleChange('dateFormat', e.target.value)}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY (American)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (European)</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
          </Select>
        </SettingsItem>

        <SettingsItem 
          label="Time Format" 
          description="12-hour or 24-hour format"
        >
          <Select
            value={localConfig.timeFormat}
            onChange={(e) => handleChange('timeFormat', e.target.value)}
          >
            <option value="12h">12-hour (3:30 PM)</option>
            <option value="24h">24-hour (15:30)</option>
          </Select>
        </SettingsItem>

        <SettingsItem 
          label="First Day of Week" 
          description="Calendar week start day"
        >
          <Select
            value={localConfig.firstDayOfWeek}
            onChange={(e) => handleChange('firstDayOfWeek', e.target.value)}
          >
            <option value="sunday">Sunday</option>
            <option value="monday">Monday</option>
          </Select>
        </SettingsItem>

        <PreviewBox $theme="light">
          Format Preview: {formatPreview()}
        </PreviewBox>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <SaveButton onClick={handleSave}>Save System Settings</SaveButton>
        </div>
      </SettingsSection>
    </>
  )
}

export default SystemSettings
