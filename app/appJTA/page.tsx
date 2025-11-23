'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

const HeroSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: right;
  align-items: flex-end;
  
  @media (max-width: 968px) {
    text-align: center;
    align-items: center;
  }
`;

const Badge = styled.div`
  background: #fed7aa;
  color: #c2410c;
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  width: fit-content;
`;

const Heading = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  color: #1c1917;
  line-height: 1.2;
  margin: 0;
  
  @media (max-width: 1024px) {
    font-size: 3rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: block;
`;

const Description = styled.p`
  font-size: 1.125rem;
  color: #57534e;
  line-height: 1.7;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.a`
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &.primary {
    background: #ed7734;
    color: white;
    border: 2px solid #ed7734;
    
    &:hover {
      background: #de5d20;
      border-color: #de5d20;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(237, 119, 52, 0.3);
    }
  }
  
  &.secondary {
    background: white;
    color: #ed7734;
    border: 2px solid #ed7734;
    
    &:hover {
      background: #fef7ee;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(237, 119, 52, 0.2);
    }
  }
`;

const FeaturesList = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  justify-content: flex-end;
  
  @media (max-width: 968px) {
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #57534e;
  font-size: 0.875rem;
  
  svg {
    color: #ed7734;
    flex-shrink: 0;
  }
`;

const ImageSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  order: -1;
  
  @media (max-width: 968px) {
    order: 0;
  }
`;

const PhoneImage = styled.img`
  max-width: 100%;
  height: auto;
  filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15));
`;

export default function AppJTAPage() {
  return (
    <PageWrapper>
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HeroSection>
            <ImageSection>
              <PhoneImage
                src="/images/JERK-Tracker-image.png"
                alt="The JERK Tracker Mobile App"
              />
            </ImageSection>
            
            <ContentSection>
              <Badge>
                <Star size={16} fill="currentColor" />
                Trusted by 2,000+ Restaurants
              </Badge>
              
              <Heading>
                Modern Pickup Tracking
                <GradientText>for Restaurants</GradientText>
              </Heading>
              
              <Description>
                Transform your restaurant&apos;s pickup experience with smart QR code tracking, real-time updates, and powerful analytics that boost customer satisfaction.
              </Description>
              
              <ButtonGroup>
                <Button href="/privacy-policy" className="primary">
                  Privacy Policy
                </Button>
                <Button href="/terms" className="secondary">
                  Terms
                </Button>
              </ButtonGroup>
              
              <FeaturesList>
                <Feature>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  No setup fees
                </Feature>
                
                <Feature>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Free support
                </Feature>
                
                <Feature>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  5-minute setup
                </Feature>
              </FeaturesList>
            </ContentSection>
          </HeroSection>
        </motion.div>
      </Container>
    </PageWrapper>
  );
}
