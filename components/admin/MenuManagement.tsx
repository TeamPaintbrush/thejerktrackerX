import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { FOOD_CATEGORIES, PRESET_FOOD_ITEMS } from '../../lib/foodItems'

const SectionCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
`

const Heading = styled.h3<{
  $size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  $weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  $mb?: string
  $color?: string
}>`
  margin: 0;
  margin-bottom: ${props => props.$mb || '0'};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm': return '0.875rem'
      case 'md': return '1rem'
      case 'lg': return '1.125rem'
      case 'xl': return '1.25rem'
      case 'xxl': return '1.5rem'
      default: return '1rem'
    }
  }};
  font-weight: ${props => {
    switch (props.$weight) {
      case 'normal': return '400'
      case 'medium': return '500'
      case 'semibold': return '600'
      case 'bold': return '700'
      default: return '400'
    }
  }};
  color: ${props => props.$color || '#111827'};
  line-height: 1.2;
`

const Text = styled.p<{
  $size?: 'xs' | 'sm' | 'base' | 'lg'
  $weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  $color?: string
  $mb?: string
}>`
  margin: 0;
  margin-bottom: ${props => props.$mb || '0'};
  font-size: ${props => {
    switch (props.$size) {
      case 'xs': return '0.75rem'
      case 'sm': return '0.875rem'
      case 'lg': return '1.125rem'
      default: return '1rem'
    }
  }};
  font-weight: ${props => {
    switch (props.$weight) {
      case 'medium': return '500'
      case 'semibold': return '600'
      case 'bold': return '700'
      default: return '400'
    }
  }};
  color: ${props => props.$color || '#374151'};
  line-height: 1.5;
`

const Grid = styled.div<{ $gap?: string }>`
  display: grid;
  gap: ${props => props.$gap || '1rem'};
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #e7e5e4;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #d6d3d1;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`

const Flex = styled.div<{
  $align?: string
  $gap?: string
  $justify?: string
}>`
  display: flex;
  align-items: ${props => props.$align || 'stretch'};
  justify-content: ${props => props.$justify || 'flex-start'};
  gap: ${props => props.$gap || '0'};
`

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}

const MenuManagement: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <SectionCard>
        <Heading $size="xl" $weight="bold" $mb="1.5rem" $color="#1c1917">
          Menu Items
        </Heading>
        <Text $size="base" $color="#78716c" $mb="1.5rem">
          Browse and manage your restaurant&apos;s menu items. Click on any item to edit its details.
        </Text>
        
        {/* Categories */}
        {FOOD_CATEGORIES.map((category) => {
          const categoryItems = PRESET_FOOD_ITEMS.filter(item => item.category === category.id);
          
          return (
            <div key={category.id} style={{ marginBottom: '2rem' }}>
              <Heading $size="lg" $weight="semibold" $mb="1rem" $color="#44403c">
                {category.icon} {category.name}
              </Heading>
              <Grid $gap="1rem">
                {categoryItems.map((item) => (
                  <Card key={item.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <Text $size="base" $weight="semibold" $color="#1c1917">
                          {item.name}
                        </Text>
                        {item.popular && (
                          <span style={{ 
                            background: '#ed7734', 
                            color: 'white', 
                            padding: '0.125rem 0.5rem', 
                            borderRadius: '0.25rem', 
                            fontSize: '0.75rem',
                            marginLeft: '0.5rem'
                          }}>
                            Popular
                          </span>
                        )}
                      </div>
                      <Text $size="base" $weight="bold" $color="#ed7734">
                        {formatPrice(item.price)}
                      </Text>
                    </div>
                    <div style={{ marginBottom: '0.75rem' }}>
                      <Text $size="sm" $color="#78716c">
                        {item.description}
                      </Text>
                    </div>
                    <Flex $align="center" $gap="1rem">
                      {item.preparationTime && (
                        <Text $size="xs" $color="#a8a29e">
                          <Clock size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          {item.preparationTime}m
                        </Text>
                      )}
                      {item.spiceLevel && (
                        <Text $size="xs" $color="#a8a29e">
                          🌶️ {item.spiceLevel}
                        </Text>
                      )}
                      {item.allergens && item.allergens.length > 0 && (
                        <Text $size="xs" $color="#a8a29e">
                          Allergens: {item.allergens.join(', ')}
                        </Text>
                      )}
                    </Flex>
                  </Card>
                ))}
              </Grid>
            </div>
          );
        })}
      </SectionCard>
    </motion.div>
  )
}

export default MenuManagement