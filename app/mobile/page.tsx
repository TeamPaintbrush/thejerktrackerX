'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ArrowRight, QrCode, BarChart3, Shield, Zap, Star, Users, Clock, LogOut, DollarSign, Headphones, Timer } from 'lucide-react';
import { Container, Button, Heading, Text, Flex, Grid, Card } from '../../styles/components';
import { getDefaultRoute } from '@/lib/roles';

const HeroSection = styled.section`
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding: 6rem 0;
  min-height: 80vh;
  display: flex;
  align-items: center;
  
  /* 📱 Mobile adjustments */
  @media (max-width: 768px) {
    padding: 3rem 0 1.5rem 0;
    min-height: 60vh;
  }
  
  @media (orientation: portrait) and (max-width: 768px) {
    padding: 3rem 1rem 1.5rem 1rem;
    min-height: 50vh;
  }
`;

const HeroContent = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  
  /* 📱 Mobile adjustments */
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 1rem;
  }
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
  padding-top: env(safe-area-inset-top, 0px);
  display: none; /* Hide navigation on mobile */
`;

const NavContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  flex-wrap: nowrap;
  
  /* 📱 Mobile navigation adjustments - keep horizontal */
  @media (max-width: 768px) {
    height: 60px;
    padding: 0 1rem;
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    height: 50px;
    padding: 0 0.5rem;
    gap: 0.25rem;
  }
`;

const Logo = styled(Flex)`
  align-items: center;
  gap: 1rem;
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: nowrap;
  
  /* Keep horizontal on all screen sizes */
  @media (max-width: 768px) {
    gap: 0.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.25rem;
  }
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

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const FooterLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: #ed7734;
    text-decoration: underline;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8125rem;
  }
`;

