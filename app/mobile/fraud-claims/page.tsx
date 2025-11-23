// 🚨 Mobile Fraud Claims Management System
// Track and manage delivery fraud claims with evidence timeline

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { 
  AlertTriangle,
  Shield,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Package,
  MapPin,
  Phone,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  FileText
} from 'lucide-react';
import BackButton from '../../../mobile-android/shared/components/BackButton';

// ==================== TYPES ====================
// Import FraudClaim from dynamodb for consistency
import type { FraudClaim as DBFraudClaim } from '@/lib/dynamodb';

// Local interface for display (compatible with DB interface)
interface FraudClaim extends Omit<DBFraudClaim, 'orderDate' | 'createdAt' | 'updatedAt' | 'evidence' | 'orderTotal'> {
  claimDate: string | Date;
  orderDate: string | Date;
  orderTotal: string | number;
  evidence: {
    qrScanned: boolean;
    scanTimestamp?: string | Date;
    scanLocation?: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    };
    photoProof?: string[] | boolean;  // Allow boolean for legacy mock data
    customerSignature?: string | boolean;  // Allow boolean for legacy mock data
    ipAddress?: string;
    deviceInfo?: string;
    additionalNotes?: string;
  };
}

// ==================== STYLED COMPONENTS ====================
const PageContainer = styled.div`
  padding: 0.5rem;
  padding-bottom: 120px;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  padding-top: 0;
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

// Stats Cards
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
  font-size: 1.75rem;
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

// Search & Filter
const SearchFilterBar = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const FilterButton = styled(motion.button)`
  padding: 0.75rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    background: #f3f4f6;
  }
`;

// Claims List
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
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
  }
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

const ClaimType = styled.div<{ $type: string }>`
  font-size: 0.75rem;
  color: ${props => 
    props.$type === 'customer_never_received' ? '#dc2626' :
    props.$type === 'driver_dispute' ? '#f59e0b' : '#6b7280'
  };
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
    props.$status === 'resolved_fraud' ? '#fee2e2' : '#d1fae5'
  };
  color: ${props => 
    props.$status === 'pending' ? '#92400e' :
    props.$status === 'under_review' ? '#1e40af' :
    props.$status === 'resolved_fraud' ? '#991b1b' : '#065f46'
  };
`;

const ClaimDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  
  svg {
    width: 14px;
    height: 14px;
    color: #9ca3af;
  }
`;

const EvidenceIndicators = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
`;

const EvidenceBadge = styled.div<{ $present: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  background: ${props => props.$present ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.$present ? '#065f46' : '#991b1b'};
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.div`
  font-size: 0.875rem;
  opacity: 0.7;
