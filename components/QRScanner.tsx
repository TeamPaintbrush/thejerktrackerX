'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Flashlight, FlashlightOff } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    opacity: 0.75;
  }
  50% {
    opacity: 1;
  }
`;

const ScannerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 50;
  display: flex;
  flex-direction: column;
`;

const ScannerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: black;
  color: white;
`;

const ScannerTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: none;
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px white;
  }
`;

const ScannerArea = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReadyToScan = styled.div`
  text-align: center;
  color: white;
  padding: 2rem;
`;

const CameraIcon = styled(Camera)`
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem auto;
  color: #9ca3af;
`;

const ReadyTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: white;
`;

const ReadyText = styled.p`
  color: #d1d5db;
  margin-bottom: 1.5rem;
`;

const StartButton = styled.button`
  background: ${({ theme }) => theme.colors.primary[600]};
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primary[700]};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[500]};
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  color: white;
  padding: 2rem;
`;

const ErrorBox = styled.div`
  background: #dc2626;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: 1rem;

  p:first-child {
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }

  p:last-child {
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    margin: 0;
  }
`;

const ManualButton = styled.button`
  background: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ScanOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ScanFrame = styled.div`
  position: relative;
  width: 16rem;
  height: 16rem;
`;

const FrameCorner = styled.div<{ $position: 'tl' | 'tr' | 'bl' | 'br' }>`
  position: absolute;
  width: 2rem;
  height: 2rem;
  border: 4px solid ${({ theme }) => theme.colors.primary[500]};
  
  ${({ $position }) => {
    switch ($position) {
      case 'tl':
        return 'top: 0; left: 0; border-right: none; border-bottom: none;';
      case 'tr':
        return 'top: 0; right: 0; border-left: none; border-bottom: none;';
      case 'bl':
        return 'bottom: 0; left: 0; border-right: none; border-top: none;';
      case 'br':
        return 'bottom: 0; right: 0; border-left: none; border-top: none;';
    }
  }}
`;

const ScanLine = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;

  &::after {
    content: '';
    width: 100%;
    height: 2px;
    background: ${({ theme }) => theme.colors.primary[500]};
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const Controls = styled.div`
  padding: 1rem;
  background: black;
  color: white;
`;

const ControlButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FlashButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $active }) => ($active ? '#d97706' : '#374151')};
  color: white;

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px white;
  }
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;

  ${({ $variant }) =>
    $variant === 'primary'
      ? `
        background: #2563eb;
        &:hover { background: #1d4ed8; }
        &:focus { box-shadow: 0 0 0 2px #3b82f6; }
      `
      : `
        background: #dc2626;
        &:hover { background: #b91c1c; }
        &:focus { box-shadow: 0 0 0 2px #ef4444; }
      `}

  &:focus {
    outline: none;
  }
`;

const ControlsText = styled.p`
  text-align: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: #9ca3af;
  margin: 0;
`;

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startScanning = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);

        // Check if device has flash
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        setHasFlash('torch' in capabilities);
      }
    } catch (err) {
      setError('Camera access denied or not available. Please check your permissions.');
      console.error('Camera error:', err);
    }
  }, []);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setFlashOn(false);
  }, []);

  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !flashOn } as any]
        });
        setFlashOn(!flashOn);
      } catch (err) {
        console.error('Flash toggle error:', err);
      }
    }
  }, [flashOn]);

  const handleManualInput = () => {
    const input = prompt('Enter QR code data or order ID:');
    if (input) {
      onScan(input);
    }
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  return (
    <ScannerOverlay>
      {/* Header */}
      <ScannerHeader>
        <ScannerTitle>Scan QR Code</ScannerTitle>
        <CloseButton
          onClick={handleClose}
          aria-label="Close scanner"
        >
          <X size={24} />
        </CloseButton>
      </ScannerHeader>

      {/* Scanner Area */}
      <ScannerArea>
        {!isScanning && !error && (
          <ReadyToScan>
            <CameraIcon />
            <ReadyTitle>Ready to Scan</ReadyTitle>
            <ReadyText>Position the QR code within the camera view</ReadyText>
            <StartButton onClick={startScanning}>
              Start Camera
            </StartButton>
          </ReadyToScan>
        )}

        {error && (
          <ErrorContainer>
            <ErrorBox>
              <p>Camera Error</p>
              <p>{error}</p>
            </ErrorBox>
            <ManualButton onClick={handleManualInput}>
              Enter Manually
            </ManualButton>
          </ErrorContainer>
        )}

        {isScanning && (
          <VideoContainer>
            <Video
              ref={videoRef}
              autoPlay
              playsInline
            />
            
            {/* Scanning Overlay */}
            <ScanOverlay>
              <ScanFrame>
                <FrameCorner $position="tl" />
                <FrameCorner $position="tr" />
                <FrameCorner $position="bl" />
                <FrameCorner $position="br" />
                <ScanLine />
              </ScanFrame>
            </ScanOverlay>
          </VideoContainer>
        )}
      </ScannerArea>

      {/* Controls */}
      {isScanning && (
        <Controls>
          <ControlButtons>
            {hasFlash && (
              <FlashButton
                onClick={toggleFlash}
                $active={flashOn}
                aria-label={flashOn ? 'Turn off flash' : 'Turn on flash'}
              >
                {flashOn ? (
                  <FlashlightOff size={24} />
                ) : (
                  <Flashlight size={24} />
                )}
              </FlashButton>
            )}
            <ActionButton
              $variant="primary"
              onClick={handleManualInput}
            >
              Enter Manually
            </ActionButton>
            <ActionButton
              $variant="danger"
              onClick={stopScanning}
            >
              Stop Camera
            </ActionButton>
          </ControlButtons>
          <ControlsText>
            Point your camera at a QR code to scan it
          </ControlsText>
        </Controls>
      )}
    </ScannerOverlay>
  );
};

export default QRScanner;