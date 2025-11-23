'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Check, Star, ArrowLeft, Zap, Users, Shield, TrendingUp, Headphones, Crown, Sparkles } from 'lucide-react';
import { Container, Button, Heading, Text, Flex, Grid, Card } from '../../styles/components';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 50%, #fef7ee 100%);
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const Navigation = styled.nav`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e7e5e4;
  position: sticky;
  top: 0;
  z-index: 1020;
`;

const NavContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #78716c;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #ed7734;
  }
`;

const Logo = styled(Flex)`
  align-items: center;
  gap: 1rem;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.125rem;
`;

const Badge = styled.div`
  background: #ed773420;
  color: #ed7734;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BillingToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
`;

const ToggleLabel = styled.span<{ $active: boolean }>`
  font-size: 1.125rem;
  font-weight: 500;
  color: ${props => props.$active ? '#1c1917' : '#78716c'};
  transition: color 0.2s ease;
`;

const ToggleButton = styled.button<{ $isAnnual: boolean }>`
  position: relative;
  display: inline-flex;
  height: 32px;
  width: 56px;
  align-items: center;
  border-radius: 9999px;
  background: ${props => props.$isAnnual ? '#ed7734' : '#d6d3d1'};
  transition: background-color 0.2s ease;
  border: none;
  cursor: pointer;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #ed773450;
  }
`;

const ToggleThumb = styled.span<{ $isAnnual: boolean }>`
  display: inline-block;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: ${props => props.$isAnnual ? 'translateX(28px)' : 'translateX(4px)'};
  transition: transform 0.2s ease;
`;

const SavingsBadge = styled.span`
  background: #22c55e20;
  color: #22c55e;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
