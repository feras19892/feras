import { ref, onMounted, onUnmounted } from 'vue';
import { apiUrl } from '../services/http';
import {
  getSchoolNotifications, getSchoolUnreadCount,
  markSchoolNotificationRead, markAllSchoolNotificationsRead,
  deleteSchoolNotification, pinSchoolNotification,
  type SchoolNotification,
} from '../services/school-notification.service';

const notifications = ref<SchoolNotification[]>([]);
const unreadCount = ref(0);
const loading = ref(false);
let eventSource: EventSource | null = null;
let fallbackIntervalId: ReturnType<typeof setInterval> | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let activeInstances = 0;

async function loadNotifications() {
  loading.value = true;
  try {
    const res = await getSchoolNotifications();
    if (res.success) notifications.value = res.notifications;
  } catch { /* ignore */ }
  loading.value = false;
}

async function refreshUnread() {
  try {
    const res = await getSchoolUnreadCount();
    if (res.success) unreadCount.value = res.count;
  } catch { /* ignore */ }
}

function startSSE() {
  if (eventSource) return;
  try {
    eventSource = new EventSource(apiUrl('/api/school/notifications/stream'), { withCredentials: true });
    eventSource.addEventListener('connected', () => {
      if (fallbackIntervalId) {
        clearInterval(fallbackIntervalId);
        fallbackIntervalId = null;
      }
      refreshUnread();
      loadNotifications();
    });
    eventSource.addEventListener('notification', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as SchoolNotification;
        notifications.value = [data, ...notifications.value].slice(0, 50);
        unreadCount.value++;
      } catch { /* ignore */ }
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

function startPolling() {
  if (fallbackIntervalId) return;
  refreshUnread();
  loadNotifications();
  fallbackIntervalId = setInterval(() => {
    refreshUnread();
    loadNotifications();
  }, 30000);
}

function stopSSE() {
  if (eventSource) { eventSource.close(); eventSource = null; }
  if (fallbackIntervalId) { clearInterval(fallbackIntervalId); fallbackIntervalId = null; }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
}

async function markAllRead() {
  unreadCount.value = 0;
  try {
    await markAllSchoolNotificationsRead();
    notifications.value = notifications.value.filter(n => n.is_pinned).map(n => ({ ...n, is_read: 1 }));
  } catch {
    refreshUnread();
  }
}

async function markOneRead(id: number) {
  const n = notifications.value.find(x => x.id === id);
  if (!n || n.is_read) return;
  try {
    await markSchoolNotificationRead(id);
    if (n.is_pinned) {
      n.is_read = 1;
    } else {
      notifications.value = notifications.value.filter(x => x.id !== id);
    }
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  } catch (err) {
    if (import.meta.env.DEV) console.error('school mark read failed:', err);
  }
}

async function deleteOne(id: number) {
  try {
    await deleteSchoolNotification(id);
    notifications.value = notifications.value.filter(n => n.id !== id);
    await refreshUnread();
  } catch (err) {
    if (import.meta.env.DEV) console.error('school delete notification failed:', err);
  }
}

async function togglePin(id: number) {
  try {
    const res = await pinSchoolNotification(id);
    if (res.success) {
      const n = notifications.value.find(x => x.id === id);
      if (n) n.is_pinned = res.is_pinned ? 1 : 0;
    }
  } catch { /* ignore */ }
}

export function useSchoolNotifications() {
  onMounted(() => {
    activeInstances++;
    if (activeInstances === 1) {
      startSSE();
      refreshUnread();
    }
  });

  onUnmounted(() => {
    activeInstances--;
    if (activeInstances <= 0) {
      activeInstances = 0;
      stopSSE();
    }
  });

  return {
    notifications,
    unreadCount,
    loading,
    markAllRead,
    markOneRead,
    deleteOne,
    togglePin,
  };
}
