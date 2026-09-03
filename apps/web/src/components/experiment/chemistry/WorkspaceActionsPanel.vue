<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
const props = defineProps<{

  canUndo: boolean;
  canRedo: boolean;
  canStepUndo?: boolean;
  canStepRedo?: boolean;
}>();

const emit = defineEmits<{
  undo: [];
  redo: [];
  stepUndo: [];
  stepRedo: [];
}>();
</script>

<template>
  <div class="workspace-actions">
    <button class="action-btn undo" :disabled="!canUndo" @click="emit('undo')" :title="t('chemistryLab.undoFull')">{{ t('chemistryLab.undoFull') }}</button>
    <button class="action-btn step-undo" :disabled="!canStepUndo" @click="emit('stepUndo')" :title="t('chemistryLab.undoStep')">{{ t('chemistryLab.undoStep') }}</button>
    <button class="action-btn step-redo" :disabled="!canStepRedo" @click="emit('stepRedo')" :title="t('chemistryLab.redoStep')">{{ t('chemistryLab.redoStep') }}</button>
    <button class="action-btn redo" :disabled="!canRedo" @click="emit('redo')" :title="t('chemistryLab.redoFull')">{{ t('chemistryLab.redoFull') }}</button>
  </div>
</template>

<style scoped>
.workspace-actions {
  position: absolute;
  bottom: 1rem;
  left: calc(var(--left-width, 300px) + 1rem);
  display: flex;
  gap: 0.4rem;
  z-index: 20;
}
.action-btn {
  padding: 0.45rem 0.7rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  background: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  color: #475569;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.15s;
}
.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.action-btn.undo:hover:not(:disabled) {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}
.action-btn.redo:hover:not(:disabled) {
  background: #dbeafe;
  color: #2563eb;
  border-color: #bfdbfe;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}
.action-btn.step-undo, .action-btn.step-redo {
  font-size: 0.7rem;
  padding: 0.35rem 0.5rem;
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #475569;
}
.action-btn.step-undo:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}
.action-btn.step-redo:hover:not(:disabled) {
  background: #dbeafe;
  border-color: #93c5fd;
  color: #2563eb;
}
</style>