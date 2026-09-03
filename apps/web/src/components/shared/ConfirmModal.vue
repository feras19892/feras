<script setup lang="ts">
import { computed } from 'vue';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

const props = defineProps<{
  open: boolean;
  icon: string;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  variant: 'danger' | 'success' | 'warning';
  loading?: boolean;
}>();

const safeMessage = computed(() => sanitizeHtml(props.message));

const emit = defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-overlay" @click.self="emit('cancel')">
      <div class="confirm-modal">
        <div class="confirm-icon">{{ icon }}</div>
        <h3 class="confirm-title">{{ title }}</h3>
        <p class="confirm-msg" v-html="safeMessage"></p>
        <div class="confirm-actions">
          <button class="confirm-btn cancel" @click="emit('cancel')" :disabled="loading">{{ cancelLabel }}</button>
          <button :class="['confirm-btn', variant]" @click="emit('confirm')" :disabled="loading">
            {{ loading ? '...' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; }
.confirm-modal { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 1.5rem; max-width: 380px; width: 90%; text-align: center; }
.confirm-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.confirm-title { font-size: 1.1rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.5rem; }
.confirm-msg { font-size: 0.9rem; color: #94a3b8; margin-bottom: 1.2rem; line-height: 1.5; }
.confirm-actions { display: flex; gap: 0.6rem; justify-content: center; }
.confirm-btn { padding: 0.5rem 1.2rem; border-radius: 0.5rem; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; font-family: inherit; }
.confirm-btn.cancel { background: rgba(100,116,139,0.2); color: #94a3b8; border: 1px solid rgba(100,116,139,0.3); }
.confirm-btn.cancel:hover { background: rgba(100,116,139,0.3); }
.confirm-btn.danger { background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
.confirm-btn.danger:hover { background: rgba(239,68,68,0.3); }
.confirm-btn.success { background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.3); }
.confirm-btn.success:hover { background: rgba(34,197,94,0.3); }
.confirm-btn.warning { background: rgba(245,158,11,0.2); color: #fbbf24; border: 1px solid rgba(245,158,11,0.3); }
.confirm-btn.warning:hover { background: rgba(245,158,11,0.3); }
.confirm-btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
