// Order service using AWS DynamoDB with in-memory fallback only
// Works both locally and on GitHub Pages with proper AWS configuration
// No localStorage dependencies - uses memory storage when DynamoDB unavailable

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  GetCommand, 
  ScanCommand, 
  UpdateCommand,
  DeleteCommand
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
  // Location tracking for billing accuracy
  location: {
    locationId: string;   // ID of the location where order was placed
    locationName?: string; // Name of the location for display
    businessId: string;   // Business ID for billing
    qrCodeId?: string;    // QR code used to place the order
    verificationStatus: 'verified' | 'pending' | 'failed' | 'manual';
    coordinates?: {       // GPS coordinates when order was placed
      latitude: number;
      longitude: number;
      accuracy?: number;  // GPS accuracy in meters
    };
    ipAddress?: string;   // IP address for additional verification
    deviceInfo?: string;  // Device fingerprint for fraud detection
    transferredAt?: Date; // When order was transferred to another location
    transferReason?: string; // Reason for transfer
    previousLocationId?: string; // Previous location before transfer
  };
}

export interface Location {
  id: string;
  businessId: string;     // Links location to business/user account
  name: string;           // Location name (e.g., "Downtown Store", "Main Branch")
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  businessInfo: {
    businessName: string;
    businessType: 'restaurant' | 'retail' | 'service' | 'other';
    businessPhone: string;
    businessEmail: string;
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    method: 'address' | 'business_registration' | 'manual' | 'gps';
    verifiedAt?: Date;
    verificationDocument?: string; // URL to verification document
    rejectionReason?: string;
  };
  qrCodes: {
    primary: string;      // Main QR code ID for this location
    backup?: string;      // Backup QR code ID
    generated: Date;
    lastUsed?: Date;
  };
  billing: {
    isActive: boolean;    // Whether this location is being billed
    activatedAt?: Date;
    deactivatedAt?: Date;
    monthlyUsage: number; // Orders processed this month
  };
  settings: {
    isActive: boolean;    // Whether location is operational
    timezone: string;
    operatingHours?: {
      [day: string]: { open: string; close: string } | null;
    };
    maxOrdersPerDay?: number;
  };
  branding?: {            // Location-specific branding (overrides user branding)
    logo?: string;        // Location-specific logo
    brandName?: string;   // Location-specific name
    customColors?: {
      primary?: string;
      secondary?: string;
    };
  };
  createdAt: Date;
  updatedAt?: Date;
}

export interface MenuItem {
  id: string;
  businessId: string;     // Links menu item to business/user account
  locationIds?: string[]; // Optional: Specific locations where item is available (empty = all locations)
  name: string;
  description: string;
  price: number;
  category: string;       // e.g., 'mains', 'sides', 'appetizers', 'beverages', 'desserts'
  customCategory?: string; // Allow custom categories for flexibility
  image?: string;         // Image URL
  popular?: boolean;
  spiceLevel?: 'none' | 'mild' | 'medium' | 'hot' | 'extra-hot';
  allergens?: string[];
  preparationTime?: number; // in minutes
  dietary?: ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'halal' | 'kosher')[]; // Dietary tags
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  availability: {
    isAvailable: boolean;
    availableDays?: string[]; // e.g., ['monday', 'tuesday', 'wednesday']
    availableTimeSlots?: { start: string; end: string }[];
  };
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;     // User ID who created the item
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user' | 'customer' | 'driver' | 'manager';
  createdAt: Date;
  updatedAt?: Date;
  platform?: 'web' | 'mobile';  // Platform where account was created
  lastLoginPlatform?: 'web' | 'mobile';  // Last platform used to login
  provider?: string;      // OAuth provider (google, github, facebook)
  providerId?: string;    // OAuth provider user ID
  image?: string;         // Profile image URL from OAuth
  // Role-specific fields
  phone?: string;         // Contact phone number
  permissions?: string[]; // Specific permissions for the role
  businessId?: string;    // Links user to their business locations
  // Push notification fields (mobile)
  fcmToken?: string;      // Firebase Cloud Messaging token for push notifications
  fcmTokenUpdatedAt?: string; // Last time FCM token was updated
  // User settings (synced across web and mobile)
  settings?: {
    profile?: Record<string, any>;
    notifications?: Record<string, any>;
    security?: Record<string, any>;
    preferences?: Record<string, any>;
    [key: string]: any;
  };
  subscription?: {        // Subscription and billing info
    plan: 'free' | 'starter' | 'professional' | 'enterprise';
    tier: 'free' | 'starter' | 'professional' | 'enterprise'; // Explicit tier for feature gating
    locationLimit: number;
    currentLocations: number;
    billingCycle: 'monthly' | 'annually';
    nextBillingDate?: Date;
    isActive: boolean;
  };
  branding?: {            // Professional+ tier exclusive features
    logo?: string;        // Logo image URL or base64
    logoUrl?: string;     // Public URL for uploaded logo
    primaryColor?: string; // Brand primary color (hex)
    secondaryColor?: string; // Brand secondary color (hex)
    brandName?: string;   // Custom business name display
    customQRStyle?: {     // Custom QR code styling
      foregroundColor?: string;
      backgroundColor?: string;
      logoEmbedded?: boolean; // Embed logo in QR center
      style?: 'squares' | 'dots' | 'rounded';
    };
    enabledAt?: Date;     // When branding was activated
  };
  driverInfo?: {          // Driver-specific information
    licenseNumber?: string;
    vehicleInfo?: string;
    availability?: 'available' | 'busy' | 'offline';
  };
  customerInfo?: {        // Customer-specific information
    preferredPayment?: string;
    deliveryAddress?: string;
    orderHistory?: string[];
  };
}

