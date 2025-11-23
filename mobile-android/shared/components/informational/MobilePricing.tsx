// 💳 Mobile Pricing Component
// Mobile-optimized pricing plans and features

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Check, 
  Star, 
  Zap, 
  Crown, 
  Sparkles,
  Shield,
  Headphones,
  TrendingUp,
  Users
} from 'lucide-react';

interface MobilePricingProps {}

// Styled Components
const PricingContainer = styled.div`
  padding: 1rem;
  padding-bottom: 120px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  max-width: 100%;
  overflow-x: hidden;
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    padding-bottom: 100px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  
  @media (max-width: 480px) {
    font-size: 0.875rem;
    margin: 0 0 1.5rem 0;
  }
`;

const BillingToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const ToggleLabel = styled.span<{ $active: boolean }>`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.$active ? '#1f2937' : '#9ca3af'};
  transition: color 0.2s ease;
`;

const ToggleButton = styled(motion.button)<{ $isAnnual: boolean }>`
  position: relative;
  display: inline-flex;
  height: 28px;
  width: 50px;
  align-items: center;
  border-radius: 14px;
  background: ${props => props.$isAnnual ? '#ed7734' : '#d1d5db'};
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;
`;

const ToggleThumb = styled.span<{ $isAnnual: boolean }>`
  display: inline-block;
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: ${props => props.$isAnnual ? 'translateX(25px)' : 'translateX(3px)'};
  transition: transform 0.2s ease;
`;

const SavingsBadge = styled.span`
  background: #d1fae5;
  color: #059669;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const PlansContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const PlanCard = styled(motion.div)<{ $popular?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => props.$popular ? '#ed7734' : 'rgba(237, 119, 52, 0.1)'};
  position: relative;
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
  color: white;
  padding: 0.375rem 1rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const PlanIcon = styled.div<{ $gradient: string }>`
  width: 56px;
  height: 56px;
  background: ${props => props.$gradient};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem;
`;

const PlanName = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const PlanSubtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
`;

const PriceSection = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const OriginalPrice = styled.span`
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
`;

const Price = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
`;

const PricePeriod = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const PlanDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #1f2937;
`;

const CheckIcon = styled(Check)`
  width: 18px;
  height: 18px;
  color: #10b981;
  margin-top: 2px;
  flex-shrink: 0;
`;

