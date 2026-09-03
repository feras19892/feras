import { ref, onMounted, onUnmounted } from 'vue'
import {
  getNotifications,
  getUnreadCount,
  markAsRead as apiMarkAsRead,
  markAllAsRead as apiMarkAllAsRead
} from '@/services/notification.service';
import type { Notification } from '@/services/notification.service'
import { eventBus } from './useEventBus'
import { useAuthStore } from '@/modules/auth/stores/auth'

const POLL_INTERVAL = 30_000

const notifications = ref<Notification[]>([])
const unreadCount = ref(0)
let active = 0
let pollTimer: ReturnType<typeof setInterval> | null = null

async function fetchAll() {
  if (document.hidden) return // تبويب مخفي: أوقف الجلب مؤقتاً — تُستأنف الدورة تلقائياً عند العودة
  const auth = useAuthStore()
  if (!auth.isAuthenticated) return // لا تجلب إشعارات لزائر غير مسجل — 401 صامت
  try {
    const [nRes, cRes] = await Promise.all([getNotifications(), getUnreadCount()]);
    if (nRes.success) notifications.value = nRes.notifications;
    if (cRes.success) unreadCount.value = cRes.count;
  } catch { /* silent */ }
}

function onNewNotification() {
  fetchAll()
}

function start() {
  active++
  if (active !== 1 || pollTimer) return
  fetchAll()
  pollTimer = setInterval(fetchAll, POLL_INTERVAL)
  eventBus.on('notification:new', onNewNotification)
}

function stop() {
  active--
  if (active > 0) return
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null }
  eventBus.off('notification:new', onNewNotification)
}

async function markAsRead(id: number) {
  try {
    await apiMarkAsRead(id)
    const n = notifications.value.find(n => n.id === id)
    if (n) n.is_read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch { /* silent */ }
}

async function markAllAsRead() {
  try {
    await apiMarkAllAsRead();
    notifications.value.forEach(n => n.is_read = true);
    unreadCount.value = 0;
  } catch { /* silent */ }
}

export function useNotifications() {
  onMounted(start)
  onUnmounted(stop)

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    connect: start,
    disconnect: stop
  }
}
