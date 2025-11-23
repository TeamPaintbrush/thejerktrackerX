'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Plus, Star, Clock, Flame } from 'lucide-react';
import { Card, Button, Flex, Grid } from '../styles/components';
import { 
  FoodItem, 
  FoodCategory, 
  FOOD_CATEGORIES, 
  PRESET_FOOD_ITEMS,
  mergeFoodItems,
  getAllFoodItemsByCategory,
  getAllPopularFoodItems,
  searchAllFoodItems,
  formatPrice,
  getSpiceLevelEmoji
} from '../lib/foodItems';
import { DynamoDBService } from '../lib/dynamodb';

const SelectorContainer = styled(Card)`
  background: white;
  border: 1px solid #e7e5e4;
  margin-bottom: 1.5rem;
`;

const SelectorHeader = styled.div`
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #f5f5f4;
`;

const SelectorTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1c1917;
  margin: 0 0 1rem 0;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a8a29e;
  width: 16px;
  height: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d6d3d1;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }

  &::placeholder {
    color: #a8a29e;
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f4;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d6d3d1;
    border-radius: 2px;
  }
`;

const CategoryTab = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.$active ? '#ed7734' : '#d6d3d1'};
  border-radius: 9999px;
  background: ${props => props.$active ? '#ed773410' : 'white'};
  color: ${props => props.$active ? '#ed7734' : '#57534e'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    border-color: #ed7734;
    background: #ed773410;
  }
`;

const ItemsContent = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f5f5f4;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d6d3d1;
    border-radius: 3px;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FoodItemCard = styled.div<{ selected?: boolean }>`
  border: 1px solid ${props => props.selected ? '#ed7734' : '#e7e5e4'};
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#ed773405' : 'white'};
  position: relative;

  &:hover {
    border-color: #ed7734;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const ItemName = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1c1917;
  margin: 0;
  line-height: 1.25;
`;

const ItemPrice = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #ed7734;
`;

const ItemDescription = styled.p`
  font-size: 0.75rem;
  color: #78716c;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ItemMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const ItemMetaLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetaBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #78716c;
`;

const PopularBadge = styled.span`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #ed7734;
  color: white;
  border-radius: 9999px;
  padding: 0.25rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddButton = styled(Button)`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ed7734;
  border: none;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${FoodItemCard}:hover & {
    opacity: 1;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #78716c;
`;

const SelectedItemsCount = styled.div`
  display: flex;
  align-items: center;  
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: #f5f5f4;
  border-top: 1px solid #e7e5e4;
  font-size: 0.875rem;
  color: #44403c;
`;

const SelectedCountText = styled.span`
  font-weight: 500;
`;

