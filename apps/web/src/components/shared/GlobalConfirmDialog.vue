<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { useConfirmDialog } from '../../composables/useConfirmDialog'

const { dialogVisible, dialogOptions, acceptDialog, cancelDialog } = useConfirmDialog()

</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="dialogVisible" class="dialog-overlay" @click.self="cancelDialog">
        <div class="dialog-modal">
          <div class="dialog-icon">{{ dialogOptions.icon || '⚠️' }}</div>
          <h3 class="dialog-title">{{ dialogOptions.title || t('common.confirm', 'تأكيد') }}</h3>
          <p class="dialog-msg">{{ dialogOptions.message }}</p>
          <div class="dialog-actions">
            <button class="dialog-btn cancel" @click="cancelDialog">
              {{ dialogOptions.cancelLabel || t('common.cancel', 'إلغاء') }}
            </button>
            <button
              :class="['dialog-btn', dialogOptions.variant || 'danger']"
              @click="acceptDialog"
            >
              {{ dialogOptions.confirmLabel || t('common.confirm', 'تأكيد') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.dialog-modal {
  background: rgba(15,23,42,0.97); border: 1px solid rgba(99,102,241,0.2);
  border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 380px;
  text-align: center; display: flex; flex-direction: column; gap: 0.6rem;
}
.dialog-icon { font-size: 2.5rem; }
.dialog-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #e2e8f0; }
.dialog-msg { margin: 0; font-size: 0.9rem; color: #94a3b8; line-height: 1.5; }
.dialog-actions { display: flex; gap: 0.6rem; justify-content: center; margin-top: 0.5rem; }
.dialog-btn {
  padding: 0.5rem 1.2rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600;
  cursor: pointer; font-family: inherit; border: none;
}
.dialog-btn.cancel {
  background: rgba(100,116,139,0.2); color: #94a3b8; border: 1px solid rgba(100,116,139,0.3);
}
.dialog-btn.cancel:hover { background: rgba(100,116,139,0.3); }
.dialog-btn.danger {
  background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3);
}
.dialog-btn.danger:hover { background: rgba(239,68,68,0.3); }
.dialog-btn.success {
  background: rgba(34,197,94,0.2); color: #4ade80; border: 1px solid rgba(34,197,94,0.3);
}
.dialog-btn.success:hover { background: rgba(34,197,94,0.3); }
.dialog-fade-enter-active, .dialog-fade-leave-active { transition: opacity 0.2s; }
.dialog-fade-enter-from, .dialog-fade-leave-to { opacity: 0; }
</style>
