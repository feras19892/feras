<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useNotifications } from '../../composables/useNotifications';

const { notifications, unreadCount, markAllRead } = useNotifications();
const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

function toggle() { open.value = !open.value; }

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
  };
  return map[type] || '🔔';
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
        <span>الإشعارات</span>
        <button v-if="notifications.length > 0" class="mark-all" @click="markAllRead">
          تحديد الكل
        </button>
      </div>
      <div v-if="notifications.length === 0" class="empty">لا توجد إشعارات</div>
      <div
        v-for="n in notifications"
        :key="n.id"
        :class="['item', { unread: !n.is_read }]"
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
.bell-wrapper { position: relative; }
.bell-btn {
  background: none; border: none; cursor: pointer; font-size: 1.1rem;
  position: relative; padding: 0.3rem;
}
.badge {
  position: absolute; top: -2px; right: -4px;
  background: #ef4444; color: #fff; font-size: 0.65rem; font-weight: 700;
  padding: 0.1rem 0.35rem; border-radius: 999px;
}
.dropdown {
  position: absolute; top: calc(100% + 0.5rem); right: 0;
  width: 320px; max-height: 400px; overflow-y: auto;
  background: rgba(15, 23, 42, 0.98); border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.6rem; z-index: 400; padding: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}
.header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 0.5rem; padding-bottom: 0.4rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-weight: 700; color: #e2e8f0; font-size: 0.85rem;
}
.mark-all {
  background: none; border: none; color: #67e8f9; font-size: 0.7rem;
  cursor: pointer; padding: 0;
}
.empty { text-align: center; padding: 1rem; color: #64748b; font-size: 0.8rem; }
.item {
  display: flex; gap: 0.5rem; padding: 0.5rem; border-radius: 0.35rem;
  transition: background 0.15s; cursor: pointer;
}
.item:hover { background: rgba(255, 255, 255, 0.03); }
.item.unread { background: rgba(99, 102, 241, 0.08); }
.icon { font-size: 1rem; flex-shrink: 0; margin-top: 0.1rem; }
.content { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; }
.title { color: #e2e8f0; font-size: 0.8rem; font-weight: 600; }
.msg { color: #94a3b8; font-size: 0.75rem; }
.time { color: #64748b; font-size: 0.7rem; }
</style>
