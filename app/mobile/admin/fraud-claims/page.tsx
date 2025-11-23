// 🚨 Mobile Admin Fraud Claims Management
// Review, investigate, and resolve fraud claims

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import MobileLayout from '@/mobile-android/shared/components/MobileLayout';
import { MobilePushNotificationService } from '@/lib/mobilePushNotifications';
import { 
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  DollarSign,
  Loader,
  Search,
  Filter,
  ChevronDown
} from 'lucide-react';

interface FraudClaim {
  id: string;
  claimNumber: string;
  customerId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  driverName?: string;
  claimType: 'customer_never_received' | 'driver_dispute' | 'suspicious_activity' | 'wrong_delivery' | 'quality_issue';
  status: 'pending' | 'under_review' | 'resolved_fraud' | 'resolved_legitimate' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  orderTotal: number;
  createdAt: Date | string;
  evidence: {
    qrScanned: boolean;
    scanTimestamp?: Date | string;
    scanLocation?: string;
    photoProof?: string[];
    customerSignature?: string;
  };
  resolutionNotes?: string;
}

const PageContainer = styled.div`
  padding: 1rem;
  padding-bottom: 120px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div<{ $color: string }>`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.$color};
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SearchFilterBar = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  color: #9ca3af;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const FilterButton = styled(motion.button)`
  padding: 0.75rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;

  &:active {
    background: #f3f4f6;
  }
`;

const ClaimsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ClaimCard = styled(motion.div)<{ $priority: string }>`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => 
    props.$priority === 'critical' ? '#dc2626' :
    props.$priority === 'high' ? '#f59e0b' :
    props.$priority === 'medium' ? '#3b82f6' : '#6b7280'
  };
`;

const ClaimHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const ClaimInfo = styled.div`
  flex: 1;
`;

const ClaimNumber = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  background: ${props => 
    props.$status === 'pending' ? '#fef3c7' :
    props.$status === 'under_review' ? '#dbeafe' :
    props.$status === 'resolved_fraud' ? '#fee2e2' :
    props.$status === 'resolved_legitimate' ? '#d1fae5' : '#f3f4f6'
  };
  color: ${props => 
    props.$status === 'pending' ? '#92400e' :
    props.$status === 'under_review' ? '#1e40af' :
    props.$status === 'resolved_fraud' ? '#991b1b' :
    props.$status === 'resolved_legitimate' ? '#065f46' : '#374151'
  };
`;

const ClaimDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.5rem 0;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button<{ $variant: 'review' | 'resolve' | 'dismiss' }>`
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s;

  ${props => {
    switch (props.$variant) {
      case 'review':
        return 'background: #dbeafe; color: #1e40af;';
      case 'resolve':
        return 'background: #d1fae5; color: #065f46;';
      case 'dismiss':
        return 'background: #fee2e2; color: #991b1b;';
    }
  }}

  &:active {
    transform: scale(0.98);
  }
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 100px;
  font-family: inherit;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #f97316;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ModalButton = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 0.875rem;
  border-radius: 8px;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
  ` : `
    background: #f3f4f6;
    color: #374151;
  `}
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
`;

export default function AdminFraudClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<FraudClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<FraudClaim | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'fraud' | 'legitimate' | 'dismiss' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/fraud-claims?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch claims');
      
      const data = await response.json();
      setClaims(data);
    } catch (error) {
      console.error('Error fetching fraud claims:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleResolve = async () => {
    if (!selectedClaim || !resolutionAction || !resolutionNotes.trim()) {
      alert('Please provide resolution notes');
      return;
    }

    setIsSubmitting(true);

    try {
      const statusMap = {
        fraud: 'resolved_fraud',
        legitimate: 'resolved_legitimate',
        dismiss: 'dismissed'
      };

      const response = await fetch(`/api/fraud-claims/${selectedClaim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: statusMap[resolutionAction],
          resolutionNotes
        })
      });

      if (!response.ok) throw new Error('Failed to resolve claim');

      // Send push notification to customer about resolution
      const resolutionMessage = resolutionAction === 'fraud' 
        ? 'Your fraud claim has been confirmed. Action has been taken.'
        : resolutionAction === 'legitimate'
        ? 'Your fraud claim has been reviewed and marked as legitimate.'
        : 'Your fraud claim has been dismissed.';

      await MobilePushNotificationService.sendNotificationToUser(
        selectedClaim.customerId,
        {
          title: '🛡️ Fraud Claim Resolved',
          body: resolutionMessage,
          data: {
            type: 'fraud_claim_resolved',
            claimId: selectedClaim.id,
            claimNumber: selectedClaim.claimNumber,
            status: statusMap[resolutionAction]
          }
        }
      );

      alert('Fraud claim resolved successfully!');
      setSelectedClaim(null);
      setResolutionAction(null);
      setResolutionNotes('');
      fetchClaims();
    } catch (error) {
      console.error('Error resolving claim:', error);
      alert('Failed to resolve claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClaims = claims.filter(claim => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      claim.claimNumber.toLowerCase().includes(query) ||
      claim.orderNumber.toLowerCase().includes(query) ||
      claim.customerName.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    underReview: claims.filter(c => c.status === 'under_review').length,
    resolved: claims.filter(c => 
      c.status === 'resolved_fraud' || 
      c.status === 'resolved_legitimate' || 
      c.status === 'dismissed'
    ).length
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'under_review': return 'Under Review';
      case 'resolved_fraud': return 'Fraud';
      case 'resolved_legitimate': return 'Legitimate';
      case 'dismissed': return 'Dismissed';
      default: return status;
    }
  };

  const getClaimTypeLabel = (type: string) => {
    switch (type) {
      case 'customer_never_received': return 'Never Received';
      case 'driver_dispute': return 'Driver Dispute';
      case 'suspicious_activity': return 'Suspicious';
      case 'wrong_delivery': return 'Wrong Delivery';
      case 'quality_issue': return 'Quality Issue';
      default: return type;
    }
  };

  return (
    <MobileLayout>
      <PageContainer>
        <Header>
          <Title>
            <Shield size={28} color="#dc2626" />
            Fraud Claims
          </Title>
          <Subtitle>Review and resolve disputes</Subtitle>
        </Header>

        <StatsGrid>
          <StatCard $color="#6b7280">
            <StatNumber>{stats.total}</StatNumber>
            <StatLabel>Total</StatLabel>
          </StatCard>
          <StatCard $color="#f59e0b">
            <StatNumber>{stats.pending}</StatNumber>
            <StatLabel>Pending</StatLabel>
          </StatCard>
          <StatCard $color="#3b82f6">
            <StatNumber>{stats.underReview}</StatNumber>
            <StatLabel>Reviewing</StatLabel>
          </StatCard>
          <StatCard $color="#10b981">
            <StatNumber>{stats.resolved}</StatNumber>
            <StatLabel>Resolved</StatLabel>
          </StatCard>
        </StatsGrid>

        <SearchFilterBar>
          <SearchBox>
            <SearchIcon size={18} />
            <SearchInput
              type="text"
              placeholder="Search claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>
          <FilterButton onClick={() => {
            const filters = ['all', 'pending', 'under_review', 'resolved_fraud'];
            const currentIndex = filters.indexOf(statusFilter);
            setStatusFilter(filters[(currentIndex + 1) % filters.length]);
          }}>
            <Filter size={18} />
          </FilterButton>
        </SearchFilterBar>

        {loading ? (
          <LoadingContainer>
            <Loader size={40} className="spinning" />
            <p style={{ marginTop: '1rem' }}>Loading claims...</p>
          </LoadingContainer>
        ) : (
          <ClaimsList>
            <AnimatePresence>
              {filteredClaims.map((claim) => (
                <ClaimCard
                  key={claim.id}
                  $priority={claim.priority}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ClaimHeader>
                    <ClaimInfo>
                      <ClaimNumber>{claim.claimNumber}</ClaimNumber>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {getClaimTypeLabel(claim.claimType)} • Order #{claim.orderNumber}
                      </div>
                    </ClaimInfo>
                    <StatusBadge $status={claim.status}>
                      {getStatusLabel(claim.status)}
                    </StatusBadge>
                  </ClaimHeader>

                  <ClaimDescription>{claim.description}</ClaimDescription>

                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Customer: {claim.customerName} • ${claim.orderTotal.toFixed(2)}
                  </div>

                  {claim.status === 'pending' && (
                    <ActionButtons>
                      <ActionButton 
                        $variant="review"
                        onClick={async () => {
                          if (Capacitor.isNativePlatform()) {
                            await Haptics.impact({ style: ImpactStyle.Light });
                          }
                          setSelectedClaim(claim);
                          setResolutionAction('legitimate');
                        }}
                      >
                        <CheckCircle size={16} />
                        Legitimate
                      </ActionButton>
                      <ActionButton 
                        $variant="resolve"
                        onClick={async () => {
                          if (Capacitor.isNativePlatform()) {
                            await Haptics.impact({ style: ImpactStyle.Light });
                          }
                          setSelectedClaim(claim);
                          setResolutionAction('fraud');
                        }}
                      >
                        <AlertTriangle size={16} />
                        Fraud
                      </ActionButton>
                    </ActionButtons>
                  )}

                  {claim.resolutionNotes && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      padding: '0.75rem', 
                      background: '#f9fafb', 
                      borderRadius: '8px',
                      fontSize: '0.75rem'
                    }}>
                      <strong>Resolution:</strong> {claim.resolutionNotes}
                    </div>
                  )}
                </ClaimCard>
              ))}
            </AnimatePresence>
          </ClaimsList>
        )}

        {/* Resolution Modal */}
        <AnimatePresence>
          {selectedClaim && resolutionAction && (
            <Modal
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedClaim(null);
                setResolutionAction(null);
              }}
            >
              <ModalContent
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
              >
                <ModalTitle>
                  Resolve Claim: {selectedClaim.claimNumber}
                </ModalTitle>
                
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                    <strong>Type:</strong> {getClaimTypeLabel(selectedClaim.claimType)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.25rem' }}>
                    <strong>Customer:</strong> {selectedClaim.customerName}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#374151', marginTop: '0.25rem' }}>
                    <strong>Order Total:</strong> ${selectedClaim.orderTotal.toFixed(2)}
                  </div>
                </div>

                <TextArea
                  placeholder="Enter resolution notes (required)..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                />

                <ModalButtons>
                  <ModalButton onClick={() => {
                    setSelectedClaim(null);
                    setResolutionAction(null);
                    setResolutionNotes('');
                  }}>
                    Cancel
                  </ModalButton>
                  <ModalButton 
                    $primary 
                    onClick={handleResolve}
                    disabled={isSubmitting || !resolutionNotes.trim()}
                  >
                    {isSubmitting ? 'Resolving...' : 
                      resolutionAction === 'fraud' ? 'Confirm Fraud' : 'Confirm Legitimate'}
                  </ModalButton>
                </ModalButtons>
              </ModalContent>
            </Modal>
          )}
        </AnimatePresence>
      </PageContainer>
    </MobileLayout>
  );
}
