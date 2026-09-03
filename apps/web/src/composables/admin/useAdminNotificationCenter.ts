import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifications } from '../useNotifications';
import { useI18n } from '../useI18n';
import { eventBus } from '../shared/useEventBus';
import { getUnreadMessageCount, markAllMessagesRead } from '../../services/admin.service';

const iconMap: Record<string, string> = {
  report_submitted: '📤',
  report_graded: '⭐',
  report_resubmitted: '↩️',
  comment_added: '💬',
  class_joined: '🏫',
  banned: '🚫',
  unbanned: '✅',
  warning: '⚠️',
  penalty: '⛔',
  reward: '🎁',
  direct_message: '💬',
  emergency: '🚨',
  chat_flagged: '🚩',
  quiz_assigned: '📝',
  admin_notification: '📢',
};

const colorMap: Record<string, string> = {
  banned: '#ef4444',
  warning: '#fbbf24',
  penalty: '#f97316',
  reward: '#34d399',
  direct_message: '#06b6d4',
  emergency: '#ef4444',
  chat_flagged: '#f87171',
  unbanned: '#34d399',
};

export type AdminNotifFilter = 'all' | 'unread' | 'pinned' | 'warnings' | 'messages';

export function useAdminNotificationCenter() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { notifications, unreadCount, markAllRead, markOneRead, deleteOne, togglePin } = useNotifications();

  const open = ref(false);
  const filter = ref<AdminNotifFilter>('all');
  const messageUnread = ref(0);
  const liveToasts = ref<{ id: number; title: string; message: string; type: string; icon: string }[]>([]);
  let toastId = 0;

  // عدّاد الرسائل الموجهة — endpoint أدمن فقط، event-driven بلا polling
  async function loadMessageUnread() {
    try {
      const res = await getUnreadMessageCount();
      if (res.success) messageUnread.value = res.count;
    } catch { /* ignore */ }
  }

  function onNotifCacheInvalidate(payload: { pattern: string }) {
    if (payload.pattern === 'notifications' || payload.pattern === 'all') loadMessageUnread();
  }

  onMounted(() => {
    loadMessageUnread();
    eventBus.on('notification:new', loadMessageUnread);
    eventBus.on('cache:invalidate', onNotifCacheInvalidate);
  });

  onUnmounted(() => {
    eventBus.off('notification:new', loadMessageUnread);
    eventBus.off('cache:invalidate', onNotifCacheInvalidate);
  });
  const seenNotifIds = new Set<number>();
  let notifInitialized = false;

  const filteredNotifications = computed(() => {
    switch (filter.value) {
      case 'unread':
        return notifications.value.filter(n => !n.is_read);
      case 'pinned':
        return notifications.value.filter(n => n.is_pinned);
      case 'warnings':
        return notifications.value.filter(n =>
          n.type === 'warning' || n.type === 'banned' || n.type === 'unbanned' || n.type === 'penalty'
        );
      case 'messages':
        return notifications.value.filter(n => n.type === 'direct_message' || n.type === 'chat_flagged');
      default:
        return notifications.value;
    }
  });

  const stats = computed(() => {
    const total = notifications.value.length;
    const unread = notifications.value.filter(n => !n.is_read).length;
    const pinned = notifications.value.filter(n => n.is_pinned).length;
    const warnings = notifications.value.filter(
      n => n.type === 'warning' || n.type === 'banned' || n.type === 'penalty'
    ).length;
    return { total, unread, pinned, warnings };
  });

  const totalUnread = computed(() => unreadCount.value + messageUnread.value);

  function getIcon(type: string): string {
    return iconMap[type] || '🔔';
  }

  function getTypeColor(type: string): string {
    return colorMap[type] || '#64748b';
  }

  function formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return t('shared.justNow');
    if (diffMin < 60) return t('shared.minutesAgo').replace('{n}', String(diffMin));
    if (diffHr < 24) return t('shared.hoursAgo').replace('{n}', String(diffHr));
    if (diffDay < 7) return t('shared.daysAgo').replace('{n}', String(diffDay));

    return d.toLocaleDateString(locale.value === 'ar' ? 'ar-SA' : locale.value);
  }

  function addToast(title: string, message: string, type: string) {
    const id = ++toastId;
    liveToasts.value.push({ id, title, message, type, icon: getIcon(type) });
    setTimeout(() => {
      liveToasts.value = liveToasts.value.filter(t => t.id !== id);
    }, 5000);
  }

  watch(notifications, (val) => {
    if (!notifInitialized) {
      val.forEach(n => seenNotifIds.add(n.id));
      notifInitialized = true;
      return;
    }
    for (const n of val) {
      if (!seenNotifIds.has(n.id) && !n.is_read) {
        seenNotifIds.add(n.id);
        addToast(n.title, n.message || '', n.type);
      }
    }
    const currentIds = new Set(val.map(n => n.id));
    for (const id of seenNotifIds) {
      if (!currentIds.has(id)) seenNotifIds.delete(id);
    }
  }, { deep: false });

  function togglePanel() {
    open.value = !open.value;
    if (open.value) loadMessageUnread();
  }

  function handleNotifClick(n: { id: number; is_read: boolean; type: string; report_id?: number; class_id?: string }) {
    if (!n.is_read) markOneRead(n.id);
    open.value = false;
    if (n.report_id) {
      router.push(`/report/${n.report_id}`);
    } else if (n.class_id) {
      router.push({ path: '/admin', query: { tab: 'classes' } });
    }
  }

  async function markAllMessagesOnly() {
    try {
      await markAllMessagesRead();
      messageUnread.value = 0;
    } catch { /* ignore */ }
  }

  return {
    open,
    filter,
    messageUnread,
    liveToasts,
    notifications,
    filteredNotifications,
    stats,
    totalUnread,
    unreadCount,
    getIcon,
    getTypeColor,
    formatTime,
    togglePanel,
    markAllRead,
    markAllMessagesOnly,
    markOneRead,
    deleteOne,
    togglePin,
    handleNotifClick,
  };
}
