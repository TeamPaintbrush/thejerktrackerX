import React, { useState } from 'react'
import styled from 'styled-components'
import { Settings, Clock, Hash } from 'lucide-react'
import { SettingsSection, SettingsItem } from '../ui/SettingsComponents'

interface OrderConfig {
  defaultStatus: string
  autoCompleteTimer: number
  orderNumberFormat: string
  orderNumberPrefix: string
  enableAutoComplete: boolean
  enableOrderTracking: boolean
}

interface OrderSettingsProps {
  orderConfig: OrderConfig
  onUpdateConfig: (config: OrderConfig) => void
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

const InputField = styled.input`
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

const InputGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`

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

const FormatPreview = styled.div`
  margin-top: 8px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
  font-family: monospace;
`

const OrderSettings: React.FC<OrderSettingsProps> = ({
  orderConfig,
  onUpdateConfig
}) => {
  const [localConfig, setLocalConfig] = useState(orderConfig)

  const handleChange = (field: keyof OrderConfig, value: string | number | boolean) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onUpdateConfig(localConfig)
  }

  const generatePreview = () => {
    const prefix = localConfig.orderNumberPrefix || 'ORD'
    const date = new Date()
    const format = localConfig.orderNumberFormat
    
    if (format === 'sequential') {
      return `${prefix}-00001`
    } else if (format === 'date-sequential') {
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
      return `${prefix}-${dateStr}-001`
    } else if (format === 'random') {
      return `${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    } else {
      return `${prefix}-CUSTOM`
    }
  }

  return (
    <>
      <SettingsSection title="Order Configuration" icon={<Settings size={20} />}>
        <SettingsItem 
          label="Default Order Status" 
          description="Initial status when a new order is created"
        >
          <Select
            value={localConfig.defaultStatus}
            onChange={(e) => handleChange('defaultStatus', e.target.value)}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready for Pickup</option>
          </Select>
        </SettingsItem>

        <SettingsItem 
          label="Enable Auto-Complete" 
          description="Automatically mark orders as completed after timer"
        >
          <Switch>
            <input
              type="checkbox"
              checked={localConfig.enableAutoComplete}
              onChange={(e) => handleChange('enableAutoComplete', e.target.checked)}
            />
            <span />
          </Switch>
        </SettingsItem>

        <SettingsItem 
          label="Auto-Complete Timer" 
          description="Minutes after 'Ready' status before auto-completion"
          disabled={!localConfig.enableAutoComplete}
        >
          <InputGroup>
            <InputField
              type="number"
              min="5"
              max="180"
              value={localConfig.autoCompleteTimer}
              onChange={(e) => handleChange('autoCompleteTimer', parseInt(e.target.value))}
              disabled={!localConfig.enableAutoComplete}
              style={{ width: '100px' }}
            />
            <span style={{ color: '#6b7280' }}>minutes</span>
          </InputGroup>
        </SettingsItem>

        <SettingsItem 
          label="Enable Order Tracking" 
          description="Allow customers to track orders via QR code"
        >
          <Switch>
            <input
              type="checkbox"
              checked={localConfig.enableOrderTracking}
              onChange={(e) => handleChange('enableOrderTracking', e.target.checked)}
            />
            <span />
          </Switch>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="Order Number Format" icon={<Hash size={20} />}>
        <SettingsItem 
          label="Format Type" 
          description="How order numbers should be generated"
        >
          <Select
            value={localConfig.orderNumberFormat}
            onChange={(e) => handleChange('orderNumberFormat', e.target.value)}
          >
            <option value="sequential">Sequential (ORD-00001)</option>
            <option value="date-sequential">Date + Sequential (ORD-20250112-001)</option>
            <option value="random">Random (ORD-A3X9K2)</option>
          </Select>
        </SettingsItem>

        <SettingsItem 
          label="Order Prefix" 
          description="Prefix for all order numbers"
        >
          <InputField
            type="text"
            value={localConfig.orderNumberPrefix}
            onChange={(e) => handleChange('orderNumberPrefix', e.target.value.toUpperCase())}
            placeholder="ORD"
            maxLength={5}
            style={{ width: '120px' }}
          />
        </SettingsItem>

        <FormatPreview>
          Preview: {generatePreview()}
        </FormatPreview>

        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <SaveButton onClick={handleSave}>Save Order Settings</SaveButton>
        </div>
      </SettingsSection>
    </>
  )
}

export default OrderSettings