const FooterDivider = styled.span`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875rem;
  
  @media (max-width: 480px) {
    display: none;
  }
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

export default function MobileAppHomepage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Debug logging and force clear authentication state
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    console.log('[MOBILE PAGE] Component mounted');
    console.log('[MOBILE PAGE] Session status:', status);
    console.log('[MOBILE PAGE] Session data:', session);
    console.log('[MOBILE PAGE] Current pathname:', window.location.pathname);
    console.log('[MOBILE PAGE] LocalStorage mobile_auth_user:', localStorage.getItem('mobile_auth_user'));
    localStorage.removeItem('mobile_auth_user');
    localStorage.removeItem('mobile_auth_token');
    console.log('[MOBILE PAGE] Cleared all mobile auth data');
  }, [session, status]);

  // Redirect authenticated users to their role-based dashboard (DISABLED - Let users see main page)
  // useEffect(() => {
  //   if (status === 'authenticated' && session?.user?.role) {
  //     const userRole = session.user.role as 'admin' | 'manager' | 'driver' | 'customer' | 'user';
  //     const defaultRoute = getDefaultRoute(userRole);
  //     
  //     // Only redirect if not already on the home page by choice
  //     if (defaultRoute !== '/') {
  //       router.push(defaultRoute);
  //     }
  //   }
  // }, [session, status, router]);

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
                <Heading as="h1" $size="xl" $mb="0" $weight="bold" $color="#1c1917">TheJERKTracker</Heading>
                <Text $size="sm" $color="#78716c">Restaurant Solutions</Text>
              </div>
            </Logo>
            
            <NavLinks>
              {status === 'authenticated' ? (
                <>
                  <Link href={session?.user?.role ? getDefaultRoute(session.user.role as 'admin' | 'manager' | 'driver' | 'customer') : '/admin'}>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button $variant="outline">
                        Dashboard
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      $variant="primary"
                      onClick={async () => {
                        // Clear any stored auth data
                        if (typeof window !== 'undefined') {
                          localStorage.removeItem('mobile_auth_user');
                        }
                        // Sign out using NextAuth and redirect to home
                        await signOut({ 
                          callbackUrl: '/',
                          redirect: true 
                        });
                      }}
                    >
                      <LogOut size={16} style={{ marginRight: '8px' }} />
                      Sign Out
                    </Button>
                  </motion.div>
                </>
              ) : (
                <Link href="/auth/signin">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button $variant="primary">
                      Launch Dashboard
                      <ArrowRight size={16} style={{ marginLeft: '8px' }} />
                    </Button>
                  </motion.div>
                </Link>
              )}
            </NavLinks>
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
                  Trusted by 2,100+ Restaurants
                </Badge>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Heading as="h1" $size="6xl" $weight="bold" $mb="1.5rem" $color="#1c1917" style={{ lineHeight: 1.1 }}>
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
                <Text $size="xl" $mb="3rem" $color="#57534e" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
                  Transform your restaurant&apos;s pickup experience with smart QR code tracking, 
                  real-time updates, and powerful analytics that boost customer satisfaction.
                </Text>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <Flex $justify="center" $gap="1rem" style={{ marginBottom: '3rem' }}>
                  <Link href="/auth/signin">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button $size="lg" $variant="primary">
                        Start Free Trial
                        <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/mobile/how-it-works">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button $size="lg" $variant="ghost">
                        How it Works
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/mobile/pricing">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button $size="lg" $variant="outline">
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
                <Flex $justify="center" $align="center" $gap="3rem" style={{ fontSize: '0.95rem', color: '#57534e', flexWrap: 'wrap' }}>
                  <Flex $align="center" $gap="0.75rem">
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                    }}>
                      <DollarSign size={24} color="white" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontWeight: '600' }}>No setup fees</span>
                  </Flex>
                  <Flex $align="center" $gap="0.75rem">
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                    }}>
                      <Headphones size={24} color="white" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontWeight: '600' }}>Free support</span>
                  </Flex>
                  <Flex $align="center" $gap="0.75rem">
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)'
                    }}>
                      <Timer size={24} color="white" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontWeight: '600' }}>5-minute setup</span>
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
            <Heading as="h2" $size="4xl" $weight="bold" $mb="1rem" $color="#1c1917">
              Everything You Need to Succeed
            </Heading>
            <Text $size="xl" $color="#57534e" style={{ maxWidth: '600px', margin: '0 auto' }}>
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
                <Card $padding="2rem">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FeatureIcon color={feature.color}>
                      {feature.icon}
                    </FeatureIcon>
                  </motion.div>
                  <Heading as="h3" $size="xl" $weight="bold" $mb="1rem" $color="#1c1917">
                    {feature.title}
                  </Heading>
                  <Text $size="base" $color="#57534e" style={{ lineHeight: 1.6 }}>
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
            <Heading as="h2" $size="3xl" $weight="bold" $mb="1rem" $color="#1c1917">
              Trusted by Restaurants Worldwide
            </Heading>
            <Text $size="lg" $color="#57534e">
              Join thousands of restaurants already improving their pickup experience
            </Text>
          </motion.div>

          <Grid $columns={3} $gap="2rem">
            {[
              { number: "2,100+", label: "Active Restaurants" },
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
                  <Text $size="lg" $color="rgba(255,255,255,0.9)">{stat.label}</Text>
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
            <Heading as="h2" $size="4xl" $weight="bold" $mb="1rem" $color="white">
              Ready to Transform Your Pickup Experience?
            </Heading>
            <Text $size="xl" $mb="3rem" $color="rgba(255,255,255,0.9)" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
              Join thousands of restaurants already using TheJERKTracker to delight customers 
              and streamline operations.
            </Text>
            
            <Flex $justify="center" $gap="1rem">
              <Link href="/mobile/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button $size="lg" $variant="secondary">
                    Start Free Trial
                    <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/mobile/pricing">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button $size="lg" $variant="outline" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>
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
          <FooterContent>
            <FooterLinks>
              <FooterLink href="https://paintbrushmarketing.net/jerktracker/" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </FooterLink>
              <FooterDivider>•</FooterDivider>
              <FooterLink href="https://paintbrushmarketing.net/jerktracker/" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </FooterLink>
              <FooterDivider>•</FooterDivider>
              <FooterLink href="https://paintbrushmarketing.net/jerktracker/" target="_blank" rel="noopener noreferrer">
                Support
              </FooterLink>
            </FooterLinks>
            <Text $size="sm" $color="rgba(255,255,255,0.7)" style={{ marginTop: '1rem' }}>
              © 2025 TheJERKTracker. Built with ❤️ for restaurants.
            </Text>
          </FooterContent>
        </Container>
      </Footer>
    </motion.div>
  );
}