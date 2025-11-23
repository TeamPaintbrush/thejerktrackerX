// 📱 Android Enhanced Offline Service
// Priority Feature #4 - Robust Offline Experience
// Based on: MOBILE-IMPROVEMENTS-PROPOSAL.md - Enhanced Offline Mode

import { Network } from '@capacitor/network';

export interface OfflineQueueItem {
  id: string;
  action: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'DELETE_ORDER' | 'UPLOAD_IMAGE' | 'SYNC_LOCATION';
  data: any;
  timestamp: number;
  retryCount: number;
  priority: 'high' | 'medium' | 'low';
}

export interface OfflineStorage {
  orders: any[];
  images: { [key: string]: string }; // Base64 encoded
  locations: any[];
  settings: any;
  lastSync: number;
}

export interface NetworkStatus {
  connected: boolean;
  connectionType: string;
  offline: boolean;
}

class AndroidOfflineService {
  private static instance: AndroidOfflineService;
  private isInitialized = false;
  private offlineQueue: OfflineQueueItem[] = [];
  private networkStatus: NetworkStatus = { connected: true, connectionType: 'wifi', offline: false };
  private syncInProgress = false;
  private offlineStorage: OfflineStorage = {
    orders: [],
    images: {},
    locations: [],
    settings: {},
    lastSync: 0
  };

  static getInstance(): AndroidOfflineService {
    if (!AndroidOfflineService.instance) {
      AndroidOfflineService.instance = new AndroidOfflineService();
    }
    return AndroidOfflineService.instance;
  }

