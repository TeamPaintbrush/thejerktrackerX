'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowRight, QrCode, BarChart3, Shield, Zap, Star, Users, Clock } from 'lucide-react';
import { Container, Button, Heading, Text, Flex, Grid, Card } from '../styles/components';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding: 6rem 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
`;

const HeroContent = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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

const FeatureIcon = styled.div<{ color: string }>`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, ${props => props.color}20 0%, ${props => props.color}10 100%);
  border: 1px solid ${props => props.color}30;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
  margin-bottom: 1.5rem;
`;

const StatsSection = styled.section`
  background: #ffffff;
  padding: 4rem 0;
  border-top: 1px solid #e7e5e4;
`;

const StatCard = styled(Card)`
  text-align: center;
  padding: 2rem;
  border: none;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;

  &:nth-child(2) {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  }

  &:nth-child(3) {
    background: linear-gradient(135deg, #44403c 0%, #292524 100%);
  }
`;

const StatNumber = styled.div`
  font-size: 2.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const CtaSection = styled.section`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  padding: 6rem 0;
  text-align: center;
  color: white;
`;

const Footer = styled.footer`
  background: #1c1917;
  color: white;
  padding: 3rem 0 2rem;
  text-align: center;
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

const FeatureGrid = styled(Grid)`
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 3rem;
`;

export default function HomePage() {
  const features = [
    {
      icon: <QrCode size={32} />,
      title: 'Smart QR Tracking',
      description: 'Generate unique QR codes for each order that customers can scan to track their pickup status in real-time.',
      color: '#ed7734'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into pickup times, customer patterns, and operational efficiency to optimize your restaurant.',
      color: '#22c55e'
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime ensures your restaurant operations never miss a beat.',
      color: '#3b82f6'
    },
    {
      icon: <Zap size={32} />,
      title: 'Lightning Fast',
      description: 'Get up and running in under 5 minutes with our streamlined setup process and intuitive interface.',
      color: '#f59e0b'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navigation */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Navigation>
          <NavContainer>
            <Logo>
              <LogoIcon>JT</LogoIcon>
              <div>
                <Heading as="h1" size="xl" mb="0" weight="bold" color="#1c1917">TheJERKTracker</Heading>
                <Text size="sm" color="#78716c">Restaurant Solutions</Text>
              </div>
            </Logo>
            
            <Flex gap="1rem" align="center">
              <Link href="/pricing">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost">Pricing</Button>
                </motion.div>
              </Link>
              <Link href="/admin">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="primary">
                    Launch Dashboard
                    <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                  </Button>
                </motion.div>
              </Link>
            </Flex>
          </NavContainer>
        </Navigation>
      </motion.div>

      {/* Hero Section */}
      <HeroSection>
        <Container>
          <HeroContent>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Badge>
                  <Star size={16} />
                  Trusted by 2,000+ Restaurants
                </Badge>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Heading as="h1" size="6xl" weight="bold" mb="1.5rem" color="#1c1917" style={{ lineHeight: 1.1 }}>
                  Modern Pickup Tracking
                  <br />
                  <GradientText>for Restaurants</GradientText>
                </Heading>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Text size="xl" mb="3rem" color="#57534e" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
                  Transform your restaurant&apos;s pickup experience with smart QR code tracking, 
                  real-time updates, and powerful analytics that boost customer satisfaction.
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Flex justify="center" gap="1rem" style={{ marginBottom: '3rem' }}>
                  <Link href="/admin">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="primary">
                        Start Free Trial
                        <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/pricing">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" variant="outline">
                        View Pricing
                      </Button>
                    </motion.div>
                  </Link>
                </Flex>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Flex justify="center" align="center" gap="2rem" style={{ fontSize: '0.875rem', color: '#78716c' }}>
                  <Flex align="center" gap="0.5rem">
                    <Shield size={16} />
                    <span>No setup fees</span>
                  </Flex>
                  <Flex align="center" gap="0.5rem">
                    <Users size={16} />
                    <span>Free support</span>
                  </Flex>
                  <Flex align="center" gap="0.5rem">
                    <Clock size={16} />
                    <span>5-minute setup</span>
                  </Flex>
                </Flex>
              </motion.div>
            </motion.div>
          </HeroContent>
        </Container>
      </HeroSection>

      {/* Features Section */}
      <section style={{ padding: '6rem 0' }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <Heading as="h2" size="4xl" weight="bold" mb="1rem" color="#1c1917">
              Everything You Need to Succeed
            </Heading>
            <Text size="xl" color="#57534e" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Powerful features designed specifically for modern restaurants who want to 
              deliver exceptional pickup experiences.
            </Text>
          </motion.div>

          <FeatureGrid>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <Card padding="2rem">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FeatureIcon color={feature.color}>
                      {feature.icon}
                    </FeatureIcon>
                  </motion.div>
                  <Heading as="h3" size="xl" weight="bold" mb="1rem" color="#1c1917">
                    {feature.title}
                  </Heading>
                  <Text size="base" color="#57534e" style={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Text>
                </Card>
              </motion.div>
            ))}
          </FeatureGrid>
        </Container>
      </section>

      {/* Stats Section */}
      <StatsSection>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <Heading as="h2" size="3xl" weight="bold" mb="1rem" color="#1c1917">
              Trusted by Restaurants Worldwide
            </Heading>
            <Text size="lg" color="#57534e">
              Join thousands of restaurants already improving their pickup experience
            </Text>
          </motion.div>

          <Grid columns={3} gap="2rem">
            {[
              { number: "2,000+", label: "Active Restaurants" },
              { number: "50k+", label: "Orders Tracked Daily" },
              { number: "98%", label: "Customer Satisfaction" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
              >
                <StatCard>
                  <StatNumber>{stat.number}</StatNumber>
                  <Text size="lg" color="rgba(255,255,255,0.9)">{stat.label}</Text>
                </StatCard>
              </motion.div>
            ))}
          </Grid>
        </Container>
      </StatsSection>

      {/* CTA Section */}
      <CtaSection>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center' }}
          >
            <Heading as="h2" size="4xl" weight="bold" mb="1rem" color="white">
              Ready to Transform Your Pickup Experience?
            </Heading>
            <Text size="xl" mb="3rem" color="rgba(255,255,255,0.9)" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
              Join thousands of restaurants already using TheJERKTracker to delight customers 
              and streamline operations.
            </Text>
            
            <Flex justify="center" gap="1rem">
              <Link href="/admin">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="secondary">
                    Start Free Trial
                    <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/pricing">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
                    View Pricing
                  </Button>
                </motion.div>
              </Link>
            </Flex>
          </motion.div>
        </Container>
      </CtaSection>

      {/* Footer */}
      <Footer>
        <Container>
          <Text size="sm" color="rgba(255,255,255,0.7)">
            © 2025 TheJERKTracker. Built with ❤️ for restaurants.
          </Text>
        </Container>
      </Footer>
    </motion.div>
  );
}