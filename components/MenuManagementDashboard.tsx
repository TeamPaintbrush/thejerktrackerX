'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Plus, Search, Edit2, Trash2, Clock, AlertCircle, Filter, RefreshCw } from 'lucide-react';
import MenuItemEditor from './MenuItemEditor';
import { FOOD_CATEGORIES, formatPrice, getSpiceLevelEmoji, mergeFoodItems, getAllFoodItemsByCategory, searchAllFoodItems } from '@/lib/foodItems';
import type { MenuItem } from '@/lib/dynamodb';
import { DynamoDBService } from '@/lib/dynamodb';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HeaderContent = styled.div`
  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    color: #78716c;
    margin: 0;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  white-space: nowrap;
  
  ${props => {
    if (props.$variant === 'danger') {
      return `
        background: #dc2626;
        color: white;
        
        &:hover:not(:disabled) {
          background: #b91c1c;
        }
      `;
    } else if (props.$variant === 'secondary') {
      return `
        background: white;
        color: #78716c;
        border: 1px solid #e7e5e4;
        
        &:hover:not(:disabled) {
          background: #f5f5f4;
        }
      `;
    } else {
      return `
        background: #ed7734;
        color: white;
        
        &:hover:not(:disabled) {
          background: #dc6627;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
        }
      `;
    }
  }}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;
  
  svg {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #a8a29e;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border: 1px solid #e7e5e4;
    border-radius: 8px;
    font-size: 0.875rem;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #ed7734;
      box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterChip = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${props => props.$active ? '#ed7734' : '#e7e5e4'};
  background: ${props => props.$active ? '#fef7ee' : 'white'};
  color: ${props => props.$active ? '#9a3412' : '#78716c'};
  
  &:hover {
    border-color: #ed7734;
    background: #fef7ee;
    color: #9a3412;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid #e7e5e4;
  
  .label {
    font-size: 0.875rem;
    color: #78716c;
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 2rem;
    font-weight: 700;
    color: #1c1917;
  }
`;

const CategorySection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e7e5e4;
  
  h3 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ItemCard = styled.div<{ $unavailable?: boolean }>`
  background: ${props => props.$unavailable ? '#fafaf9' : 'white'};
  border: 1px solid #e7e5e4;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s;
  opacity: ${props => props.$unavailable ? 0.6 : 1};
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d6d3d1;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 0.5rem;
`;

const ItemTitle = styled.div`
  flex: 1;
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #1c1917;
    margin: 0 0 0.25rem 0;
  }
`;

const Price = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #ed7734;
  white-space: nowrap;
`;

const ItemDescription = styled.p`
  font-size: 0.875rem;
  color: #78716c;
  line-height: 1.5;
  margin: 0 0 0.75rem 0;
`;

const ItemMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const Badge = styled.span<{ $color?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => props.$color === 'orange' ? '#fef7ee' : '#f5f5f4'};
  border: 1px solid ${props => props.$color === 'orange' ? '#fed7aa' : '#e7e5e4'};
  color: ${props => props.$color === 'orange' ? '#9a3412' : '#57534e'};
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f5f5f4;
`;

const IconButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e7e5e4;
  background: white;
  color: ${props => props.$variant === 'delete' ? '#dc2626' : '#44403c'};
  
  &:hover {
    background: ${props => props.$variant === 'delete' ? '#fef2f2' : '#f5f5f4'};
    border-color: ${props => props.$variant === 'delete' ? '#fecaca' : '#d6d3d1'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #78716c;
  
  svg {
    margin: 0 auto 1rem;
    color: #d6d3d1;
  }
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #44403c;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    margin: 0;
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #78716c;
  gap: 0.75rem;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface MenuManagementDashboardProps {
  businessId: string;
  showPresetItems?: boolean;  // Whether to show preset items alongside database items
}

const MenuManagementDashboard: React.FC<MenuManagementDashboardProps> = ({
  businessId,
  showPresetItems = true
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>();

  const loadMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      const dbItems = await DynamoDBService.getMenuItems(businessId);
      const merged = mergeFoodItems(dbItems as any, showPresetItems);
      setMenuItems(merged as MenuItem[]);
      setFilteredItems(merged as MenuItem[]);
    } catch (error) {
      console.error('Error loading menu items:', error);
    } finally {
      setLoading(false);
    }
  }, [businessId, showPresetItems]);

  useEffect(() => {
    loadMenuItems();
  }, [loadMenuItems]);

  useEffect(() => {
    let filtered = menuItems;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = getAllFoodItemsByCategory(filtered as any, selectedCategory) as MenuItem[];
    }

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchAllFoodItems(filtered as any, searchQuery) as MenuItem[];
    }

    setFilteredItems(filtered);
  }, [searchQuery, selectedCategory, menuItems]);

  const handleSaveItem = async (itemData: Partial<MenuItem>) => {
    try {
      if (editingItem?.id) {
        await DynamoDBService.updateMenuItem(editingItem.id, itemData);
      } else {
        await DynamoDBService.createMenuItem(itemData as Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>);
      }
      
      setShowEditor(false);
      setEditingItem(undefined);
      await loadMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      throw error;
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item? This action cannot be undone.')) {
      return;
    }

    try {
      await DynamoDBService.deleteMenuItem(itemId);
      await loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  const handleCreateNew = () => {
    setEditingItem(undefined);
    setShowEditor(true);
  };

  // Calculate stats
  const totalItems = menuItems.length;
  const availableItems = menuItems.filter(item => item.availability?.isAvailable !== false).length;
  const popularItems = menuItems.filter(item => item.popular).length;

  // Group items by category
  const categorizedItems: Record<string, MenuItem[]> = {};
  const allCategories = [...FOOD_CATEGORIES, { id: 'custom', name: 'Custom Categories', icon: '📋' }];
  
  filteredItems.forEach(item => {
    const categoryKey = item.category === 'custom' ? item.customCategory || 'custom' : item.category;
    if (!categorizedItems[categoryKey]) {
      categorizedItems[categoryKey] = [];
    }
    categorizedItems[categoryKey].push(item);
  });

  return (
    <Container>
      <Header>
        <HeaderContent>
          <h2>Menu Management</h2>
          <p>Create and manage your menu items for all locations</p>
        </HeaderContent>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button $variant="secondary" onClick={loadMenuItems} disabled={loading}>
            <RefreshCw size={18} />
            Refresh
          </Button>
          <Button $variant="primary" onClick={handleCreateNew}>
            <Plus size={18} />
            Add Menu Item
          </Button>
        </div>
      </Header>

      <Stats>
        <StatCard>
          <div className="label">Total Items</div>
          <div className="value">{totalItems}</div>
        </StatCard>
        <StatCard>
          <div className="label">Available</div>
          <div className="value">{availableItems}</div>
        </StatCard>
        <StatCard>
          <div className="label">Popular Items</div>
          <div className="value">{popularItems}</div>
        </StatCard>
      </Stats>

      <Toolbar>
        <SearchBox>
          <Search size={18} />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBox>
        
        <FilterGroup>
          <FilterChip
            $active={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
          >
            All Items
          </FilterChip>
          {FOOD_CATEGORIES.map(category => (
            <FilterChip
              key={category.id}
              $active={selectedCategory === category.id}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.icon} {category.name}
            </FilterChip>
          ))}
        </FilterGroup>
      </Toolbar>

      {loading ? (
        <LoadingState>
          <RefreshCw size={24} />
          <span>Loading menu items...</span>
        </LoadingState>
      ) : filteredItems.length === 0 ? (
        <EmptyState>
          <AlertCircle size={48} />
          <h3>No menu items found</h3>
          <p>
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Get started by creating your first menu item'}
          </p>
          {!searchQuery && selectedCategory === 'all' && (
            <Button $variant="primary" onClick={handleCreateNew} style={{ marginTop: '1rem' }}>
              <Plus size={18} />
              Create First Item
            </Button>
          )}
        </EmptyState>
      ) : (
        Object.entries(categorizedItems).map(([categoryKey, items]) => {
          const category = allCategories.find(c => c.id === categoryKey) || 
                          { id: categoryKey, name: categoryKey, icon: '📋' };
          
          return (
            <CategorySection key={categoryKey}>
              <h3>
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#78716c' }}>
                  ({items.length})
                </span>
              </h3>
              
              <ItemGrid>
                {items.map(item => (
                  <ItemCard key={item.id} $unavailable={item.availability?.isAvailable === false}>
                    <ItemHeader>
                      <ItemTitle>
                        <h4>{item.name}</h4>
                      </ItemTitle>
                      <Price>{formatPrice(item.price)}</Price>
                    </ItemHeader>

                    <ItemDescription>{item.description}</ItemDescription>

                    <ItemMeta>
                      {item.popular && (
                        <Badge $color="orange">⭐ Popular</Badge>
                      )}
                      {item.spiceLevel && item.spiceLevel !== 'none' && (
                        <Badge>{getSpiceLevelEmoji(item.spiceLevel)} {item.spiceLevel}</Badge>
                      )}
                      {item.preparationTime && (
                        <Badge>
                          <Clock size={12} />
                          {item.preparationTime}m
                        </Badge>
                      )}
                      {item.dietary?.map(diet => (
                        <Badge key={diet}>{diet}</Badge>
                      ))}
                      {item.availability?.isAvailable === false && (
                        <Badge $color="orange">Unavailable</Badge>
                      )}
                    </ItemMeta>

                    {item.allergens && item.allergens.length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#a8a29e', marginBottom: '0.75rem' }}>
                        Allergens: {item.allergens.join(', ')}
                      </div>
                    )}

                    <ItemActions>
                      <IconButton $variant="edit" onClick={() => handleEditItem(item)}>
                        <Edit2 size={16} />
                        Edit
                      </IconButton>
                      {!item.id.startsWith('jerk-') && !item.id.startsWith('curry-') && (
                        <IconButton $variant="delete" onClick={() => handleDeleteItem(item.id)}>
                          <Trash2 size={16} />
                          Delete
                        </IconButton>
                      )}
                    </ItemActions>
                  </ItemCard>
                ))}
              </ItemGrid>
            </CategorySection>
          );
        })
      )}

      {showEditor && (
        <MenuItemEditor
          menuItem={editingItem}
          businessId={businessId}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowEditor(false);
            setEditingItem(undefined);
          }}
        />
      )}
    </Container>
  );
};

export default MenuManagementDashboard;
