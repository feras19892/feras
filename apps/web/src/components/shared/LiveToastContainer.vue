<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, watch, onUnmounted } from 'vue';
import { useNotifications } from '../../composables/useNotifications';


const { notifications } = useNotifications();

const liveToasts = ref<{ id: number; notifId: number; title: string; message: string; type: string; icon: string }[]>([]);
let toastId = 0;
const seenIds = new Set<number>();
let initialized = false;

function getIcon(type: string): string {
  const map: Record<string, string> = {
    report_submitted: '📤',
    report_graded: '⭐',
    report_resubmitted: '↩️',
    report_opened: '👁️',
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
    capacity_request: '📦',
    school_report: '🚨',
    plagiarism_detected: '🔍',
    plagiarism_confirmed: '🚫',
    class_frozen: '❄️',
    class_unfrozen: '🔓',
    badge_awarded: '🏆',
    announcement: '📢',
    approval_escalation: '⚡',
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
    report_graded: '#fbbf24',
    report_opened: '#60a5fa',
    capacity_request: '#f97316',
    school_report: '#ef4444',
    plagiarism_detected: '#fbbf24',
    plagiarism_confirmed: '#ef4444',
    class_frozen: '#60a5fa',
    class_unfrozen: '#34d399',
    badge_awarded: '#fbbf24',
    announcement: '#6366f1',
    approval_escalation: '#a855f7',
  };
  return map[type] || '#6366f1';
}

function removeToast(id: number) {
  liveToasts.value = liveToasts.value.filter(t => t.id !== id);
}

watch(notifications, (val) => {
  if (!initialized) {
    val.forEach(n => seenIds.add(n.id));
    initialized = true;
    return;
  }
  for (const n of val) {
    if (!seenIds.has(n.id) && !n.is_read) {
      seenIds.add(n.id);
      const id = ++toastId;
      liveToasts.value.push({
        id,
        notifId: n.id,
        title: n.title,
        message: n.message || '',
        type: n.type,
        icon: getIcon(n.type),
      });
      setTimeout(() => removeToast(id), 5000);
    }
  }
  const currentIds = new Set(val.map(n => n.id));
  for (const id of seenIds) {
    if (!currentIds.has(id)) seenIds.delete(id);
  }
}, { deep: false });

onUnmounted(() => {
  liveToasts.value = [];
});
</script>

<template>
  <div class="live-toast-container">
    <TransitionGroup name="toast-anim">
      <div
        v-for="toast in liveToasts"
        :key="toast.id"
        class="live-toast"
        :style="{ borderInlineStartColor: getTypeColor(toast.type) }"
        @click="removeToast(toast.id)"
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

<style scoped>
.live-toast-container {
  position: fixed;
  top: 1rem;
  inset-inline-end: 1rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}
.live-toast {
  min-width: 280px;
  max-width: 360px;
  padding: 0.7rem 0.9rem;
  border-radius: 0.6rem;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-inline-start: 3px solid #6366f1;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 0.2s;
}
.live-toast:hover { opacity: 0.85; }
.toast-icon { font-size: 1.1rem; flex-shrink: 0; }
.toast-body { flex: 1; min-width: 0; }
.toast-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: #e2e8f0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toast-msg {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.15rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.toast-anim-enter-active, .toast-anim-leave-active { transition: all 0.3s ease; }
.toast-anim-enter-from { opacity: 0; transform: translateX(20px); }
.toast-anim-leave-to { opacity: 0; transform: translateX(20px); }
</style>
