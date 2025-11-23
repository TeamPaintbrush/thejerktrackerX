import React from 'react'
import styled from 'styled-components'
import Card, { CardHeader, CardContent } from '@/components/ui/Card'

interface UsageMeterProps {
  title: string
  current: number
  limit: number
  unit: string
  description?: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
}

const MeterContainer = styled.div`
  margin: 20px 0;
`

const MeterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .meter-title {
    font-weight: 600;
    color: #374151;
    font-size: 16px;
  }
  
  .meter-value {
    font-weight: 700;
    font-size: 18px;
    color: #111827;
  }
`

const MeterBarContainer = styled.div`
  background: #f3f4f6;
  border-radius: 8px;
  height: 12px;
  overflow: hidden;
  position: relative;
`

const MeterBar = styled.div<{ 
  percentage: number; 
  color: UsageMeterProps['color'] 
}>`
  height: 100%;
  border-radius: 8px;
  transition: width 0.3s ease, background-color 0.3s ease;
  width: ${({ percentage }) => Math.min(percentage, 100)}%;
  
  ${({ color, percentage }) => {
    // Auto-determine color based on percentage if not specified
    const finalColor = color || (
      percentage >= 90 ? 'red' :
      percentage >= 75 ? 'yellow' :
      percentage >= 50 ? 'blue' : 'green'
    )
    
    switch (finalColor) {
      case 'green':
        return 'background: linear-gradient(90deg, #10b981, #059669);'
      case 'yellow':
        return 'background: linear-gradient(90deg, #f59e0b, #d97706);'
      case 'red':
        return 'background: linear-gradient(90deg, #ef4444, #dc2626);'
      default: // blue
        return 'background: linear-gradient(90deg, #3b82f6, #2563eb);'
    }
  }}
`

const MeterLabels = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
`

const PercentageLabel = styled.span.withConfig({
  shouldForwardProp: (prop) => prop !== 'isWarning',
})<{ isWarning?: boolean }>`
  font-weight: 600;
  color: ${({ isWarning }) => isWarning ? '#dc2626' : '#374151'};
`

const MeterDescription = styled.p`
  margin: 8px 0 0 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
`

const WarningMessage = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
  color: #92400e;
  font-size: 14px;
  
  .warning-icon {
    margin-right: 8px;
  }
`

export default function UsageMeter({ 
  title, 
  current, 
  limit, 
  unit, 
  description, 
  color 
}: UsageMeterProps) {
  const percentage = limit === -1 ? 0 : (current / limit) * 100
  const isUnlimited = limit === -1
  const isWarning = percentage >= 80 && !isUnlimited
  const isOverLimit = current > limit && !isUnlimited

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <Card>
      <CardHeader>
        <h3>{title}</h3>
        {description && (
          <p>{description}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <MeterContainer>
          <MeterHeader>
            <span className="meter-title">
              {isUnlimited ? 'Usage' : 'Usage'}
            </span>
            <span className="meter-value">
              {formatNumber(current)} {unit}
              {!isUnlimited && (
                <span style={{ color: '#6b7280', fontWeight: 400, fontSize: '14px' }}>
                  {' '}/ {formatNumber(limit)} {unit}
                </span>
              )}
            </span>
          </MeterHeader>

          {!isUnlimited && (
            <>
              <MeterBarContainer>
                <MeterBar 
                  percentage={percentage} 
                  color={color}
                />
              </MeterBarContainer>

              <MeterLabels>
                <span>0 {unit}</span>
                <PercentageLabel isWarning={isWarning}>
                  {percentage.toFixed(0)}%
                </PercentageLabel>
                <span>{formatNumber(limit)} {unit}</span>
              </MeterLabels>
            </>
          )}

          {isUnlimited && (
            <MeterDescription>
              ✨ Unlimited usage - no limits on your {unit.toLowerCase()}
            </MeterDescription>
          )}

          {description && !isUnlimited && (
            <MeterDescription>
              {description}
            </MeterDescription>
          )}

          {isWarning && !isOverLimit && (
            <WarningMessage>
              <span className="warning-icon">⚠️</span>
              You&apos;re approaching your limit. Consider upgrading to avoid service interruption.
            </WarningMessage>
          )}

          {isOverLimit && (
            <WarningMessage style={{ background: '#fecaca', borderColor: '#ef4444', color: '#991b1b' }}>
              <span className="warning-icon">🚨</span>
              You&apos;ve exceeded your limit! Additional usage may incur overage charges.
            </WarningMessage>
          )}
        </MeterContainer>
      </CardContent>
    </Card>
  )
}