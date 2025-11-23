// 📚 Mobile How It Works Component
// Educational content explaining the platform

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  QrCode, 
  Smartphone, 
  CheckCircle, 
  Clock, 
  User, 
  Package,
  ArrowRight,
  Bell,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface MobileHowItWorksProps {}

// Styled Components
const HowItWorksContainer = styled.div`
  padding: 1rem;
  padding-bottom: 120px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.5;
`;

const ProcessFlow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FlowStep = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1rem;
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FlowIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const FlowContent = styled.div`
  flex: 1;
`;

const FlowTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const FlowDesc = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1.4;
`;

const FlowArrow = styled(ArrowRight)`
  color: #ed7734;
  width: 20px;
  height: 20px;
  transform: rotate(90deg);
  margin: 0.5rem auto;
`;

const StepsSection = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  text-align: center;
`;

const StepCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(237, 119, 52, 0.1);
  position: relative;
  overflow: hidden;
`;

const StepNumber = styled.div`
  position: absolute;
  top: -12px;
  right: -12px;
  background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 4px 8px rgba(237, 119, 52, 0.3);
`;

const StepIcon = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(237, 119, 52, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #ed7734;
`;

const StepTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
  text-align: center;
`;

const StepDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
  text-align: center;
`;

const BenefitsSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const BenefitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const BenefitCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
`;

const BenefitIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(237, 119, 52, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ed7734;
`;

const BenefitTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const BenefitDesc = styled.p`
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  width: 100%;
`;

const MobileHowItWorks: React.FC<MobileHowItWorksProps> = () => {
  const router = useRouter();

  const processFlow = [
    {
      icon: <User size={24} />,
      title: 'Customer Orders',
      description: 'Place food order through platform'
    },
    {
      icon: <QrCode size={24} />,
      title: 'QR Code Generated',
      description: 'Unique tracking code created'
    },
    {
      icon: <Package size={24} />,
      title: 'Driver Picks Up',
      description: 'Order collected from restaurant'
    },
    {
      icon: <MapPin size={24} />,
      title: 'Real-time Tracking',
      description: 'Live updates on delivery status'
    },
    {
      icon: <CheckCircle size={24} />,
      title: 'Delivery Complete',
      description: 'Customer receives order'
    }
  ];

  const steps = [
    {
      number: 1,
      icon: <QrCode size={32} />,
      title: 'Generate QR Code',
      description: 'Create a unique QR code for each order. Customers can scan it to track their delivery in real-time with detailed status updates.'
    },
    {
      number: 2,
      icon: <Smartphone size={32} />,
      title: 'Scan & Track',
      description: 'Customers scan the QR code with their smartphone camera. No app download required - works directly in the browser.'
    },
    {
      number: 3,
      icon: <Bell size={32} />,
      title: 'Live Updates',
      description: 'Receive instant notifications at every step. Order confirmed, picked up, out for delivery, and delivered - all in real-time.'
    },
    {
      number: 4,
      icon: <CheckCircle size={32} />,
      title: 'Confirm Delivery',
      description: 'Mark orders as delivered with photo proof and customer signatures. Complete audit trail for every delivery.'
    }
  ];

  const benefits = [
    {
      icon: <Clock size={24} />,
      title: 'Save Time',
      description: 'Reduce customer service calls'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Increase Efficiency',
      description: 'Streamline operations'
    },
    {
      icon: <User size={24} />,
      title: 'Happy Customers',
      description: 'Better experience'
    },
    {
      icon: <Package size={24} />,
      title: 'Track Everything',
      description: 'Complete visibility'
    }
  ];

  const handleGetStarted = () => {
    router.push('/mobile/pricing');
  };

  return (
    <HowItWorksContainer>
      <Header>
        <Title>How It Works</Title>
        <Subtitle>
          Simple, fast, and efficient food delivery tracking with QR codes
        </Subtitle>
      </Header>

      {/* Quick Process Flow */}
      <ProcessFlow>
        {processFlow.map((step, index) => (
          <React.Fragment key={index}>
            <FlowStep
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <FlowIcon>{step.icon}</FlowIcon>
              <FlowContent>
                <FlowTitle>{step.title}</FlowTitle>
                <FlowDesc>{step.description}</FlowDesc>
              </FlowContent>
            </FlowStep>
            {index < processFlow.length - 1 && <FlowArrow />}
          </React.Fragment>
        ))}
      </ProcessFlow>

      {/* Detailed Steps */}
      <StepsSection>
        <SectionTitle>Step-by-Step Guide</SectionTitle>
        {steps.map((step, index) => (
          <StepCard
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <StepNumber>{step.number}</StepNumber>
            <StepIcon>{step.icon}</StepIcon>
            <StepTitle>{step.title}</StepTitle>
            <StepDescription>{step.description}</StepDescription>
          </StepCard>
        ))}
      </StepsSection>

      {/* Benefits */}
      <BenefitsSection>
        <SectionTitle>Key Benefits</SectionTitle>
        <BenefitGrid>
          {benefits.map((benefit, index) => (
            <BenefitCard key={index}>
              <BenefitIcon>{benefit.icon}</BenefitIcon>
              <BenefitTitle>{benefit.title}</BenefitTitle>
              <BenefitDesc>{benefit.description}</BenefitDesc>
            </BenefitCard>
          ))}
        </BenefitGrid>
      </BenefitsSection>

      {/* CTA */}
      <CTASection>
        <CTATitle>Ready to Get Started?</CTATitle>
        <CTAText>
          Join hundreds of restaurants already using The JERK Tracker
        </CTAText>
        <CTAButton
          onClick={handleGetStarted}
          whileTap={{ scale: 0.95 }}
        >
          View Pricing Plans
        </CTAButton>
      </CTASection>
    </HowItWorksContainer>
  );
};

export default MobileHowItWorks;
