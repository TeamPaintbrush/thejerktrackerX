'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { ArrowLeft, Plus, Edit, Trash2, DollarSign } from 'lucide-react';
import { LoadingOverlay } from '@/components/Loading';
import { DynamoDBService } from '@/lib/dynamodb';
import type { MenuItem } from '@/lib/dynamodb';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast';
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderLeft = styled.div``;

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

const AddButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #ed7734 0%, #de5d20 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
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

const ItemFooter = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button<{ $variant: 'edit' | 'delete' }>`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e7e5e4;
  background: ${props => props.$variant === 'delete' ? '#fee2e2' : 'white'};
  color: ${props => props.$variant === 'delete' ? '#dc2626' : '#44403c'};
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$variant === 'delete' ? '#fecaca' : '#f5f5f4'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #78716c;

  h3 {
    color: #1c1917;
    margin-bottom: 0.5rem;
  }
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #1c1917;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #44403c;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  font-size: 0.9375rem;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e7e5e4;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 2px #ed773420;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: #44403c;
  cursor: pointer;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1.5rem;
`;

const ModalButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$variant === 'primary' 
    ? 'linear-gradient(135deg, #ed7734 0%, #de5d20 100%)'
    : '#f5f5f4'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#44403c'};

  &:hover {
    opacity: ${props => props.$variant === 'primary' ? 0.9 : 1};
    background: ${props => props.$variant === 'secondary' ? '#e7e5e4' : ''};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface MenuItemType {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
}

export default function AdminMenuPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    available: true
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'admin') {
      router.push('/admin');
      return;
    }

    loadMenuItems();
  }, [status, session, router]);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const businessId = (session?.user as any)?.businessId || session?.user?.id || 'default-business';
      const items = await DynamoDBService.getMenuItems(businessId);
      
      // Transform MenuItem to MenuItemType
      const transformed = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        available: (item as any).available !== false // Default to true if not set
      }));
      
      setMenuItems(transformed);
    } catch (error) {
      console.error('Error loading menu items:', error);
      showError('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    const toastId = showLoading('Deleting menu item...');

    try {
      const deleted = await DynamoDBService.deleteMenuItem(id);
      
      if (deleted) {
        dismissToast(toastId);
        showSuccess('Menu item deleted successfully!');
        await loadMenuItems(); // Reload the list
      } else {
        throw new Error('Failed to delete menu item');
      }
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || 'Failed to delete menu item');
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      available: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItemType) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      available: item.available
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      available: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showError('Please enter a menu item name');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      showError('Please enter a valid price');
      return;
    }

    if (parseFloat(formData.price) > 10000) {
      showError('Price cannot exceed $10,000');
      return;
    }

    const toastId = showLoading(editingItem ? 'Updating menu item...' : 'Creating menu item...');

    try {
      const businessId = (session?.user as any)?.businessId || session?.user?.id || 'default-business';
      const price = parseFloat(formData.price);

      if (editingItem) {
        // Update existing item
        await DynamoDBService.updateMenuItem(editingItem.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: price
        } as any);
        dismissToast(toastId);
        showSuccess('Menu item updated successfully!');
      } else {
        // Create new item
        await DynamoDBService.createMenuItem({
          businessId: businessId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: price,
          category: 'main'
        } as any);
        dismissToast(toastId);
        showSuccess('Menu item created successfully!');
      }

      closeModal();
      await loadMenuItems();
    } catch (error: any) {
      dismissToast(toastId);
      showError(error.message || 'Failed to save menu item');
    }
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
          <HeaderLeft>
            <BackButton onClick={() => router.push('/admin')}>
              <ArrowLeft />
              <span>Back to Dashboard</span>
            </BackButton>
            
            <Title>Menu Management</Title>
            <Description>
              Manage menu items and pricing
            </Description>
          </HeaderLeft>
          
          <AddButton onClick={openAddModal}>
            <Plus />
            Add Item
          </AddButton>
        </Header>

        {menuItems.length === 0 ? (
          <EmptyState>
            <h3>No Menu Items</h3>
            <p>Start by adding your first menu item</p>
          </EmptyState>
        ) : (
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
                <ItemFooter>
                  <IconButton 
                    $variant="edit" 
                    onClick={() => openEditModal(item)}
                  >
                    <Edit />
                    Edit
                  </IconButton>
                  <IconButton 
                    $variant="delete" 
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 />
                    Delete
                  </IconButton>
                </ItemFooter>
              </MenuItem>
            ))}
          </MenuGrid>
        )}
      </ContentCard>

      <Modal $isOpen={isModalOpen} onClick={closeModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</ModalTitle>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormField>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Jerk Chicken"
                required
              />
            </FormField>

            <FormField>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the item..."
              />
            </FormField>

            <FormField>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </FormField>

            <FormField>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={formData.available}
                  onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                />
                Available for ordering
              </CheckboxLabel>
            </FormField>

            <ModalFooter>
              <ModalButton type="button" $variant="secondary" onClick={closeModal}>
                Cancel
              </ModalButton>
              <ModalButton type="submit" $variant="primary">
                {editingItem ? 'Update Item' : 'Create Item'}
              </ModalButton>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
}