`;

// ==================== MOCK DATA ====================
const getMockClaims = (): FraudClaim[] => {
  return [
    {
      id: '1',
      businessId: 'default-business',
      customerId: 'customer-john-smith',
      orderId: 'ORDER-1730001234567',
      claimNumber: 'FC-2025-001',
      orderNumber: 'ORDER-1730001234567',
      customerName: 'John Smith',
      customerPhone: '+1 (555) 123-4567',
      driverName: 'Mike Johnson',
      claimType: 'customer_never_received',
      claimDate: '2025-10-26T14:30:00',
      orderDate: '2025-10-26T12:00:00',
      orderTotal: '$45.99',
      status: 'under_review',
      description: 'Customer claims order never arrived. Driver states delivery was made.',
      evidence: {
        qrScanned: true,
        scanTimestamp: '2025-10-26T12:45:00',
        scanLocation: '123 Main St, Brooklyn NY',
        photoProof: true,
        customerSignature: false
      },
      priority: 'high'
    },
    {
      id: '2',
      businessId: 'default-business',
      customerId: 'customer-sarah-williams',
      orderId: 'ORDER-1730002345678',
      claimNumber: 'FC-2025-002',
      orderNumber: 'ORDER-1730002345678',
      customerName: 'Sarah Williams',
      customerPhone: '+1 (555) 234-5678',
      driverName: 'Chris Brown',
      claimType: 'customer_never_received',
      claimDate: '2025-10-25T18:15:00',
      orderDate: '2025-10-25T17:30:00',
      orderTotal: '$32.50',
      status: 'resolved_fraud',
      description: 'Customer claimed non-delivery. QR scan and photo evidence confirmed delivery.',
      evidence: {
        qrScanned: true,
        scanTimestamp: '2025-10-25T17:55:00',
        scanLocation: '456 Oak Ave, Brooklyn NY',
        photoProof: true,
        customerSignature: true
      },
      resolutionNotes: 'Evidence clearly shows delivery. Customer admitted receipt after review.',
      priority: 'critical'
    },
    {
      id: '3',
      businessId: 'default-business',
      customerId: 'customer-david-lee',
      orderId: 'ORDER-1730003456789',
      claimNumber: 'FC-2025-003',
      orderNumber: 'ORDER-1730003456789',
      customerName: 'David Lee',
      customerPhone: '+1 (555) 345-6789',
      driverName: 'Alex Martinez',
      claimType: 'driver_dispute',
      claimDate: '2025-10-24T20:00:00',
      orderDate: '2025-10-24T19:00:00',
      orderTotal: '$28.75',
      status: 'pending',
      description: 'Driver claims customer refused order. Customer denies.',
      evidence: {
        qrScanned: false,
        photoProof: false,
        customerSignature: false
      },
      priority: 'medium'
    },
    {
      id: '4',
      businessId: 'default-business',
      customerId: 'customer-emily-chen',
      orderId: 'ORDER-1730004567890',
      claimNumber: 'FC-2025-004',
      orderNumber: 'ORDER-1730004567890',
      customerName: 'Emily Chen',
      customerPhone: '+1 (555) 456-7890',
      driverName: 'Jordan Taylor',
      claimType: 'customer_never_received',
      claimDate: '2025-10-27T10:00:00',
      orderDate: '2025-10-27T09:15:00',
      orderTotal: '$52.00',
      status: 'resolved_legitimate',
      description: 'Legitimate claim - driver never scanned QR code. Refund issued.',
      evidence: {
        qrScanned: false,
        photoProof: false,
        customerSignature: false
      },
      resolutionNotes: 'Driver admitted forgetting to scan QR. Customer refunded.',
      priority: 'low'
    }
  ];
};

// ==================== MAIN COMPONENT ====================
export default function FraudClaimsPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<FraudClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'under_review' | 'resolved'>('all');

  // Fetch fraud claims from API
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (selectedFilter !== 'all') {
          params.append('status', selectedFilter);
        }
        
        const response = await fetch(`/api/fraud-claims?${params.toString()}`);
        
        if (!response.ok) {
          console.error('Failed to fetch fraud claims');
          // Fallback to mock data if API fails
          setClaims(getMockClaims());
          return;
        }
        
        const data = await response.json();
        setClaims(data);
      } catch (error) {
        console.error('Error fetching fraud claims:', error);
        // Fallback to mock data on error
        setClaims(getMockClaims());
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [selectedFilter]);

  // Filter claims by search query
  const filteredClaims = claims.filter(claim => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      claim.claimNumber.toLowerCase().includes(query) ||
      claim.orderNumber.toLowerCase().includes(query) ||
      claim.customerName.toLowerCase().includes(query) ||
      claim.description.toLowerCase().includes(query)
    );
  });

  // Calculate statistics
  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    underReview: claims.filter(c => c.status === 'under_review').length,
    resolvedFraud: claims.filter(c => c.status === 'resolved_fraud').length,
    resolvedLegitimate: claims.filter(c => c.status === 'resolved_legitimate').length
  };

  const getClaimTypeLabel = (type: FraudClaim['claimType']) => {
    switch (type) {
      case 'customer_never_received': return 'Never Received';
      case 'driver_dispute': return 'Driver Dispute';
      case 'suspicious_activity': return 'Suspicious Activity';
      case 'wrong_delivery': return 'Wrong Delivery';
      case 'quality_issue': return 'Quality Issue';
      default: return type;
    }
  };

  const getStatusLabel = (status: FraudClaim['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'under_review': return 'Under Review';
      case 'resolved_fraud': return 'Fraud Confirmed';
      case 'resolved_legitimate': return 'Legitimate';
      case 'dismissed': return 'Dismissed';
      default: return status;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleClaimClick = async (claim: FraudClaim) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    
    // For now, show detailed alert - in production would navigate to detail page
    const evidenceList = [
      claim.evidence.qrScanned ? `✓ QR Scanned at ${claim.evidence.scanTimestamp ? formatTime(claim.evidence.scanTimestamp) : 'N/A'}` : '✗ No QR Scan',
      claim.evidence.photoProof ? '✓ Photo Evidence' : '✗ No Photo',
      claim.evidence.customerSignature ? '✓ Customer Signature' : '✗ No Signature'
    ].join('\n');

    alert(
      `🚨 FRAUD CLAIM DETAILS\n\n` +
      `Claim: ${claim.claimNumber}\n` +
      `Order: ${claim.orderNumber}\n` +
      `Status: ${getStatusLabel(claim.status)}\n\n` +
      `Customer: ${claim.customerName}\n` +
      `Phone: ${claim.customerPhone}\n` +
      `Driver: ${claim.driverName || 'N/A'}\n\n` +
      `Description:\n${claim.description}\n\n` +
      `EVIDENCE:\n${evidenceList}\n\n` +
      (claim.resolutionNotes ? `Resolution:\n${claim.resolutionNotes}` : 'Investigation in progress...')
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <BackButton href="/mobile/orders-hub" label="Orders Hub" />
        <Header>
          <Title><AlertTriangle size={28} /> Fraud Claims</Title>
          <Subtitle>Loading claims...</Subtitle>
        </Header>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton href="/mobile/orders-hub" label="Orders Hub" />
      
      <Header>
        <Title>
          <AlertTriangle size={28} color="#dc2626" />
          Fraud Claims
        </Title>
        <Subtitle>Track delivery disputes & fraud prevention</Subtitle>
      </Header>

      {/* Statistics */}
      <StatsGrid>
        <StatCard $color="#6b7280">
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>Total Claims</StatLabel>
        </StatCard>
        <StatCard $color="#f59e0b">
          <StatNumber>{stats.pending}</StatNumber>
          <StatLabel>Pending</StatLabel>
        </StatCard>
        <StatCard $color="#3b82f6">
          <StatNumber>{stats.underReview}</StatNumber>
          <StatLabel>Under Review</StatLabel>
        </StatCard>
        <StatCard $color="#dc2626">
          <StatNumber>{stats.resolvedFraud}</StatNumber>
          <StatLabel>Fraud Confirmed</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Search & Filter */}
      <SearchFilterBar>
        <SearchBox>
          <SearchIcon size={18} />
          <SearchInput
            type="text"
            placeholder="Search claims, orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
        <FilterButton whileTap={{ scale: 0.95 }}>
          <Filter size={20} color="#6b7280" />
        </FilterButton>
      </SearchFilterBar>

      {/* Claims List */}
      {filteredClaims.length === 0 ? (
        <EmptyState>
          <EmptyIcon><Shield size={64} /></EmptyIcon>
          <EmptyText>
            {searchQuery ? 'No claims found' : 'No Fraud Claims'}
          </EmptyText>
          <EmptySubtext>
            {searchQuery 
              ? 'Try adjusting your search'
              : 'All deliveries verified with QR tracking'
            }
          </EmptySubtext>
        </EmptyState>
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
                onClick={() => handleClaimClick(claim)}
              >
                <ClaimHeader>
                  <ClaimInfo>
                    <ClaimNumber>{claim.claimNumber}</ClaimNumber>
                    <ClaimType $type={claim.claimType}>
                      {getClaimTypeLabel(claim.claimType)}
                    </ClaimType>
                  </ClaimInfo>
                  <StatusBadge $status={claim.status}>
                    {getStatusLabel(claim.status)}
                  </StatusBadge>
                </ClaimHeader>

                <ClaimDetails>
                  <DetailRow>
                    <Package />
                    <span>Order: {claim.orderNumber}</span>
                  </DetailRow>
                  <DetailRow>
                    <User />
                    <span>{claim.customerName}</span>
                  </DetailRow>
                  <DetailRow>
                    <Calendar />
                    <span>Claim Date: {formatDate(claim.claimDate)} at {formatTime(claim.claimDate)}</span>
                  </DetailRow>
                  <DetailRow>
                    <FileText />
                    <span>{claim.description}</span>
                  </DetailRow>
                </ClaimDetails>

                <EvidenceIndicators>
                  <EvidenceBadge $present={claim.evidence.qrScanned}>
                    {claim.evidence.qrScanned ? <CheckCircle /> : <XCircle />}
                    QR Scan
                  </EvidenceBadge>
                  <EvidenceBadge $present={!!claim.evidence.photoProof}>
                    {claim.evidence.photoProof ? <CheckCircle /> : <XCircle />}
                    Photo
                  </EvidenceBadge>
                  <EvidenceBadge $present={!!claim.evidence.customerSignature}>
                    {claim.evidence.customerSignature ? <CheckCircle /> : <XCircle />}
                    Signature
                  </EvidenceBadge>
                </EvidenceIndicators>
              </ClaimCard>
            ))}
          </AnimatePresence>
        </ClaimsList>
      )}
    </PageContainer>
  );
}
