'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import OrderForm from '@/components/OrderForm';
import { ArrowLeft, Download, Share2, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { buildTrackingUrl } from '@/lib/url';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  padding: 2rem;
`;

const ContentCard = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

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

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #f5f5f4;
  border: none;
  border-radius: 0.5rem;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1c1917;
  margin: 0 0 0.5rem 0;
  text-align: center;
`;

const ModalSubtitle = styled.p`
  color: #78716c;
  text-align: center;
  margin: 0 0 1.5rem 0;
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 2px solid #e7e5e4;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const OrderInfo = styled.div`
  background: #fafaf9;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e7e5e4;

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: #78716c;
  font-size: 0.875rem;
`;

const InfoValue = styled.span`
  color: #1c1917;
  font-weight: 600;
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const DownloadButton = styled(ActionButton)`
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
  }
`;

const ShareButton = styled(ActionButton)`
  background: #f5f5f4;
  color: #44403c;

  &:hover {
    background: #e7e5e4;
  }
`;

const DoneButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.75rem;

  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

export default function CreateOrderPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const getTrackingUrl = (orderId: string) => buildTrackingUrl(`/qr-tracking?order=${orderId}`);
  
  // Business ID comes from the logged-in user's account
  // In production, this would be session.user.businessId
  const businessId = session?.user?.id || 'BUS-001';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleOrderCreated = (order: any) => {
    // Show QR code modal instead of redirecting
    setCreatedOrder(order);
    setShowQRModal(true);
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector('#qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `order-${createdOrder.orderNumber}-qr.png`;
      link.href = url;
      link.click();
    }
  };

  const handleShareQR = async () => {
    const trackingUrl = getTrackingUrl(createdOrder.id);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Order #${createdOrder.orderNumber}`,
          text: `Track your order: ${createdOrder.customerName}`,
          url: trackingUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(trackingUrl);
      alert('Tracking link copied to clipboard!');
    }
  };

  const handleCloseModal = () => {
    setShowQRModal(false);
    setCreatedOrder(null);
    
    // Redirect based on user role
    const role = session?.user?.role;
    if (role === 'admin') {
      router.push('/admin');
    } else if (role === 'customer') {
      router.push('/customer');
    } else if (role === 'driver') {
      router.push('/driver');
    } else if (role === 'manager') {
      router.push('/manager');
    } else {
      router.push('/');
    }
  };

  if (status === 'loading') {
    return (
      <Container>
        <ContentCard>
          <p style={{ textAlign: 'center', color: '#78716c' }}>Loading...</p>
        </ContentCard>
      </Container>
    );
  }

  return (
    <Container>
      <ContentCard>
        <Header>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft />
            <span>Back</span>
          </BackButton>
          
          <Title>Create New Order Tracker</Title>
          <Description>
            Fill in the order details below to create a new pickup order.
          </Description>
        </Header>

        <OrderForm 
          onOrderCreated={handleOrderCreated} 
          businessId={businessId}
          userSession={session}
        />
      </ContentCard>

      {/* QR Code Success Modal */}
      {showQRModal && createdOrder && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
          <ModalContent>
            <CloseButton onClick={handleCloseModal}>
              <X size={18} />
            </CloseButton>

            <ModalTitle>✅ Order Created!</ModalTitle>
            <ModalSubtitle>
              Your QR code tracker has been generated
            </ModalSubtitle>

            <QRCodeContainer>
              <QRCodeCanvas
                id="qr-code-canvas"
                value={getTrackingUrl(createdOrder.id)}
                size={200}
                level="H"
                includeMargin={true}
              />
            </QRCodeContainer>

            <OrderInfo>
              <InfoRow>
                <InfoLabel>Order #:</InfoLabel>
                <InfoValue>{createdOrder.orderNumber}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Customer:</InfoLabel>
                <InfoValue>{createdOrder.customerName}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>Status:</InfoLabel>
                <InfoValue>Pending Pickup</InfoValue>
              </InfoRow>
              {createdOrder.location?.locationName && (
                <InfoRow>
                  <InfoLabel>Location:</InfoLabel>
                  <InfoValue>{createdOrder.location.locationName}</InfoValue>
                </InfoRow>
              )}
            </OrderInfo>

            <ButtonGroup>
              <DownloadButton onClick={handleDownloadQR}>
                <Download size={18} />
                Download
              </DownloadButton>
              <ShareButton onClick={handleShareQR}>
                <Share2 size={18} />
                Share
              </ShareButton>
            </ButtonGroup>

            <DoneButton onClick={handleCloseModal}>
              Done - View Dashboard
            </DoneButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}
