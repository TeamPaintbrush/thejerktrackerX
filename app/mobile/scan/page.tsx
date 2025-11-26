'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Camera, AlertCircle, Settings as SettingsIcon, X } from 'lucide-react';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';
import qrScannerService from '@/services/QRScannerService';
import { haptics } from '@/services/MobileInteractionService';

const Container = styled.div`
  padding: 1rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #78716c;
  margin: 0;
  font-size: 0.875rem;
`;

const ScanButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ScanIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 48px;
    height: 48px;
  }
`;

const ScanText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
`;

const InfoSection = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-top: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1c1917;
  margin: 0 0 1rem 0;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const InfoItem = styled.li`
  padding: 0.75rem 0;
  color: #78716c;
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  &::before {
    content: "•";
    color: #ed7734;
    font-weight: 700;
    font-size: 1.25rem;
  }
`;

const PermissionAlert = styled.div`
  background: #fef3c7;
  border: 2px solid #fbbf24;
  border-radius: 1rem;
  padding: 1rem;
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;

  svg {
    flex-shrink: 0;
    color: #d97706;
    width: 24px;
    height: 24px;
  }
`;

const PermissionText = styled.div`
  flex: 1;
`;

const PermissionTitle = styled.div`
  font-weight: 600;
  color: #92400e;
  margin-bottom: 0.25rem;
`;

const PermissionDesc = styled.div`
  font-size: 0.875rem;
  color: #78716c;
  margin-bottom: 0.75rem;
`;

const SettingsButton = styled.button`
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:active {
    transform: scale(0.95);
  }
`;

const ErrorAlert = styled.div`
  background: #fee2e2;
  border: 2px solid #ef4444;
  border-radius: 1rem;
  padding: 1rem;
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;

  svg {
    color: #dc2626;
    width: 24px;
    height: 24px;
  }
`;

const ErrorText = styled.div`
  flex: 1;
  color: #991b1b;
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0.25rem;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export default function MobileQRScannerPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    if (!qrScannerService.isSupported()) {
      setError('QR Scanner is only available on mobile devices');
      return;
    }

    const status = await qrScannerService.getPermissionStatus();
    setPermissionStatus(status);
  };

  const handleScan = async () => {
    setError(null);
    
    if (!qrScannerService.isSupported()) {
      setError('QR Scanner not supported on this device');
      await haptics.error();
      return;
    }

    try {
      setIsScanning(true);
      await haptics.light();

      const success = await qrScannerService.scanAndNavigate(router);

      if (success) {
        await haptics.qrScanned();
      } else {
        await haptics.error();
        setError('Invalid QR code or scan cancelled');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to scan QR code. Please try again.');
      await haptics.error();
    } finally {
      setIsScanning(false);
    }
  };

  const handleOpenSettings = async () => {
    await haptics.buttonTap();
    await qrScannerService.openSettings();
  };

  return (
    <MobileLayout>
      <Container>
        <Header>
          <Title>Scan QR Code</Title>
          <Subtitle>Scan order QR codes to track deliveries</Subtitle>
        </Header>

        <ScanButton 
          onClick={handleScan} 
          disabled={isScanning || permissionStatus === 'denied'}
        >
          <ScanIcon>
            <Camera />
          </ScanIcon>
          <ScanText>
            {isScanning ? 'Scanning...' : 'Tap to Scan QR Code'}
          </ScanText>
        </ScanButton>

        {permissionStatus === 'denied' && (
          <PermissionAlert>
            <AlertCircle />
            <PermissionText>
              <PermissionTitle>Camera Permission Required</PermissionTitle>
              <PermissionDesc>
                Please enable camera access in your device settings to scan QR codes
              </PermissionDesc>
              <SettingsButton onClick={handleOpenSettings}>
                <SettingsIcon size={16} />
                Open Settings
              </SettingsButton>
            </PermissionText>
          </PermissionAlert>
        )}

        {error && (
          <ErrorAlert>
            <AlertCircle />
            <ErrorText>{error}</ErrorText>
            <CloseButton onClick={() => setError(null)}>
              <X />
            </CloseButton>
          </ErrorAlert>
        )}

        <InfoSection>
          <InfoTitle>How to Use</InfoTitle>
          <InfoList>
            <InfoItem>Tap the "Scan QR Code" button above</InfoItem>
            <InfoItem>Position the QR code within the camera frame</InfoItem>
            <InfoItem>Wait for the code to be recognized</InfoItem>
            <InfoItem>You'll be automatically taken to the order tracking page</InfoItem>
          </InfoList>
        </InfoSection>

        <InfoSection>
          <InfoTitle>What You Can Scan</InfoTitle>
          <InfoList>
            <InfoItem>Order receipts with QR codes</InfoItem>
            <InfoItem>Order tracking links</InfoItem>
            <InfoItem>Shared order QR codes</InfoItem>
          </InfoList>
        </InfoSection>
      </Container>
    </MobileLayout>
  );
}
