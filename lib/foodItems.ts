export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  popular?: boolean;
  spiceLevel?: 'none' | 'mild' | 'medium' | 'hot' | 'extra-hot';
  allergens?: string[];
  preparationTime?: number; // in minutes
  // Extended fields for database items
  businessId?: string;
  customCategory?: string;
  dietary?: ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'halal' | 'kosher')[];
  availability?: {
    isAvailable: boolean;
    availableDays?: string[];
    availableTimeSlots?: { start: string; end: string }[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FoodCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}
export const FOOD_CATEGORIES: FoodCategory[] = [
  {
    id: 'mains',
    name: 'Main Dishes',
    description: 'Our signature jerk dishes and hearty mains',
    icon: '🍖'
  },
  {
    id: 'sides',
    name: 'Sides',
    description: 'Perfect accompaniments to your meal',
    icon: '🍚'
  },
  {
    id: 'appetizers',
    name: 'Appetizers',
    description: 'Start your meal right',
    icon: '🥘'
  },
  {
    id: 'beverages',
    name: 'Beverages',
    description: 'Refresh yourself with our drinks',
    icon: '🥤'
  },
  {
    id: 'desserts',
    name: 'Desserts',
    description: 'Sweet endings to your meal',
    icon: '🍰'
  }
];

export const PRESET_FOOD_ITEMS: FoodItem[] = [
  // Main Dishes
  {
    id: 'jerk-chicken-combo',
    name: 'Jerk Chicken Combo',
    description: 'Our signature jerk chicken with rice & peas, coleslaw, and plantains',
    price: 16.99,
    category: 'mains',
    popular: true,
    spiceLevel: 'medium',
    preparationTime: 15,
    allergens: ['soy']
  },
  {
    id: 'curry-goat',
    name: 'Curry Goat',
    description: 'Tender goat meat slow-cooked in aromatic curry spices, served with rice',
    price: 19.99,
    category: 'mains',
    popular: true,
    spiceLevel: 'mild',
    preparationTime: 20,
    allergens: []
  },
  {
    id: 'ackee-saltfish',
    name: 'Ackee & Saltfish',
    description: 'Jamaica\'s national dish with boiled green bananas and dumplings',
    price: 17.99,
    category: 'mains',
    spiceLevel: 'mild',
    preparationTime: 12,
    allergens: ['fish']
  },
  {
    id: 'jerk-pork',
    name: 'Jerk Pork',
    description: 'Spicy marinated pork shoulder, grilled to perfection',
    price: 18.99,
    category: 'mains',
    spiceLevel: 'hot',
    preparationTime: 18,
    allergens: ['soy']
  },
  {
    id: 'brown-stew-chicken',
    name: 'Brown Stew Chicken',
    description: 'Chicken pieces braised in rich brown sauce with vegetables',
    price: 15.99,
    category: 'mains',
    spiceLevel: 'mild',
    preparationTime: 16,
    allergens: []
  },
  {
    id: 'escovitch-fish',
    name: 'Escovitch Fish',
    description: 'Fried snapper topped with spicy pickled vegetables',
    price: 21.99,
    category: 'mains',
    spiceLevel: 'medium',
    preparationTime: 14,
    allergens: ['fish']
  },
  {
    id: 'oxtail-stew',
    name: 'Oxtail Stew',
    description: 'Fall-off-the-bone oxtail braised with butter beans',
    price: 23.99,
    category: 'mains',
    popular: true,
    spiceLevel: 'mild',
    preparationTime: 25,
    allergens: []
  },

  // Sides
  {
    id: 'rice-peas',
    name: 'Rice & Peas',
    description: 'Coconut rice cooked with kidney beans and spices',
    price: 4.99,
    category: 'sides',
    popular: true,
    preparationTime: 5,
    allergens: []
  },
  {
    id: 'plantains',
    name: 'Sweet Plantains',
    description: 'Caramelized ripe plantains',
    price: 3.99,
    category: 'sides',
    preparationTime: 8,
    allergens: []
  },
  {
    id: 'festival',
    name: 'Festival',
    description: 'Sweet fried dumplings, crispy outside and soft inside',
    price: 2.99,
    category: 'sides',
    preparationTime: 6,
    allergens: ['gluten']
  },
  {
    id: 'coleslaw',
    name: 'Coleslaw',
    description: 'Fresh cabbage and carrot salad with tangy dressing',
    price: 3.49,
    category: 'sides',
    preparationTime: 2,
    allergens: ['dairy']
  },
  {
    id: 'mac-cheese',
    name: 'Mac & Cheese',
    description: 'Creamy baked macaroni and cheese',
    price: 5.99,
    category: 'sides',
    preparationTime: 4,
    allergens: ['dairy', 'gluten']
  },
  {
    id: 'steamed-vegetables',
    name: 'Steamed Vegetables',
    description: 'Fresh seasonal vegetables lightly steamed',
    price: 4.49,
    category: 'sides',
    preparationTime: 6,
    allergens: []
  },

  // Appetizers
  {
    id: 'jamaican-patties',
    name: 'Jamaican Beef Patties',
    description: 'Flaky pastry filled with spiced ground beef (2 pieces)',
    price: 6.99,
    category: 'appetizers',
    popular: true,
    spiceLevel: 'medium',
    preparationTime: 8,
    allergens: ['gluten']
  },
  {
    id: 'chicken-patties',
    name: 'Jamaican Chicken Patties',
    description: 'Flaky pastry filled with seasoned chicken (2 pieces)',
    price: 6.99,
    category: 'appetizers',
    spiceLevel: 'mild',
    preparationTime: 8,
    allergens: ['gluten']
  },
  {
    id: 'saltfish-fritters',
    name: 'Saltfish Fritters',
    description: 'Crispy fried fritters with saltfish and scotch bonnet (6 pieces)',
    price: 8.99,
    category: 'appetizers',
    spiceLevel: 'medium',
    preparationTime: 10,
    allergens: ['fish', 'gluten']
  },

  // Beverages
  {
    id: 'sorrel-drink',
    name: 'Sorrel Drink',
    description: 'Traditional hibiscus drink with ginger and spices',
    price: 3.99,
    category: 'beverages',
    popular: true,
    preparationTime: 2,
    allergens: []
  },
  {
    id: 'ginger-beer',
    name: 'Jamaican Ginger Beer',
    description: 'Spicy homemade ginger beer',
    price: 3.49,
    category: 'beverages',
    spiceLevel: 'medium',
    preparationTime: 2,
    allergens: []
  },
  {
    id: 'coconut-water',
    name: 'Fresh Coconut Water',
    description: 'Pure coconut water from young coconuts',
    price: 4.99,
    category: 'beverages',
    preparationTime: 3,
    allergens: []
  },
  {
    id: 'rum-punch',
    name: 'Virgin Rum Punch',
    description: 'Non-alcoholic tropical fruit punch',
    price: 4.49,
    category: 'beverages',
    preparationTime: 3,
    allergens: []
  },

  // Desserts
  {
    id: 'rum-cake',
    name: 'Jamaican Rum Cake',
    description: 'Moist cake soaked in rum syrup (alcohol-free version available)',
    price: 6.99,
    category: 'desserts',
    popular: true,
    preparationTime: 3,
    allergens: ['gluten', 'dairy', 'eggs']
  },
  {
    id: 'coconut-drops',
    name: 'Coconut Drops',
    description: 'Sweet coconut candy with ginger (4 pieces)',
    price: 4.99,
    category: 'desserts',
    preparationTime: 2,
    allergens: []
  },
  {
    id: 'plantain-tart',
    name: 'Plantain Tart',
    description: 'Sweet plantain custard tart',
    price: 5.99,
    category: 'desserts',
    preparationTime: 4,
    allergens: ['gluten', 'dairy', 'eggs']
  }
];

// Helper functions for preset items (legacy support)
export const getFoodItemsByCategory = (categoryId: string): FoodItem[] => {
  return PRESET_FOOD_ITEMS.filter(item => item.category === categoryId);
};

export const getPopularFoodItems = (): FoodItem[] => {
  return PRESET_FOOD_ITEMS.filter(item => item.popular);
};

export const getFoodItemById = (id: string): FoodItem | undefined => {
  return PRESET_FOOD_ITEMS.find(item => item.id === id);
};

export const searchFoodItems = (query: string): FoodItem[] => {
  const lowercaseQuery = query.toLowerCase();
  return PRESET_FOOD_ITEMS.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery)
  );
};

