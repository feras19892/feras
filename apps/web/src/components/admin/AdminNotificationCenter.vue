<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifications } from '../../composables/useNotifications';
import { useI18n } from '../../composables/useI18n';
import { getUnreadMessageCount, getConversations, markAllMessagesRead, type ConversationItem } from '../../services/admin.service';

const router = useRouter();
const { notifications, unreadCount, markAllRead, markOneRead, deleteOne, togglePin } = useNotifications();
const { t, locale } = useI18n();

const open = ref(false);
const filter = ref<'all' | 'unread' | 'pinned' | 'warnings' | 'messages'>('all');
const messageUnread = ref(0);
const conversations = ref<ConversationItem[]>([]);
const liveToasts = ref<{ id: number; title: string; message: string; type: string; icon: string }[]>([]);
let toastId = 0;
const seenNotifIds = new Set<number>();
let notifInitialized = false;

const filteredNotifications = computed(() => {
  switch (filter.value) {
    case 'unread':
      return notifications.value.filter(n => !n.is_read);
    case 'pinned':
      return notifications.value.filter(n => n.is_pinned);
    case 'warnings':
      return notifications.value.filter(n => n.type === 'warning' || n.type === 'banned' || n.type === 'unbanned' || n.type === 'penalty');
    case 'messages':
      return notifications.value.filter(n => n.type === 'direct_message');
    default:
      return notifications.value;
  }
});

const stats = computed(() => {
  const total = notifications.value.length;
  const unread = notifications.value.filter(n => !n.is_read).length;
  const pinned = notifications.value.filter(n => n.is_pinned).length;
  const warnings = notifications.value.filter(n => n.type === 'warning' || n.type === 'banned' || n.type === 'penalty').length;
  return { total, unread, pinned, warnings };
});

const totalUnread = computed(() => unreadCount.value + messageUnread.value);

function getIcon(type: string): string {
  const map: Record<string, string> = {
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
  };
  return map[type] || '🔔';
}

function getTypeColor(type: string): string {
  const map: Record<string, string> = {
    banned: '#ef4444',
    warning: '#fbbf24',
    penalty: '#f97316',
    reward: '#34d399',
    direct_message: '#06b6d4',
    emergency: '#ef4444',
    chat_flagged: '#f87171',
    unbanned: '#34d399',
  };
  return map[type] || '#64748b';
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

function togglePanel() {
  open.value = !open.value;
  if (open.value) {
    loadConversations();
    loadMessageUnread();
    if (unreadCount.value > 0) {
      markAllRead();
    }
    if (messageUnread.value > 0) {
      messageUnread.value = 0;
      markAllMessagesRead().catch(() => {});
    }
  }
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

async function loadMessageUnread() {
  try {
    const res = await getUnreadMessageCount();
    if (res.success) messageUnread.value = res.count;
  } catch { /* ignore */ }
}

async function loadConversations() {
  try {
    const res = await getConversations();
    if (res.success) conversations.value = res.conversations;
  } catch { /* ignore */ }
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

let pollTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  pollTimer = setInterval(() => {
    loadMessageUnread();
  }, 30000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<template>
  <!-- Notification Bell Button -->
  <div class="admin-notif-trigger" @click="togglePanel">
    <span class="bell-icon">🔔</span>
    <Transition name="badge-pop">
      <span v-if="totalUnread > 0" class="notif-badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
    </Transition>
  </div>

  <!-- Slide-out Panel -->
  <Transition name="slide-panel">
    <div v-if="open" class="notif-panel-overlay" @click.self="open = false">
      <div class="notif-panel">
        <!-- Header -->
        <div class="panel-header">
          <div class="header-title">
            <span class="header-icon">🔔</span>
            <h2>{{ t('admin.notifCenter') }}</h2>
          </div>
          <button class="close-btn" @click="open = false">✕</button>
        </div>

        <!-- Stats Bar -->
        <div class="stats-bar">
          <div class="stat-chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">
            <span class="stat-num">{{ stats.total }}</span>
            <span class="stat-lbl">{{ t('admin.notifAll') }}</span>
          </div>
          <div class="stat-chip unread" :class="{ active: filter === 'unread' }" @click="filter = 'unread'">
            <span class="stat-num">{{ stats.unread }}</span>
            <span class="stat-lbl">{{ t('admin.notifUnread') }}</span>
          </div>
          <div class="stat-chip pinned" :class="{ active: filter === 'pinned' }" @click="filter = 'pinned'">
            <span class="stat-num">{{ stats.pinned }}</span>
            <span class="stat-lbl">{{ t('admin.notifPinned') }}</span>
          </div>
          <div class="stat-chip warn" :class="{ active: filter === 'warnings' }" @click="filter = 'warnings'">
            <span class="stat-num">{{ stats.warnings }}</span>
            <span class="stat-lbl">{{ t('admin.notifWarnings') }}</span>
          </div>
          <div class="stat-chip msg" :class="{ active: filter === 'messages' }" @click="filter = 'messages'">
            <span class="stat-num">{{ messageUnread }}</span>
            <span class="stat-lbl">{{ t('admin.notifMessages') }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="panel-actions">
          <button class="action-btn mark-all" @click="markAllRead" :disabled="unreadCount === 0">
            ✓ {{ t('admin.notifMarkAllRead') }}
          </button>
        </div>

        <!-- Notifications List -->
        <div class="notif-list">
          <div v-if="filteredNotifications.length === 0" class="notif-empty">
            <div class="empty-icon">📭</div>
            <p>{{ t('common.noNotifications') }}</p>
          </div>

          <div
            v-for="n in filteredNotifications"
            :key="n.id"
            class="notif-item"
            :class="{ unread: !n.is_read, pinned: n.is_pinned }"
            @click="handleNotifClick(n)"
          >
            <div class="notif-accent" :style="{ background: getTypeColor(n.type) }"></div>
            <div class="notif-icon-wrap">
              <span class="notif-icon">{{ getIcon(n.type) }}</span>
            </div>
            <div class="notif-body">
              <div class="notif-title-row">
                <span v-if="n.is_pinned" class="pin-badge">📌</span>
                <span class="notif-title">{{ n.title }}</span>
              </div>
              <div v-if="n.message" class="notif-msg">{{ n.message }}</div>
              <div class="notif-meta">
                <span class="notif-time">{{ formatTime(n.created_at) }}</span>
                <span v-if="!n.is_read" class="unread-dot"></span>
              </div>
              <div class="notif-item-actions">
                <button class="mini-act pin" @click.stop="togglePin(n.id)" :title="n.is_pinned ? t('common.unpin') : t('common.pin')">
                  {{ n.is_pinned ? '📌' : '📍' }}
                </button>
                <button class="mini-act del" @click.stop="deleteOne(n.id)" :title="t('common.delete')">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Live Toasts -->
  <div class="live-toasts">
    <TransitionGroup name="toast-anim">
      <div
        v-for="toast in liveToasts"
        :key="toast.id"
        class="live-toast"
        :style="{ borderLeftColor: getTypeColor(toast.type) }"
        @click="liveToasts = liveToasts.filter(t => t.id !== toast.id)"
      >
        <span class="toast-icon">{{ toast.icon }}</span>
        <div class="toast-body">
          <div class="toast-title">{{ toast.title }}</div>
          <div v-if="toast.message" class="toast-msg">{{ toast.message }}</div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>


<style scoped src='./AdminNotificationCenter.css'></style>