  /**
   * Initialize offline service
   */
  async initialize(): Promise<void> {
    try {
      // Load offline data
      await this.loadOfflineData();
      
      // Setup network monitoring
      await this.setupNetworkMonitoring();
      
      // Load pending queue
      await this.loadOfflineQueue();
      
      this.isInitialized = true;
      console.log('[AndroidOffline] Service initialized');
      
      // Try initial sync if online
      if (this.networkStatus.connected) {
        this.processPendingQueue();
      }
    } catch (error) {
      console.error('[AndroidOffline] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Setup network status monitoring
   */
  private async setupNetworkMonitoring(): Promise<void> {
    try {
      // Get initial network status
      const status = await Network.getStatus();
      this.networkStatus = {
        connected: status.connected,
        connectionType: status.connectionType,
        offline: !status.connected
      };

      // Listen for network changes
      Network.addListener('networkStatusChange', (status) => {
        const wasOffline = this.networkStatus.offline;
        this.networkStatus = {
          connected: status.connected,
          connectionType: status.connectionType,
          offline: !status.connected
        };

        console.log('[AndroidOffline] Network status changed:', this.networkStatus);

        // If came back online, process queue
        if (wasOffline && status.connected) {
          console.log('[AndroidOffline] Back online - processing queue');
          this.processPendingQueue();
        }
      });

    } catch (error) {
      console.error('[AndroidOffline] Failed to setup network monitoring:', error);
    }
  }

  /**
   * Add item to offline queue
   */
  async addToQueue(action: OfflineQueueItem['action'], data: any, priority: OfflineQueueItem['priority'] = 'medium'): Promise<string> {
    const item: OfflineQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      priority
    };

    this.offlineQueue.push(item);
    await this.saveOfflineQueue();

    console.log(`[AndroidOffline] Added to queue: ${action}`, item);

    // If online, try to process immediately
    if (this.networkStatus.connected && !this.syncInProgress) {
      this.processQueueItem(item);
    }

    return item.id;
  }

  /**
   * Process pending offline queue
   */
  async processPendingQueue(): Promise<void> {
    if (this.syncInProgress || !this.networkStatus.connected) {
      return;
    }

    this.syncInProgress = true;
    console.log('[AndroidOffline] Processing queue:', this.offlineQueue.length, 'items');

    // Sort by priority and timestamp
    const sortedQueue = [...this.offlineQueue].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.timestamp - b.timestamp;
    });

    for (const item of sortedQueue) {
      if (!this.networkStatus.connected) {
        break; // Stop if went offline
      }

      await this.processQueueItem(item);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.syncInProgress = false;
    await this.saveOfflineQueue();
    console.log('[AndroidOffline] Queue processing complete');
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    try {
      console.log(`[AndroidOffline] Processing: ${item.action}`, item.id);

      switch (item.action) {
        case 'CREATE_ORDER':
          await this.syncCreateOrder(item.data);
          break;
        case 'UPDATE_ORDER':
          await this.syncUpdateOrder(item.data);
          break;
        case 'DELETE_ORDER':
          await this.syncDeleteOrder(item.data);
          break;
        case 'UPLOAD_IMAGE':
          await this.syncUploadImage(item.data);
          break;
        case 'SYNC_LOCATION':
          await this.syncLocation(item.data);
          break;
      }

      // Remove from queue on success
      this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
      console.log(`[AndroidOffline] Successfully processed: ${item.action}`);

    } catch (error) {
      console.error(`[AndroidOffline] Failed to process ${item.action}:`, error);
      
      item.retryCount++;
      
      // Remove if too many retries
      if (item.retryCount >= 3) {
        this.offlineQueue = this.offlineQueue.filter(q => q.id !== item.id);
        console.log(`[AndroidOffline] Max retries reached for: ${item.action}`);
      }
    }
  }

  /**
   * Store order offline
   */
  async storeOrderOffline(order: any): Promise<void> {
    this.offlineStorage.orders.push({
      ...order,
      offlineId: `offline_${Date.now()}`,
      createdOffline: true,
      lastModified: Date.now()
    });
    
    await this.saveOfflineData();
    
    // Add to sync queue
    await this.addToQueue('CREATE_ORDER', order, 'high');
  }

  /**
   * Get offline orders
   */
  getOfflineOrders(): any[] {
    return this.offlineStorage.orders.filter(order => order.createdOffline);
  }

  /**
   * Store image offline (Base64)
   */
  async storeImageOffline(imageId: string, imageData: string): Promise<void> {
    this.offlineStorage.images[imageId] = imageData;
    await this.saveOfflineData();
    
    // Add to upload queue
    await this.addToQueue('UPLOAD_IMAGE', { id: imageId, data: imageData }, 'medium');
  }

  /**
   * Get network status
   */
  getNetworkStatus(): NetworkStatus {
    return this.networkStatus;
  }

  /**
   * Check if offline
   */
  isOffline(): boolean {
    return this.networkStatus.offline;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { pending: number; syncing: boolean } {
    return {
      pending: this.offlineQueue.length,
      syncing: this.syncInProgress
    };
  }

  // Storage methods
  private async saveOfflineData(): Promise<void> {
    try {
      localStorage.setItem('android_offline_storage', JSON.stringify(this.offlineStorage));
    } catch (error) {
      console.error('[AndroidOffline] Failed to save offline data:', error);
    }
  }

  private async loadOfflineData(): Promise<void> {
    try {
      const stored = localStorage.getItem('android_offline_storage');
      if (stored) {
        this.offlineStorage = { ...this.offlineStorage, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('[AndroidOffline] Failed to load offline data:', error);
    }
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      localStorage.setItem('android_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('[AndroidOffline] Failed to save queue:', error);
    }
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('android_offline_queue');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[AndroidOffline] Failed to load queue:', error);
    }
  }

  // Sync methods (mock implementations)
  private async syncCreateOrder(orderData: any): Promise<void> {
    // Mock API call
    console.log('[AndroidOffline] Syncing create order:', orderData);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async syncUpdateOrder(orderData: any): Promise<void> {
    console.log('[AndroidOffline] Syncing update order:', orderData);
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  private async syncDeleteOrder(orderData: any): Promise<void> {
    console.log('[AndroidOffline] Syncing delete order:', orderData);
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async syncUploadImage(imageData: any): Promise<void> {
    console.log('[AndroidOffline] Syncing upload image:', imageData.id);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async syncLocation(locationData: any): Promise<void> {
    console.log('[AndroidOffline] Syncing location:', locationData);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// Export singleton instance
export const offlineService = AndroidOfflineService.getInstance();

// Usage Examples:
/*
// Initialize service
await AndroidOfflineService.initialize();

// Store order when offline
await AndroidOfflineService.storeOrderOffline({
  id: 'order123',
  items: [...],
  total: 25.99
});

// Store image offline
await AndroidOfflineService.storeImageOffline('receipt123', base64ImageData);

// Check status
const isOffline = AndroidOfflineService.isOffline();
const queueStatus = AndroidOfflineService.getQueueStatus();

// Get offline orders
const offlineOrders = AndroidOfflineService.getOfflineOrders();
*/