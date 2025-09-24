// Hybrid order service using AWS DynamoDB with localStorage fallback
// Works both locally and on GitHub Pages with proper AWS configuration

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  ScanCommand, 
  UpdateCommand 
} from '@aws-sdk/lib-dynamodb';
import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDetails: string;
  status: 'pending' | 'picked_up' | 'delivered';
  createdAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  driverName?: string;
  driverCompany?: string;
  deliveryConfirmationMethod?: 'manual' | 'auto-timeout';
}

export class DynamoDBService {
  private static client: DynamoDBDocumentClient | null = null;
  private static fallbackMode = false;

  // AWS DynamoDB Configuration
  private static getConfig() {
    return {
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      tableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'jerktracker-orders',
      enableDynamoDB: process.env.NEXT_PUBLIC_ENABLE_DYNAMODB !== 'false',
      fallbackMode: process.env.NEXT_PUBLIC_FALLBACK_MODE === 'true'
    };
  }

  // Initialize DynamoDB Client
  private static async initClient(): Promise<DynamoDBDocumentClient | null> {
    if (this.client) return this.client;
    
    const config = this.getConfig();
    
    if (!config.enableDynamoDB || config.fallbackMode) {
      console.log('DynamoDB disabled or in fallback mode, using localStorage');
      this.fallbackMode = true;
      return null;
    }

    try {
      let dynamoClient: DynamoDBClient;

      if (typeof window !== 'undefined') {
        // Browser environment - use Cognito Identity Pool for unauthenticated access
        // You'll need to set up a Cognito Identity Pool in AWS
        const cognitoIdentityPoolId = process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID;
        
        if (cognitoIdentityPoolId) {
          dynamoClient = new DynamoDBClient({
            region: config.region,
            credentials: fromCognitoIdentityPool({
              identityPoolId: cognitoIdentityPoolId,
              clientConfig: { region: config.region }
            })
          });
        } else {
          console.warn('No Cognito Identity Pool configured, falling back to localStorage');
          this.fallbackMode = true;
          return null;
        }
      } else {
        // Server environment - use AWS credentials from environment
        dynamoClient = new DynamoDBClient({
          region: config.region,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
          }
        });
      }

      this.client = DynamoDBDocumentClient.from(dynamoClient);
      
      // Test the connection
      await this.testConnection();
      
      console.log('DynamoDB client initialized successfully');
      return this.client;
    } catch (error) {
      console.error('Failed to initialize DynamoDB client:', error);
      this.fallbackMode = true;
      return null;
    }
  }

  // Test DynamoDB connection
  private static async testConnection(): Promise<boolean> {
    try {
      if (!this.client) return false;
      
      const config = this.getConfig();
      
      // Simple connection test - just scan the table
      await this.client.send(new ScanCommand({
        TableName: config.tableName,
        Limit: 1
      }));

      console.log('DynamoDB connection test successful');
      return true;
    } catch (error) {
      console.error('DynamoDB connection test failed:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      return false;
    }
  }

  // Storage key with environment prefix for localStorage fallback
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
    const client = await this.initClient();
    
    if (client && !this.fallbackMode) {
      return this.createOrderDynamoDB(order, client);
    } else {
      console.log('Using localStorage fallback for createOrder');
      return this.createOrderLocal(order);
    }
  }

  // Get all orders
  static async getAllOrders(): Promise<Order[]> {
    const client = await this.initClient();
    
    if (client && !this.fallbackMode) {
      return this.getAllOrdersDynamoDB(client);
    } else {
      console.log('Using localStorage fallback for getAllOrders');
      return this.getAllOrdersLocal();
    }
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<Order | null> {
    const client = await this.initClient();
    
    if (client && !this.fallbackMode) {
      return this.getOrderByIdDynamoDB(id, client);
    } else {
      console.log('Using localStorage fallback for getOrderById');
      return this.getOrderByIdLocal(id);
    }
  }

  // Update order
  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const client = await this.initClient();
    
    if (client && !this.fallbackMode) {
      return this.updateOrderDynamoDB(id, updates, client);
    } else {
      console.log('Using localStorage fallback for updateOrder');
      return this.updateOrderLocal(id, updates);
    }
  }

  // Check service status
  static async getServiceStatus(): Promise<{
    dynamoDBAvailable: boolean;
    fallbackMode: boolean;
    storageType: 'dynamodb' | 'localStorage' | 'sessionStorage' | 'memory';
    region?: string;
    tableName?: string;
  }> {
    const config = this.getConfig();
    const client = await this.initClient();
    const storage = this.getStorage();
    
    let storageType: 'dynamodb' | 'localStorage' | 'sessionStorage' | 'memory' = 'memory';
    
    if (client && !this.fallbackMode) {
      storageType = 'dynamodb';
    } else if (storage.available) {
      storageType = typeof localStorage !== 'undefined' ? 'localStorage' : 'sessionStorage';
    }
    
    return {
      dynamoDBAvailable: !!client && !this.fallbackMode,
      fallbackMode: this.fallbackMode,
      storageType,
      region: config.region,
      tableName: config.tableName
    };
  }

  // DynamoDB Methods
  private static async createOrderDynamoDB(order: Omit<Order, 'id' | 'createdAt'>, client: DynamoDBDocumentClient): Promise<Order> {
    const config = this.getConfig();
    const newOrder: Order = {
      ...order,
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };

    try {
      const item = {
        ...newOrder,
        createdAt: newOrder.createdAt.toISOString(),
        pickedUpAt: newOrder.pickedUpAt?.toISOString()
      };

      await client.send(new PutCommand({
        TableName: config.tableName,
        Item: item
      }));

      console.log('Order created in DynamoDB:', newOrder.id);
      
      // Also store in localStorage as cache
      this.createOrderLocal(newOrder);
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order in DynamoDB:', error);
      // Fallback to localStorage
      return this.createOrderLocal(order);
    }
  }

  private static async getAllOrdersDynamoDB(client: DynamoDBDocumentClient): Promise<Order[]> {
    const config = this.getConfig();

    try {
      const result = await client.send(new ScanCommand({
        TableName: config.tableName
      }));

      const orders = (result.Items || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        pickedUpAt: item.pickedUpAt ? new Date(item.pickedUpAt) : undefined,
      })) as Order[];

      console.log(`Loaded ${orders.length} orders from DynamoDB`);
      
      // Cache in localStorage
      const storage = this.getStorage();
      if (storage.available) {
        try {
          storage.setItem(this.getStorageKey(), JSON.stringify(orders));
        } catch (cacheError) {
          console.warn('Failed to cache orders in localStorage:', cacheError);
        }
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders from DynamoDB:', error);
      // Fallback to localStorage
      return this.getAllOrdersLocal();
    }
  }

  private static async getOrderByIdDynamoDB(id: string, client: DynamoDBDocumentClient): Promise<Order | null> {
    const config = this.getConfig();

    try {
      const result = await client.send(new GetCommand({
        TableName: config.tableName,
        Key: { id }
      }));

      if (result.Item) {
        const order = {
          ...result.Item,
          createdAt: new Date(result.Item.createdAt),
          pickedUpAt: result.Item.pickedUpAt ? new Date(result.Item.pickedUpAt) : undefined,
        } as Order;

        console.log('Order found in DynamoDB:', order.id, order.orderNumber);
        return order;
      }

      console.warn('Order not found in DynamoDB:', id);
      return null;
    } catch (error) {
      console.error('Error fetching order from DynamoDB:', error);
      // Fallback to localStorage
      return this.getOrderByIdLocal(id);
    }
  }

  private static async updateOrderDynamoDB(id: string, updates: Partial<Order>, client: DynamoDBDocumentClient): Promise<Order | null> {
    const config = this.getConfig();

    try {
      // Add pickup timestamp if status is being updated to picked_up
      if (updates.status === 'picked_up' && !updates.pickedUpAt) {
        updates.pickedUpAt = new Date();
      }

      const updateExpression = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .map(key => `#${key} = :${key}`)
        .join(', ');

      const expressionAttributeNames = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {});

      const expressionAttributeValues = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'createdAt')
        .reduce((acc, key) => {
          const value = updates[key as keyof Order];
          return {
            ...acc,
            [`:${key}`]: value instanceof Date ? value.toISOString() : value
          };
        }, {});

      await client.send(new UpdateCommand({
        TableName: config.tableName,
        Key: { id },
        UpdateExpression: `SET ${updateExpression}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      }));

      console.log('Order updated in DynamoDB:', id);
      
      // Also update localStorage cache
      this.updateOrderLocal(id, updates);
      
      // Fetch the updated order
      return this.getOrderByIdDynamoDB(id, client);
    } catch (error) {
      console.error('Error updating order in DynamoDB:', error);
      // Fallback to localStorage
      return this.updateOrderLocal(id, updates);
    }
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
  private static createOrderLocal(order: Omit<Order, 'id' | 'createdAt'> | Order): Order {
    let newOrder: Order;
    
    if ('id' in order && 'createdAt' in order) {
      // If it's already a complete Order object, use it as is
      newOrder = order as Order;
    } else {
      // Create new order with generated ID and timestamp
      newOrder = {
        ...order,
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      };
    }

    const storage = this.getStorage();
    const orders = this.getAllOrdersLocal();
    
    // Check if order already exists (for caching from DynamoDB)
    const existingIndex = orders.findIndex(o => o.id === newOrder.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = newOrder;
    } else {
      orders.push(newOrder);
    }
    
    try {
      const serializedOrders = orders.map(o => ({
        ...o,
        createdAt: o.createdAt.toISOString(),
        pickedUpAt: o.pickedUpAt?.toISOString()
      }));
      
      storage.setItem(this.getStorageKey(), JSON.stringify(serializedOrders));
      console.log('Order saved to localStorage:', newOrder.id);
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

  // Auto-complete orders that have been picked up for more than 2 hours
  static async autoCompleteOverdueOrders(): Promise<void> {
    try {
      const orders = await this.getAllOrders();
      const now = new Date();
      const twoHoursInMs = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      
      for (const order of orders) {
        // Check if order is picked up but not delivered
        if (order.status === 'picked_up' && order.pickedUpAt) {
          const pickupTime = new Date(order.pickedUpAt);
          const timeSincePickup = now.getTime() - pickupTime.getTime();
          
          // If more than 2 hours have passed since pickup, auto-complete
          if (timeSincePickup > twoHoursInMs) {
            await this.updateOrder(order.id, {
              status: 'delivered',
              deliveredAt: now,
              deliveryConfirmationMethod: 'auto-timeout'
            });
            console.log(`Auto-completed order ${order.orderNumber} after ${Math.round(timeSincePickup / (60 * 1000))} minutes`);
          }
        }
      }
    } catch (error) {
      console.error('Error in auto-complete process:', error);
    }
  }

  // Start auto-complete timer (runs every 15 minutes)
  static startAutoCompleteTimer(): void {
    // Run immediately
    this.autoCompleteOverdueOrders();
    
    // Then run every 15 minutes
    setInterval(() => {
      this.autoCompleteOverdueOrders();
    }, 15 * 60 * 1000); // 15 minutes
  }
}