'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { BillingService, BillingPlan, BillingUsage } from '@/lib/billingService'
import { User } from '@/lib/dynamodb'
import { LoadingSpinner } from '@/components/Loading'
import BackButton from '@/components/settings/BackButton'

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`

const PageHeader = styled.div`
  margin-bottom: 30px;
  
  h1 {
    margin: 0 0 10px 0;
    color: #333;
    font-size: 28px;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 16px;
  }
`

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`

const Card = styled.div`
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`

const CardHeader = styled.div`
  margin-bottom: 15px;
  
  h3 {
    margin: 0 0 5px 0;
    color: #333;
    font-size: 18px;
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`

const UsageMeter = styled.div`
  margin: 15px 0;
`

const MeterBar = styled.div<{ $percentage: number; $isOverage: boolean }>`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    width: ${props => Math.min(props.$percentage, 100)}%;
    height: 100%;
    background: ${props => props.$isOverage ? '#ef4444' : props.$percentage > 80 ? '#f59e0b' : '#10b981'};
    transition: width 0.3s ease;
  }
`

const MeterLabel = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-top: 8px;
  font-size: 14px;
  color: #666;
`

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #ed7734;
  margin-bottom: 5px;
`

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
`

const PlanCard = styled(Card)<{ $isSelected?: boolean }>`
  border: ${props => props.$isSelected ? '2px solid #ed7734' : '1px solid #e1e5e9'};
  position: relative;
  cursor: ${props => props.$isSelected ? 'default' : 'pointer'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: ${props => props.$isSelected ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.$isSelected ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '0 4px 16px rgba(0, 0, 0, 0.1)'};
  }
`

const CurrentPlanBadge = styled.div`
  position: absolute;
  top: -10px;
  right: 20px;
  background: #ed7734;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`

const PlanPrice = styled.div`
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
    font-size: 14px;
    
    &::before {
      content: '✓';
      color: #10b981;
      font-weight: 600;
      margin-right: 10px;
    }
  }
`

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #ed7734;
    color: white;
    
    &:hover:not(:disabled) {
      background: #5a6fd8;
    }
  ` : `
    background: transparent;
    color: #ed7734;
    border: 2px solid #ed7734;
    
    &:hover:not(:disabled) {
      background: #ed7734;
      color: white;
    }
  `}
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    border-color: #e5e7eb;
    cursor: not-allowed;
  }
`

const WarningAlert = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  
  .title {
    font-weight: 600;
    color: #92400e;
    margin-bottom: 5px;
  }
  
  .message {
    color: #92400e;
    font-size: 14px;
    margin: 0;
  }
`

const BillingToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  gap: 15px;
  
  label {
    font-size: 16px;
    color: #333;
    font-weight: 500;
  }
  
  input[type="checkbox"] {
    width: 50px;
    height: 28px;
    appearance: none;
    background: #e5e7eb;
    border-radius: 14px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s ease;
    
    &:checked {
      background: #ed7734;
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: white;
      top: 4px;
      left: 4px;
      transition: transform 0.3s ease;
    }
    
    &:checked::after {
      transform: translateX(22px);
    }
  }
`