const SelectButton = styled(motion.button)<{ $variant: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
    color: white;
    border: 2px solid transparent;
    box-shadow: 0 4px 12px rgba(237, 119, 52, 0.25);
    
    &:hover {
      box-shadow: 0 6px 16px rgba(237, 119, 52, 0.35);
      transform: translateY(-1px);
    }
  ` : `
    background: white;
    color: #ed7734;
    border: 2px solid #ed7734;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    
    &:hover {
      background: #fef7ee;
      box-shadow: 0 4px 12px rgba(237, 119, 52, 0.15);
      transform: translateY(-1px);
    }
  `}
  
  &:active {
    transform: scale(0.98);
  }
`;

const FeaturesSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const FeatureCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(237, 119, 52, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ed7734;
`;

const FeatureTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const FeatureDesc = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

const CTASection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const CTATitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const CTAText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1.5rem 0;
`;

const CTAButton = styled(motion.button)`
  background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(237, 119, 52, 0.25);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 6px 16px rgba(237, 119, 52, 0.35);
    transform: translateY(-1px);
  }
`;

const DemoButton = styled(motion.button)`
  background: white;
  color: #ed7734;
  border: 2px solid #ed7734;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 1rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #fef7ee;
    box-shadow: 0 4px 12px rgba(237, 119, 52, 0.15);
    transform: translateY(-1px);
  }
`;

const MobilePricing: React.FC<MobilePricingProps> = () => {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      subtitle: "Perfect for small restaurants",
      price: isAnnual ? 15 : 19,
      originalPrice: isAnnual ? 19 : null,
      period: isAnnual ? "/month (billed annually)" : "/month",
      popular: false,
      description: "Everything you need to get started with modern pickup tracking",
      features: [
        "Up to 250 orders/month",
        "QR code generation",
        "Basic analytics dashboard",
        "Email support",
        "Mobile-responsive design",
        "Basic customization"
      ],
      gradient: "linear-gradient(135deg, #78716c 0%, #57534e 100%)",
      icon: <Zap size={28} />
    },
    {
      name: "Professional",
      subtitle: "Most popular choice",
      price: isAnnual ? 45 : 59,
      originalPrice: isAnnual ? 59 : null,
      period: isAnnual ? "/month (billed annually)" : "/month",
      popular: true,
      description: "Advanced features for growing restaurants (Per Location)",
      features: [
        "Unlimited orders",
        "Advanced QR code features",
        "Comprehensive analytics",
        "Priority email support",
        "Custom branding",
        "API access",
        "Driver performance insights",
        "Customer feedback system"
      ],
      gradient: "linear-gradient(135deg, #ed7734 0%, #f59e0b 100%)",
      icon: <Crown size={28} />
    },
    {
      name: "Enterprise",
      subtitle: "For restaurant chains",
      price: "Custom",
      period: "pricing",
      popular: false,
      description: "White-label solution with dedicated support",
      features: [
        "Everything in Professional",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "24/7 phone support",
        "Advanced security features",
        "Multi-location management",
        "Custom reporting"
      ],
      gradient: "linear-gradient(135deg, #44403c 0%, #292524 100%)",
      icon: <Sparkles size={28} />
    }
  ];

  const features = [
    {
      icon: <Zap size={24} />,
      title: "Lightning Fast",
      description: "Quick setup in minutes"
    },
    {
      icon: <Shield size={24} />,
      title: "Secure",
      description: "Enterprise-grade security"
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Analytics",
      description: "Real-time insights"
    },
    {
      icon: <Users size={24} />,
      title: "Multi-User",
      description: "Team collaboration"
    }
  ];

  const handleSelectPlan = (planName: string) => {
    // Redirect to signup/create account for all paid plans
    router.push('/mobile/login');
  };

  const handleContactSales = () => {
    // Create professional email template for Enterprise plan
    const subject = encodeURIComponent('Enterprise Plan Inquiry - The JERK Tracker');
    const body = encodeURIComponent(`Hello,

I'm interested in learning more about The JERK Tracker Enterprise plan for my restaurant business.

Business Details:
- Restaurant Name: 
- Number of Locations: 
- Expected Monthly Orders: 
- Current Ordering System: 

I would like to discuss:
[ ] Custom pricing options
[ ] White-label solutions
[ ] Multi-location management
[ ] Custom integrations
[ ] Dedicated support

Best time to contact me:
- Phone: 
- Preferred contact method: 

Thank you,
`);
    
    window.location.href = `mailto:apps@paintbrushmarketing.net?subject=${subject}&body=${body}`;
  };

  const handleStartFreeTrial = () => {
    // Redirect to create account screen
    router.push('/mobile/login');
  };

  const handleScheduleDemo = () => {
    // Create professional email template for demo scheduling
    const subject = encodeURIComponent('Schedule a Demo - The JERK Tracker');
    const body = encodeURIComponent(`Hello,

I would like to schedule a demo of The JERK Tracker for my restaurant.

Business Information:
- Restaurant Name: 
- Your Name: 
- Email: 
- Phone: 
- Number of Locations: 
- Current Monthly Orders (approx): 

Preferred Demo Times:
- First Choice: 
- Second Choice: 
- Third Choice: 

What I'm most interested in:
[ ] QR code order tracking
[ ] Multi-location management
[ ] Analytics and reporting
[ ] Driver management
[ ] Custom integrations
[ ] Other: 

Additional questions or requirements:


Thank you,
`);
    
    window.location.href = `mailto:apps@paintbrushmarketing.net?subject=${subject}&body=${body}`;
  };

  return (
    <PricingContainer>
      <Header>
        <Title>Choose Your Plan</Title>
        <Subtitle>Start tracking deliveries with QR codes today</Subtitle>
      </Header>

      {/* Billing Toggle */}
      <BillingToggle>
        <ToggleLabel $active={!isAnnual}>Monthly</ToggleLabel>
        <ToggleButton
          $isAnnual={isAnnual}
          onClick={() => setIsAnnual(!isAnnual)}
          whileTap={{ scale: 0.95 }}
        >
          <ToggleThumb $isAnnual={isAnnual} />
        </ToggleButton>
        <ToggleLabel $active={isAnnual}>
          Annual
          {isAnnual && <SavingsBadge style={{ marginLeft: '0.5rem' }}>Save 20%</SavingsBadge>}
        </ToggleLabel>
      </BillingToggle>

      {/* Plans */}
      <PlansContainer>
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.name}
            $popular={plan.popular}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {plan.popular && (
              <PopularBadge>
                <Star size={14} fill="white" />
                Most Popular
              </PopularBadge>
            )}

            <PlanHeader>
              <PlanIcon $gradient={plan.gradient}>
                {plan.icon}
              </PlanIcon>
              <PlanName>{plan.name}</PlanName>
              <PlanSubtitle>{plan.subtitle}</PlanSubtitle>
            </PlanHeader>

            <PriceSection>
              <PriceContainer>
                {plan.originalPrice && <OriginalPrice>${plan.originalPrice}</OriginalPrice>}
                <Price>{typeof plan.price === 'number' ? `$${plan.price}` : plan.price}</Price>
              </PriceContainer>
              <PricePeriod>{plan.period}</PricePeriod>
            </PriceSection>

            <PlanDescription>{plan.description}</PlanDescription>

            <FeatureList>
              {plan.features.map((feature, idx) => (
                <FeatureItem key={idx}>
                  <CheckIcon />
                  <span>{feature}</span>
                </FeatureItem>
              ))}
            </FeatureList>

            <SelectButton
              $variant={plan.popular ? 'primary' : 'secondary'}
              onClick={() => plan.name === 'Enterprise' ? handleContactSales() : handleSelectPlan(plan.name)}
              whileTap={{ scale: 0.95 }}
            >
              {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
            </SelectButton>
          </PlanCard>
        ))}
      </PlansContainer>

      {/* Features Grid */}
      <FeaturesSection>
        <SectionTitle>Why Choose The JERK Tracker?</SectionTitle>
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                {feature.icon}
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDesc>{feature.description}</FeatureDesc>
            </FeatureCard>
          ))}
        </FeatureGrid>
      </FeaturesSection>

      {/* CTA */}
      <CTASection>
        <CTATitle>Ready to get started?</CTATitle>
        <CTAText>Join restaurants already using The JERK Tracker</CTAText>
        <CTAButton
          onClick={handleStartFreeTrial}
          whileTap={{ scale: 0.95 }}
        >
          Try It Free
        </CTAButton>
        <DemoButton
          onClick={handleScheduleDemo}
          whileTap={{ scale: 0.95 }}
        >
          Schedule a Demo
        </DemoButton>
      </CTASection>
    </PricingContainer>
  );
};

export default MobilePricing;