export interface FraudClaim {
  id: string;
  claimNumber: string;    // Human-readable claim number (e.g., "FC-2024-001")
  businessId: string;     // Links claim to business/user account
  orderId: string;        // Links to the order being disputed
  orderNumber: string;    // Human-readable order number
  
  // Claim details
  claimType: 'customer_never_received' | 'driver_dispute' | 'suspicious_activity' | 'wrong_delivery' | 'quality_issue';
  status: 'pending' | 'under_review' | 'resolved_fraud' | 'resolved_legitimate' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  
  // Party information
  customerId: string;     // Customer/user ID for notifications
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  driverName?: string;
  driverEmail?: string;
  
  // Order information
  orderDate: Date;
  orderTotal: number;
  deliveryAddress?: string;
  
  // Evidence collection
  evidence: {
    qrScanned: boolean;
    scanTimestamp?: Date;
    scanLocation?: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      accuracy?: number;
    };
    photoProof?: string[];    // URLs to uploaded photos
    customerSignature?: string; // Base64 signature data or URL
    ipAddress?: string;
    deviceInfo?: string;
    additionalNotes?: string;
  };
  
  // Resolution
  resolutionNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: string;      // Admin/manager user ID who resolved
  refundAmount?: number;
  actionTaken?: string;     // Description of action taken
  
  // Metadata
  createdAt: Date;
  updatedAt?: Date;
  createdBy?: string;       // User ID who created the claim
  assignedTo?: string;      // Admin/manager assigned to investigate
}

const sanitizeForDynamo = (value: any): any => {
  if (value === undefined) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value
      .map(item => sanitizeForDynamo(item))
      .filter(item => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, val]) => {
      const sanitized = sanitizeForDynamo(val);
      if (sanitized !== undefined) {
        acc[key] = sanitized;
      }
      return acc;
    }, {} as Record<string, any>);
  }

  return value;
};

export class DynamoDBService {
  private static client: DynamoDBDocumentClient | null = null;
  private static fallbackMode = false;
  private static readonly ORDER_MEMORY_KEY = 'orders';

  // AWS DynamoDB Configuration
  private static getConfig() {
    return {
      region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
      tableName: process.env.NEXT_PUBLIC_DYNAMODB_TABLE_NAME || 'jerktracker-orders',
      enableDynamoDB: process.env.NEXT_PUBLIC_ENABLE_DYNAMODB !== 'false',
      fallbackMode: process.env.NEXT_PUBLIC_FALLBACK_MODE === 'true'
    };
  }

  private static getUsersTableName() {
    return process.env.NEXT_PUBLIC_DYNAMODB_USERS_TABLE || 'jerktracker-users';
  }

  // Initialize DynamoDB Client
  private static async initClient(): Promise<DynamoDBDocumentClient | null> {
    if (this.client) return this.client;
    
    const config = this.getConfig();
    
    if (!config.enableDynamoDB || config.fallbackMode) {
      console.log('DynamoDB disabled or in fallback mode, using in-memory storage');
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
          // Client-side without Cognito - fallback to server-side operations
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



  // In-memory storage for fallback when DynamoDB is not available
  private static memoryStorage: Record<string, any> = {};
  
  private static getFromMemory(key: string): any[] {
    return this.memoryStorage[key] || [];
  }

  private static setInMemory(key: string, value: any[]): void {
    this.memoryStorage[key] = value;
  }

  // Create a new order
  static async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    const client = await this.initClient();
    
    if (client && !this.fallbackMode) {
      return this.createOrderDynamoDB(order, client);
    } else {
      console.log('Using in-memory fallback for createOrder');
      return this.createOrderMemory(order);
    }
  }

  // Get all orders
  static async getAllOrders(): Promise<Order[]> {
    const client = await this.initClient();
    
    if (client && !this.fallbackMode) {
      return this.getAllOrdersDynamoDB(client);
    } else {
      console.log('Using memory fallback for getAllOrders');
      return this.getAllOrdersMemory();
    }
  }

  // Get order by ID
  static async getOrderById(id: string): Promise<Order | null> {
    const client = await this.initClient();
    
    if (client && !this.fallbackMode) {
      return this.getOrderByIdDynamoDB(id, client);
    } else {
      console.log('Using memory fallback for getOrderById');
      return this.getOrderByIdMemory(id);
    }
  }

  // Update order
  static async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const client = await this.initClient();
    
    if (client && !this.fallbackMode) {
      return this.updateOrderDynamoDB(id, updates, client);
    } else {
      console.log('Using memory fallback for updateOrder');
      return this.updateOrderMemory(id, updates);
    }
  }

  // Convenience method to update order status
  static async updateOrderStatus(id: string, status: 'pending' | 'picked_up' | 'delivered'): Promise<Order | null> {
    const updates: Partial<Order> = { status };
    
    // Add timestamp when order is picked up
    if (status === 'picked_up') {
      updates.pickedUpAt = new Date();
    }
    // Add timestamp when order is delivered
    if (status === 'delivered') {
      updates.deliveredAt = new Date();
    }
    
    return this.updateOrder(id, updates);
  }

