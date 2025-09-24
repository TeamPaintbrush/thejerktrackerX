// Client-side order service using localStorage
// Perfect for GitHub Pages static hosting without backend requirements

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDetails: string;
  status: 'pending' | 'picked_up';
  createdAt: Date;
  pickedUpAt?: Date;
  driverName?: string;
  driverCompany?: string;
}

export class DynamoDBService {
  // Storage key with environment prefix for GitHub Pages
  private static getStorageKey(): string {
    const baseKey = 'jerktracker_orders';
    const environment = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';
    return `${baseKey}_${environment}`;
  }

  // Test and get storage with comprehensive fallback
  private static getStorage(): { 
    getItem: (key: string) => string | null,
    setItem: (key: string, value: string) => void,
    available: boolean
  } {
    if (typeof window === 'undefined') {
      return {
        getItem: () => null,
        setItem: () => {},
        available: false
      };
    }

    // Test localStorage availability
    try {
      const testKey = 'jerktracker_storage_test_' + Date.now();
      const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
      
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      
      if (retrieved !== testValue) {
        throw new Error('localStorage test failed');
      }
      
      return {
        getItem: (key: string) => localStorage.getItem(key),
        setItem: (key: string, value: string) => localStorage.setItem(key, value),
        available: true
      };
    } catch (error) {
      console.warn('localStorage not available, using sessionStorage fallback:', error);
      
      // Try sessionStorage fallback
      try {
        const testKey = 'jerktracker_session_test_' + Date.now();
        const testValue = JSON.stringify({ test: true, timestamp: Date.now() });
        
        sessionStorage.setItem(testKey, testValue);
        const retrieved = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);
        
        if (retrieved === testValue) {
          return {
            getItem: (key: string) => sessionStorage.getItem(key),
            setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
            available: true
          };
        }
      } catch (sessionError) {
        console.warn('sessionStorage also not available:', sessionError);
      }
      
      // Final fallback to in-memory storage
      const memoryStorage: Record<string, string> = {};
      return {
        getItem: (key: string) => memoryStorage[key] || null,
        setItem: (key: string, value: string) => { memoryStorage[key] = value; },
        available: false
      };
    }
  }

  // Create a new order
  static async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    return this.createOrderLocal(order);
  }

  // Get all orders
  static async getAllOrders(): Promise<Order[]> {
    return this.getAllOrdersLocal();
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<Order | null> {
    return this.getOrderByIdLocal(id);
  }

  // Update order
  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    return this.updateOrderLocal(id, updates);
  }

  // Test storage functionality
  static testStorage(): { available: boolean, type: string, error?: string } {
    const storage = this.getStorage();
    
    if (!storage.available) {
      return { available: false, type: 'memory', error: 'Neither localStorage nor sessionStorage available' };
    }
    
    try {
      const testKey = this.getStorageKey() + '_test';
      const testOrder: Order = {
        id: 'test_' + Date.now(),
        orderNumber: 'TEST001',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        orderDetails: 'Test order details',
        status: 'pending',
        createdAt: new Date()
      };
      
      storage.setItem(testKey, JSON.stringify([testOrder]));
      const retrieved = storage.getItem(testKey);
      
      if (retrieved) {
        const parsed = JSON.parse(retrieved);
        if (parsed.length === 1 && parsed[0].id === testOrder.id) {
          // Clean up test data
          storage.setItem(testKey, '');
          return { available: true, type: 'persistent' };
        }
      }
      
      return { available: false, type: 'unknown', error: 'Storage test failed' };
    } catch (error) {
      return { available: false, type: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Local storage methods with enhanced error handling
  private static createOrderLocal(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    const storage = this.getStorage();
    const orders = this.getAllOrdersLocal();
    orders.push(newOrder);
    
    try {
      storage.setItem(this.getStorageKey(), JSON.stringify(orders));
      console.log('Order saved successfully:', newOrder.id);
    } catch (error) {
      console.error('Error saving order to storage:', error);
      // Still return the order even if storage fails
    }
    
    return newOrder;
  }

  private static getAllOrdersLocal(): Order[] {
    const storage = this.getStorage();
    const storageKey = this.getStorageKey();
    
    try {
      const stored = storage.getItem(storageKey);
      if (!stored || stored === 'null' || stored === '[]') {
        console.log('No orders found in storage');
        return [];
      }

      const orders = JSON.parse(stored);
      if (!Array.isArray(orders)) {
        console.warn('Invalid orders data in storage, resetting');
        storage.setItem(storageKey, '[]');
        return [];
      }

      const parsedOrders = orders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        pickedUpAt: order.pickedUpAt ? new Date(order.pickedUpAt) : undefined,
      }));

      console.log(`Loaded ${parsedOrders.length} orders from storage`);
      return parsedOrders;
    } catch (error) {
      console.error('Error parsing orders from storage:', error);
      // Try to reset storage on parse error
      try {
        storage.setItem(storageKey, '[]');
      } catch (resetError) {
        console.error('Failed to reset storage:', resetError);
      }
      return [];
    }
  }

  private static getOrderByIdLocal(id: string): Order | null {
    const orders = this.getAllOrdersLocal();
    const order = orders.find(order => order.id === id);
    
    if (order) {
      console.log('Order found:', order.id, order.orderNumber);
    } else {
      console.warn('Order not found:', id);
      console.log('Available order IDs:', orders.map(o => o.id));
    }
    
    return order || null;
  }

  private static updateOrderLocal(id: string, updates: Partial<Order>): Order | null {
    const storage = this.getStorage();
    const orders = this.getAllOrdersLocal();
    const index = orders.findIndex(order => order.id === id);

    if (index === -1) {
      console.warn('Order not found for update:', id);
      return null;
    }

    // Add pickup timestamp if status is being updated to picked_up
    if (updates.status === 'picked_up' && !updates.pickedUpAt) {
      updates.pickedUpAt = new Date();
    }

    orders[index] = { ...orders[index], ...updates };
    
    try {
      storage.setItem(this.getStorageKey(), JSON.stringify(orders));
      console.log('Order updated successfully:', id);
    } catch (error) {
      console.error('Error updating order in storage:', error);
    }
    
    return orders[index];
  }
}