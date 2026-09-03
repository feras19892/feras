import { ref, onMounted, onUnmounted } from 'vue';
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead, deleteNotification, pinNotification } from '../services/notification.service';
import { eventBus } from './shared/useEventBus';
import type { Notification } from '../services/notification.service';
import type { AppEvents } from './shared/useEventBus';

export function useNotifications() {
  // المتغيرات داخل الدالة — كل مكون يأخذ نسخته الخاصة
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  let reloadTimer: ReturnType<typeof setTimeout> | null = null;

  function scheduleReload(delayMs = 300) {
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      reloadTimer = null;
      refreshUnread();
      loadNotifications();
    }, delayMs);
  }

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
      if (import.meta.env.DEV) console.error('mark all read failed:', err);
      refreshUnread();
    }
  }

  async function markOneRead(id: number) {
    const n = notifications.value.find(x => x.id === id);
    if (!n || n.is_read) return;
    try {
      await markAsRead(id);
      n.is_read = true;
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

  function onCacheInvalidate(payload: AppEvents['cache:invalidate']) {
    if (payload.pattern === 'notifications' || payload.pattern === 'all') {
      scheduleReload();
    }
  }

  function onNewNotification() {
    scheduleReload();
  }

  onMounted(() => {
    loadNotifications();
    refreshUnread();
    eventBus.on('notification:new', onNewNotification);
    eventBus.on('cache:invalidate', onCacheInvalidate);
  });

  onUnmounted(() => {
    if (reloadTimer) { clearTimeout(reloadTimer); reloadTimer = null; }
    eventBus.off('notification:new', onNewNotification);
    eventBus.off('cache:invalidate', onCacheInvalidate);
  });

  return { notifications, unreadCount, loading, loadNotifications, markAllRead, markOneRead, deleteOne, togglePin };
}