  // Transfer order to a different location
  static async transferOrder(orderId: string, newLocationId: string, reason?: string): Promise<Order | null> {
    try {
      const order = await this.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      const newLocation = await this.getLocationById(newLocationId);
      if (!newLocation) {
        throw new Error('Target location not found');
      }

      const oldLocationId = order.location.locationId;

      // Update order with new location
      const updates: Partial<Order> = {
        location: {
          ...order.location,
          locationId: newLocationId,
          locationName: newLocation.name,
          businessId: newLocation.businessId,
          transferredAt: new Date(),
          transferReason: reason || 'Location transfer',
          previousLocationId: oldLocationId
        }
      };

      const updatedOrder = await this.updateOrder(orderId, updates);

      // Update billing counters
      if (oldLocationId && oldLocationId !== 'default') {
        await this.updateLocationUsage(oldLocationId, -1);
      }
      await this.updateLocationUsage(newLocationId, 1);

      return updatedOrder;
    } catch (error) {
      console.error('Error transferring order:', error);
      throw error;
    }
  }

  // Check service status
  static async getServiceStatus(): Promise<{
    dynamoDBAvailable: boolean;
    fallbackMode: boolean;
    storageType: 'dynamodb' | 'memory';
    region?: string;
    tableName?: string;
  }> {
    const config = this.getConfig();
    const client = await this.initClient();
    
    const storageType: 'dynamodb' | 'memory' = client && !this.fallbackMode ? 'dynamodb' : 'memory';
    
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
      
      // Also store in memory as cache
      this.createOrderMemory(newOrder);
      
      return newOrder;
    } catch (error) {
      console.error('Error creating order in DynamoDB:', error);
      // Fallback to memory
      return this.createOrderMemory(order);
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
      
      // Cache in memory
      try {
        this.setInMemory(this.ORDER_MEMORY_KEY, orders);
      } catch (cacheError) {
        console.warn('Failed to cache orders in memory:', cacheError);
      }
      
      return orders;
    } catch (error) {
      console.error('Error fetching orders from DynamoDB:', error);
      // Fallback to memory
      return this.getAllOrdersMemory();
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
      // Fallback to memory
      return this.getOrderByIdMemory(id);
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
      
      // Also update memory cache
      this.updateOrderMemory(id, updates);
      
      // Fetch the updated order
      return this.getOrderByIdDynamoDB(id, client);
    } catch (error) {
      console.error('Error updating order in DynamoDB:', error);
      // Fallback to memory
      return this.updateOrderMemory(id, updates);
    }
  }

  // Test memory storage functionality
  static testStorage(): { available: boolean, type: string, error?: string } {
    try {
      const testKey = 'test_' + Date.now();
      const testOrder: Order = {
        id: 'test_' + Date.now(),
        orderNumber: 'TEST001',
        customerName: 'Test Customer',
        customerEmail: 'test@example.com',
        orderDetails: 'Test order details',
        status: 'pending',
        createdAt: new Date(),
        location: {
          locationId: 'test_location',
          businessId: 'test_business',
          verificationStatus: 'verified'
        }
      };
      
      // Test memory storage
      this.setInMemory(testKey, [testOrder]);
      const retrieved = this.getFromMemory(testKey);
      
      if (retrieved && Array.isArray(retrieved) && retrieved.length === 1 && retrieved[0].id === testOrder.id) {
        // Clean up test data
        this.setInMemory(testKey, []);
        return { available: true, type: 'memory' };
      }
      
      return { available: false, type: 'unknown', error: 'Memory storage test failed' };
    } catch (error) {
      return { available: false, type: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Memory storage methods for fallback
  private static createOrderMemory(order: Omit<Order, 'id' | 'createdAt'> | Order): Order {
    let newOrder: Order;
    
    if ('id' in order && 'createdAt' in order) {
      // If it's already a complete Order object, create a deep copy
      newOrder = JSON.parse(JSON.stringify(order));
    } else {
      // Create new order with generated ID and timestamp
      newOrder = {
        ...JSON.parse(JSON.stringify(order)),
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
      };
    }

    const orders = [...this.getAllOrdersMemory()];
    
    // Check if order already exists (for caching from DynamoDB)
    const existingIndex = orders.findIndex(o => o.id === newOrder.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = newOrder;
    } else {
      orders.push(newOrder);
    }
    
    // Store in memory with a new array
    this.setInMemory(this.ORDER_MEMORY_KEY, orders);
    console.log('Order saved to memory:', newOrder.id);
    
    return newOrder;
  }

  private static getAllOrdersMemory(): Order[] {
    try {
      const stored = this.getFromMemory(this.ORDER_MEMORY_KEY);
      if (!stored || !Array.isArray(stored)) {
        console.log('No orders found in memory');
        return [];
      }

      // Ensure Date objects are properly reconstructed
      const orders = stored.map(order => ({
        ...order,
        createdAt: order.createdAt instanceof Date ? order.createdAt : new Date(order.createdAt),
        pickedUpAt: order.pickedUpAt ? (order.pickedUpAt instanceof Date ? order.pickedUpAt : new Date(order.pickedUpAt)) : undefined,
        deliveredAt: order.deliveredAt ? (order.deliveredAt instanceof Date ? order.deliveredAt : new Date(order.deliveredAt)) : undefined
      }));

      console.log(`Loaded ${orders.length} orders from memory`);
      return orders;
    } catch (error) {
      console.error('Error loading orders from memory:', error);
      return [];
    }
  }

  private static getOrderByIdMemory(id: string): Order | null {
    const orders = this.getAllOrdersMemory();
    const order = orders.find((order: Order) => order.id === id);
    
    if (order) {
      console.log('Order found in memory:', order.id, order.orderNumber);
    } else {
      console.warn('Order not found in memory:', id);
      console.log('Available order IDs:', orders.map((o: Order) => o.id));
    }
    
    return order || null;
  }

  private static updateOrderMemory(id: string, updates: Partial<Order>): Order | null {
    const orders = this.getAllOrdersMemory();
    const index = orders.findIndex((order: Order) => order.id === id);

    if (index === -1) {
      console.warn('Order not found for update in memory:', id);
      return null;
    }

    // Add pickup timestamp if status is being updated to picked_up
    const updatesCopy = { ...updates };
    if (updatesCopy.status === 'picked_up' && !updatesCopy.pickedUpAt) {
      updatesCopy.pickedUpAt = new Date();
    }

    // Create a deep copy of the existing order and merge updates
    const updatedOrder = { 
      ...JSON.parse(JSON.stringify(orders[index])),
      ...updatesCopy 
    };

    // Create a new orders array with the updated order
    const newOrders = [...orders];
    newOrders[index] = updatedOrder;
    
    // Store updated orders in memory
    this.setInMemory(this.ORDER_MEMORY_KEY, newOrders);
    console.log('Order updated successfully in memory:', id);
    
    return updatedOrder;
  }

  // Auto-complete orders that have been picked up for more than 30 minutes
  static async autoCompleteOverdueOrders(): Promise<void> {
    try {
      const orders = await this.getAllOrders();
      const now = new Date();
      const thirtyMinutesInMs = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      for (const order of orders) {
        // Check if order is picked up but not delivered
        if (order.status === 'picked_up' && order.pickedUpAt) {
          const pickupTime = new Date(order.pickedUpAt);
          const timeSincePickup = now.getTime() - pickupTime.getTime();
          
          // If more than 30 minutes have passed since pickup, auto-complete
          if (timeSincePickup > thirtyMinutesInMs) {
            await this.updateOrder(order.id, {
              status: 'delivered',
              deliveredAt: now,
              deliveryConfirmationMethod: 'auto-timeout'
            });
            console.log(`Auto-completed order ${order.orderNumber} after ${Math.round(timeSincePickup / (60 * 1000))} minutes (assumed delivered)`);
          }
        }
      }
    } catch (error) {
      console.error('Error in auto-complete process:', error);
    }
  }

  // Start auto-complete timer (runs every 10 minutes to check for 30-minute deliveries)
  static startAutoCompleteTimer(): void {
    // Run immediately
    this.autoCompleteOverdueOrders();
    
    // Then run every 10 minutes (more frequent for shorter timeout)
    setInterval(() => {
      this.autoCompleteOverdueOrders();
    }, 10 * 60 * 1000); // 10 minutes
  }

  // User Management Methods
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const client = await this.initClient();
      if (!client || this.fallbackMode) {
        // Fallback to hardcoded users when DynamoDB is not available
        const hardcodedUsers: User[] = [
          {
            id: '1',
            name: 'Admin User',
            email: 'admin@thejerktracker.com',
            password: '$2b$12$TrF0jtIKlujqXTqT/5KvBeyei5TFNRo2Pvs0lqzNh1UF808kW10ci', // admin123
            role: 'admin' as const,
            createdAt: new Date()
          }
        ];
        return hardcodedUsers.find(user => user.email === email) || null;
      }

      const result = await client.send(new ScanCommand({
        TableName: this.getUsersTableName(),
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      }));

      return result.Items?.[0] as User || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }



  // ==================== LOCATION MANAGEMENT METHODS ====================

  static async createLocation(location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>): Promise<Location | null> {
    try {
      const newLocation: Location = {
        ...location,
        id: 'loc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (this.fallbackMode) {
        const locations = this.getFromMemory('locations') || [];
        locations.push(newLocation);
        this.setInMemory('locations', locations);
        console.log('Created location in memory:', newLocation.id);
        return newLocation;
      }

      const client = await this.initClient();
      if (!client) {
        console.error('DynamoDB client not available');
        return null;
      }

      const config = this.getConfig();
      const item = sanitizeForDynamo({
        ...newLocation,
        type: 'location',
        createdAt: newLocation.createdAt.toISOString(),
        updatedAt: newLocation.updatedAt?.toISOString()
      });

      const command = new PutCommand({
        TableName: config.tableName,
        Item: item
      });

      await client.send(command);
      console.log('Location created successfully:', newLocation.id);
      return newLocation;
    } catch (error) {
      console.error('Error creating location:', error);
      return null;
    }
  }

  static async getLocationsByBusinessId(businessId: string): Promise<Location[]> {
    try {
      if (this.fallbackMode) {
        const locations = this.getFromMemory('locations') || [];
        return locations.filter((loc: Location) => loc.businessId === businessId);
      }

      const client = await this.initClient();
      if (!client) return [];

      const config = this.getConfig();
      const command = new ScanCommand({
        TableName: config.tableName,
        FilterExpression: '#type = :type AND businessId = :businessId',
        ExpressionAttributeNames: {
          '#type': 'type'
        },
        ExpressionAttributeValues: {
          ':type': 'location',
          ':businessId': businessId
        }
      });

      const result = await client.send(command);
      return (result.Items || []).map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined
      })) as Location[];
    } catch (error) {
      console.error('Error getting locations by business ID:', error);
      return [];
    }
  }

  static async getLocationById(locationId: string): Promise<Location | null> {
    try {
      if (this.fallbackMode) {
        const locations = this.getFromMemory('locations') || [];
        return locations.find((loc: Location) => loc.id === locationId) || null;
      }

      const client = await this.initClient();
      if (!client) return null;

      const config = this.getConfig();
      const command = new GetCommand({
        TableName: config.tableName,
        Key: { id: locationId }
      });

      const result = await client.send(command);
      if (!result.Item || result.Item.type !== 'location') return null;

      return {
        ...result.Item,
        createdAt: new Date(result.Item.createdAt),
        updatedAt: result.Item.updatedAt ? new Date(result.Item.updatedAt) : undefined
      } as Location;
    } catch (error) {
      console.error('Error getting location by ID:', error);
      return null;
    }
  }

  static async updateLocation(locationId: string, updates: Partial<Location>): Promise<boolean> {
    try {
      if (this.fallbackMode) {
        const locations = this.getFromMemory('locations') || [];
        const locationIndex = locations.findIndex((loc: Location) => loc.id === locationId);
        if (locationIndex === -1) return false;

        locations[locationIndex] = {
          ...locations[locationIndex],
          ...updates,
          updatedAt: new Date()
        };
        this.setInMemory('locations', locations);
        return true;
      }

      const client = await this.initClient();
      if (!client) return false;

      const config = this.getConfig();
      const sanitizedUpdates = sanitizeForDynamo(updates) as Record<string, any>;
      const updateEntries = Object.entries(sanitizedUpdates).filter(([, value]) => value !== undefined);

      if (updateEntries.length === 0) {
        console.warn('No valid location updates provided');
        return false;
      }

      const updateExpression = updateEntries
        .map(([key]) => `#${key} = :${key}`)
        .join(', ');

      const expressionAttributeNames = updateEntries.reduce((acc, [key]) => {
        acc[`#${key}`] = key;
        return acc;
      }, {} as Record<string, string>);

      const expressionAttributeValues = updateEntries.reduce((acc, [key, value]) => {
        acc[`:${key}`] = value;
        return acc;
      }, {} as Record<string, any>);

      // Add updatedAt timestamp
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date().toISOString();

      const command = new UpdateCommand({
        TableName: config.tableName,
        Key: { id: locationId },
        UpdateExpression: `SET ${updateExpression}, #updatedAt = :updatedAt`,
        ExpressionAttributeNames: {
          ...expressionAttributeNames,
          '#type': 'type'
        },
        ExpressionAttributeValues: {
          ...expressionAttributeValues,
          ':type': 'location'
        },
        ConditionExpression: 'attribute_exists(id) AND #type = :type'
      });

      await client.send(command);
      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  }

  static async deleteLocation(locationId: string): Promise<boolean> {
    try {
      if (this.fallbackMode) {
        const locations = this.getFromMemory('locations') || [];
        const filtered = locations.filter((loc: Location) => loc.id !== locationId);
        if (filtered.length === locations.length) {
          return false;
        }
        this.setInMemory('locations', filtered);
        return true;
      }

      const client = await this.initClient();
      if (!client) return false;

      const config = this.getConfig();
      const command = new DeleteCommand({
        TableName: config.tableName,
        Key: { id: locationId },
        ConditionExpression: 'attribute_exists(id) AND #type = :type',
        ExpressionAttributeNames: {
          '#type': 'type'
        },
        ExpressionAttributeValues: {
          ':type': 'location'
        }
      });

      await client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }

  static async verifyLocationAddress(address: Location['address']): Promise<{ isValid: boolean; coordinates?: { latitude: number; longitude: number }; error?: string }> {
    try {
      const addressString = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
      
      // Basic validation checks
      if (!address.street || !address.city || !address.state || !address.zipCode) {
        return { isValid: false, error: 'Incomplete address information' };
      }

      // Google Maps Geocoding API integration
      const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (GOOGLE_MAPS_API_KEY) {
        try {
          const encodedAddress = encodeURIComponent(addressString);
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
          );
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              const location = data.results[0].geometry.location;
              return {
                isValid: true,
                coordinates: {
                  latitude: location.lat,
                  longitude: location.lng
                }
              };
            } else {
              console.warn('Google Maps Geocoding failed:', data.status);
            }
          }
        } catch (apiError) {
          console.error('Google Maps API error:', apiError);
        }
      }

      // Fallback: Basic coordinate estimation for testing
      // In production with API key, this won't be reached
      console.warn('Using fallback geocoding - add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for production');
      const mockCoordinates = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1
      };

      return {
        isValid: true,
        coordinates: mockCoordinates
      };
    } catch (error) {
      console.error('Error verifying address:', error);
      return { isValid: false, error: 'Address verification failed' };
    }
  }

  static async updateLocationUsage(locationId: string, increment: number = 1): Promise<boolean> {
    try {
      const location = await this.getLocationById(locationId);
      if (!location) return false;

      const updatedUsage = location.billing.monthlyUsage + increment;
      
      return await this.updateLocation(locationId, {
        billing: {
          ...location.billing,
          monthlyUsage: updatedUsage
        }
      });
    } catch (error) {
      console.error('Error updating location usage:', error);
      return false;
    }
  }

  static async getLocationUsageReport(businessId: string): Promise<{
    totalLocations: number;
    activeLocations: number;
    totalMonthlyUsage: number;
    locationBreakdown: Array<{
      locationId: string;
      name: string;
      monthlyUsage: number;
      isActive: boolean;
    }>;
  }> {
    try {
      const locations = await this.getLocationsByBusinessId(businessId);
      
      const totalLocations = locations.length;
      const activeLocations = locations.filter(loc => loc.billing.isActive).length;
      const totalMonthlyUsage = locations.reduce((sum, loc) => sum + loc.billing.monthlyUsage, 0);
      
      const locationBreakdown = locations.map(loc => ({
        locationId: loc.id,
        name: loc.name,
        monthlyUsage: loc.billing.monthlyUsage,
        isActive: loc.billing.isActive
      }));

      return {
        totalLocations,
        activeLocations,
        totalMonthlyUsage,
        locationBreakdown
      };
    } catch (error) {
      console.error('Error getting location usage report:', error);
      return {
        totalLocations: 0,
        activeLocations: 0,
        totalMonthlyUsage: 0,
        locationBreakdown: []
      };
    }
  }

  // ==================== MENU ITEM OPERATIONS ====================
  
  /**
   * Create a new menu item
   */
  static async createMenuItem(menuItem: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MenuItem> {
    const newMenuItem: MenuItem = {
      ...menuItem,
      id: `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        // In-memory fallback
        const menuItems = this.getFromMemory('menuItems') as MenuItem[] || [];
        menuItems.push(newMenuItem);
        this.setInMemory('menuItems', menuItems);
        return newMenuItem;
      }

      const config = this.getConfig();
      await client.send(new PutCommand({
        TableName: 'jerktracker-menu-items',
        Item: newMenuItem
      }));

      return newMenuItem;
    } catch (error) {
      console.error('Error creating menu item:', error);
      // Fallback to memory on error
      const menuItems = this.getFromMemory('menuItems') as MenuItem[] || [];
      menuItems.push(newMenuItem);
      this.setInMemory('menuItems', menuItems);
      return newMenuItem;
    }
  }

  /**
   * Get all menu items for a business
   */
  static async getMenuItems(businessId: string): Promise<MenuItem[]> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        // In-memory fallback
        const menuItems = this.getFromMemory('menuItems') as MenuItem[] || [];
        return menuItems.filter(item => item.businessId === businessId);
      }

      const result = await client.send(new ScanCommand({
        TableName: 'jerktracker-menu-items',
        FilterExpression: 'businessId = :businessId',
        ExpressionAttributeValues: {
          ':businessId': businessId
        }
      }));

      return (result.Items as MenuItem[]) || [];
    } catch (error) {
      console.error('Error getting menu items:', error);
      const menuItems = this.getFromMemory('menuItems') as MenuItem[] || [];
      return menuItems.filter(item => item.businessId === businessId);
    }
  }

  /**
   * Get menu items by location
   */
  static async getMenuItemsByLocation(businessId: string, locationId: string): Promise<MenuItem[]> {
    try {
      const allItems = await this.getMenuItems(businessId);
      // Return items that are either available at all locations or specifically at this location
      return allItems.filter(item => 
        !item.locationIds || 
        item.locationIds.length === 0 || 
        item.locationIds.includes(locationId)
      );
    } catch (error) {
      console.error('Error getting menu items by location:', error);
      return [];
    }
  }

  /**
   * Get menu items by category
   */
  static async getMenuItemsByCategory(businessId: string, category: string): Promise<MenuItem[]> {
    try {
      const allItems = await this.getMenuItems(businessId);
      return allItems.filter(item => 
        item.category === category || item.customCategory === category
      );
    } catch (error) {
      console.error('Error getting menu items by category:', error);
      return [];
    }
  }

  /**
   * Get a single menu item by ID
   */
  static async getMenuItem(id: string): Promise<MenuItem | null> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        const menuItems = this.getFromMemory('menuItems') as MenuItem[] || [];
        return menuItems.find(item => item.id === id) || null;
      }

      const result = await client.send(new GetCommand({
        TableName: 'jerktracker-menu-items',
        Key: { id }
      }));

      return (result.Item as MenuItem) || null;
    } catch (error) {
      console.error('Error getting menu item:', error);
      const menuItems = this.getFromMemory('menuItems') as MenuItem[] || [];
      return menuItems.find(item => item.id === id) || null;
    }
  }

  /**
   * Update a menu item
   */
  static async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    try {
      const client = await this.initClient();
      const updatedItem = {
        ...updates,
        id,
        updatedAt: new Date()
      };
      
      if (!client || this.fallbackMode) {
        const menuItems = this.getFromMemory('menuItems') as MenuItem[] || [];
        const index = menuItems.findIndex(item => item.id === id);
        if (index !== -1) {
          menuItems[index] = { ...menuItems[index], ...updatedItem };
          this.setInMemory('menuItems', menuItems);
          return menuItems[index];
        }
        return null;
      }

      // Build update expression
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.keys(updates).forEach((key, index) => {
        if (key !== 'id' && key !== 'createdAt') {
          updateExpressions.push(`#field${index} = :value${index}`);
          expressionAttributeNames[`#field${index}`] = key;
          expressionAttributeValues[`:value${index}`] = (updates as any)[key];
        }
      });

      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date();

      await client.send(new UpdateCommand({
        TableName: 'jerktracker-menu-items',
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      }));

      return await this.getMenuItem(id);
    } catch (error) {
      console.error('Error updating menu item:', error);
      return null;
    }
  }

  /**
   * Delete a menu item
   */
  static async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        const menuItems = this.getFromMemory('menuItems') as MenuItem[] || [];
        const filtered = menuItems.filter(item => item.id !== id);
        this.setInMemory('menuItems', filtered);
        return true;
      }

      await client.send(new UpdateCommand({
        TableName: 'jerktracker-menu-items',
        Key: { id },
        UpdateExpression: 'REMOVE #item',
        ExpressionAttributeNames: { '#item': 'id' }
      }));

      return true;
    } catch (error) {
      console.error('Error deleting menu item:', error);
      return false;
    }
  }

  /**
   * Search menu items
   */
  static async searchMenuItems(businessId: string, query: string): Promise<MenuItem[]> {
    try {
      const allItems = await this.getMenuItems(businessId);
      const lowerQuery = query.toLowerCase();
      
      return allItems.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery) ||
        item.customCategory?.toLowerCase().includes(lowerQuery) ||
        item.allergens?.some(allergen => allergen.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error('Error searching menu items:', error);
      return [];
    }
  }

  // ==================== FRAUD CLAIMS ====================

  /**
   * Create a new fraud claim
   */
  static async createFraudClaim(claim: Omit<FraudClaim, 'id' | 'createdAt' | 'claimNumber'>): Promise<FraudClaim> {
    try {
      const client = await this.initClient();
      const timestamp = Date.now();
      const claimNumber = `FC-${new Date().getFullYear()}-${String(timestamp).slice(-6)}`;
      
      const newClaim: FraudClaim = {
        ...claim,
        id: `claim_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        claimNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (!client || this.fallbackMode) {
        const claims = this.getFromMemory('fraudClaims') as FraudClaim[] || [];
        claims.push(newClaim);
        this.setInMemory('fraudClaims', claims);
        return newClaim;
      }

      await client.send(new PutCommand({
        TableName: 'jerktracker-fraud-claims',
        Item: newClaim
      }));

      return newClaim;
    } catch (error) {
      console.error('Error creating fraud claim:', error);
      throw error;
    }
  }

  /**
   * Get all fraud claims for a business
   */
  static async getFraudClaims(businessId: string, filters?: {
    status?: FraudClaim['status'];
    claimType?: FraudClaim['claimType'];
    priority?: FraudClaim['priority'];
  }): Promise<FraudClaim[]> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        let claims = this.getFromMemory('fraudClaims') as FraudClaim[] || [];
        claims = claims.filter(claim => claim.businessId === businessId);
        
        if (filters?.status) {
          claims = claims.filter(claim => claim.status === filters.status);
        }
        if (filters?.claimType) {
          claims = claims.filter(claim => claim.claimType === filters.claimType);
        }
        if (filters?.priority) {
          claims = claims.filter(claim => claim.priority === filters.priority);
        }
        
        return claims.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      const result = await client.send(new ScanCommand({
        TableName: 'jerktracker-fraud-claims'
      }));

      let claims = (result.Items as FraudClaim[]) || [];
      claims = claims.filter(claim => claim.businessId === businessId);
      
      if (filters?.status) {
        claims = claims.filter(claim => claim.status === filters.status);
      }
      if (filters?.claimType) {
        claims = claims.filter(claim => claim.claimType === filters.claimType);
      }
      if (filters?.priority) {
        claims = claims.filter(claim => claim.priority === filters.priority);
      }
      
      return claims.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting fraud claims:', error);
      return [];
    }
  }

  /**
   * Get a single fraud claim by ID
   */
  static async getFraudClaim(id: string): Promise<FraudClaim | null> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        const claims = this.getFromMemory('fraudClaims') as FraudClaim[] || [];
        return claims.find(claim => claim.id === id) || null;
      }

      const result = await client.send(new GetCommand({
        TableName: 'jerktracker-fraud-claims',
        Key: { id }
      }));

      return (result.Item as FraudClaim) || null;
    } catch (error) {
      console.error('Error getting fraud claim:', error);
      return null;
    }
  }

  /**
   * Update a fraud claim
   */
  static async updateFraudClaim(id: string, updates: Partial<FraudClaim>): Promise<FraudClaim | null> {
    try {
      const client = await this.initClient();
      const updatedClaim = {
        ...updates,
        id,
        updatedAt: new Date()
      };
      
      if (!client || this.fallbackMode) {
        const claims = this.getFromMemory('fraudClaims') as FraudClaim[] || [];
        const index = claims.findIndex(claim => claim.id === id);
        if (index !== -1) {
          claims[index] = { ...claims[index], ...updatedClaim };
          this.setInMemory('fraudClaims', claims);
          return claims[index];
        }
        return null;
      }

      // Build update expression
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.keys(updates).forEach((key, index) => {
        if (key !== 'id' && key !== 'createdAt' && key !== 'claimNumber') {
          updateExpressions.push(`#field${index} = :value${index}`);
          expressionAttributeNames[`#field${index}`] = key;
          expressionAttributeValues[`:value${index}`] = (updates as any)[key];
        }
      });

      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date();

      await client.send(new UpdateCommand({
        TableName: 'jerktracker-fraud-claims',
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      }));

      return await this.getFraudClaim(id);
    } catch (error) {
      console.error('Error updating fraud claim:', error);
      return null;
    }
  }

  /**
   * Resolve a fraud claim with resolution details
   */
  static async resolveFraudClaim(
    id: string, 
    resolution: {
      status: 'resolved_fraud' | 'resolved_legitimate' | 'dismissed';
      resolutionNotes: string;
      resolvedBy: string;
      refundAmount?: number;
      actionTaken?: string;
    }
  ): Promise<FraudClaim | null> {
    try {
      return await this.updateFraudClaim(id, {
        ...resolution,
        resolvedAt: new Date()
      });
    } catch (error) {
      console.error('Error resolving fraud claim:', error);
      return null;
    }
  }

  /**
   * Get fraud claims by order ID
   */
  static async getFraudClaimsByOrder(orderId: string): Promise<FraudClaim[]> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        const claims = this.getFromMemory('fraudClaims') as FraudClaim[] || [];
        return claims.filter(claim => claim.orderId === orderId);
      }

      const result = await client.send(new ScanCommand({
        TableName: 'jerktracker-fraud-claims'
      }));

      const claims = (result.Items as FraudClaim[]) || [];
      return claims.filter(claim => claim.orderId === orderId);
    } catch (error) {
      console.error('Error getting fraud claims by order:', error);
      return [];
    }
  }

  // ==================== USER MANAGEMENT ====================

  /**
   * Get all users for a business
   */
  static async getAllUsers(businessId?: string): Promise<User[]> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        let users = this.getFromMemory('users') as User[] || [];
        if (businessId) {
          users = users.filter(user => user.businessId === businessId);
        }
        return users.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      const result = await client.send(new ScanCommand({
        TableName: this.getUsersTableName()
      }));

      let users = (result.Items as User[]) || [];
      if (businessId) {
        users = users.filter(user => user.businessId === businessId);
      }
      
      return users.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        const users = this.getFromMemory('users') as User[] || [];
        return users.find(user => user.id === id) || null;
      }

      const result = await client.send(new GetCommand({
        TableName: this.getUsersTableName(),
        Key: { id }
      }));

      return (result.Item as User) || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const client = await this.initClient();
      const timestamp = Date.now();
      
      const newUser: User = {
        ...userData,
        id: `user_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (!client || this.fallbackMode) {
        const users = this.getFromMemory('users') as User[] || [];
        users.push(newUser);
        this.setInMemory('users', users);
        return newUser;
      }

      await client.send(new PutCommand({
        TableName: this.getUsersTableName(),
        Item: newUser
      }));

      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const client = await this.initClient();
      const updatedUser = {
        ...updates,
        id,
        updatedAt: new Date()
      };
      
      if (!client || this.fallbackMode) {
        const users = this.getFromMemory('users') as User[] || [];
        const index = users.findIndex(user => user.id === id);
        if (index !== -1) {
          users[index] = { ...users[index], ...updatedUser };
          this.setInMemory('users', users);
          return users[index];
        }
        return null;
      }

      // Build update expression
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      Object.keys(updates).forEach((key, index) => {
        if (key !== 'id' && key !== 'createdAt') {
          updateExpressions.push(`#field${index} = :value${index}`);
          expressionAttributeNames[`#field${index}`] = key;
          expressionAttributeValues[`:value${index}`] = (updates as any)[key];
        }
      });

      updateExpressions.push('#updatedAt = :updatedAt');
      expressionAttributeNames['#updatedAt'] = 'updatedAt';
      expressionAttributeValues[':updatedAt'] = new Date();

      await client.send(new UpdateCommand({
        TableName: this.getUsersTableName(),
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      }));

      return await this.getUserById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const client = await this.initClient();
      
      if (!client || this.fallbackMode) {
        const users = this.getFromMemory('users') as User[] || [];
        const filtered = users.filter(user => user.id !== id);
        this.setInMemory('users', filtered);
        return true;
      }

      await client.send(new UpdateCommand({
        TableName: this.getUsersTableName(),
        Key: { id },
        UpdateExpression: 'REMOVE #user',
        ExpressionAttributeNames: { '#user': 'id' }
      }));

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  /**
   * Search users
   */
  static async searchUsers(query: string, businessId?: string): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers(businessId);
      const lowerQuery = query.toLowerCase();
      
      return allUsers.filter(user =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.phone?.toLowerCase().includes(lowerQuery) ||
        user.role.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: User['role'], businessId?: string): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers(businessId);
      return allUsers.filter(user => user.role === role);
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  /**
   * Update user settings
   */
  static async updateUserSettings(userId: string, settings: User['settings']): Promise<User | null> {
    try {
      return await this.updateUser(userId, { settings });
    } catch (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
  }

  /**
   * Update driver status
   */
  static async updateDriverStatus(driverId: string, status: 'available' | 'busy' | 'offline'): Promise<boolean> {
    try {
      const client = await this.initClient();
      if (!client || this.fallbackMode) {
        console.log('Driver status update skipped: DynamoDB not available');
        return false;
      }

      await client.send(new UpdateCommand({
        TableName: this.getUsersTableName(),
        Key: { id: driverId },
        UpdateExpression: 'SET driverInfo.availability = :status, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':status': status,
          ':updatedAt': new Date().toISOString()
        }
      }));

      return true;
    } catch (error) {
      console.error('Error updating driver status:', error);
      return false;
    }
  }

  /**
   * Get available drivers
   */
  static async getAvailableDrivers(): Promise<User[]> {
    try {
      const drivers = await this.getUsersByRole('driver');
      return drivers.filter(driver => 
        driver.driverInfo?.availability === 'available'
      );
    } catch (error) {
      console.error('Error getting available drivers:', error);
      return [];
    }
  }
}