// Helper functions for dynamic menu items (database + presets)
/**
 * Merge preset items with database items
 * Database items take precedence over presets with same ID
 */
export const mergeFoodItems = (dbItems: FoodItem[], includePresets = true): FoodItem[] => {
  if (!includePresets) return dbItems;
  
  const merged = [...dbItems];
  const dbIds = new Set(dbItems.map(item => item.id));
  
  // Add preset items that aren't overridden by database items
  PRESET_FOOD_ITEMS.forEach(preset => {
    if (!dbIds.has(preset.id)) {
      merged.push(preset);
    }
  });
  
  return merged;
};

/**
 * Get all food items (database + presets) by category
 */
export const getAllFoodItemsByCategory = (allItems: FoodItem[], categoryId: string): FoodItem[] => {
  return allItems.filter(item => item.category === categoryId);
};

/**
 * Get popular items from merged list
 */
export const getAllPopularFoodItems = (allItems: FoodItem[]): FoodItem[] => {
  return allItems.filter(item => item.popular);
};

/**
 * Search across all items (database + presets)
 */
export const searchAllFoodItems = (allItems: FoodItem[], query: string): FoodItem[] => {
  const lowercaseQuery = query.toLowerCase();
  return allItems.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.description.toLowerCase().includes(lowercaseQuery) ||
    item.allergens?.some(allergen => allergen.toLowerCase().includes(lowercaseQuery))
  );
};

export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const getSpiceLevelEmoji = (level?: string): string => {
  switch (level) {
    case 'mild': return '🌶️';
    case 'medium': return '🌶️🌶️';
    case 'hot': return '🌶️🌶️🌶️';
    case 'extra-hot': return '🌶️🌶️🌶️🔥';
    default: return '';
  }
};