// ============================================================================
// API CLIENT
// ============================================================================

import { io, Socket } from "socket.io-client";
import { NotificationConfig } from "./types";
import {
  Notification,
  NotificationFilters,
  NotificationPreferences,
  NotificationStats} from './types';



export class NotificationApiClient {
  private config: NotificationConfig;
  private ws?: Socket;
  private pollInterval?: any;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(config: NotificationConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.config.getAuthToken ? await this.config.getAuthToken() : null;
    
    const response = await fetch(`${this.config.apiUrl}${endpoint}`, {
      ...options,
      credentials: 'include', // Ensure cookies are sent for session-based auth
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    const params = new URLSearchParams();
    if (filters?.status) {
      params.append('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
    }
    if (filters?.type) {
      params.append('type', Array.isArray(filters.type) ? filters.type.join(',') : filters.type);
    }
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    const rawNotifications = await this.request(`/notifications/${this.config.userId}${query}`);

    const notifications:Notification[] = this.config.dataLocator ? this.config.dataLocator(rawNotifications) : rawNotifications;
    
    // Parse date strings to Date objects
    return Array.isArray(notifications) ? notifications.map(this.parseNotificationDates): [this.parseNotificationDates(notifications)];
  }

  async getUnreadCount(): Promise<number> {
    const rawResult = await this.request<{ count: number }>(`/notifications/${this.config.userId}/unread-count`);
    const result = this.config.dataLocator ? this.config.dataLocator(rawResult) : rawResult;
    console.log("GOT UNREAD COUNT IN API: ", result.count, result);
    return result.count;
  }

  async getStats(): Promise<NotificationStats> {
    return this.request<NotificationStats>(`/notifications/${this.config.userId}/stats`);
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const prefs = await this.request<NotificationPreferences>(`/notifications/${this.config.userId}/preferences`);
    return prefs;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}/read`, { method: 'POST' });
  }

  async markAllAsRead(): Promise<void> {
    await this.request(`/notifications/${this.config.userId}/read-all`, { method: 'POST' });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.request(`/notifications/${notificationId}`, { method: 'DELETE' });
  }

  async deleteAll(): Promise<void> {
    await this.request(`/notifications/${this.config.userId}`, { method: 'DELETE' });
  }

  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<void> {
    await this.request(`/notifications/${this.config.userId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(prefs)
    });
  }

  connectWebSocket(onMessage: (data: any) => void): void {
    if (!this.config.wsUrl) return;

    const connect = () => {
      
      this.ws = io(this.config.wsUrl!, {
        query: { // Pass userId as a 'query' option for the handshake
          userId: this.config.userId,
        },
        // Force WebSocket transport for performance, though 'polling' fallback is common
        transports: ['websocket', 'polling'], 
        reconnectionAttempts: this.maxReconnectAttempts
      });

      
      // this.ws.onmessage = (event) => {
        //   const data = JSON.parse(event.data);
        
      //   // Parse dates in received data
      //   if (data.notification) {
      //     data.notification = this.parseNotificationDates(data.notification);
      //   }
        
      //   onMessage(data);
      // };

      // this.ws.onerror = (error) => {
      //   console.error('❌ WebSocket error:', error);
      // };

      // this.ws.onclose = () => {
      //   console.log('🔌 WebSocket disconnected');
        
      //   if (this.reconnectAttempts < this.maxReconnectAttempts) {
      //     this.reconnectAttempts++;
      //     const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      //     console.log(`🔄 Reconnecting in ${delay}ms...`);
      //     setTimeout(connect, delay);
      //   }
      // };

      this.ws.on('connect', () => {
        console.log('🔌 WebSocket connected');
        this.reconnectAttempts = 0;
      });
      // Listen for the custom event emitted by your NestJS gateway
      this.ws.on('initial-data', (data: any) => {
        // Handle your custom initial-data event
        this.handleMessage(data, onMessage); 
      });

      this.ws.on('notification', (data: any) => {
        // Handle your custom 'notification' event
        this.handleMessage(data, onMessage); 
      });

      this.ws.on('unread-count', (data: any) => {
        // Handle your custom 'unread-count' event
        this.handleMessage(data, onMessage); 
      });

      this.ws.on('error', (error: any) => { // Socket.IO uses 'error'
        console.error('❌ Socket.IO error:', error);
      });
      
      this.ws.on('disconnect', (reason: string) => { // Socket.IO uses 'disconnect'
        console.log(`🔌 Socket.IO disconnected. Reason: ${reason}`);
        // Socket.IO's built-in reconnection handles the rest.
      });

    };
    
    connect();
  }

  // Helper function to process messages (optional, based on your original logic)
  private handleMessage = (data: any, onMessage: (data: any) => void) => {
      if (data.notification) {
          data.notification = this.parseNotificationDates(data.notification);
      }
      onMessage(data);
  }
  
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = undefined;
    }
  }

  startPolling(onPoll: () => Promise<void>): void {
    if (!this.config.pollInterval) return;

    this.pollInterval = setInterval(async () => {
      try {
        await onPoll();
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.config.pollInterval);
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
  }

  private parseNotificationDates(notification: Notification): Notification {
    return {
      ...notification,
      createdAt: notification.createdAt ? new Date(notification.createdAt) : new Date(),
      readAt: notification.readAt ? new Date(notification.readAt) : undefined,
      scheduledFor: notification.scheduledFor ? new Date(notification.scheduledFor) : undefined,
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined,
    };
  }
}
