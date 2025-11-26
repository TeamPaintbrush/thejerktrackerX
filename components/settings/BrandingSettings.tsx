/**
 * Business Branding Settings Component
 * Professional+ Tier Exclusive Feature
 * Allows users to upload logo, set brand colors, and customize QR code appearance
 */

'use client';

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import NextImage from 'next/image';
import { Upload, Save, Eye, AlertCircle, Crown, Palette, Image as ImageIcon, Check } from 'lucide-react';
import { canUploadLogo, canCustomizeColors, canCustomizeQRStyle, canEmbedLogoInQR, getUpgradeMessage } from '@/lib/tierFeatures';
import type { SubscriptionTier } from '@/lib/tierFeatures';
import BackButton from './BackButton';

interface BrandingSettingsProps {
  userTier: SubscriptionTier;
  currentBranding?: {
    logo?: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    brandName?: string;
    customQRStyle?: {
      foregroundColor?: string;
      backgroundColor?: string;
      logoEmbedded?: boolean;
      style?: 'squares' | 'dots' | 'rounded';
    };
  };
  onSave: (branding: any) => Promise<void>;
}

const Container = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f5f5f4;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Section = styled.div<{ $locked?: boolean }>`
  margin-bottom: 2rem;
  opacity: ${props => props.$locked ? 0.5 : 1};
  pointer-events: ${props => props.$locked ? 'none' : 'auto'};
  position: relative;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #44403c;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LockedOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  cursor: not-allowed;
`;

const UpgradePrompt = styled.div`
  background: linear-gradient(135deg, #ed773420 0%, #de5d2020 100%);
  border: 2px solid #ed7734;
  border-radius: 0.75rem;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UpgradeText = styled.div`
  flex: 1;
`;

const UpgradeTitle = styled.div`
  font-weight: 600;
  color: #1c1917;
  margin-bottom: 0.25rem;
`;

const UpgradeDescription = styled.div`
  font-size: 0.875rem;
  color: #57534e;
`;

const UpgradeButton = styled.button`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const LogoUploadArea = styled.div`
  border: 2px dashed #d6d3d1;
  border-radius: 0.75rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafaf9;

  &:hover {
    border-color: #ed7734;
    background: #fef7ee;
  }
`;

const LogoPreview = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 0.75rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #e7e5e4;
  position: relative;
`;

const PreviewImage = styled(NextImage)`
  object-fit: contain;
`;

const LogoPlaceholder = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a8a29e;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ColorPickerGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ColorPickerField = styled.div``;

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
  height: 40px;
  border: 2px solid #e7e5e4;
  border-radius: 0.5rem;
  cursor: pointer;
  padding: 0;
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 0.375rem;
  }
`;

const TextInput = styled.input`
  flex: 1;
  padding: 0.625rem 1rem;
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

const QRStyleOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const QRStyleOption = styled.button<{ $active?: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.$active ? '#ed7734' : '#e7e5e4'};
  border-radius: 0.75rem;
  background: ${props => props.$active ? '#fef7ee' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  font-weight: 500;
  color: ${props => props.$active ? '#ed7734' : '#57534e'};

  &:hover {
    border-color: #ed7734;
    background: #fef7ee;
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 1rem;
  border: 2px solid #e7e5e4;
  border-radius: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ed7734;
    background: #fef7ee;
  }
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const CheckboxLabel = styled.div`
  flex: 1;
`;

const CheckboxTitle = styled.div`
  font-weight: 500;
  color: #1c1917;
  margin-bottom: 0.25rem;
`;

const CheckboxDescription = styled.div`
  font-size: 0.875rem;
  color: #78716c;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #f5f5f4;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(237, 119, 52, 0.3);
    }
  `}

  ${props => props.$variant === 'secondary' && `
    background: white;
    color: #44403c;
    border: 2px solid #e7e5e4;

    &:hover {
      border-color: #ed7734;
      color: #ed7734;
    }
  `}
`;

const SuccessMessage = styled.div`
  background: #22c55e20;
  border: 2px solid #22c55e;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #15803d;
  margin-bottom: 1.5rem;
`;