const ClearButton = styled.button`
  color: #ed7734;
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

interface SelectedFoodItem extends FoodItem {
  quantity: number;
}

interface FoodItemSelectorProps {
  selectedItems: SelectedFoodItem[];
  onItemSelect: (item: FoodItem) => void;
  onItemRemove: (itemId: string) => void;
  onClearAll: () => void;
  businessId?: string;  // Optional: if provided, loads menu items from database
  includePresets?: boolean;  // Whether to include preset items (default: true)
}

const FoodItemSelector: React.FC<FoodItemSelectorProps> = ({
  selectedItems,
  onItemSelect,
  onItemRemove,
  onClearAll,
  businessId,
  includePresets = true
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [allMenuItems, setAllMenuItems] = useState<FoodItem[]>(PRESET_FOOD_ITEMS);
  const [loading, setLoading] = useState(false);

  // Load menu items from database if businessId is provided
  useEffect(() => {
    const loadMenuItems = async () => {
      if (businessId) {
        setLoading(true);
        try {
          const dbItems = await DynamoDBService.getMenuItems(businessId);
          const merged = mergeFoodItems(dbItems as any, includePresets);
          setAllMenuItems(merged as FoodItem[]);
        } catch (error) {
          console.error('Error loading menu items:', error);
          // Fallback to preset items only
          setAllMenuItems(PRESET_FOOD_ITEMS);
        } finally {
          setLoading(false);
        }
      } else {
        // No businessId provided, use preset items only
        setAllMenuItems(PRESET_FOOD_ITEMS);
      }
    };

    loadMenuItems();
  }, [businessId, includePresets]);

  const filteredItems = useMemo(() => {
    // Filter out unavailable items
    const availableItems = allMenuItems.filter(item => 
      !item.availability || item.availability.isAvailable !== false
    );

    if (searchQuery.trim()) {
      return searchAllFoodItems(availableItems, searchQuery) as FoodItem[];
    }

    if (activeCategory === 'popular') {
      return getAllPopularFoodItems(availableItems) as FoodItem[];
    }

    return getAllFoodItemsByCategory(availableItems, activeCategory) as FoodItem[];
  }, [activeCategory, searchQuery, allMenuItems]);

  const isItemSelected = (itemId: string) => {
    return selectedItems.some(item => item.id === itemId);
  };

  const totalSelectedItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const categories = [
    { id: 'popular', name: 'Popular', icon: '⭐' },
    ...FOOD_CATEGORIES
  ];

  if (loading) {
    return (
      <SelectorContainer>
        <SelectorHeader>
          <SelectorTitle>Loading menu items...</SelectorTitle>
        </SelectorHeader>
      </SelectorContainer>
    );
  }

  return (
    <SelectorContainer>
      <SelectorHeader>
        <SelectorTitle>Select Food Items</SelectorTitle>
        
        <SearchContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Search for dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <CategoryTabs>
          {categories.map((category) => (
            <CategoryTab
              key={category.id}
              $active={activeCategory === category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setSearchQuery(''); // Clear search when switching categories
              }}
            >
              <span>{category.icon}</span>
              {category.name}
            </CategoryTab>
          ))}
        </CategoryTabs>
      </SelectorHeader>

      <ItemsContent>
        {filteredItems.length === 0 ? (
          <EmptyState>
            {searchQuery ? 
              `No items found for "${searchQuery}"` : 
              'No items available in this category'
            }
          </EmptyState>
        ) : (
          <ItemsGrid>
            {filteredItems.map((item) => (
              <FoodItemCard
                key={item.id}
                selected={isItemSelected(item.id)}
                onClick={() => onItemSelect(item)}
              >
                {item.popular && (
                  <PopularBadge>
                    <Star size={12} />
                  </PopularBadge>
                )}

                <ItemHeader>
                  <ItemName>{item.name}</ItemName>
                  <ItemPrice>{formatPrice(item.price)}</ItemPrice>
                </ItemHeader>

                <ItemDescription>{item.description}</ItemDescription>

                <ItemMeta>
                  <ItemMetaLeft>
                    {item.preparationTime && (
                      <MetaBadge>
                        <Clock size={12} />
                        {item.preparationTime}m
                      </MetaBadge>
                    )}
                    {item.spiceLevel && (
                      <MetaBadge>
                        <Flame size={12} />
                        {getSpiceLevelEmoji(item.spiceLevel)}
                      </MetaBadge>
                    )}
                  </ItemMetaLeft>
                </ItemMeta>

                {isItemSelected(item.id) && (
                  <AddButton onClick={(e) => {
                    e.stopPropagation();
                    onItemRemove(item.id);
                  }}>
                    <Plus style={{ transform: 'rotate(45deg)' }} />
                  </AddButton>
                )}
              </FoodItemCard>
            ))}
          </ItemsGrid>
        )}
      </ItemsContent>

      {totalSelectedItems > 0 && (
        <SelectedItemsCount>
          <SelectedCountText>
            {totalSelectedItems} item{totalSelectedItems !== 1 ? 's' : ''} selected • {formatPrice(totalPrice)}
          </SelectedCountText>
          <ClearButton onClick={onClearAll}>
            Clear All
          </ClearButton>
        </SelectedItemsCount>
      )}
    </SelectorContainer>
  );
};

export default FoodItemSelector;