'use client';

import React from 'react';
import Link from 'next/link';
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
  Home
} from 'lucide-react';
import { Container, Button, Heading, Text, Flex, Grid, Card } from '../../styles/components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%);
  padding: 2rem 0;
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 4rem 0;
  background: white;
  margin-bottom: 4rem;
  border-bottom: 1px solid #e7e5e4;
`;

const HeroTitle = styled(Heading)`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
`;

const HeroSubtitle = styled(Text)`
  max-width: 600px;
  margin: 0 auto 2rem;
`;

const StepCard = styled(Card)`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #ed7734;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(237, 119, 52, 0.2);
  }
`;

const StepNumber = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.125rem;
`;

const StepIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ed773410 0%, #de5d2010 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #ed7734;
`;

const StepTitle = styled(Heading)`
  text-align: center;
  margin-bottom: 1rem;
`;

const StepDescription = styled(Text)`
  text-align: center;
  line-height: 1.6;
`;

const ProcessFlow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 3rem 0;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FlowStep = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #f5f5f4;
`;

const FlowIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #ed7734;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FlowArrow = styled(ArrowRight)`
  color: #ed7734;
  
  @media (max-width: 768px) {
    transform: rotate(90deg);
  }
`;

const FeatureGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 4rem 0;
`;

const FeatureCard = styled(Card)`
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  border: 1px solid #e7e5e4;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`;

const BackButton = styled(Button)`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 2rem;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(237, 119, 52, 0.3);
  }
`;

const ExampleSection = styled.div`
  background: #f8fafc;
  padding: 3rem 0;
  margin: 4rem 0;
  border-radius: 1rem;
`;

const ExampleCard = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e7e5e4;
`;

const MockForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MockInput = styled.div`
  padding: 0.75rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
`;

const MockButton = styled.div`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  padding: 0.75rem;
  border-radius: 0.5rem;
  text-align: center;
  font-weight: 500;
