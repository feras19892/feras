<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifications } from '../../composables/useNotifications';
import type { Notification } from '../../services/notification.service';
const { notifications, unreadCount, markAllRead, markOneRead } = useNotifications();

const router = useRouter();
const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

const showDot = computed(() => unreadCount.value > 0);

function toggle() {
  open.value = !open.value;
}

function onDocumentClick(event: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    open.value = false;
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false;
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentClick);
  document.removeEventListener('keydown', onKeydown);
});

function getIcon(type: string) {
  const map: Record<string, string> = {
    report_submitted: '📤',
    report_graded: '⭐',
    report_resubmitted: '↩️',
    comment_added: '💬',
    class_joined: '🏫',
    quiz_assigned: '📝',
    warning: '⚠️',
    broadcast_info: '📢',
    broadcast_urgent: '🚨',
  };
  return map[type] || '🔔';
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString(locale.value, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

async function onItemClick(n: Notification) {
  if (!n.is_read) await markOneRead(n.id);
  if (n.report_id) router.push(`/report/${n.report_id}`);
  open.value = false;
}
</script>

<template>
  <div ref="wrapperRef" class="bell-wrapper">
    <button
      class="bell-btn"
      :aria-label="t('common.notifications')"
      :aria-expanded="open"
      @click="toggle"
    >
      🔔
      <span v-if="showDot" class="dot" aria-hidden="true"></span>
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
        v-for="n in notifications.slice(0, 20)"
        :key="n.id"
        :class="['item', { unread: !n.is_read }]"
        @click="onItemClick(n)"
      >
        <span class="icon">{{ getIcon(n.type) }}</span>
        <div class="content">
          <div class="title">{{ n.title }}</div>
          <div v-if="n.message" class="msg">{{ n.message }}</div>
          <div class="time">{{ formatTime(n.created_at) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bell-wrapper { position: relative; display: inline-flex; align-items: center; }
.bell-btn {
  background: none; border: none; cursor: pointer; font-size: 1.1rem;
  position: relative; padding: 0.3rem; color: var(--as-text, #e2e8f0);
  display: inline-flex; align-items: center; justify-content: center;
}
.dot {
  position: absolute; top: -3px; inset-inline-end: -3px;
  width: 10px; height: 10px;
  background: var(--as-danger, #ef4444); border-radius: 50%;
  border: 2px solid var(--bg-primary, rgba(15, 23, 42, 0.9));
}
.dropdown {
  position: absolute; top: calc(100% + 0.5rem); inset-inline-end: 0;
  width: min(320px, calc(100vw - 1rem)); max-height: 400px; overflow-y: auto;
  background: var(--bg-card, white); border: 1px solid var(--as-border, #e5e7eb);
  border-radius: 0.6rem; z-index: 400; padding: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  color: var(--as-text, #1a2332);
}
.header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 0.5rem; padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--as-border, #e5e7eb);
  font-weight: 700; color: var(--as-text, #1a2332); font-size: 0.85rem;
}
.mark-all {
  background: none; border: none; color: var(--as-accent, #6366f1); font-size: 0.75rem;
  cursor: pointer; padding: 0.2rem 0.4rem; border-radius: 0.3rem;
}
.mark-all:hover { background: rgba(99, 102, 241, 0.08); }
.empty { text-align: center; padding: 1rem; color: var(--as-text-soft, #6b7280); font-size: 0.8rem; }
.item {
  display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: 0.35rem;
  transition: background 0.15s; cursor: pointer;
}
.item:hover { background: var(--bg-hover, rgba(99, 102, 241, 0.05)); }
.item.unread { background: rgba(99, 102, 241, 0.08); }
.item.unread:hover { background: rgba(99, 102, 241, 0.12); }
.icon { font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.content { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; min-width: 0; }
.title { color: var(--as-text, #1a2332); font-size: 0.8rem; font-weight: 600; }
.msg { color: var(--as-text-soft, #6b7280); font-size: 0.75rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word; }
.time { color: var(--as-text-muted, #64748b); font-size: 0.7rem; }
</style>
