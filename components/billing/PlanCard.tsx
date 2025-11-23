import React from 'react'
import styled from 'styled-components'
import { BillingPlan } from '@/lib/billingService'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface PlanCardProps {
  plan: BillingPlan
  isSelected?: boolean
  isYearly?: boolean
  onSelect: (plan: BillingPlan) => void
  disabled?: boolean
}

const PlanContainer = styled(Card)<{ isSelected?: boolean }>`
  border: ${props => props.isSelected ? '2px solid #667eea' : '1px solid #e1e5e9'};
  position: relative;
  cursor: ${props => props.isSelected ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.isSelected ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.isSelected ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 4px 16px rgba(0, 0, 0, 0.1)'};
  }
`

const CurrentPlanBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 20px;
  background: #667eea;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`

const PlanPrice = styled.div`
  text-align: center;
  font-size: 36px;
  font-weight: 700;
  color: #333;
  margin: 15px 0;
  
  .period {
    font-size: 16px;
    color: #666;
    font-weight: 400;
  }
  
  .yearly-savings {
    font-size: 14px;
    color: #10b981;
    font-weight: 600;
    display: block;
    margin-top: 5px;
  }
`

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 15px 0;
  
  li {
    padding: 8px 0;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
    
    &::before {
      content: '✓';
      color: #10b981;
      font-weight: bold;
      font-size: 16px;
    }
  }
`

const PlanLimits = styled.div`
  background: #f8fafc;
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  
  .limit-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 8px 0;
    font-size: 14px;
    
    .limit-label {
      color: #666;
    }
    
    .limit-value {
      color: #333;
      font-weight: 600;
    }
  }
`

const SelectButton = styled(Button)<{ isSelected?: boolean }>`
  width: 100%;
  margin-top: 15px;
`

export default function PlanCard({ 
  plan, 
  isSelected = false, 
  isYearly = false, 
  onSelect, 
  disabled = false 
}: PlanCardProps) {
  const calculatePrice = () => {
    if (isYearly) {
      return (plan.monthlyPrice * 12 * 0.9).toFixed(2) // 10% discount for yearly
    }
    return plan.monthlyPrice.toFixed(2)
  }

  const calculateSavings = () => {
    if (isYearly) {
      const monthlyCost = plan.monthlyPrice * 12
      const yearlyCost = monthlyCost * 0.9
      return (monthlyCost - yearlyCost).toFixed(2)
    }
    return '0'
  }

  const handleSelect = () => {
    if (!disabled && !isSelected) {
      onSelect(plan)
    }
  }

  return (
    <PlanContainer 
      isSelected={isSelected}
      variant={isSelected ? 'selected' : 'default'}
    >
      {isSelected && <CurrentPlanBadge>Current Plan</CurrentPlanBadge>}
      
      <PlanHeader>
        <h3>{plan.name}</h3>
        <p>{plan.description}</p>
      </PlanHeader>

      <PlanPrice>
        ${calculatePrice()}
        <span className="period">
          /{isYearly ? 'year' : 'month'}
        </span>
        {isYearly && (
          <span className="yearly-savings">
            Save ${calculateSavings()} per year
          </span>
        )}
      </PlanPrice>

      <PlanLimits>
        <div className="limit-item">
          <span className="limit-label">Locations Included:</span>
          <span className="limit-value">
            {plan.limits.locations === -1 ? 'Unlimited' : plan.limits.locations}
          </span>
        </div>
        <div className="limit-item">
          <span className="limit-label">Orders per Location:</span>
          <span className="limit-value">
            {plan.limits.ordersPerLocation ? `${plan.limits.ordersPerLocation}/month` : 'Unlimited'}
          </span>
        </div>
        <div className="limit-item">
          <span className="limit-label">Support Level:</span>
          <span className="limit-value">
            {plan.limits.support.charAt(0).toUpperCase() + plan.limits.support.slice(1)}
          </span>
        </div>
        <div className="limit-item">
          <span className="limit-label">Analytics:</span>
          <span className="limit-value">
            {plan.limits.analytics ? '✓ Included' : '✗ Not Available'}
          </span>
        </div>
      </PlanLimits>

      <FeatureList>
        {plan.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </FeatureList>

      <SelectButton
        variant={isSelected ? 'secondary' : 'primary'}
        onClick={handleSelect}
        disabled={disabled}
      >
        {isSelected ? 'Current Plan' : `Select ${plan.name}`}
      </SelectButton>
    </PlanContainer>
  )
}