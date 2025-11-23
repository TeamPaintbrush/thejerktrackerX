// 🚨 Fraud Claim Form Component
// Modal form for creating and submitting fraud claims with evidence collection

'use client';

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { 
  X, 
  AlertTriangle, 
  Upload, 
  Camera, 
  FileText,
  CheckCircle,
  Loader
} from 'lucide-react';
import type { Order, FraudClaim } from '@/lib/dynamodb';
import { MobilePushNotificationService } from '@/lib/mobilePushNotifications';

interface FraudClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  businessId: string;
  customerId?: string; // Optional customer/user ID for notifications
  onSubmitSuccess?: (claim: FraudClaim) => void;
  qrEvidence?: {
    qrScanned: boolean;
    scanTimestamp?: Date;
    scanLocation?: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    };
  };
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const Modal = styled(motion.div)`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
`;

const Header = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 16px 16px 0 0;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }
`;

const OrderInfo = styled.div`
  background: #fef7ee;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #92400e;
`;

const Body = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Required = styled.span`
  color: #ef4444;
  margin-left: 0.25rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }

  &[type="file"] {
    padding: 0.5rem;
  }
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0.5rem 0 0 0;
`;

const EvidenceSection = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
`;

const EvidenceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: #374151;

  svg {
    color: #10b981;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;

  &:hover {
    border-color: #f97316;
    background: #fef7ee;
  }
`;

const UploadIcon = styled.div`
  color: #9ca3af;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
`;

const UploadText = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const FileList = styled.div`
  margin-top: 0.75rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    background: #fee2e2;
  }
`;

const Footer = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
  position: sticky;
  bottom: 0;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  ` : `
    background: white;
    color: #374151;
    border: 2px solid #e5e7eb;
    
    &:hover {
      background: #f9fafb;
    }
  `}
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${props => {
    switch (props.$priority) {
      case 'critical':
        return 'background: #fef2f2; color: #991b1b;';
      case 'high':
        return 'background: #fef3c7; color: #92400e;';
      case 'medium':
        return 'background: #dbeafe; color: #1e40af;';
      default:
        return 'background: #f3f4f6; color: #4b5563;';
    }
  }}
