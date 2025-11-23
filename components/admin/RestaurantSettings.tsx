import React, { useState } from 'react'
import styled from 'styled-components'
import { Store, Clock, Phone, MapPin } from 'lucide-react'
import { SettingsSection, SettingsItem } from '../ui/SettingsComponents'

interface RestaurantInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
}

interface OperatingHours {
  [key: string]: {
    open: string
    close: string
    closed: boolean
  }
}

interface RestaurantSettingsProps {
  restaurantInfo: RestaurantInfo
  operatingHours: OperatingHours
  onUpdateInfo: (info: RestaurantInfo) => void
  onUpdateHours: (hours: OperatingHours) => void
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
`

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const HoursGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 8px;
`

const DayRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const DayLabel = styled.div`
  min-width: 100px;
  font-weight: 500;
  color: #374151;
`

const TimeInputs = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`

const TimeInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
  
  &:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }
`

const ClosedCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
  
  input {
    cursor: pointer;
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

const RestaurantSettings: React.FC<RestaurantSettingsProps> = ({
  restaurantInfo,
  operatingHours,
  onUpdateInfo,
  onUpdateHours
}) => {
  const [localInfo, setLocalInfo] = useState(restaurantInfo)
  const [localHours, setLocalHours] = useState(operatingHours)

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleInfoChange = (field: keyof RestaurantInfo, value: string) => {
    setLocalInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleHourChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setLocalHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleSaveInfo = () => {
    onUpdateInfo(localInfo)
  }

  const handleSaveHours = () => {
    onUpdateHours(localHours)
  }

  return (
    <>
      <SettingsSection title="Restaurant Information" icon={<Store size={20} />}>
        <SettingsItem label="Restaurant Name" description="Your business name as it appears to customers">
          <InputField
            type="text"
            value={localInfo.name}
            onChange={(e) => handleInfoChange('name', e.target.value)}
            placeholder="The JERK Tracker"
          />
        </SettingsItem>

        <SettingsItem label="Address" description="Full business address">
          <TextArea
            value={localInfo.address}
            onChange={(e) => handleInfoChange('address', e.target.value)}
            placeholder="123 Main Street, City, State 12345"
          />
        </SettingsItem>

        <SettingsItem label="Phone Number" description="Primary contact phone">
          <InputField
            type="tel"
            value={localInfo.phone}
            onChange={(e) => handleInfoChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </SettingsItem>

        <SettingsItem label="Email" description="Business email address">
          <InputField
            type="email"
            value={localInfo.email}
            onChange={(e) => handleInfoChange('email', e.target.value)}
            placeholder="contact@restaurant.com"
          />
        </SettingsItem>

        <SettingsItem label="Website" description="Your restaurant website (optional)">
          <InputField
            type="url"
            value={localInfo.website}
            onChange={(e) => handleInfoChange('website', e.target.value)}
            placeholder="https://yourrestaurant.com"
          />
        </SettingsItem>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <SaveButton onClick={handleSaveInfo}>Save Restaurant Info</SaveButton>
        </div>
      </SettingsSection>

      <SettingsSection title="Operating Hours" icon={<Clock size={20} />}>
        <HoursGrid>
          {days.map(day => (
            <DayRow key={day}>
              <DayLabel>{day}</DayLabel>
              <TimeInputs>
                <TimeInput
                  type="time"
                  value={localHours[day]?.open || '09:00'}
                  onChange={(e) => handleHourChange(day, 'open', e.target.value)}
                  disabled={localHours[day]?.closed}
                />
                <span>to</span>
                <TimeInput
                  type="time"
                  value={localHours[day]?.close || '21:00'}
                  onChange={(e) => handleHourChange(day, 'close', e.target.value)}
                  disabled={localHours[day]?.closed}
                />
                <ClosedCheckbox>
                  <input
                    type="checkbox"
                    checked={localHours[day]?.closed || false}
                    onChange={(e) => handleHourChange(day, 'closed', e.target.checked)}
                  />
                  Closed
                </ClosedCheckbox>
              </TimeInputs>
            </DayRow>
          ))}
        </HoursGrid>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <SaveButton onClick={handleSaveHours}>Save Operating Hours</SaveButton>
        </div>
      </SettingsSection>
    </>
  )
}

export default RestaurantSettings
