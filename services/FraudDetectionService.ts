import { DynamoDBService, Order } from '@/lib/dynamodb';

export interface FraudAlert {
  id: string;
  type: 'duplicate_claim' | 'unusual_pattern' | 'high_volume' | 'suspicious_location' | 'rapid_succession';
  severity: 'low' | 'medium' | 'high' | 'critical';
  orderId?: string;
  userId?: string;
  locationId?: string;
  description: string;
  details: any;
  detectedAt: Date;
  resolved: boolean;
}

class FraudDetectionService {
  private alertThresholds = {
    maxOrdersPerHour: 10,
    maxOrdersPerDay: 50,
    duplicateWindowMinutes: 30,
    suspiciousDistanceKm: 50, // Distance between orders in short time
    rapidSuccessionMinutes: 5 // Multiple orders in rapid succession
  };

  /**
   * Analyze an order for potential fraud indicators
   */
  async analyzeOrder(order: Order): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = [];

    try {
      // Check for duplicate orders
      const duplicateAlert = await this.checkDuplicateOrder(order);
      if (duplicateAlert) alerts.push(duplicateAlert);

      // Check for unusual patterns
      const patternAlert = await this.checkUnusualPattern(order);
      if (patternAlert) alerts.push(patternAlert);

      // Check for high volume from same user
      const volumeAlert = await this.checkHighVolume(order);
      if (volumeAlert) alerts.push(volumeAlert);

      // Check for rapid succession orders
      const rapidAlert = await this.checkRapidSuccession(order);
      if (rapidAlert) alerts.push(rapidAlert);

      // Save alerts to database (if any)
      if (alerts.length > 0) {
        await this.saveAlerts(alerts);
      }

      return alerts;
    } catch (error) {
      console.error('Error analyzing order for fraud:', error);
      return [];
    }
  }

  /**
   * Check for duplicate order claims
   */
  private async checkDuplicateOrder(order: Order): Promise<FraudAlert | null> {
    try {
      const allOrders = await DynamoDBService.getAllOrders();
      
      // Find similar orders within time window
      const duplicates = allOrders.filter(existingOrder => {
        if (existingOrder.id === order.id) return false;

        const timeDiff = Math.abs(
          new Date(order.createdAt).getTime() - new Date(existingOrder.createdAt).getTime()
        ) / 60000; // Convert to minutes

        // Check for same customer, similar items, within time window
        return (
          existingOrder.customerEmail === order.customerEmail &&
          timeDiff <= this.alertThresholds.duplicateWindowMinutes &&
          this.isSimilarOrder(existingOrder, order)
        );
      });

      if (duplicates.length > 0) {
        return {
          id: `fraud-${Date.now()}-duplicate`,
          type: 'duplicate_claim',
          severity: duplicates.length > 2 ? 'critical' : 'high',
          orderId: order.id,
          userId: order.customerId,
          description: `Potential duplicate order detected for customer ${order.customerEmail}`,
          details: {
            duplicateCount: duplicates.length,
            duplicateOrderIds: duplicates.map(o => o.id),
            timeWindow: this.alertThresholds.duplicateWindowMinutes
          },
          detectedAt: new Date(),
          resolved: false
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking duplicate orders:', error);
      return null;
    }
  }

  /**
   * Check for unusual ordering patterns
   */
  private async checkUnusualPattern(order: Order): Promise<FraudAlert | null> {
    try {
      const allOrders = await DynamoDBService.getAllOrders();
      
      // Get customer's order history
      const customerOrders = allOrders.filter(o => 
        o.customerEmail === order.customerEmail
      );

      if (customerOrders.length < 3) {
        return null; // Not enough history
      }

      // Calculate average order value
      const avgOrderValue = customerOrders.reduce((sum, o) => 
        sum + (parseFloat(o.totalAmount) || 0), 0
      ) / customerOrders.length;

      const currentValue = parseFloat(order.totalAmount) || 0;

      // Alert if order is significantly higher than average (3x or more)
      if (currentValue > avgOrderValue * 3 && avgOrderValue > 0) {
        return {
          id: `fraud-${Date.now()}-pattern`,
          type: 'unusual_pattern',
          severity: 'medium',
          orderId: order.id,
          userId: order.customerId,
          description: `Order value significantly higher than customer average`,
          details: {
            currentValue,
            averageValue: avgOrderValue.toFixed(2),
            multiplier: (currentValue / avgOrderValue).toFixed(2)
          },
          detectedAt: new Date(),
          resolved: false
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking unusual patterns:', error);
      return null;
    }
  }

  /**
   * Check for high volume of orders
   */
  private async checkHighVolume(order: Order): Promise<FraudAlert | null> {
    try {
      const allOrders = await DynamoDBService.getAllOrders();
      const now = new Date();

      // Check orders in last hour
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const recentOrders = allOrders.filter(o => 
        o.customerEmail === order.customerEmail &&
        new Date(o.createdAt) >= oneHourAgo
      );

      if (recentOrders.length >= this.alertThresholds.maxOrdersPerHour) {
        return {
          id: `fraud-${Date.now()}-volume`,
          type: 'high_volume',
          severity: 'high',
          orderId: order.id,
          userId: order.customerId,
          description: `Unusually high order volume from customer`,
          details: {
            ordersInLastHour: recentOrders.length,
            threshold: this.alertThresholds.maxOrdersPerHour,
            customerEmail: order.customerEmail
          },
          detectedAt: new Date(),
          resolved: false
        };
      }

      // Check orders in last 24 hours
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const dailyOrders = allOrders.filter(o => 
        o.customerEmail === order.customerEmail &&
        new Date(o.createdAt) >= oneDayAgo
      );

      if (dailyOrders.length >= this.alertThresholds.maxOrdersPerDay) {
        return {
          id: `fraud-${Date.now()}-daily-volume`,
          type: 'high_volume',
          severity: 'medium',
          orderId: order.id,
          userId: order.customerId,
          description: `High daily order volume from customer`,
          details: {
            ordersInLast24Hours: dailyOrders.length,
            threshold: this.alertThresholds.maxOrdersPerDay,
            customerEmail: order.customerEmail
          },
          detectedAt: new Date(),
          resolved: false
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking high volume:', error);
      return null;
    }
  }

  /**
   * Check for rapid succession orders
   */
  private async checkRapidSuccession(order: Order): Promise<FraudAlert | null> {
    try {
      const allOrders = await DynamoDBService.getAllOrders();
      
      // Find orders from same customer in last few minutes
      const recentMinutes = this.alertThresholds.rapidSuccessionMinutes;
      const cutoff = new Date(new Date(order.createdAt).getTime() - recentMinutes * 60 * 1000);
      
      const rapidOrders = allOrders.filter(o => 
        o.customerEmail === order.customerEmail &&
        o.id !== order.id &&
        new Date(o.createdAt) >= cutoff
      );

      if (rapidOrders.length >= 3) {
        return {
          id: `fraud-${Date.now()}-rapid`,
          type: 'rapid_succession',
          severity: 'medium',
          orderId: order.id,
          userId: order.customerId,
          description: `Multiple orders in rapid succession`,
          details: {
            ordersInWindow: rapidOrders.length,
            windowMinutes: recentMinutes,
            orderIds: rapidOrders.map(o => o.id)
          },
          detectedAt: new Date(),
          resolved: false
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking rapid succession:', error);
      return null;
    }
  }

  /**
   * Check if two orders are similar
   */
  private isSimilarOrder(order1: Order, order2: Order): boolean {
    // Simple similarity check based on order details
    const details1 = order1.orderDetails.toLowerCase();
    const details2 = order2.orderDetails.toLowerCase();

    // Calculate similarity (simple word overlap)
    const words1 = new Set(details1.split(/\s+/));
    const words2 = new Set(details2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    const similarity = intersection.size / union.size;
    
    return similarity > 0.7; // 70% similarity threshold
  }

  /**
   * Save fraud alerts to localStorage (or database)
   */
  private async saveAlerts(alerts: FraudAlert[]): Promise<void> {
    try {
      if (typeof window === 'undefined') return;

      const existingAlerts = this.getAllAlerts();
      const updatedAlerts = [...existingAlerts, ...alerts];
      
      localStorage.setItem('fraud_alerts', JSON.stringify(updatedAlerts));
      
      console.log(`Saved ${alerts.length} fraud alerts`);
    } catch (error) {
      console.error('Error saving fraud alerts:', error);
    }
  }

  /**
   * Get all fraud alerts
   */
  getAllAlerts(): FraudAlert[] {
    try {
      if (typeof window === 'undefined') return [];

      const alertsStr = localStorage.getItem('fraud_alerts');
      if (!alertsStr) return [];

      return JSON.parse(alertsStr);
    } catch (error) {
      console.error('Error getting fraud alerts:', error);
      return [];
    }
  }

  /**
   * Get unresolved alerts
   */
  getUnresolvedAlerts(): FraudAlert[] {
    return this.getAllAlerts().filter(alert => !alert.resolved);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: FraudAlert['severity']): FraudAlert[] {
    return this.getAllAlerts().filter(alert => alert.severity === severity);
  }

  /**
   * Mark alert as resolved
   */
  resolveAlert(alertId: string): void {
    try {
      if (typeof window === 'undefined') return;

      const alerts = this.getAllAlerts();
      const updatedAlerts = alerts.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      );

      localStorage.setItem('fraud_alerts', JSON.stringify(updatedAlerts));
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  }

  /**
   * Clear old alerts (older than 30 days)
   */
  clearOldAlerts(): void {
    try {
      if (typeof window === 'undefined') return;

      const alerts = this.getAllAlerts();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentAlerts = alerts.filter(alert => 
        new Date(alert.detectedAt) >= thirtyDaysAgo
      );

      localStorage.setItem('fraud_alerts', JSON.stringify(recentAlerts));
      
      console.log(`Cleared ${alerts.length - recentAlerts.length} old alerts`);
    } catch (error) {
      console.error('Error clearing old alerts:', error);
    }
  }
}

// Export singleton instance
export const fraudDetectionService = new FraudDetectionService();

export default fraudDetectionService;
