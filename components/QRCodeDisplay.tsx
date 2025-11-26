'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styled from 'styled-components';
import { buildTrackingUrl } from '@/lib/url';

const QRContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  text-align: center;
  /* Mobile overflow prevention */
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const QRTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
`;

const QRWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const QRDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.75rem;
`;

const QRLink = styled.a`
  color: ${({ theme }) => theme.colors.primary[600]};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary[800]};
    text-decoration: underline;
  }
`;

const PrintButton = styled.button`
  background: ${({ theme }) => theme.colors.success[600]};
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.success[700]};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface QRCodeDisplayProps {
  orderId: string;
  orderNumber: string;
  compact?: boolean;
  size?: number;
  showTitle?: boolean;
  showDescription?: boolean;
  showUrl?: boolean;
  showPrintButton?: boolean;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  orderId, 
  orderNumber,
  compact = false,
  size = 200,
  showTitle = true,
  showDescription = true,
  showUrl = true,
  showPrintButton = true
}) => {
  const orderUrl = buildTrackingUrl(`/order?id=${orderId}`);

  if (compact) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1rem', 
        padding: '1rem',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div>
          <QRCodeCanvas value={orderUrl} size={size} />
        </div>
        <div style={{ flex: 1 }}>
          {showTitle && (
            <h4 style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '1.125rem', 
              fontWeight: '600',
              color: '#111827'
            }}>
              QR Code for Order #{orderNumber}
            </h4>
          )}
          {showDescription && (
            <p style={{ 
              margin: '0 0 0.5rem 0', 
              fontSize: '0.875rem', 
              color: '#6b7280' 
            }}>
              Scan to access this order page
            </p>
          )}
          {showUrl && (
            <QRLink
              href={orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.75rem' }}
            >
              {orderUrl.length > 50 ? `${orderUrl.substring(0, 50)}...` : orderUrl}
            </QRLink>
          )}
        </div>
      </div>
    );
  }

  return (
    <QRContainer>
      {showTitle && <QRTitle>Order #{orderNumber}</QRTitle>}
      <QRWrapper>
        <QRCodeCanvas value={orderUrl} size={size} />
      </QRWrapper>
      {showDescription && <QRDescription>Scan this QR code to check in the order</QRDescription>}
      {showUrl && (
        <QRLink
          href={orderUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {orderUrl}
        </QRLink>
      )}
      {showPrintButton && (
        <div>
          <PrintButton onClick={() => window.print()}>
            Print Receipt
          </PrintButton>
        </div>
      )}
    </QRContainer>
  );
};

export default QRCodeDisplay;