<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifications } from '../../composables/useNotifications';
import { useI18n } from '../../composables/useI18n';

const router = useRouter();
const { notifications, unreadCount, markAllRead, markOneRead, deleteOne, togglePin } = useNotifications();
const { t, locale } = useI18n();
const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

function toggle() {
  open.value = !open.value;
  if (open.value && unreadCount.value > 0) {
    markAllRead();
  }
}

function onDocumentClick(event: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('mousedown', onDocumentClick));
onUnmounted(() => document.removeEventListener('mousedown', onDocumentClick));

function getIcon(type: string) {
  const map: Record<string, string> = {
    report_submitted: '📤',
    report_graded: '⭐',
    report_resubmitted: '↩️',
    comment_added: '💬',
    class_joined: '🏫',
    capacity_request: '📦',
    school_report: '🚨',
    chat_flagged: '⚠️',
    approval_escalation: '⚡',
    warning: '⚠️',
    plagiarism_detected: '🔍',
    plagiarism_confirmed: '🚫',
    class_frozen: '❄️',
    class_unfrozen: '🔓',
    report_opened: '👁️',
    badge_awarded: '🏆',
    penalty: '⚠️',
    reward: '🎁',
    announcement: '📢',
  };
  return map[type] || '🔔';
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString(locale.value === 'ar' ? 'ar-SA' : locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function handleNotificationClick(n: { id: number; report_id?: number; type: string; class_id?: string; is_read: boolean; is_pinned?: number }) {
  if (!n.is_read) markOneRead(n.id);
  open.value = false;
  if (n.report_id) {
    router.push(`/report/${n.report_id}`);
  }
}
</script>

<template>
  <div ref="wrapperRef" class="bell-wrapper">
    <button class="bell-btn" @click="toggle">
      🔔
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </button>
    <div v-if="open" class="dropdown" @click.stop>
      <div class="header">
        <span>{{ t('common.notifications') }}</span>
        <button v-if="notifications.length > 0" class="mark-all" @click="markAllRead">
          {{ t('common.markAllRead') }}
        </button>
      </div>
      <div v-if="notifications.length === 0" class="empty">{{ t('common.noNotifications') }}</div>
      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['item', { unread: !n.is_read, clickable: n.report_id, pinned: n.is_pinned }]"
        @click="handleNotificationClick(n)"
      >
        <span class="icon">{{ getIcon(n.type) }}</span>
        <div class="content">
          <div class="title">
            <span v-if="n.is_pinned" class="pin-indicator">📌</span>
            {{ n.title }}
          </div>
          <div v-if="n.message" class="msg">{{ n.message }}</div>
          <div class="time">{{ formatTime(n.created_at) }}</div>
          <div class="item-actions" @click.stop>
            <button class="action-btn pin" @click.stop="togglePin(n.id)" :title="n.is_pinned ? t('common.unpin') : t('common.pin')">
              {{ n.is_pinned ? '📌' : '📍' }}
            </button>
            <button class="action-btn del" @click.stop="deleteOne(n.id)" :title="t('common.delete')">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bell-wrapper { position: relative; }
.bell-btn {
  background: none; border: none; cursor: pointer; font-size: 1.1rem;
  position: relative; padding: 0.25rem; transition: opacity 0.12s;
}
.bell-btn:hover { opacity: 0.7; }
.badge {
  position: absolute; top: -2px; right: -4px;
  background: #ef4444; color: #fff; font-size: 0.58rem; font-weight: 700;
  padding: 0.1rem 0.3rem; border-radius: 999px;
  min-width: 14px; text-align: center; line-height: 1;
}
.dropdown {
  position: absolute; top: calc(100% + 0.4rem); right: 0;
  width: 300px; max-height: 380px; overflow-y: auto;
  background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 4px; z-index: 400; padding: 0.5rem;
}
.header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 0.4rem; padding-bottom: 0.3rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-weight: 600; color: #e2e8f0; font-size: 0.82rem;
}
.mark-all {
  background: none; border: none; color: #67e8f9; font-size: 0.68rem;
  cursor: pointer; padding: 0;
}
.mark-all:hover { opacity: 0.7; }
.empty { text-align: center; padding: 1rem; color: #475569; font-size: 0.78rem; }
.item {
  display: flex; gap: 0.5rem; padding: 0.4rem; border-radius: 3px;
  transition: background 0.12s; cursor: pointer;
}
.item:hover { background: rgba(255, 255, 255, 0.02); }
.item.clickable:hover { background: rgba(99, 102, 241, 0.06); }
.item.unread { background: rgba(99, 102, 241, 0.06); }
.icon { font-size: 0.9rem; flex-shrink: 0; margin-top: 0.1rem; }
.content { display: flex; flex-direction: column; gap: 0.1rem; flex: 1; }
.title { color: #e2e8f0; font-size: 0.78rem; font-weight: 600; }
.msg { color: #64748b; font-size: 0.72rem; }
.time { color: #475569; font-size: 0.65rem; }
.item.pinned { border-left: 2px solid #fbbf24; }
.pin-indicator { font-size: 0.65rem; }
.item-actions { display: flex; gap: 0.25rem; margin-top: 0.2rem; }
.action-btn { background: none; border: 1px solid rgba(255,255,255,0.06); border-radius: 3px; padding: 0.1rem 0.3rem; cursor: pointer; font-size: 0.65rem; font-family: inherit; transition: background 0.12s; }
.action-btn.pin:hover { background: rgba(251,191,36,0.1); }
.action-btn.del:hover { background: rgba(239,68,68,0.1); }
</style>