`;

export default function HowItWorksPage() {
  return (
    <PageContainer>
      {/* Hero Section */}
      <HeroSection>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HeroTitle as="h1" size="4xl" weight="bold">
              📱 Driver &quot;Picked Up&quot; Process
            </HeroTitle>
            <HeroTitle as="h2" size="3xl" weight="bold">
              Complete QR Code Workflow
            </HeroTitle>
            <HeroSubtitle size="lg" color="#78716c">
              A seamless, contactless pickup system that streamlines order management 
              and delivery coordination through QR code technology.
            </HeroSubtitle>
          </motion.div>
        </Container>
      </HeroSection>

      <Container>
        {/* Process Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Heading as="h3" size="2xl" weight="bold" mb="2rem" style={{ textAlign: 'center' }}>
            How It Works - Step by Step
          </Heading>
          
          <ProcessFlow>
            <FlowStep>
              <FlowIcon><Package size={20} /></FlowIcon>
              <Text size="sm" weight="medium">Order Created</Text>
            </FlowStep>
            <FlowArrow size={20} />
            <FlowStep>
              <FlowIcon><QrCode size={20} /></FlowIcon>
              <Text size="sm" weight="medium">QR Generated</Text>
            </FlowStep>
            <FlowArrow size={20} />
            <FlowStep>
              <FlowIcon><Smartphone size={20} /></FlowIcon>
              <Text size="sm" weight="medium">Driver Scans</Text>
            </FlowStep>
            <FlowArrow size={20} />
            <FlowStep>
              <FlowIcon><User size={20} /></FlowIcon>
              <Text size="sm" weight="medium">Check-in Form</Text>
            </FlowStep>
            <FlowArrow size={20} />
            <FlowStep>
              <FlowIcon><CheckCircle size={20} /></FlowIcon>
              <Text size="sm" weight="medium">Pickup Confirmed</Text>
            </FlowStep>
          </ProcessFlow>
        </motion.div>

        {/* Detailed Steps */}
        <Grid gap="2rem" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', margin: '4rem 0' }}>
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <StepCard>
              <StepNumber>1</StepNumber>
              <StepIcon>
                <Package size={40} />
              </StepIcon>
              <StepTitle as="h4" size="xl" weight="semibold">
                📋 Restaurant Creates Order
              </StepTitle>
              <StepDescription size="base" color="#78716c">
                Restaurant staff creates an order through the admin dashboard. They can choose 
                between preset menu items (like Jerk Chicken Combo, Rice & Peas) or create 
                custom orders. The system automatically generates a unique order ID and QR code.
              </StepDescription>
            </StepCard>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <StepCard>
              <StepNumber>2</StepNumber>
              <StepIcon>
                <QrCode size={40} />
              </StepIcon>
              <StepTitle as="h4" size="xl" weight="semibold">
                🚚 Driver Receives Order & Scans QR Code
              </StepTitle>
              <StepDescription size="base" color="#78716c">
                Driver arrives at the restaurant to pick up the order. They scan the QR code 
                (displayed on receipt, screen, or printout) using their phone camera or QR 
                scanner app. The QR code instantly opens the order page in their browser.
              </StepDescription>
            </StepCard>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <StepCard>
              <StepNumber>3</StepNumber>
              <StepIcon>
                <Smartphone size={40} />
              </StepIcon>
              <StepTitle as="h4" size="xl" weight="semibold">
                📱 Driver Check-in Page Opens
              </StepTitle>
              <StepDescription size="base" color="#78716c">
                The QR code opens a mobile-optimized page showing order details (customer name, 
                order contents, total price) and a Driver Check-in Form. The driver can verify 
                they have the correct order before proceeding.
              </StepDescription>
            </StepCard>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <StepCard>
              <StepNumber>4</StepNumber>
              <StepIcon>
                <User size={40} />
              </StepIcon>
              <StepTitle as="h4" size="xl" weight="semibold">
                ✅ Driver Confirms Pickup
              </StepTitle>
              <StepDescription size="base" color="#78716c">
                Driver fills out a simple form with their name and delivery company 
                (UberEats, DoorDash, Grubhub, etc.), then clicks &quot;Confirm Pickup&quot;. 
                The system instantly updates the order status and records pickup details.
              </StepDescription>
            </StepCard>
          </motion.div>

          {/* Step 5 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <StepCard>
              <StepNumber>5</StepNumber>
              <StepIcon>
                <CheckCircle size={40} />
              </StepIcon>
              <StepTitle as="h4" size="xl" weight="semibold">
                📊 Admin Dashboard Updates
              </StepTitle>
              <StepDescription size="base" color="#78716c">
                Restaurant staff immediately sees the order status change to &quot;Picked Up&quot; 
                in their admin dashboard. The system shows driver details, pickup time, 
                and complete order timeline for full tracking visibility.
              </StepDescription>
            </StepCard>
          </motion.div>
        </Grid>

        {/* Example Section */}
        <ExampleSection>
          <Container>
            <Heading as="h3" size="2xl" weight="bold" mb="2rem" style={{ textAlign: 'center' }}>
              Driver Check-in Form Example
            </Heading>
            <Text size="base" color="#78716c" mb="2rem" style={{ textAlign: 'center' }}>
              This is what drivers see when they scan the QR code:
            </Text>
            
            <ExampleCard>
              <Heading as="h4" size="lg" weight="semibold" mb="1rem" style={{ textAlign: 'center' }}>
                Order #12345
              </Heading>
              <Flex align="center" gap="0.5rem" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                <User size={16} />
                <Text size="sm" color="#78716c">John Smith</Text>
                <Clock size={16} style={{ marginLeft: '1rem' }} />
                <Text size="sm" color="#78716c">2:30 PM</Text>
              </Flex>
              
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <Text size="sm" weight="medium" mb="0.5rem">Order Details:</Text>
                <Text size="sm" color="#78716c">
                  2x Jerk Chicken Combo - $29.98<br />
                  1x Rice & Peas - $4.99<br />
                  1x Sweet Plantains - $3.99<br />
                  <strong>Total: $38.96</strong>
                </Text>
              </div>

              <Heading as="h5" size="base" weight="semibold" mb="1rem">
                Driver Check-in
              </Heading>
              
              <MockForm>
                <MockInput>Driver Name: John Driver</MockInput>
                <MockInput>Delivery Company: UberEats</MockInput>
                <MockButton>✅ Confirm Pickup</MockButton>
              </MockForm>
            </ExampleCard>
          </Container>
        </ExampleSection>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Heading as="h3" size="2xl" weight="bold" mb="2rem" style={{ textAlign: 'center' }}>
            🎯 Key Benefits
          </Heading>
          
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>
                <QrCode size={24} />
              </FeatureIcon>
              <Heading as="h4" size="lg" weight="semibold" mb="1rem">
                Contactless Process
              </Heading>
              <Text size="sm" color="#78716c">
                No physical paperwork or face-to-face interaction required. 
                Everything happens through QR code scanning and mobile forms.
              </Text>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <Clock size={24} />
              </FeatureIcon>
              <Heading as="h4" size="lg" weight="semibold" mb="1rem">
                Real-Time Updates
              </Heading>
              <Text size="sm" color="#78716c">
                Order status changes instantly when drivers confirm pickup. 
                Restaurant staff see updates immediately in their dashboard.
              </Text>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <Smartphone size={24} />
              </FeatureIcon>
              <Heading as="h4" size="lg" weight="semibold" mb="1rem">
                Mobile Optimized
              </Heading>
              <Text size="sm" color="#78716c">
                Designed specifically for mobile devices. Fast loading, 
                touch-friendly interface, and works with any QR scanner app.
              </Text>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>
                <CheckCircle size={24} />
              </FeatureIcon>
              <Heading as="h4" size="lg" weight="semibold" mb="1rem">
                Complete Tracking
              </Heading>
              <Text size="sm" color="#78716c">
                Full audit trail with driver names, companies, and pickup times. 
                Perfect for delivery management and customer service.
              </Text>
            </FeatureCard>
          </FeatureGrid>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          style={{ textAlign: 'center', marginTop: '4rem' }}
        >
          <Link href="/" passHref>
            <BackButton as="a">
              <Home size={20} />
              Back to Home
            </BackButton>
          </Link>
        </motion.div>
      </Container>
    </PageContainer>
  );
}