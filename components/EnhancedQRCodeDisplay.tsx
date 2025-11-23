/**
 * Enhanced QR Code Display with Professional Tier Branding Support
 * Supports custom logo embedding, colors, and styling for Professional+ users
 */

'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Image from 'next/image';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, CheckCircle, Printer, Maximize2 } from 'lucide-react';
import { canEmbedLogoInQR, canCustomizeQRStyle } from '@/lib/tierFeatures';
import type { SubscriptionTier } from '@/lib/tierFeatures';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
  subtitle?: string;
  userTier?: SubscriptionTier;
  branding?: {
    logo?: string;
    primaryColor?: string;
    customQRStyle?: {
      foregroundColor?: string;
      backgroundColor?: string;
      logoEmbedded?: boolean;
      style?: 'squares' | 'dots' | 'rounded';
    };
  };
  showActions?: boolean;
  className?: string;
}

const Container = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1c1917;
  margin: 0 0 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #78716c;
  margin: 0 0 1.5rem;
`;

const QRWrapper = styled.div`
  display: inline-block;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 0 0 1px #e7e5e4;
  margin-bottom: 1.5rem;
  position: relative;
`;

const BrandedQRWrapper = styled(QRWrapper)<{ $borderColor?: string }>`
  box-shadow: 0 0 0 3px ${props => props.$borderColor || '#ed7734'};
`;

const LogoOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20%;
  height: 20%;
  background: white;
  border-radius: 0.5rem;
  padding: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const LogoImage = styled(Image)`
  object-fit: contain;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: 2px solid #e7e5e4;
  border-radius: 0.5rem;
  background: white;
  color: #44403c;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ed7734;
    color: #ed7734;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SuccessButton = styled(ActionButton)`
  border-color: #22c55e;
  color: #22c55e;

  &:hover {
    border-color: #22c55e;
    color: #22c55e;
  }
`;

const ValueDisplay = styled.div`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #fafaf9;
  border-radius: 0.5rem;
  font-family: monospace;
  font-size: 0.75rem;
  color: #57534e;
  word-break: break-all;
`;

export default function EnhancedQRCodeDisplay({
  value,
  size = 256,
  title,
  subtitle,
  userTier = 'free',
  branding,
  showActions = true,
  className
}: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const hasQRStyleAccess = canCustomizeQRStyle(userTier);
  const hasLogoAccess = canEmbedLogoInQR(userTier);

  // Apply branding if Professional+ tier
  const qrFgColor = hasQRStyleAccess && branding?.customQRStyle?.foregroundColor
    ? branding.customQRStyle.foregroundColor
    : '#000000';
  
  const qrBgColor = hasQRStyleAccess && branding?.customQRStyle?.backgroundColor
    ? branding.customQRStyle.backgroundColor
    : '#ffffff';

  const showLogoInQR = hasLogoAccess && 
    branding?.customQRStyle?.logoEmbedded && 
    branding?.logo;

  const borderColor = hasQRStyleAccess ? branding?.primaryColor : undefined;

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const imgData = canvas.toDataURL('image/png');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${title || 'Print'}</title>
          <style>
            body {
              margin: 0;
              padding: 2rem;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              font-family: system-ui, -apple-system, sans-serif;
            }
            h1 {
              margin-bottom: 0.5rem;
              color: #1c1917;
            }
            p {
              color: #78716c;
              margin-bottom: 2rem;
            }
            img {
              border: 3px solid ${borderColor || '#e7e5e4'};
              border-radius: 1rem;
              padding: 1rem;
            }
            @media print {
              @page {
                margin: 2cm;
              }
            }
          </style>
        </head>
        <body>
          ${title ? `<h1>${title}</h1>` : ''}
          ${subtitle ? `<p>${subtitle}</p>` : ''}
          <img src="${imgData}" alt="QR Code" />
          <p style="margin-top: 2rem; font-family: monospace; font-size: 0.875rem;">${value}</p>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const WrapperComponent = borderColor ? BrandedQRWrapper : QRWrapper;

  return (
    <Container className={className}>
      {title && <Title>{title}</Title>}
      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      <WrapperComponent $borderColor={borderColor}>
        <QRCodeCanvas
          value={value}
          size={size}
          level="H" // High error correction for logo embedding
          fgColor={qrFgColor}
          bgColor={qrBgColor}
          includeMargin={false}
        />
        
        {showLogoInQR && branding?.logo && (
          <LogoOverlay>
            <LogoImage
              src={branding.logo}
              alt="Brand logo"
              fill
              sizes="80px"
              unoptimized
            />
          </LogoOverlay>
        )}
      </WrapperComponent>

      {showActions && (
        <ActionButtons>
          <ActionButton onClick={handleDownload}>
            <Download size={16} />
            Download
          </ActionButton>
          
          {copied ? (
            <SuccessButton>
              <CheckCircle size={16} />
              Copied!
            </SuccessButton>
          ) : (
            <ActionButton onClick={handleCopy}>
              <Copy size={16} />
              Copy URL
            </ActionButton>
          )}
          
          <ActionButton onClick={handlePrint}>
            <Printer size={16} />
            Print
          </ActionButton>
        </ActionButtons>
      )}

      <ValueDisplay>{value}</ValueDisplay>
    </Container>
  );
}
