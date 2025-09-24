'use client';

import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import styled from 'styled-components';

const QRContainer = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  text-align: center;
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
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ orderId, orderNumber }) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/thejerktrackerX' : '';
  const orderUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${basePath}/orders/${orderId}`;

  return (
    <QRContainer>
      <QRTitle>Order #{orderNumber}</QRTitle>
      <QRWrapper>
        <QRCodeCanvas value={orderUrl} size={200} />
      </QRWrapper>
      <QRDescription>Scan this QR code to check in the order</QRDescription>
      <QRLink
        href={orderUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {orderUrl}
      </QRLink>
      <div>
        <PrintButton onClick={() => window.print()}>
          Print Receipt
        </PrintButton>
      </div>
    </QRContainer>
  );
};

export default QRCodeDisplay;