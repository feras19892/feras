import { ref, onMounted, onUnmounted } from 'vue';
import { getNotifications, getUnreadCount, markAllAsRead, markAsRead } from '../services/notification.service';
import type { Notification } from '../services/notification.service';

const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const loading = ref(false);
let intervalId: ReturnType<typeof setInterval> | null = null;
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
  try {
    await markAllAsRead();
    notifications.value = notifications.value.map(n => ({ ...n, is_read: true }));
    unreadCount.value = 0;
  } catch (err) {
    console.error('mark all read failed:', err);
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
    console.error('mark read failed:', err);
  }
}

function startPolling(intervalMs = 30000) {
  refreshUnread();
  loadNotifications();
  if (intervalId) clearInterval(intervalId);
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

export function useNotifications() {
  onMounted(() => {
    activeInstances++;
    if (activeInstances === 1) {
      startPolling();
    }
  });

  onUnmounted(() => {
    activeInstances--;
    if (activeInstances <= 0) {
      activeInstances = 0;
      stopPolling();
    }
  });

  return { notifications, unreadCount, loading, loadNotifications, markAllRead, markOneRead };
}
