import React from 'react'
import styled from 'styled-components'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
}

const SwitchContainer = styled.div<{ size: 'small' | 'medium' | 'large' }>`
  display: inline-block;
  position: relative;
  width: ${props => {
    switch (props.size) {
      case 'small': return '32px'
      case 'large': return '56px'
      default: return '44px'
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '18px'
      case 'large': return '32px'
      default: return '24px'
    }
  }};
`

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`

const Slider = styled.span<{ checked: boolean; disabled?: boolean; size: 'small' | 'medium' | 'large' }>`
  position: absolute;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => {
    if (props.disabled) return '#e5e7eb'
    return props.checked ? '#10b981' : '#d1d5db'
  }};
  transition: 0.3s;
  border-radius: 34px;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:before {
    position: absolute;
    content: "";
    height: ${props => {
      switch (props.size) {
        case 'small': return '14px'
        case 'large': return '26px'
        default: return '18px'
      }
    }};
    width: ${props => {
      switch (props.size) {
        case 'small': return '14px'
        case 'large': return '26px'
        default: return '18px'
      }
    }};
    left: ${props => {
      if (props.checked) {
        switch (props.size) {
          case 'small': return '16px'
          case 'large': return '28px'
          default: return '24px'
        }
      }
      return '2px'
    }};
    bottom: 2px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
`

const Switch: React.FC<SwitchProps> = ({ 
  checked, 
  onChange, 
  disabled = false,
  size = 'medium'
}) => {
  return (
    <SwitchContainer size={size}>
      <SwitchInput
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <Slider 
        checked={checked} 
        disabled={disabled}
        size={size}
      />
    </SwitchContainer>
  )
}

export default Switch