export default function BrandingSettings({ userTier, currentBranding, onSave }: BrandingSettingsProps) {
  const [branding, setBranding] = useState(currentBranding || {});
  const [logoPreview, setLogoPreview] = useState<string | null>(currentBranding?.logoUrl || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasLogoAccess = canUploadLogo(userTier);
  const hasColorAccess = canCustomizeColors(userTier);
  const hasQRStyleAccess = canCustomizeQRStyle(userTier);
  const hasLogoOnQRAccess = canEmbedLogoInQR(userTier);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
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
      await onSave(branding);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save branding:', error);
      alert('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <BackButton />
      <Header>
        <Title>
          <Palette size={24} />
          Business Branding
        </Title>
        <PremiumBadge>
          <Crown size={14} />
          Professional+
        </PremiumBadge>
      </Header>

      {saved && (
        <SuccessMessage>
          <Check size={20} />
          <span>Branding settings saved successfully!</span>
        </SuccessMessage>
      )}

      {/* Logo Upload */}
      <Section $locked={!hasLogoAccess}>
        <SectionTitle>
          <ImageIcon size={20} />
          Brand Logo
        </SectionTitle>
        
        {!hasLogoAccess && (
          <LockedOverlay>
            <UpgradePrompt>
              <Crown size={24} color="#ed7734" />
              <UpgradeText>
                <UpgradeTitle>Professional Feature</UpgradeTitle>
                <UpgradeDescription>{getUpgradeMessage('Custom Logo')}</UpgradeDescription>
              </UpgradeText>
              <UpgradeButton>Upgrade Now</UpgradeButton>
            </UpgradePrompt>
          </LockedOverlay>
        )}

        <LogoUploadArea onClick={() => fileInputRef.current?.click()}>
          {logoPreview ? (
            <LogoPreview>
              <PreviewImage
                src={logoPreview}
                alt="Brand logo preview"
                fill
                sizes="120px"
                unoptimized
              />
            </LogoPreview>
          ) : (
            <LogoPlaceholder>
              <Upload size={40} />
            </LogoPlaceholder>
          )}
          
          <p style={{ margin: 0, color: '#78716c', fontSize: '0.875rem' }}>
            {logoPreview ? 'Click to change logo' : 'Click to upload logo'}
          </p>
          <p style={{ margin: '0.5rem 0 0', color: '#a8a29e', fontSize: '0.75rem' }}>
            PNG, JPG up to 2MB • Recommended: 500x500px
          </p>
        </LogoUploadArea>
        
        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
        />
      </Section>

      {/* Brand Colors */}
      <Section $locked={!hasColorAccess}>
        <SectionTitle>
          <Palette size={20} />
          Brand Colors
        </SectionTitle>

        {!hasColorAccess && (
          <LockedOverlay>
            <UpgradePrompt>
              <Crown size={24} color="#ed7734" />
              <UpgradeText>
                <UpgradeTitle>Professional Feature</UpgradeTitle>
                <UpgradeDescription>{getUpgradeMessage('Custom Colors')}</UpgradeDescription>
              </UpgradeText>
              <UpgradeButton>Upgrade Now</UpgradeButton>
            </UpgradePrompt>
          </LockedOverlay>
        )}

        <ColorPickerGroup>
          <ColorPickerField>
            <Label>Primary Color</Label>
            <ColorInputWrapper>
              <ColorInput
                type="color"
                value={branding.primaryColor || '#ed7734'}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
              />
              <TextInput
                type="text"
                value={branding.primaryColor || '#ed7734'}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                placeholder="#ed7734"
              />
            </ColorInputWrapper>
          </ColorPickerField>

          <ColorPickerField>
            <Label>Secondary Color</Label>
            <ColorInputWrapper>
              <ColorInput
                type="color"
                value={branding.secondaryColor || '#de5d20'}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
              />
              <TextInput
                type="text"
                value={branding.secondaryColor || '#de5d20'}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                placeholder="#de5d20"
              />
            </ColorInputWrapper>
          </ColorPickerField>
        </ColorPickerGroup>
      </Section>

      {/* Custom QR Code Style */}
      <Section $locked={!hasQRStyleAccess}>
        <SectionTitle>
          Custom QR Code Style
        </SectionTitle>

        {!hasQRStyleAccess && (
          <LockedOverlay>
            <UpgradePrompt>
              <Crown size={24} color="#ed7734" />
              <UpgradeText>
                <UpgradeTitle>Professional Feature</UpgradeTitle>
                <UpgradeDescription>{getUpgradeMessage('Custom QR Styling')}</UpgradeDescription>
              </UpgradeText>
              <UpgradeButton>Upgrade Now</UpgradeButton>
            </UpgradePrompt>
          </LockedOverlay>
        )}

        <Label style={{ marginBottom: '1rem' }}>QR Code Pattern Style</Label>
        <QRStyleOptions>
          {['squares', 'dots', 'rounded'].map(style => (
            <QRStyleOption
              key={style}
              $active={branding.customQRStyle?.style === style}
              onClick={() => setBranding({
                ...branding,
                customQRStyle: { ...branding.customQRStyle, style: style as any }
              })}
            >
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </QRStyleOption>
          ))}
        </QRStyleOptions>

        <div style={{ marginTop: '1.5rem' }}>
          <ColorPickerGroup>
            <ColorPickerField>
              <Label>QR Foreground Color</Label>
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
                  onChange={(e) => setBranding({
                    ...branding,
                    customQRStyle: { ...branding.customQRStyle, foregroundColor: e.target.value }
                  })}
                  placeholder="#000000"
                />
              </ColorInputWrapper>
            </ColorPickerField>

            <ColorPickerField>
              <Label>QR Background Color</Label>
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
                  onChange={(e) => setBranding({
                    ...branding,
                    customQRStyle: { ...branding.customQRStyle, backgroundColor: e.target.value }
                  })}
                  placeholder="#ffffff"
                />
              </ColorInputWrapper>
            </ColorPickerField>
          </ColorPickerGroup>
        </div>

        {/* Logo on QR Code */}
        {hasLogoOnQRAccess && logoPreview && (
          <div style={{ marginTop: '1.5rem' }}>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                checked={branding.customQRStyle?.logoEmbedded || false}
                onChange={(e) => setBranding({
                  ...branding,
                  customQRStyle: { ...branding.customQRStyle, logoEmbedded: e.target.checked }
                })}
              />
              <CheckboxLabel>
                <CheckboxTitle>Embed Logo in QR Code</CheckboxTitle>
                <CheckboxDescription>
                  Places your brand logo in the center of all generated QR codes
                </CheckboxDescription>
              </CheckboxLabel>
            </CheckboxWrapper>
          </div>
        )}
      </Section>

      <ButtonGroup>
        <Button $variant="secondary">
          <Eye size={18} />
          Preview
        </Button>
        <Button $variant="primary" onClick={handleSave} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Branding'}
        </Button>
      </ButtonGroup>
    </Container>
  );
}
