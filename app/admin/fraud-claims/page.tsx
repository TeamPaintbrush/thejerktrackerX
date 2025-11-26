'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { AlertTriangle, ArrowLeft, Clock, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
import { LoadingOverlay } from '@/components/Loading';

const Container = styled.div`
  min-height: 100vh;
  background: #fafaf9;
  padding: 2rem;
`;

const ContentCard = styled.div`
  max-width: 1400px;
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
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: #dc2626;
  }
`;

const Description = styled.p`
  color: #78716c;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  padding: 1.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1c1917;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #78716c;
  font-weight: 500;
`;

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;

  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a8a29e;
    width: 18px;
    height: 18px;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 1px solid #e7e5e4;
    border-radius: 0.5rem;
    font-size: 0.9375rem;

    &:focus {
      outline: none;
      border-color: #ed7734;
      box-shadow: 0 0 0 2px #ed773420;
    }
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: 1px solid #e7e5e4;
  background: ${props => props.$active ? '#1c1917' : 'white'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#1c1917' : '#f5f5f4'};
  }
`;

const ClaimsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const ClaimCard = styled.div`
  padding: 1.5rem;
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #dc2626;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
  }
`;

const ClaimHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ClaimId = styled.div`
  font-weight: 700;
  color: #1c1917;
  font-size: 1rem;
`;

const ClaimStatus = styled.div<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => {
    switch(props.$status) {
      case 'pending': return '#fef3c7';
      case 'approved': return '#dcfce7';
      case 'rejected': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'pending': return '#d97706';
      case 'approved': return '#16a34a';
      case 'rejected': return '#dc2626';
      default: return '#6b7280';
    }
  }};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ClaimDetails = styled.div`
  font-size: 0.875rem;
  color: #78716c;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  
  div {
    strong {
      color: #44403c;
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e7e5e4;
`;

const ActionButton = styled.button<{ $variant: 'approve' | 'reject' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$variant === 'approve' ? '#16a34a' : '#dc2626'};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

export default function AdminFraudClaimsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/');
      return;
    }

    // Mock claims data - replace with actual API call
    setTimeout(() => {
      setClaims([
        {
          id: 'CLAIM-001',
          orderNumber: 'ORD-2025-123',
          customerEmail: 'customer@example.com',
          status: 'pending',
          reason: 'Order not received',
          submittedAt: new Date().toISOString(),
          description: 'Customer claims they never received the order',
          amount: 45.99
        },
        {
          id: 'CLAIM-002',
          orderNumber: 'ORD-2025-098',
          customerEmail: 'john@example.com',
          status: 'approved',
          reason: 'Wrong items delivered',
          submittedAt: new Date(Date.now() - 86400000).toISOString(),
          description: 'Order contained incorrect items',
          amount: 32.50
        },
        {
          id: 'CLAIM-003',
          orderNumber: 'ORD-2025-087',
          customerEmail: 'sarah@example.com',
          status: 'rejected',
          reason: 'Quality issue',
          submittedAt: new Date(Date.now() - 172800000).toISOString(),
          description: 'Food quality was poor',
          amount: 28.75
        }
      ]);
      setIsLoading(false);
    }, 500);
  }, [status, session, router]);

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <XCircle />;
      default: return <AlertTriangle />;
    }
  };

  const handleApproveClaim = (claimId: string) => {
    console.log('Approving claim:', claimId);
    // Add API call here
  };

  const handleRejectClaim = (claimId: string) => {
    console.log('Rejecting claim:', claimId);
    // Add API call here
  };

  const filteredClaims = claims.filter(claim => {
    const matchesStatus = filterStatus === 'all' || claim.status === filterStatus;
    const matchesSearch = claim.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          claim.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    approved: claims.filter(c => c.status === 'approved').length,
    rejected: claims.filter(c => c.status === 'rejected').length
  };

  if (status === 'loading' || isLoading) {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Loading fraud claims...">
          <div />
        </LoadingOverlay>
      </Container>
    );
  }

  return (
    <Container>
      <ContentCard>
        <Header>
          <BackButton onClick={() => router.push('/admin')}>
            <ArrowLeft />
            <span>Back to Admin</span>
          </BackButton>
          
          <Title>
            <AlertTriangle />
            Fraud Claims Management
          </Title>
          <Description>
            Review and manage fraud claims across all orders
          </Description>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Claims</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Review</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.approved}</StatValue>
            <StatLabel>Approved</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.rejected}</StatValue>
            <StatLabel>Rejected</StatLabel>
          </StatCard>
        </StatsGrid>

        <Filters>
          <SearchBox>
            <Search />
            <input 
              type="text" 
              placeholder="Search by order number or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>
          
          <FilterButton $active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
            All
          </FilterButton>
          <FilterButton $active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')}>
            Pending
          </FilterButton>
          <FilterButton $active={filterStatus === 'approved'} onClick={() => setFilterStatus('approved')}>
            Approved
          </FilterButton>
          <FilterButton $active={filterStatus === 'rejected'} onClick={() => setFilterStatus('rejected')}>
            Rejected
          </FilterButton>
        </Filters>

        <ClaimsGrid>
          {filteredClaims.map(claim => (
            <ClaimCard key={claim.id}>
              <ClaimHeader>
                <ClaimId>Claim #{claim.id}</ClaimId>
                <ClaimStatus $status={claim.status}>
                  {getStatusIcon(claim.status)}
                  {claim.status}
                </ClaimStatus>
              </ClaimHeader>
              <ClaimDetails>
                <div><strong>Order:</strong> #{claim.orderNumber}</div>
                <div><strong>Customer:</strong> {claim.customerEmail}</div>
                <div><strong>Amount:</strong> ${claim.amount.toFixed(2)}</div>
                <div><strong>Reason:</strong> {claim.reason}</div>
                <div><strong>Submitted:</strong> {new Date(claim.submittedAt).toLocaleDateString()}</div>
              </ClaimDetails>
              <ClaimDetails style={{ marginTop: '0.75rem' }}>
                <div><strong>Description:</strong> {claim.description}</div>
              </ClaimDetails>
              
              {claim.status === 'pending' && (
                <ActionButtons>
                  <ActionButton $variant="approve" onClick={() => handleApproveClaim(claim.id)}>
                    Approve Claim
                  </ActionButton>
                  <ActionButton $variant="reject" onClick={() => handleRejectClaim(claim.id)}>
                    Reject Claim
                  </ActionButton>
                </ActionButtons>
              )}
            </ClaimCard>
          ))}
        </ClaimsGrid>
      </ContentCard>
    </Container>
  );
}
