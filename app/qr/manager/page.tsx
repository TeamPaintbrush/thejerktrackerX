'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { ArrowLeft, QrCode, Download, Plus, Trash2 } from 'lucide-react';
import { LoadingOverlay } from '@/components/Loading';
import QRCodeLib from 'qrcode';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast';
import { Toaster } from 'react-hot-toast';

const Container = styled.div`
  min-height: 100vh;
  background: #fafaf9;
  padding: 2rem;
`;

const ContentCard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e7e5e4;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e7e5e4;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderLeft = styled.div``;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f5f5f4;
  border: none;
  border-radius: 0.5rem;
  color: #44403c;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1c1917;
  margin: 0 0 0.5rem 0;
`;

const Description = styled.p`
  color: #78716c;
  margin: 0;
`;

const GenerateButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const QRGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const QRCard = styled.div`
  padding: 1.5rem;
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #ed7734;
    box-shadow: 0 2px 8px rgba(237, 119, 52, 0.1);
  }
`;

const QRCodeDisplay = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: white;
  border: 2px solid #e7e5e4;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  svg {
    width: 80%;
    height: 80%;
    color: #1c1917;
  }
`;

const QRInfo = styled.div`
  margin-bottom: 1rem;
`;

const QRLabel = styled.div`
  font-weight: 600;
  color: #1c1917;
  margin-bottom: 0.25rem;
`;

const QRMeta = styled.div`
  font-size: 0.875rem;
  color: #78716c;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $variant: 'download' | 'delete' }>`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e7e5e4;
  background: ${props => props.$variant === 'delete' ? '#fee2e2' : 'white'};
  color: ${props => props.$variant === 'delete' ? '#dc2626' : '#44403c'};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$variant === 'delete' ? '#fecaca' : '#f5f5f4'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #78716c;

  svg {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    opacity: 0.3;
  }

  h3 {
    color: #1c1917;
    margin-bottom: 0.5rem;
  }
`;

interface QRCodeType {
  id: string;
  label: string;
  type: string;
  createdAt: string;
  qrDataUrl?: string;
  data: string;
}

export default function QRManagerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodes, setQrCodes] = useState<QRCodeType[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'manager' && session?.user?.role !== 'admin') {
      router.push('/manager');
      return;
    }
  }, [status, session, router]);

  const generateQRDataUrl = async (data: string): Promise<string> => {
    try {
      return await QRCodeLib.toDataURL(data, {
        width: 400,
        margin: 2,
        color: {
          dark: '#1c1917',
          light: '#ffffff'
        }
      });
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    const toastId = showLoading('Generating QR code...');
    try {
      const newId = Date.now().toString();
      const tableNumber = qrCodes.length + 1;
      const businessId = (session?.user as any)?.businessId || session?.user?.id || 'default-business';
      
      const qrData = JSON.stringify({
        type: 'table',
        tableId: newId,
        tableNumber: tableNumber,
        businessId: businessId,
        createdAt: new Date().toISOString()
      });

      const dataUrl = await generateQRDataUrl(qrData);

      const newCode: QRCodeType = {
        id: newId,
        label: `Table ${tableNumber}`,
        type: 'table',
        createdAt: new Date().toISOString(),
        qrDataUrl: dataUrl,
        data: qrData
      };
      
      setQrCodes([...qrCodes, newCode]);
      dismissToast(toastId);
      showSuccess(`QR code for Table ${tableNumber} generated successfully`);
    } catch (error) {
      dismissToast(toastId);
      showError('Failed to generate QR code');
      console.error('Generate error:', error);
    }
  };

  const handleDelete = (id: string, label: string) => {
    if (confirm(`Are you sure you want to delete the QR code for ${label}?`)) {
      setQrCodes(prev => prev.filter(code => code.id !== id));
      showSuccess(`${label} QR code deleted`);
    }
  };

  const handleDownload = async (code: QRCodeType) => {
    try {
      if (!code.qrDataUrl) {
        showError('QR code image not available');
        return;
      }

      const link = document.createElement('a');
      link.download = `${code.label.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
      link.href = code.qrDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showSuccess(`${code.label} QR code downloaded`);
    } catch (error) {
      showError('Failed to download QR code');
      console.error('Download error:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Loading QR codes...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  return (
    <Container>
      <Toaster />
      <ContentCard>
        <Header>
          <HeaderLeft>
            <BackButton onClick={() => router.push('/manager')}>
              <ArrowLeft />
              <span>Back to Dashboard</span>
            </BackButton>
            
            <Title>QR Code Manager</Title>
            <Description>
              Generate and manage QR codes for tables and locations
            </Description>
          </HeaderLeft>
          
          <GenerateButton onClick={handleGenerate}>
            <Plus />
            Generate QR
          </GenerateButton>
        </Header>

        {qrCodes.length === 0 ? (
          <EmptyState>
            <QrCode />
            <h3>No QR Codes</h3>
            <p>Generate your first QR code to get started</p>
          </EmptyState>
        ) : (
          <QRGrid>
            {qrCodes.map(code => (
              <QRCard key={code.id}>
                <QRCodeDisplay>
                  {code.qrDataUrl ? (
                    <img src={code.qrDataUrl} alt={code.label} />
                  ) : (
                    <QrCode />
                  )}
                </QRCodeDisplay>
                <QRInfo>
                  <QRLabel>{code.label}</QRLabel>
                  <QRMeta>
                    Created: {new Date(code.createdAt).toLocaleDateString()}
                  </QRMeta>
                </QRInfo>
                <ButtonGroup>
                  <ActionButton 
                    $variant="download" 
                    onClick={() => handleDownload(code)}
                  >
                    <Download />
                    Download
                  </ActionButton>
                  <ActionButton 
                    $variant="delete" 
                    onClick={() => handleDelete(code.id, code.label)}
                  >
                    <Trash2 />
                    Delete
                  </ActionButton>
                </ButtonGroup>
              </QRCard>
            ))}
          </QRGrid>
        )}
      </ContentCard>
    </Container>
  );
}
