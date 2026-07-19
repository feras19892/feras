import { ref, onMounted, onUnmounted } from 'vue';
import { getNotifications, getUnreadCount, markAllAsRead } from '../services/notification.service';
import type { Notification } from '../services/notification.service';

export function useNotifications() {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

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
    try {
      await markAllAsRead();
      notifications.value = notifications.value.map(n => ({ ...n, is_read: true }));
      unreadCount.value = 0;
    } catch (err) {
      console.error('mark all read failed:', err);
    }
  }

  function startPolling(intervalMs = 30000) {
    refreshUnread();
    loadNotifications();
    intervalId = setInterval(() => {
      refreshUnread();
      loadNotifications();
    }, intervalMs);
  }

  function stopPolling() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  onMounted(() => {
    loadNotifications();
    startPolling();
  });

  onUnmounted(() => stopPolling());

  return { notifications, unreadCount, loading, loadNotifications, markAllRead };
}
