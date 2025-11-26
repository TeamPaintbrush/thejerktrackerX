'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { DynamoDBService, Order } from '@/lib/dynamodb';
import { LoadingOverlay } from '@/components/Loading';
import { showError } from '@/lib/toast';
import { Toaster } from 'react-hot-toast';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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

const OrdersGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const OrderCard = styled(motion.div)`
  padding: 1.5rem;
  background: #fafaf9;
  border: 1px solid #e7e5e4;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #ed7734;
    box-shadow: 0 2px 8px rgba(237, 119, 52, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OrderNumber = styled.div`
  font-weight: 700;
  color: #1c1917;
  font-size: 1rem;
`;

const OrderStatus = styled.div<{ $status: string }>`
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
      case 'picked_up': return '#dbeafe';
      case 'delivered': return '#dcfce7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch(props.$status) {
      case 'pending': return '#d97706';
      case 'picked_up': return '#2563eb';
      case 'delivered': return '#16a34a';
      default: return '#6b7280';
    }
  }};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const OrderDetails = styled.div`
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

const ViewButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e7e5e4;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #78716c;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e7e5e4;
  background: ${props => props.$active ? '#1c1917' : 'white'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: ${props => props.$active ? '#1c1917' : '#f5f5f4'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ORDERS_PER_PAGE = 20;

export default function OrdersHubPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    loadOrders();
  }, [status, router]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const allOrders = await DynamoDBService.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      showError('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'pending': return <Clock />;
      case 'picked_up': return <Package />;
      case 'delivered': return <CheckCircle />;
      default: return <Package />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.customerName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
  const endIndex = startIndex + ORDERS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => o.status === 'picked_up').length,
    completed: orders.filter(o => o.status === 'delivered').length
  };

  if (status === 'loading' || isLoading) {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Loading orders...">
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
          
          <Title>Orders Hub</Title>
          <Description>
            Manage and track all orders in one central location
          </Description>
        </Header>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Orders</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.active}</StatValue>
            <StatLabel>Active</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.completed}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatCard>
        </StatsGrid>

        <Filters>
          <SearchBox>
            <Search />
            <input 
              type="text" 
              placeholder="Search by order number or customer name..."
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
          <FilterButton $active={filterStatus === 'picked_up'} onClick={() => setFilterStatus('picked_up')}>
            Active
          </FilterButton>
          <FilterButton $active={filterStatus === 'delivered'} onClick={() => setFilterStatus('delivered')}>
            Completed
          </FilterButton>
        </Filters>

        <OrdersGrid>
          {paginatedOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <OrderHeader>
                <OrderNumber>Order #{order.orderNumber}</OrderNumber>
                <OrderStatus $status={order.status}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </OrderStatus>
              </OrderHeader>
              <OrderDetails>
                <div><strong>Customer:</strong> {order.customerName}</div>
                <div><strong>Items:</strong> {order.orderDetails}</div>
                <div><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                {order.driverName && <div><strong>Driver:</strong> {order.driverName}</div>}
              </OrderDetails>
              <ViewButton onClick={() => router.push(`/orders/${order.id}`)}>
                <Eye />
                View Details
              </ViewButton>
            </OrderCard>
          ))}
        </OrdersGrid>

        {totalPages > 1 && (
          <PaginationContainer>
            <PaginationInfo>
              Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
            </PaginationInfo>
            
            <PaginationButtons>
              <PageButton 
                onClick={handlePreviousPage} 
                disabled={currentPage === 1}
              >
                <ChevronLeft />
                Previous
              </PageButton>
              
              {getPageNumbers().map((page, idx) => (
                page === '...' ? (
                  <PageButton key={`ellipsis-${idx}`} disabled>...</PageButton>
                ) : (
                  <PageButton
                    key={page}
                    $active={currentPage === page}
                    onClick={() => handlePageClick(page as number)}
                  >
                    {page}
                  </PageButton>
                )
              ))}
              
              <PageButton 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight />
              </PageButton>
            </PaginationButtons>
          </PaginationContainer>
        )}
      </ContentCard>
    </Container>
  );
}
