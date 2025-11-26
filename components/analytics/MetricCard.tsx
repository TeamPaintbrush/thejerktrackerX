import React from 'react'
import styled from 'styled-components'
import Card from '@/components/ui/Card'

interface MetricCardProps {
  title: string
  value: string | number
  icon: string
  change?: {
    value: number
    type: 'positive' | 'negative' | 'neutral'
    period: string
  }
  description?: string
  color?: 'blue' | 'green' | 'orange' | 'red'
}

const MetricContainer = styled(Card)`
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`

const IconContainer = styled.div<{ color?: MetricCardProps['color'] }>`
  font-size: 36px;
  margin-bottom: 12px;
  
  ${({ color }) => {
    switch (color) {
      case 'green':
        return 'filter: hue-rotate(120deg);'
      case 'orange':
        return 'filter: hue-rotate(30deg);'
      case 'red':
        return 'filter: hue-rotate(0deg);'
      default:
        return 'filter: hue-rotate(220deg);' // blue
    }
  }}
`

const MetricValue = styled.div<{ color?: MetricCardProps['color'] }>`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
  
  ${({ color }) => {
    switch (color) {
      case 'green':
        return 'color: #10b981;'
      case 'orange':
        return 'color: #f59e0b;'
      case 'red':
        return 'color: #ef4444;'
      default:
        return 'color: #3b82f6;' // blue
    }
  }}
`

const MetricLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`

const MetricChange = styled.div<{ type: 'positive' | 'negative' | 'neutral' }>`
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  
  ${({ type }) => {
    switch (type) {
      case 'positive':
        return `
          color: #10b981;
          &::before {
            content: '↗';
            font-size: 14px;
          }
        `;
      case 'negative':
        return `
          color: #ef4444;
          &::before {
            content: '↘';
            font-size: 14px;
          }
        `;
      default:
        return `
          color: #6b7280;
          &::before {
            content: '→';
            font-size: 14px;
          }
        `;
    }
  }}
`

const MetricDescription = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 8px 0 0 0;
  line-height: 1.4;
`

const MetricTrend = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
`

export default function MetricCard({
  title,
  value,
  icon,
  change,
  description,
  color = 'blue'
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      // Format large numbers
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`
      }
      return val.toLocaleString()
    }
    return val
  }

  const formatChangeValue = (changeVal: number) => {
    const absValue = Math.abs(changeVal)
    if (absValue >= 100) {
      return `${changeVal > 0 ? '+' : ''}${changeVal.toFixed(0)}%`
    }
    return `${changeVal > 0 ? '+' : ''}${changeVal.toFixed(1)}%`
  }

  return (
    <MetricContainer>
      <IconContainer color={color}>
        {icon}
      </IconContainer>
      
      <MetricValue color={color}>
        {formatValue(value)}
      </MetricValue>
      
      <MetricLabel>
        {title}
      </MetricLabel>
      
      {change && (
        <MetricTrend>
          <MetricChange type={change.type}>
            {formatChangeValue(change.value)} vs {change.period}
          </MetricChange>
        </MetricTrend>
      )}
      
      {description && (
        <MetricDescription>
          {description}
        </MetricDescription>
      )}
    </MetricContainer>
  )
}