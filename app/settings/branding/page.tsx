/**
 * Business Branding Settings Page (Web)
 * Professional+ Tier Exclusive Feature
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { ArrowLeft, Crown, AlertCircle } from 'lucide-react';
import BrandingSettings from '@/components/settings/BrandingSettings';
import EnhancedQRCodeDisplay from '@/components/EnhancedQRCodeDisplay';
import { hasBrandingAccess } from '@/lib/tierFeatures';
import type { SubscriptionTier } from '@/lib/tierFeatures';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  padding: 2rem;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #78716c;
  background: none;
  border: none;
  font-size: 0.875rem;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem;
  margin-left: -0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: #ed7734;
  }
`;

const Title = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #78716c;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const AccessDenied = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const AccessDeniedIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #fef7ee 0%, #fed7aa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AccessDeniedTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 1rem;
`;

const AccessDeniedText = styled.p`
  font-size: 1rem;
  color: #78716c;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const UpgradeButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(237, 119, 52, 0.3);
  }
`;

const PreviewSection = styled.div`
  position: sticky;
  top: 2rem;
`;

const PreviewTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #44403c;
  margin-bottom: 1rem;
`;

const Loading = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #78716c;
`;

export default function BrandingSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [branding, setBranding] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock user tier - in production, get from session/database
  const userTier: SubscriptionTier = (session?.user as any)?.subscription?.tier || 'free';

  useEffect(() => {
    // Load current branding settings
    const loadBranding = async () => {
      try {
        // In production, fetch from API/database
        // const response = await fetch('/api/user/branding');
        // const data = await response.json();
        
        // Mock data for development
        setBranding({
          logo: null,
          logoUrl: null,
          primaryColor: '#ed7734',
          secondaryColor: '#de5d20',
          brandName: 'My Restaurant',
          customQRStyle: {
            foregroundColor: '#000000',
            backgroundColor: '#ffffff',
            logoEmbedded: false,
            style: 'squares'
          }
        });
      } catch (error) {
        console.error('Failed to load branding:', error);
      } finally {
        setLoading(false);
      }
    };

    if (status === 'authenticated') {
      loadBranding();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleSaveBranding = async (newBranding: any) => {
    try {
      // In production, save to API/database
      // await fetch('/api/user/branding', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newBranding)
      // });

      setBranding(newBranding);
      console.log('Branding saved:', newBranding);
    } catch (error) {
      console.error('Failed to save branding:', error);
      throw error;
    }
  };

  if (loading || status === 'loading') {
    return (
      <PageWrapper>
        <Container>
          <Loading>Loading branding settings...</Loading>
        </Container>
      </PageWrapper>
    );
  }

  // Check if user has Professional+ access
  if (!hasBrandingAccess(userTier)) {
    return (
      <PageWrapper>
        <Container>
          <Header>
            <BackButton onClick={() => router.push('/settings')}>
              <ArrowLeft size={16} />
              Back to Settings
            </BackButton>
          </Header>

          <AccessDenied>
            <AccessDeniedIcon>
              <Crown size={40} color="#ed7734" />
            </AccessDeniedIcon>
            
            <AccessDeniedTitle>
              Professional Feature Required
            </AccessDeniedTitle>
            
            <AccessDeniedText>
              Business Branding is an exclusive feature for Professional and Enterprise tier customers.
              Upgrade your plan to customize your brand logo, colors, and QR code styling.
            </AccessDeniedText>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontWeight: 600, color: '#1c1917', marginBottom: '1rem' }}>
                What you&apos;ll get with Professional:
              </h4>
              <ul style={{ textAlign: 'left', display: 'inline-block', color: '#57534e' }}>
                <li>✅ Upload custom brand logo</li>
                <li>✅ Customize brand colors</li>
                <li>✅ Styled QR codes with your brand</li>
                <li>✅ Logo embedded in QR codes</li>
                <li>✅ Branded reports and analytics</li>
                <li>✅ Unlimited locations and orders</li>
                <li>✅ Priority support</li>
              </ul>
            </div>

            <UpgradeButton onClick={() => router.push('/pricing')}>
              <Crown size={20} />
              Upgrade to Professional
            </UpgradeButton>
          </AccessDenied>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container>
        <Header>
          <BackButton onClick={() => router.push('/settings')}>
            <ArrowLeft size={16} />
            Back to Settings
          </BackButton>
          
          <Title>Business Branding</Title>
          <Subtitle>
            Customize your brand identity with logo, colors, and styled QR codes
          </Subtitle>
        </Header>

        <Grid>
          <BrandingSettings
            userTier={userTier}
            currentBranding={branding}
            onSave={handleSaveBranding}
          />

          <PreviewSection>
            <PreviewTitle>QR Code Preview</PreviewTitle>
            <EnhancedQRCodeDisplay
              value="https://jerktrackerx.com/track/sample-order-123"
              size={240}
              title="Sample Order QR"
              subtitle="Order #12345"
              userTier={userTier}
              branding={branding}
              showActions={false}
            />
          </PreviewSection>
        </Grid>
      </Container>
    </PageWrapper>
  );
}