export default function BillingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usageSummary, setUsageSummary] = useState<any>(null)
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([])
  const [isYearlyBilling, setIsYearlyBilling] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>('professional')

  const loadBillingData = useCallback(async () => {
    try {
      setLoading(true)
      const user = session?.user as User
      const businessId = user.businessId || 'biz_' + user.id

      // Load usage summary and billing plans
      const [summary, plans] = await Promise.all([
        BillingService.getUsageSummary(businessId),
        Promise.resolve(BillingService.getAvailablePlans())
      ])

      setUsageSummary(summary)
      setBillingPlans(plans)
    } catch (error) {
      console.error('Error loading billing data:', error)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (status === 'loading') return

    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    loadBillingData()
  }, [session, status, router, loadBillingData])

  const handlePlanSelect = async (planId: string) => {
    // In a real application, this would integrate with payment processing
    console.log('Plan selected:', planId)
    // Implement plan change logic here
  }

  const calculateSavings = (monthlyPrice: number, yearlyPrice: number): number => {
    const yearlyMonthlyEquivalent = yearlyPrice / 12
    return ((monthlyPrice - yearlyMonthlyEquivalent) / monthlyPrice) * 100
  }

  if (status === 'loading' || loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <LoadingSpinner size="lg" />
        </div>
      </Container>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <Container>
      <ContentWrapper>
        <BackButton />
        <PageHeader>
          <h1>Billing & Usage</h1>
          <p>Manage your subscription and track location-based usage</p>
        </PageHeader>

        {usageSummary?.overageWarning && (
          <WarningAlert>
            <div className="title">Plan Limit Exceeded</div>
            <p className="message">{usageSummary.overageWarning}</p>
          </WarningAlert>
        )}

        {usageSummary && (
          <DashboardGrid>
            <Card>
              <CardHeader>
                <h3>Current Plan</h3>
                <p>Your active subscription</p>
              </CardHeader>
              <StatValue>{usageSummary.currentPlan}</StatValue>
              <StatLabel>Plan Name</StatLabel>
            </Card>

            <Card>
              <CardHeader>
                <h3>Locations Used</h3>
                <p>Active locations this month</p>
              </CardHeader>
              <UsageMeter>
                <MeterBar 
                  $percentage={(usageSummary.locationsUsed / usageSummary.locationsLimit) * 100}
                  $isOverage={usageSummary.locationsUsed > usageSummary.locationsLimit}
                />
                <MeterLabel>
                  <span>{usageSummary.locationsUsed} of {usageSummary.locationsLimit === Infinity ? '∞' : usageSummary.locationsLimit}</span>
                  <span>{Math.round((usageSummary.locationsUsed / usageSummary.locationsLimit) * 100)}%</span>
                </MeterLabel>
              </UsageMeter>
            </Card>

            <Card>
              <CardHeader>
                <h3>Monthly Orders</h3>
                <p>Total orders across all locations</p>
              </CardHeader>
              <StatValue>{usageSummary.currentMonthOrders.toLocaleString()}</StatValue>
              <StatLabel>Orders This Month</StatLabel>
            </Card>

            <Card>
              <CardHeader>
                <h3>Estimated Bill</h3>
                <p>Next billing date: {usageSummary.nextBillingDate.toLocaleDateString()}</p>
              </CardHeader>
              <StatValue>${usageSummary.estimatedMonthlyBill.toFixed(2)}</StatValue>
              <StatLabel>Monthly Amount</StatLabel>
            </Card>
          </DashboardGrid>
        )}

        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
            Choose Your Plan
          </h2>
          
          <BillingToggle>
            <label>Monthly</label>
            <input
              type="checkbox"
              checked={isYearlyBilling}
              onChange={(e) => setIsYearlyBilling(e.target.checked)}
            />
            <label>Yearly <span style={{ color: '#10b981', fontWeight: 600 }}>Save up to 20%</span></label>
          </BillingToggle>

          <DashboardGrid>
            {billingPlans.map(plan => {
              const isSelected = plan.id === currentPlan
              const price = isYearlyBilling ? plan.yearlyPrice : plan.monthlyPrice
              const savings = calculateSavings(plan.monthlyPrice, plan.yearlyPrice)
              
              return (
                <PlanCard 
                  key={plan.id} 
                  $isSelected={isSelected}
                  onClick={() => !isSelected && handlePlanSelect(plan.id)}
                >
                  {isSelected && <CurrentPlanBadge>Current Plan</CurrentPlanBadge>}
                  
                  <CardHeader>
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                  </CardHeader>

                  <PlanPrice>
                    ${price.toFixed(2)}
                    <span className="period">/{isYearlyBilling ? 'year' : 'month'}</span>
                    {isYearlyBilling && (
                      <span className="yearly-savings">
                        Save {savings.toFixed(0)}% yearly
                      </span>
                    )}
                  </PlanPrice>

                  <FeatureList>
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </FeatureList>

                  <ActionButton
                    variant={isSelected ? 'secondary' : 'primary'}
                    disabled={isSelected}
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {isSelected ? 'Current Plan' : 'Select Plan'}
                  </ActionButton>
                </PlanCard>
              )
            })}
          </DashboardGrid>
        </div>
      </ContentWrapper>
    </Container>
  )
}