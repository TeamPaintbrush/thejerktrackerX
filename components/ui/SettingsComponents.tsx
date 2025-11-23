import React, { useState } from 'react'
import styled from 'styled-components'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
  defaultCollapsed?: boolean
}

interface SettingsItemProps {
  label: string
  description?: string
  children: React.ReactNode
  disabled?: boolean
}

const SectionContainer = styled.div`
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`

const SectionHeader = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 1rem;
  background: ${props => props.$isCollapsed ? '#f9fafb' : '#ffffff'};
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`

const SectionHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
`

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #6b7280;
`

const CollapseIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: transform 0.2s;
`

const SectionContent = styled.div<{ $isCollapsed: boolean }>`
  padding: ${props => props.$isCollapsed ? '0 1rem' : '1rem'};
  max-height: ${props => props.$isCollapsed ? '0' : '2000px'};
  opacity: ${props => props.$isCollapsed ? '0' : '1'};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`

const ItemContainer = styled.div<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  opacity: ${props => props.disabled ? 0.6 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'default'};

  &:last-child {
    border-bottom: none;
  }
`

const ItemInfo = styled.div`
  flex: 1;
  margin-right: 1rem;
`

const ItemLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`

const ItemDescription = styled.div`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
`

const ItemControl = styled.div`
  display: flex;
  align-items: center;
`

export const SettingsSection: React.FC<SettingsSectionProps> = ({ 
  title, 
  children, 
  icon,
  defaultCollapsed = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  
  return (
    <SectionContainer>
      <SectionHeader 
        $isCollapsed={isCollapsed}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <SectionHeaderLeft>
          {icon && <SectionIcon>{icon}</SectionIcon>}
          <SectionTitle>{title}</SectionTitle>
        </SectionHeaderLeft>
        <CollapseIcon>
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </CollapseIcon>
      </SectionHeader>
      <SectionContent $isCollapsed={isCollapsed}>
        {children}
      </SectionContent>
    </SectionContainer>
  )
}

export const SettingsItem: React.FC<SettingsItemProps> = ({ 
  label, 
  description, 
  children, 
  disabled = false 
}) => {
  return (
    <ItemContainer disabled={disabled}>
      <ItemInfo>
        <ItemLabel>{label}</ItemLabel>
        {description && <ItemDescription>{description}</ItemDescription>}
      </ItemInfo>
      <ItemControl>{children}</ItemControl>
    </ItemContainer>
  )
}