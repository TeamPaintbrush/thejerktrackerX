import React, { useState } from 'react'
import styled from 'styled-components'
import { CreditCard, Receipt, Package } from 'lucide-react'
import { SettingsSection, SettingsItem } from '../ui/SettingsComponents'

interface BillingInfo {
  currentPlan: 'free' | 'basic' | 'professional' | 'enterprise'
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate: string
  paymentMethod: {
    type: 'card' | 'paypal' | 'none'
    last4?: string
    expiryDate?: string
  }
}

interface BillingSettingsProps {
  billingInfo: BillingInfo
  onUpdateBilling: (info: Partial<BillingInfo>) => void
}

const PlanCard = styled.div<{ $active: boolean }>`
  border: 2px solid ${props => props.$active ? '#667eea' : '#e5e7eb'};
  background: ${props => props.$active ? '#f3f4ff' : 'white'};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`

const PlanName = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`

const PlanPrice = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
  
  span {
    font-size: 16px;
    color: #6b7280;
    font-weight: 400;
  }
`

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
`

const PlanFeature = styled.li`
  padding: 0.5rem 0;
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:before {
    content: '✓';
    color: #667eea;
    font-weight: bold;
  }
`

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1rem 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const PaymentMethodCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
`

const CardIcon = styled.div`
  width: 48px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  color: white;
  font-weight: bold;
  font-size: 12px;
`

const CardDetails = styled.div`
  flex: 1;
`

const CardType = styled.div`
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`

const CardNumber = styled.div`
  font-size: 14px;
  color: #6b7280;
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  ${props => {
    switch(props.$variant) {
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover { background: #dc2626; }
        `
      case 'secondary':
        return `
          background: white;
          color: #667eea;
          border: 1px solid #667eea;
          &:hover { background: #f3f4ff; }
        `
      default:
        return `
          background: #667eea;
          color: white;
          &:hover { background: #5568d3; }
        `
    }
  }}
  
  &:active {
    transform: translateY(1px);
  }
`

const BillingHistory = styled.div`
  margin-top: 1rem;
`

const InvoiceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`

const InvoiceDate = styled.div`
  font-weight: 500;
  color: #374151;
`

const InvoiceAmount = styled.div`
  font-weight: 600;
  color: #667eea;
`

const InvoiceActions = styled.div`
  display: flex;
  gap: 8px;
`

const Badge = styled.span<{ $type?: 'success' | 'warning' }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch(props.$type) {
      case 'success':
        return `
          background: #d1fae5;
          color: #065f46;
        `
      case 'warning':
        return `
          background: #fef3c7;
          color: #92400e;
        `
      default:
        return `
          background: #e0e7ff;
          color: #3730a3;
        `
    }
  }}
`

const BillingSettings: React.FC<BillingSettingsProps> = ({
  billingInfo,
  onUpdateBilling
}) => {
  const [localInfo, setLocalInfo] = useState(billingInfo)

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['Up to 50 orders/month', 'Basic QR codes', 'Email support']
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      features: ['Up to 500 orders/month', 'Custom QR codes', 'Priority email support', 'Basic analytics']
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      features: ['Unlimited orders', 'Advanced QR features', '24/7 phone support', 'Advanced analytics', 'Custom branding']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      features: ['Everything in Professional', 'API access', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee']
    }
  ]

  const mockInvoices = [
    { date: 'Jan 15, 2025', amount: '$79.00', status: 'Paid' },
    { date: 'Dec 15, 2024', amount: '$79.00', status: 'Paid' },
    { date: 'Nov 15, 2024', amount: '$79.00', status: 'Paid' }
  ]

  const handlePlanChange = (planId: string) => {
    setLocalInfo(prev => ({ ...prev, currentPlan: planId as BillingInfo['currentPlan'] }))
  }

  const handleSave = () => {
    onUpdateBilling(localInfo)
  }

  return (
    <>
      <SettingsSection title="Subscription Plans" icon={<Package size={20} />}>
        <PlansGrid>
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              $active={localInfo.currentPlan === plan.id}
              onClick={() => handlePlanChange(plan.id)}
            >
              <PlanName>{plan.name}</PlanName>
              <PlanPrice>
                ${plan.price}<span>/month</span>
              </PlanPrice>
              {localInfo.currentPlan === plan.id && (
                <Badge $type="success">Current Plan</Badge>
              )}
              <PlanFeatures>
                {plan.features.map((feature, idx) => (
                  <PlanFeature key={idx}>{feature}</PlanFeature>
                ))}
              </PlanFeatures>
            </PlanCard>
          ))}
        </PlansGrid>
        
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button $variant="secondary">Compare Plans</Button>
          {localInfo.currentPlan !== billingInfo.currentPlan && (
            <Button onClick={handleSave}>Upgrade Plan</Button>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Payment Method" icon={<CreditCard size={20} />}>
        {localInfo.paymentMethod.type !== 'none' ? (
          <PaymentMethodCard>
            <CardIcon>VISA</CardIcon>
            <CardDetails>
              <CardType>Visa ending in {localInfo.paymentMethod.last4 || '4242'}</CardType>
              <CardNumber>Expires {localInfo.paymentMethod.expiryDate || '12/25'}</CardNumber>
            </CardDetails>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button $variant="secondary">Edit</Button>
              <Button $variant="danger">Remove</Button>
            </div>
          </PaymentMethodCard>
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>No payment method added</p>
            <Button>Add Payment Method</Button>
          </div>
        )}
        
        <SettingsItem 
          label="Billing Cycle" 
          description="Choose your billing frequency"
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              $variant={localInfo.billingCycle === 'monthly' ? 'primary' : 'secondary'}
              onClick={() => setLocalInfo(prev => ({ ...prev, billingCycle: 'monthly' }))}
            >
              Monthly
            </Button>
            <Button 
              $variant={localInfo.billingCycle === 'yearly' ? 'primary' : 'secondary'}
              onClick={() => setLocalInfo(prev => ({ ...prev, billingCycle: 'yearly' }))}
            >
              Yearly (Save 20%)
            </Button>
          </div>
        </SettingsItem>

        <SettingsItem 
          label="Next Billing Date" 
          description="Your next payment will be processed on this date"
        >
          <div style={{ color: '#374151', fontWeight: '500' }}>
            {localInfo.nextBillingDate}
          </div>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection title="Billing History" icon={<Receipt size={20} />}>
        <BillingHistory>
          {mockInvoices.map((invoice, idx) => (
            <InvoiceRow key={idx}>
              <div>
                <InvoiceDate>{invoice.date}</InvoiceDate>
                <Badge $type="success">{invoice.status}</Badge>
              </div>
              <InvoiceAmount>{invoice.amount}</InvoiceAmount>
              <InvoiceActions>
                <Button $variant="secondary">View</Button>
                <Button $variant="secondary">Download</Button>
              </InvoiceActions>
            </InvoiceRow>
          ))}
        </BillingHistory>
        
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <Button $variant="secondary">View All Invoices</Button>
        </div>
      </SettingsSection>
    </>
  )
}

export default BillingSettings