`;

const PricingGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 5rem;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const PricingCard = styled(Card)<{ $popular?: boolean }>`
  position: relative;
  padding: 2rem;
  border: 2px solid ${props => props.$popular ? '#ed773420' : '#e7e5e4'};
  background: white;
  transition: all 0.3s ease;
  transform: ${props => props.$popular ? 'scale(1.05)' : 'scale(1)'};

  &:hover {
    border-color: #ed773420;
    transform: ${props => props.$popular ? 'scale(1.05)' : 'scale(1.02)'};
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  @media (min-width: 1024px) {
    transform: ${props => props.$popular ? 'scale(1.08)' : 'scale(1)'};

    &:hover {
      transform: ${props => props.$popular ? 'scale(1.08)' : 'scale(1.03)'};
    }
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const PlanIcon = styled.div<{ gradient: string }>`
  width: 64px;
  height: 64px;
  background: ${props => props.gradient};
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1.5rem;
`;

const PriceSection = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const OriginalPrice = styled.span`
  font-size: 1.125rem;
  color: #78716c;
  text-decoration: line-through;
  margin-right: 0.5rem;
`;

const Price = styled.span`
  font-size: 3rem;
  font-weight: 700;
  color: #1c1917;
`;

const PricePeriod = styled.p`
  color: #78716c;
  margin: 0;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
`;

const CheckIcon = styled(Check)`
  width: 20px;
  height: 20px;
  color: #22c55e;
  margin-top: 2px;
  flex-shrink: 0;
`;

const FeaturesSection = styled.section`
  background: white;
  border-radius: 2rem;
  padding: 3rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid #e7e5e4;
`;

const FeatureCard = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const CTASection = styled.section`
  margin-top: 5rem;
  text-align: center;
`;

export default function PricingPage() {
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
      icon: <Zap size={32} />
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
        "🎨 Custom Business Branding",
        "🎨 Upload Brand Logo",
        "🎨 Custom Brand Colors",
        "🎨 Styled QR Codes with Logo",
        "Comprehensive analytics & reporting",
        "Priority email support",
        "API access",
        "Driver performance insights",
        "Customer feedback system"
      ],
      gradient: "linear-gradient(135deg, #ed7734 0%, #de5d20 100%)",
      icon: <Crown size={32} />
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
      icon: <Sparkles size={32} />
    }
  ];

  const features = [
    {
      icon: <Zap size={24} />,
      title: "Lightning Fast Setup",
      description: "Get your restaurant tracking system up and running in under 5 minutes with our streamlined onboarding process."
    },
    {
      icon: <Shield size={24} />,
      title: "Enterprise Security",
      description: "Bank-level encryption and SOC 2 compliance ensure your restaurant's data is always protected."
    },
    {
      icon: <TrendingUp size={24} />,
      title: "Real-time Analytics",
      description: "Make data-driven decisions with comprehensive insights into pickup times, driver performance, and customer satisfaction."
    },
    {
      icon: <Users size={24} />,
      title: "Seamless Integration",
      description: "Works perfectly with popular POS systems, delivery platforms, and restaurant management tools."
    }
  ];

  return (
    <PageWrapper>
      {/* Navigation */}
      <Navigation>
        <NavContainer>
          <BackLink href="/">
            <ArrowLeft size={20} />
            <Logo>
              <LogoIcon>JT</LogoIcon>
              <div>
                <Heading as="h1" $size="xl" $mb="0" $weight="bold" $color="#1c1917">TheJERKTracker</Heading>
                <Text $size="sm" $color="#78716c">Restaurant Solutions</Text>
              </div>
            </Logo>
          </BackLink>
          
          <Link href="/admin">
            <Button $variant="primary">Launch Dashboard</Button>
          </Link>
        </NavContainer>
      </Navigation>

      <Container style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge>
              <Crown size={16} />
              Trusted by 2,100+ Restaurants
            </Badge>
            
            <Heading as="h1" $size="6xl" $weight="bold" $mb="1.5rem" $color="#1c1917" style={{ lineHeight: 1.1 }}>
              Choose Your
              <br />
              <GradientText>Perfect Plan</GradientText>
            </Heading>
            
            <Text $size="xl" $mb="3rem" $color="#57534e" style={{ maxWidth: '800px', margin: '0 auto 3rem' }}>
              Flexible pricing designed to grow with your restaurant. Start free, upgrade anytime.
            </Text>

            {/* Billing Toggle */}
            <BillingToggle>
              <ToggleLabel $active={!isAnnual}>Monthly</ToggleLabel>
              <ToggleButton
                $isAnnual={isAnnual}
                onClick={() => setIsAnnual(!isAnnual)}
              >
                <ToggleThumb $isAnnual={isAnnual} />
              </ToggleButton>
              <ToggleLabel $active={isAnnual}>Annual</ToggleLabel>
              {isAnnual && (
                <SavingsBadge>Save 25%</SavingsBadge>
              )}
            </BillingToggle>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <PricingGrid>
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <PricingCard $popular={plan.popular}>
                {plan.popular && (
                  <PopularBadge>
                    <Star size={16} />
                    Most Popular
                  </PopularBadge>
                )}

                <div style={{ textAlign: 'center' }}>
                  <PlanIcon gradient={plan.gradient}>
                    {plan.icon}
                  </PlanIcon>
                  
                  <Heading as="h3" $size="2xl" $weight="bold" $mb="0.5rem" $color="#1c1917">
                    {plan.name}
                  </Heading>
                  <Text $size="base" $color="#78716c" $mb="1.5rem">{plan.subtitle}</Text>
                  
                  <PriceSection>
                    <PriceContainer>
                      {plan.originalPrice && (
                        <OriginalPrice>${plan.originalPrice}</OriginalPrice>
                      )}
                      <Price>
                        {typeof plan.price === 'number' ? '$' : ''}{plan.price}
                      </Price>
                    </PriceContainer>
                    <PricePeriod>{plan.period}</PricePeriod>
                  </PriceSection>
                  
                  <Text $size="base" $color="#57534e" $mb="2rem">{plan.description}</Text>

                  <Button
                    $variant={plan.popular ? "primary" : plan.name === 'Enterprise' ? "secondary" : "outline"}
                    style={{ width: '100%', marginBottom: '2rem' }}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </div>

                <FeatureList>
                  {plan.features.map((feature, featureIndex) => (
                    <FeatureItem key={featureIndex}>
                      <CheckIcon />
                      <Text $size="base" $color="#44403c">{feature}</Text>
                    </FeatureItem>
                  ))}
                </FeatureList>
              </PricingCard>
            </motion.div>
          ))}
        </PricingGrid>

        {/* Features Section */}
        <FeaturesSection>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <Heading as="h2" $size="4xl" $weight="bold" $mb="1rem" $color="#1c1917">
              Why Choose TheJERKTracker?
            </Heading>
            <Text $size="xl" $color="#57534e" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Built specifically for restaurants who demand reliability, security, and exceptional user experience.
            </Text>
          </div>

          <Grid $columns={2} $gap="2rem">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <FeatureCard>
                  <FeatureIcon>
                    {feature.icon}
                  </FeatureIcon>
                  <div>
                    <Heading as="h3" $size="xl" $weight="bold" $mb="0.5rem" $color="#1c1917">
                      {feature.title}
                    </Heading>
                    <Text $size="base" $color="#57534e" style={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Text>
                  </div>
                </FeatureCard>
              </motion.div>
            ))}
          </Grid>
        </FeaturesSection>

        {/* CTA Section */}
        <CTASection>
          <Heading as="h2" $size="3xl" $weight="bold" $mb="1.5rem" $color="#1c1917">
            Still have questions?
          </Heading>
          <Text $size="xl" $color="#57534e" $mb="2rem">
            Our team is here to help you choose the perfect plan for your restaurant.
          </Text>
          <Flex $justify="center" $gap="1rem">
            <Button $size="lg" $variant="primary">
              <Headphones size={20} style={{ marginRight: '8px' }} />
              Schedule a Demo
            </Button>
            <Link href="/admin">
              <Button $size="lg" $variant="outline">
                Try It Free
              </Button>
            </Link>
          </Flex>
        </CTASection>
      </Container>
    </PageWrapper>
  );
}
