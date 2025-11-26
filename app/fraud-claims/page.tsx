'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { AlertTriangle, ArrowLeft, Clock, CheckCircle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { LoadingOverlay } from '@/components/Loading';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast';
import { Toaster } from 'react-hot-toast';
import { DynamoDBService } from '@/lib/dynamodb';

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  padding: 2rem;
`;

const ContentCard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
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
  
  div {
    margin-bottom: 0.5rem;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: #44403c;
  }
`;

const ClaimActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e7e5e4;
`;

const ActionButton = styled.button<{ $variant: 'approve' | 'reject' }>`
  flex: 1;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  background: ${props => props.$variant === 'approve' 
    ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
    : 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'};
  color: white;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-started;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  color: #78716c;
  
  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    color: #d6d3d1;
  }
  
  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #44403c;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    margin: 0;
  }
`;

const NewClaimButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
  }
`;

export default function FraudClaimsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    loadFraudClaims();
  }, [status, router]);

  const loadFraudClaims = async () => {
    try {
      setIsLoading(true);
      const businessId = (session?.user as any)?.businessId || 'default';
      const claimsData = await DynamoDBService.getFraudClaims(businessId);
      
      // Transform to component format
      const formattedClaims = claimsData.map(claim => ({
        id: claim.id,
        orderNumber: claim.orderNumber,
        status: claim.status,
        reason: claim.claimType.replace(/_/g, ' '),
        submittedAt: claim.createdAt.toISOString(),
        description: claim.description
      }));
      
      setClaims(formattedClaims);
    } catch (error) {
      console.error('Error loading fraud claims:', error);
      showError('Failed to load fraud claims');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock />;
      case 'approved': return <CheckCircle />;
      case 'rejected': return <XCircle />;
      default: return <AlertTriangle />;
    }
  };

  const handleApprove = async (claimId: string) => {
    if (!confirm('Are you sure you want to approve this fraud claim?')) {
      return;
    }

    const toastId = showLoading('Approving claim...');

    try {
      await DynamoDBService.resolveFraudClaim(claimId, {
        status: 'resolved_fraud',
        resolutionNotes: 'Claim approved - fraud confirmed',
        resolvedBy: session?.user?.id || 'admin',
        actionTaken: 'Customer refunded, driver flagged'
      });
      
      dismissToast(toastId);
      showSuccess('Fraud claim approved successfully');
      await loadFraudClaims(); // Reload claims
    } catch (error) {
      dismissToast(toastId);
      showError('Failed to approve claim');
      console.error('Error approving claim:', error);
    }
  };

  const handleReject = async (claimId: string) => {
    if (!confirm('Are you sure you want to reject this fraud claim?')) {
      return;
    }

    const toastId = showLoading('Rejecting claim...');

    try {
      await DynamoDBService.resolveFraudClaim(claimId, {
        status: 'resolved_legitimate',
        resolutionNotes: 'Claim rejected - no fraud detected',
        resolvedBy: session?.user?.id || 'admin',
        actionTaken: 'Claim dismissed, order was legitimate'
      });
      
      dismissToast(toastId);
      showSuccess('Fraud claim rejected');
      await loadFraudClaims(); // Reload claims
    } catch (error) {
      dismissToast(toastId);
      showError('Failed to reject claim');
      console.error('Error rejecting claim:', error);
    }
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
      <Toaster />
      <ContentCard>
        <Header>
          <BackButton onClick={() => router.back()}>
            <ArrowLeft />
            <span>Back</span>
          </BackButton>
          
          <Title>
            <AlertTriangle />
            Fraud Claims
          </Title>
          <Description>
            View and manage fraud claims for orders
          </Description>
        </Header>

        {claims.length > 0 ? (
          <ClaimsGrid>
            {claims.map(claim => (
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
                  <div><strong>Reason:</strong> {claim.reason}</div>
                  <div><strong>Description:</strong> {claim.description}</div>
                  <div><strong>Submitted:</strong> {new Date(claim.submittedAt).toLocaleDateString()}</div>
                </ClaimDetails>
                {claim.status === 'pending' && (
                  <ClaimActions>
                    <ActionButton 
                      $variant="approve" 
                      onClick={() => handleApprove(claim.id)}
                    >
                      <ThumbsUp />
                      Approve
                    </ActionButton>
                    <ActionButton 
                      $variant="reject" 
                      onClick={() => handleReject(claim.id)}
                    >
                      <ThumbsDown />
                      Reject
                    </ActionButton>
                  </ClaimActions>
                )}
              </ClaimCard>
            ))}
          </ClaimsGrid>
        ) : (
          <EmptyState>
            <AlertTriangle />
            <h3>No Claims Filed</h3>
            <p>There are no fraud claims to display.</p>
            <NewClaimButton onClick={() => router.push('/fraud-claims/create')}>
              File New Claim
            </NewClaimButton>
          </EmptyState>
        )}
      </ContentCard>
    </Container>
  );
}
