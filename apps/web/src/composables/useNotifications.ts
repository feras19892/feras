import { ref, onMounted, onUnmounted } from 'vue';
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead, deleteNotification, pinNotification } from '../services/notification.service';
import { apiUrl } from '../services/http';
import type { Notification } from '../services/notification.service';

const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const loading = ref(false);
let eventSource: EventSource | null = null;
let fallbackIntervalId: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let activeInstances = 0;

async function loadNotifications() {
  loading.value = true;
  try {
    const res = await getNotifications();
    if (res.success) notifications.value = res.notifications;
  } catch {
    // silently ignore when API is unavailable
  }
  loading.value = false;
}

async function refreshUnread() {
  try {
    const res = await getUnreadCount();
    if (res.success) unreadCount.value = res.count;
  } catch {
    // silently ignore when API is unavailable
  }
}

async function markAllRead() {
  unreadCount.value = 0;
  try {
    await markAllAsRead();
    // Remove all non-pinned, keep pinned as read
    notifications.value = notifications.value.filter(n => n.is_pinned).map(n => ({ ...n, is_read: true }));
  } catch (err) {
    if (import.meta.env.DEV) console.error('mark all read failed:', err);
    refreshUnread();
  }
}

async function markOneRead(id: number) {
  const n = notifications.value.find(x => x.id === id);
  if (!n || n.is_read) return;
  try {
    await markAsRead(id);
    if (n.is_pinned) {
      n.is_read = true;
    } else {
      // Non-pinned: auto-deleted on backend, remove from list
      notifications.value = notifications.value.filter(x => x.id !== id);
    }
    if (unreadCount.value > 0) unreadCount.value--;
  } catch (err) {
    if (import.meta.env.DEV) console.error('mark read failed:', err);
  }
}

async function deleteOne(id: number) {
  try {
    await deleteNotification(id);
    notifications.value = notifications.value.filter(x => x.id !== id);
    if (unreadCount.value > 0) unreadCount.value--;
  } catch (err) {
    if (import.meta.env.DEV) console.error('delete notification failed:', err);
  }
}

async function togglePin(id: number) {
  try {
    const res = await pinNotification(id);
    if (res.success) {
      const n = notifications.value.find(x => x.id === id);
      if (n) n.is_pinned = res.is_pinned ? 1 : 0;
    }
  } catch (err) {
    if (import.meta.env.DEV) console.error('pin notification failed:', err);
  }
}

function startSSE() {
  if (eventSource) return;
  try {
    const url = apiUrl('/api/notifications/stream');
    eventSource = new EventSource(url, { withCredentials: true });

    eventSource.addEventListener('connected', () => {
      if (fallbackIntervalId) {
        clearInterval(fallbackIntervalId);
        fallbackIntervalId = null;
      }
      refreshUnread();
      loadNotifications();
    });

    eventSource.addEventListener('notification', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as Notification;
        notifications.value = [data, ...notifications.value].slice(0, 50);
        unreadCount.value++;
      } catch {
        // ignore parse errors
      }
    });

    eventSource.addEventListener('ping', () => {
      // heartbeat — connection alive
    });

    eventSource.onerror = () => {
      eventSource?.close();
      eventSource = null;
      if (!fallbackIntervalId) {
        refreshUnread();
        loadNotifications();
        fallbackIntervalId = setInterval(() => {
          refreshUnread();
          loadNotifications();
        }, 30000);
      }
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        if (!eventSource) startSSE();
      }, 10000);
    };
  } catch {
    startPolling();
  }
}

function startPolling(intervalMs = 30000) {
  refreshUnread();
  loadNotifications();
  if (fallbackIntervalId) clearInterval(fallbackIntervalId);
  fallbackIntervalId = setInterval(() => {
    refreshUnread();
    loadNotifications();
  }, intervalMs);
}

function stopAll() {
  if (eventSource) {
    eventSource.close();
    eventSource = null;
  }
  if (fallbackIntervalId) {
    clearInterval(fallbackIntervalId);
    fallbackIntervalId = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

export function useNotifications() {
  onMounted(() => {
    activeInstances++;
    if (activeInstances === 1) {
      startSSE();
    }
  });

  onUnmounted(() => {
    activeInstances--;
    if (activeInstances <= 0) {
      activeInstances = 0;
      stopAll();
    }
  });

  return { notifications, unreadCount, loading, loadNotifications, markAllRead, markOneRead, deleteOne, togglePin };
}
