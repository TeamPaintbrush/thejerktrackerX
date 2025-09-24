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

  // Local storage methods
  private static createOrderLocal(order: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    if (typeof window !== 'undefined') {
      const orders = this.getAllOrdersLocal();
      orders.push(newOrder);
      try {
        localStorage.setItem('jerktracker_orders', JSON.stringify(orders));
      } catch (error) {
        console.error('Error saving order to localStorage:', error);
      }
    }
    
    return newOrder;
  }

  private static getAllOrdersLocal(): Order[] {
    if (typeof window === 'undefined') return [];
    
    const stored = localStorage.getItem('jerktracker_orders');
    if (!stored) return [];

    try {
      const orders = JSON.parse(stored);
      return orders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        pickedUpAt: order.pickedUpAt ? new Date(order.pickedUpAt) : undefined,
      }));
    } catch (error) {
      console.error('Error parsing orders from localStorage:', error);
      return [];
    }
  }

  private static getOrderByIdLocal(id: string): Order | null {
    const orders = this.getAllOrdersLocal();
    return orders.find(order => order.id === id) || null;
  }

  private static updateOrderLocal(id: string, updates: Partial<Order>): Order | null {
    if (typeof window === 'undefined') return null;
    
    const orders = this.getAllOrdersLocal();
    const index = orders.findIndex(order => order.id === id);

    if (index === -1) return null;

    orders[index] = { ...orders[index], ...updates };
    
    try {
      localStorage.setItem('jerktracker_orders', JSON.stringify(orders));
    } catch (error) {
      console.error('Error updating order in localStorage:', error);
    }
    
    return orders[index];
  }
}