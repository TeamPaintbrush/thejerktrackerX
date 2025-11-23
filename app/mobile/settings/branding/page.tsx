/**
 * Business Branding Settings Page (Mobile)
 * Professional+ Tier Exclusive Feature
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { ArrowLeft, Crown, Save, Upload, Palette, Eye } from 'lucide-react';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';
import { MobileAuth } from '@/mobile-android/shared/services/mobileAuth';
import { hasBrandingAccess, canUploadLogo, canCustomizeColors, canCustomizeQRStyle } from '@/lib/tierFeatures';
import type { SubscriptionTier } from '@/lib/tierFeatures';

const Container = styled.div`
  padding: 0.5rem 1rem 5rem;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
  min-height: calc(100vh - 60px);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border: 2px solid #e7e5e4;
  border-radius: 0.5rem;
  cursor: pointer;
  color: #44403c;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  flex: 1;
`;

const PremiumBadge = styled.div`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1c1917;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UpgradePrompt = styled.div`
  background: linear-gradient(135deg, #ed773420 0%, #de5d2020 100%);
  border: 2px solid #ed7734;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  margin: 2rem 0;
`;

const UpgradeTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 0.5rem;
`;

const UpgradeText = styled.p`
  color: #57534e;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const UpgradeButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
`;

const LogoUploadButton = styled.button`
  width: 100%;
  padding: 2rem;
  border: 2px dashed #d6d3d1;
  border-radius: 0.75rem;
  background: #fafaf9;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    border-color: #ed7734;
    background: #fef7ee;
  }
`;

const LogoPreview = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e7e5e4;
  margin-bottom: 1rem;
  position: relative;
`;

const LogoImage = styled(Image)`
  object-fit: contain;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ColorPicker = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #44403c;
  margin-bottom: 0.5rem;
`;

const ColorInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ColorInput = styled.input`
  width: 60px;
  height: 50px;
  border: 2px solid #e7e5e4;
  border-radius: 0.5rem;
  cursor: pointer;
  padding: 0;
`;

const TextInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e7e5e4;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-family: monospace;
  color: #44403c;

  &:focus {
    outline: none;
    border-color: #ed7734;
  }
`;

const SaveButton = styled.button`
  position: fixed;
  bottom: 80px;
  left: 1rem;
  right: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 50;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FeatureList = styled.ul`
  text-align: left;
  margin: 1.5rem 0;
  padding-left: 1.5rem;
  color: #57534e;
  line-height: 1.8;

  li {
    margin-bottom: 0.5rem;
  }
`;

export default function MobileBrandingSettings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [branding, setBranding] = useState<any>({
    primaryColor: '#ed7734',
    secondaryColor: '#de5d20',
    customQRStyle: {
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
    }
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = MobileAuth.getCurrentUser();
    if (!currentUser) {
      router.push('/mobile/auth/signin');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const userTier: SubscriptionTier = user?.subscription?.tier || 'free';
  const hasAccess = hasBrandingAccess(userTier);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      setBranding({ ...branding, logo: result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to local storage for mobile
      localStorage.setItem('userBranding', JSON.stringify(branding));
      
      // In production, also sync to backend
      // await fetch('/api/user/branding', {
      //   method: 'POST',
      //   body: JSON.stringify(branding)
      // });

      alert('Branding settings saved successfully!');
    } catch (error) {
      console.error('Failed to save branding:', error);
      alert('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  if (!hasAccess) {
    return (
      <MobileLayout>
        <Container>
          <Header>
            <BackButton onClick={() => router.push('/mobile/settings')}>
              <ArrowLeft size={20} />
            </BackButton>
            <Title>Branding</Title>
          </Header>

          <UpgradePrompt>
            <Crown size={48} color="#ed7734" style={{ margin: '0 auto 1rem' }} />
            
            <UpgradeTitle>Professional Feature</UpgradeTitle>
            
            <UpgradeText>
              Business Branding is exclusive to Professional and Enterprise tier customers.
            </UpgradeText>

            <FeatureList>
              <li>✅ Upload custom brand logo</li>
              <li>✅ Customize brand colors</li>
              <li>✅ Styled QR codes</li>
              <li>✅ Logo on QR codes</li>
              <li>✅ Branded reports</li>
              <li>✅ Unlimited locations</li>
            </FeatureList>

            <UpgradeButton onClick={() => router.push('/pricing')}>
              <Crown size={20} />
              Upgrade to Professional
            </UpgradeButton>
          </UpgradePrompt>
        </Container>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <Container>
        <Header>
          <BackButton onClick={() => router.push('/mobile/settings')}>
            <ArrowLeft size={20} />
          </BackButton>
          <Title>Branding</Title>
          <PremiumBadge>
            <Crown size={12} />
            Pro
          </PremiumBadge>
        </Header>

        {/* Logo Upload */}
        <Card>
          <SectionTitle>
            <Upload size={20} />
            Brand Logo
          </SectionTitle>
          
          {logoPreview && (
            <LogoPreview>
              <LogoImage
                src={logoPreview}
                alt="Brand logo"
                fill
                sizes="100px"
                unoptimized
              />
            </LogoPreview>
          )}

          <LogoUploadButton onClick={() => fileInputRef.current?.click()}>
            <Upload size={32} color="#78716c" />
            <span style={{ color: '#78716c', fontSize: '0.875rem' }}>
              {logoPreview ? 'Change Logo' : 'Upload Logo'}
            </span>
            <span style={{ color: '#a8a29e', fontSize: '0.75rem' }}>
              PNG, JPG up to 2MB
            </span>
          </LogoUploadButton>
          
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
          />
        </Card>

        {/* Brand Colors */}
        <Card>
          <SectionTitle>
            <Palette size={20} />
            Brand Colors
          </SectionTitle>

          <ColorPicker>
            <Label>Primary Color</Label>
            <ColorInputWrapper>
              <ColorInput
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              />
              <TextInput
                type="text"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                placeholder="#ed7734"
              />
            </ColorInputWrapper>
          </ColorPicker>

          <ColorPicker>
            <Label>Secondary Color</Label>
            <ColorInputWrapper>
              <ColorInput
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
              />
              <TextInput
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                placeholder="#de5d20"
              />
            </ColorInputWrapper>
          </ColorPicker>
        </Card>

        {/* QR Code Colors */}
        <Card>
          <SectionTitle>QR Code Style</SectionTitle>

          <ColorPicker>
            <Label>QR Foreground</Label>
            <ColorInputWrapper>
              <ColorInput
                type="color"
                value={branding.customQRStyle?.foregroundColor || '#000000'}
                onChange={(e) => setBranding({
                  ...branding,
                  customQRStyle: { ...branding.customQRStyle, foregroundColor: e.target.value }
                })}
              />
              <TextInput
                type="text"
                value={branding.customQRStyle?.foregroundColor || '#000000'}
                placeholder="#000000"
              />
            </ColorInputWrapper>
          </ColorPicker>

          <ColorPicker>
            <Label>QR Background</Label>
            <ColorInputWrapper>
              <ColorInput
                type="color"
                value={branding.customQRStyle?.backgroundColor || '#ffffff'}
                onChange={(e) => setBranding({
                  ...branding,
                  customQRStyle: { ...branding.customQRStyle, backgroundColor: e.target.value }
                })}
              />
              <TextInput
                type="text"
                value={branding.customQRStyle?.backgroundColor || '#ffffff'}
                placeholder="#ffffff"
              />
            </ColorInputWrapper>
          </ColorPicker>
        </Card>

        <SaveButton onClick={handleSave} disabled={saving}>
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Branding'}
        </SaveButton>
      </Container>
    </MobileLayout>
  );
}