`;

export default function FraudClaimForm({
  isOpen,
  onClose,
  order,
  businessId,
  customerId,
  onSubmitSuccess,
  qrEvidence
}: FraudClaimFormProps) {
  const [claimType, setClaimType] = useState<FraudClaim['claimType']>('customer_never_received');
  const [priority, setPriority] = useState<FraudClaim['priority']>('medium');
  const [description, setDescription] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 5 - photoFiles.length);
      setPhotoFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      alert('Please provide a description of the issue');
      return;
    }

    setIsSubmitting(true);

    try {
      // In production, you'd upload photos to cloud storage first
      const photoUrls: string[] = []; // Array of uploaded photo URLs

      const claimData = {
        businessId,
        customerId: customerId || businessId, // Use customerId if provided, fallback to businessId
        orderId: order.id,
        orderNumber: order.orderNumber,
        claimType,
        status: 'pending' as const,
        priority,
        description,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: customerPhone || order.customerEmail,
        driverName: order.driverName,
        orderDate: order.createdAt,
        orderTotal: 0, // You'd calculate this from order details
        evidence: {
          qrScanned: qrEvidence?.qrScanned || false,
          scanTimestamp: qrEvidence?.scanTimestamp,
          scanLocation: qrEvidence?.scanLocation,
          gpsCoordinates: qrEvidence?.gpsCoordinates,
          photoProof: photoUrls,
          additionalNotes
        }
      };

      const response = await fetch('/api/fraud-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimData)
      });

      if (!response.ok) throw new Error('Failed to submit claim');

      const newClaim = await response.json();
      
      // Send push notification to admins about new fraud claim
      await MobilePushNotificationService.notifyNewFraudClaim(
        newClaim.claimNumber,
        order.orderNumber
      );
      
      if (onSubmitSuccess) {
        onSubmitSuccess(newClaim);
      }

      onClose();
    } catch (error) {
      console.error('Error submitting fraud claim:', error);
      alert('Failed to submit fraud claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <Modal
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <Header>
                <HeaderTop>
                  <Title>
                    <AlertTriangle size={24} />
                    Report Fraud / Issue
                  </Title>
                  <CloseButton onClick={onClose} type="button">
                    <X size={24} />
                  </CloseButton>
                </HeaderTop>
                <OrderInfo>
                  <strong>Order #{order.orderNumber}</strong> • {order.customerName}
                </OrderInfo>
              </Header>

              <Body>
                <FormGroup>
                  <Label>
                    Issue Type<Required>*</Required>
                  </Label>
                  <Select
                    value={claimType}
                    onChange={(e) => setClaimType(e.target.value as FraudClaim['claimType'])}
                    required
                  >
                    <option value="customer_never_received">Customer Never Received Order</option>
                    <option value="driver_dispute">Driver Dispute</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="wrong_delivery">Wrong Delivery Address</option>
                    <option value="quality_issue">Quality/Accuracy Issue</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>
                    Priority Level<Required>*</Required>
                  </Label>
                  <Select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as FraudClaim['priority'])}
                    required
                  >
                    <option value="low">Low - Minor issue, no financial impact</option>
                    <option value="medium">Medium - Standard investigation needed</option>
                    <option value="high">High - Significant financial impact</option>
                    <option value="critical">Critical - Urgent attention required</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>
                    Description<Required>*</Required>
                  </Label>
                  <TextArea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide detailed information about the issue..."
                    required
                  />
                  <HelpText>Include specific details, times, and circumstances</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>Contact Phone Number</Label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                  <HelpText>Optional - for follow-up communication</HelpText>
                </FormGroup>

                {qrEvidence && qrEvidence.qrScanned && (
                  <FormGroup>
                    <Label>Collected Evidence</Label>
                    <EvidenceSection>
                      <EvidenceItem>
                        <CheckCircle size={16} />
                        QR Code Scanned
                      </EvidenceItem>
                      {qrEvidence.scanTimestamp && (
                        <EvidenceItem>
                          <CheckCircle size={16} />
                          Scan Time: {new Date(qrEvidence.scanTimestamp).toLocaleString()}
                        </EvidenceItem>
                      )}
                      {qrEvidence.scanLocation && (
                        <EvidenceItem>
                          <CheckCircle size={16} />
                          Location: {qrEvidence.scanLocation}
                        </EvidenceItem>
                      )}
                      {qrEvidence.gpsCoordinates && (
                        <EvidenceItem>
                          <CheckCircle size={16} />
                          GPS Coordinates Recorded
                        </EvidenceItem>
                      )}
                    </EvidenceSection>
                  </FormGroup>
                )}

                <FormGroup>
                  <Label>Photo Evidence (Optional)</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <UploadArea onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon>
                      <Camera size={32} />
                    </UploadIcon>
                    <UploadText>
                      Click to upload photos (max 5)
                    </UploadText>
                  </UploadArea>
                  {photoFiles.length > 0 && (
                    <FileList>
                      {photoFiles.map((file, index) => (
                        <FileItem key={index}>
                          <span>{file.name}</span>
                          <RemoveFileButton onClick={() => removeFile(index)} type="button">
                            <X size={16} />
                          </RemoveFileButton>
                        </FileItem>
                      ))}
                    </FileList>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Additional Notes</Label>
                  <TextArea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any other relevant information..."
                    style={{ minHeight: '80px' }}
                  />
                </FormGroup>
              </Body>

              <Footer>
                <Button type="button" $variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" $variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader size={20} className="spinning" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      Submit Claim
                    </>
                  )}
                </Button>
              </Footer>
            </form>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
}
