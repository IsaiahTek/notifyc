import { fetchNotifications, fetchUnreadCount, fetchPreferences } from './actions';
import { NotificationApiClient } from './api_client';
import { addNotification } from './handlers'
import { NotificationConfig, NotificationState } from './types';
import { notificationStore } from './store'
// ============================================================================
// INITIALIZATION (Call once in your app)
// ============================================================================
export let apiClient: NotificationApiClient | null = null;

export function initializeNotifications(config: NotificationConfig, onInitialized?: () => void) {
  apiClient = new NotificationApiClient(config);

  const onMessage = (data: any) => {
    console.log("GOT NEW NOTIFICATION: ", data)
    if (data.type === 'notification') {
      addNotification(data.notification);
    } else if (data.type === 'unread-count') {
      const state = notificationStore.snapshot[0];
      notificationStore.update({ ...state, unreadCount: data.count }, "key");
    } else if (data.type === 'initial-data') {
      const state = notificationStore.snapshot[0];
      notificationStore.update({
        ...state,
        notifications: data.notifications,
        unreadCount: data.unreadCount,
        isConnected: true
      }, "key");
    }
  };

  const connectRealtime = async () => {
    const preferredTransport = config.realtimeTransport ?? 'sse';
    let connected = false;

    if (preferredTransport === 'sse') {
      connected = apiClient!.connectSSE(onMessage);
      if (!connected && config.wsUrl) {
        connected = await apiClient!.connectWebSocket(onMessage);
      }
    } else if (preferredTransport === 'websocket') {
      connected = await apiClient!.connectWebSocket(onMessage);
      if (!connected) {
        connected = apiClient!.connectSSE(onMessage);
      }
    } else if (preferredTransport === 'polling') {
      connected = false;
    } else if (preferredTransport === 'none') {
      connected = false;
    }

    if (!connected && preferredTransport !== 'none' && config.pollInterval) {
      apiClient!.startPolling(async () => {
        await fetchNotifications();
        await fetchUnreadCount();
      });
      connected = true;
    }

    if (connected) {
      const state = notificationStore.snapshot[0];
      notificationStore.update({ ...state, isConnected: true }, "key");
    }
  };

  void connectRealtime();

  console.log("ABOUT TO CALL NOTIFICATION ACTIONS");
  // Initial fetch
  fetchNotifications();
  fetchUnreadCount();
  fetchPreferences();

  // Call onInitialized callback
  onInitialized && onInitialized();
}

export function disconnectNotifications() {
  if (apiClient) {
    apiClient.disconnectWebSocket();
    apiClient.stopPolling();
    const state = notificationStore.snapshot as NotificationState;
    notificationStore.update({ ...state, isConnected: false }, "key");
  }
}
