'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Package, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';

interface MobileBillingSettingsProps {
  className?: string;
}

interface BillingData {
  plan: string;
  price: number;
  billingCycle: string;
  nextBillingDate: string;
  paymentMethod: string;
  ordersUsed: number;
  ordersLimit: number;
  storageUsed: number;
  storageLimit: number;
}

const BillingContainer = styled.div`
  padding: 0.5rem 1rem;
  padding-bottom: 100px;
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
  margin-top: 0.5rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const BillingSection = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlanCard = styled.div<{ $active?: boolean }>`
  background: ${props => props.$active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f9fafb'};
  color: ${props => props.$active ? 'white' : '#1f2937'};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border: 2px solid ${props => props.$active ? '#667eea' : '#e5e7eb'};
`;

const PlanName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlanPrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  
  span {
    font-size: 1rem;
    font-weight: 400;
    opacity: 0.8;
  }
`;

const PlanFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
  
  li {
    padding: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    opacity: 0.9;
  }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
`;

const UsageBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
`;

const UsageFill = styled.div<{ $percentage: number; $warning?: boolean }>`
  width: ${props => Math.min(props.$percentage, 100)}%;
  height: 100%;
  background: ${props => props.$warning ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #10b981, #059669)'};
  transition: width 0.3s ease;
`;

const UsageText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const AlertBox = styled.div<{ $type: 'info' | 'warning' | 'success' }>`
  padding: 1rem;
  border-radius: 8px;
  background: ${props => 
    props.$type === 'success' ? '#ecfdf5' :
    props.$type === 'warning' ? '#fef3c7' : '#eff6ff'
  };
  border: 1px solid ${props => 
    props.$type === 'success' ? '#10b981' :
    props.$type === 'warning' ? '#f59e0b' : '#3b82f6'
  };
  color: ${props => 
    props.$type === 'success' ? '#065f46' :
    props.$type === 'warning' ? '#92400e' : '#1e40af'
  };
  margin-bottom: 1rem;
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

export default function MobileBillingSettings({ className }: MobileBillingSettingsProps) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState<BillingData>({
    plan: 'Professional',
    price: 49,
    billingCycle: 'monthly',
    nextBillingDate: '2025-11-14',
    paymentMethod: 'Visa •••• 4242',
    ordersUsed: 847,
    ordersLimit: 1000,
    storageUsed: 2.3,
    storageLimit: 10
  });

  useEffect(() => {
    // Load billing data
    const loadBillingData = async () => {
      setLoading(true);
      
      if (typeof window !== 'undefined') {
        try {
          // Get user from localStorage
          const storedUser = localStorage.getItem('mobile_auth_user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            // In production, load real billing data from API
            console.log('Loading billing data for user:', userData.email);
          }
        } catch (error) {
          console.error('Error loading billing data:', error);
        }
      }
      
      setLoading(false);
    };
    
    loadBillingData();
  }, []);

  const ordersPercentage = (billingData.ordersUsed / billingData.ordersLimit) * 100;
  const storagePercentage = (billingData.storageUsed / billingData.storageLimit) * 100;

  if (loading) {
    return (
      <BillingContainer className={className}>
        <BillingSection
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#666' }}>Loading billing information...</p>
          </div>
        </BillingSection>
      </BillingContainer>
    );
  }

  return (
    <BillingContainer className={className}>
      <Header>
        <Title>Billing & Plans</Title>
        <Subtitle>Manage your subscription</Subtitle>
      </Header>

      {/* Available Plans */}
      <BillingSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <SectionTitle>
          <Package size={20} />
          Available Plans
        </SectionTitle>

        {/* Starter Plan */}
        <PlanCard $active={billingData.plan === 'Starter'}>
          <PlanName>
            {billingData.plan === 'Starter' && <CheckCircle size={24} />}
            Starter
          </PlanName>
          <PlanPrice>
            $19
            <span>/monthly</span>
          </PlanPrice>
          <PlanFeatures>
            <li>
              <CheckCircle size={16} />
              Up to 250 orders/month
            </li>
            <li>
              <CheckCircle size={16} />
              2GB storage
            </li>
            <li>
              <CheckCircle size={16} />
              QR code tracking
            </li>
            <li>
              <CheckCircle size={16} />
              Email support
            </li>
            <li>
              <CheckCircle size={16} />
              Basic analytics
            </li>
          </PlanFeatures>
          {billingData.plan !== 'Starter' && (
            <Button
              whileTap={{ scale: 0.98 }}
              onClick={() => addToast({
                type: 'info',
                title: 'Plan Change',
                message: 'Contact support to change your plan',
                duration: 3000
              })}
            >
              <ArrowUpRight size={20} />
              Select Plan
            </Button>
          )}
        </PlanCard>

        {/* Professional Plan */}
        <PlanCard $active={billingData.plan === 'Professional'}>
          <PlanName>
            {billingData.plan === 'Professional' && <CheckCircle size={24} />}
            Professional
          </PlanName>
          <PlanPrice>
            $49
            <span>/monthly</span>
          </PlanPrice>
          <PlanFeatures>
            <li>
              <CheckCircle size={16} />
              Up to 1,000 orders/month
            </li>
            <li>
              <CheckCircle size={16} />
              10GB storage
            </li>
            <li>
              <CheckCircle size={16} />
              QR code tracking
            </li>
            <li>
              <CheckCircle size={16} />
              Real-time notifications
            </li>
            <li>
              <CheckCircle size={16} />
              Priority support
            </li>
            <li>
              <CheckCircle size={16} />
              Advanced analytics
            </li>
          </PlanFeatures>
          {billingData.plan !== 'Professional' && (
            <Button
              whileTap={{ scale: 0.98 }}
              onClick={() => addToast({
                type: 'info',
                title: 'Plan Change',
                message: 'Contact support to upgrade your plan',
                duration: 3000
              })}
            >
              <ArrowUpRight size={20} />
              Select Plan
            </Button>
          )}
        </PlanCard>

        {/* Enterprise Plan */}
        <PlanCard $active={billingData.plan === 'Enterprise'}>
          <PlanName>
            {billingData.plan === 'Enterprise' && <CheckCircle size={24} />}
            Enterprise
          </PlanName>
          <PlanPrice>
            $99
            <span>/monthly</span>
          </PlanPrice>
          <PlanFeatures>
            <li>
              <CheckCircle size={16} />
              Unlimited orders
            </li>
            <li>
              <CheckCircle size={16} />
              50GB storage
            </li>
            <li>
              <CheckCircle size={16} />
              QR code tracking
            </li>
            <li>
              <CheckCircle size={16} />
              Real-time notifications
            </li>
            <li>
              <CheckCircle size={16} />
              24/7 Premium support
            </li>
            <li>
              <CheckCircle size={16} />
              Custom integrations
            </li>
            <li>
              <CheckCircle size={16} />
              White-label options
            </li>
          </PlanFeatures>
          {billingData.plan !== 'Enterprise' && (
            <Button
              whileTap={{ scale: 0.98 }}
              onClick={() => addToast({
                type: 'info',
                title: 'Plan Change',
                message: 'Contact support for enterprise pricing',
                duration: 3000
              })}
            >
              <ArrowUpRight size={20} />
              Contact Sales
            </Button>
          )}
        </PlanCard>
      </BillingSection>

      {/* Usage */}
      <BillingSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <SectionTitle>
          <TrendingUp size={20} />
          Usage This Month
        </SectionTitle>

        {ordersPercentage > 80 && (
          <AlertBox $type="warning">
            <AlertCircle size={16} />
            <div>
              You&apos;ve used {ordersPercentage.toFixed(0)}% of your monthly orders. 
              Consider upgrading your plan.
            </div>
          </AlertBox>
        )}

        <div style={{ marginBottom: '1.5rem' }}>
          <InfoLabel>
            <Package size={16} />
            Orders
          </InfoLabel>
          <UsageBar>
            <UsageFill $percentage={ordersPercentage} $warning={ordersPercentage > 80} />
          </UsageBar>
          <UsageText>
            <span>{billingData.ordersUsed.toLocaleString()} used</span>
            <span>{billingData.ordersLimit.toLocaleString()} total</span>
          </UsageText>
        </div>

        <div>
          <InfoLabel>
            <TrendingUp size={16} />
            Storage
          </InfoLabel>
          <UsageBar>
            <UsageFill $percentage={storagePercentage} $warning={storagePercentage > 80} />
          </UsageBar>
          <UsageText>
            <span>{billingData.storageUsed}GB used</span>
            <span>{billingData.storageLimit}GB total</span>
          </UsageText>
        </div>
      </BillingSection>

      {/* Billing Details */}
      <BillingSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <SectionTitle>
          <CreditCard size={20} />
          Billing Details
        </SectionTitle>

        <InfoRow>
          <InfoLabel>
            <Calendar size={16} />
            Next Billing Date
          </InfoLabel>
          <InfoValue>{new Date(billingData.nextBillingDate).toLocaleDateString()}</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <DollarSign size={16} />
            Amount
          </InfoLabel>
          <InfoValue>${billingData.price}.00</InfoValue>
        </InfoRow>

        <InfoRow>
          <InfoLabel>
            <CreditCard size={16} />
            Payment Method
          </InfoLabel>
          <InfoValue>{billingData.paymentMethod}</InfoValue>
        </InfoRow>

        <Button
          whileTap={{ scale: 0.98 }}
          onClick={() => addToast({
            type: 'info',
            title: 'Coming Soon',
            message: 'Payment method update feature is in development',
            duration: 3000
          })}
        >
          <CreditCard size={20} />
          Update Payment Method
        </Button>
      </BillingSection>

      {/* Info */}
      <AlertBox $type="info">
        <AlertCircle size={16} />
        <div>
          Your subscription will automatically renew on {new Date(billingData.nextBillingDate).toLocaleDateString()}. 
          You can cancel anytime from your account settings.
        </div>
      </AlertBox>
    </BillingContainer>
  );
}
