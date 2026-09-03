<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { useResetConfirm } from '../../composables/useResetConfirm'

const { showResetConfirm, acceptReset, cancelReset, t } = useResetConfirm()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="showResetConfirm" class="reset-confirm-overlay" @click.self="cancelReset">
        <div class="reset-confirm-modal">
          <div class="reset-icon">🔄</div>
          <h3>{{ t('experiments.resetConfirm') }}</h3>
          <p>{{ t('experiments.resetConfirmMsg', 'سيتم مسح جميع القراءات والبيانات. هل أنت متأكد؟') }}</p>
          <div class="reset-actions">
            <button class="reset-cancel" @click="cancelReset">{{ t('common.cancel', 'إلغاء') }}</button>
            <button class="reset-accept" @click="acceptReset">{{ t('experiments.resetBtn') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.reset-confirm-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.reset-confirm-modal {
  background: rgba(15,23,42,0.97); border: 1px solid rgba(99,102,241,0.2);
  border-radius: 0.8rem; padding: 1.5rem; width: 90%; max-width: 340px;
  text-align: center; display: flex; flex-direction: column; gap: 0.6rem;
}
.reset-icon { font-size: 2rem; }
.reset-confirm-modal h3 { margin: 0; font-size: 1rem; color: #f1f5f9; }
.reset-confirm-modal p { margin: 0; font-size: 0.82rem; color: #94a3b8; line-height: 1.5; }
.reset-actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.reset-cancel {
  flex: 1; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; font-family: inherit; border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05); color: #94a3b8;
}
.reset-accept {
  flex: 1; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; font-family: inherit; border: none;
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>
