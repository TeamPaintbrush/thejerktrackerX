'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { ArrowLeft, DollarSign, ShoppingCart } from 'lucide-react';
import { LoadingOverlay } from '@/components/Loading';
import { DynamoDBService } from '@/lib/dynamodb';
import { showError } from '@/lib/toast';
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

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const MenuItem = styled.div`
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

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
`;

const ItemName = styled.h3`
  font-size: 1.125rem;
  color: #1c1917;
  margin: 0;
`;

const ItemPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: #ed7734;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ItemDescription = styled.p`
  color: #78716c;
  margin: 0 0 1rem 0;
  font-size: 0.9375rem;
`;

const AvailabilityBadge = styled.div<{ $available: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
  background: ${props => props.$available ? '#dcfce7' : '#fee2e2'};
  color: ${props => props.$available ? '#16a34a' : '#dc2626'};
`;

const OrderButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

export default function CustomerMenuPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'customer') {
      router.push('/customer');
      return;
    }

    loadMenuItems();
  }, [status, session, router]);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const businessId = (session?.user as any)?.businessId || session?.user?.id || 'default-business';
      const items = await DynamoDBService.getMenuItems(businessId);
      
      const transformed = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        available: (item as any).available !== false
      }));
      
      setMenuItems(transformed);
    } catch (error) {
      console.error('Error loading menu:', error);
      showError('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrder = (item: MenuItemType) => {
    router.push(`/orders/create?item=${item.id}`);
  };

  if (status === 'loading' || isLoading) {
    return (
      <Container>
        <LoadingOverlay isLoading={true} message="Loading menu...">
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
          <BackButton onClick={() => router.push('/customer')}>
            <ArrowLeft />
            <span>Back to Dashboard</span>
          </BackButton>
          
          <Title>Our Menu</Title>
          <Description>
            Browse our delicious Caribbean dishes
          </Description>
        </Header>

        <MenuGrid>
          {menuItems.map(item => (
            <MenuItem key={item.id}>
              <ItemHeader>
                <ItemName>{item.name}</ItemName>
                <ItemPrice>
                  <DollarSign />
                  {item.price.toFixed(2)}
                </ItemPrice>
              </ItemHeader>
              <ItemDescription>{item.description}</ItemDescription>
              <AvailabilityBadge $available={item.available}>
                {item.available ? 'Available' : 'Out of Stock'}
              </AvailabilityBadge>
              <OrderButton 
                disabled={!item.available}
                onClick={() => handleOrder(item)}
              >
                <ShoppingCart />
                {item.available ? 'Order Now' : 'Unavailable'}
              </OrderButton>
            </MenuItem>
          ))}
        </MenuGrid>
      </ContentCard>
    </Container>
  );
}
