<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ t('experiments.helpTitle') }}</h3>
        <button class="modal-close" @click="emit('close')">&#x2715;</button>
      </div>
      <div class="modal-body">
        <p><strong>Space</strong> — {{ t('experiments.helpSpace') }}</p>
        <p><strong>R</strong> — {{ t('experiments.helpR') }}</p>
        <p><strong>S</strong> — {{ t('experiments.helpS') }}</p>
        <p><strong>Ctrl+Z</strong> — {{ t('experiments.helpUndo') }}</p>
        <p><strong>Ctrl+Y</strong> — {{ t('experiments.helpRedo') }}</p>
        <p><strong>?</strong> — {{ t('experiments.helpQuestion') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); z-index: 9999; display: flex; align-items: center; justify-content: center; }
.modal { background: #1A1F27; border: 1px solid #2D3645; border-radius: 10px; width: 480px; max-width: 90vw; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: .8rem 1rem; border-bottom: 1px solid #2D3645; }
.modal-header h3 { margin: 0; font-size: .95rem; color: #D1D7E0; }
.modal-close { background: none; border: none; color: #8B95A5; cursor: pointer; font-size: 1rem; }
.modal-body { padding: 1rem; font-size: .82rem; color: #8B95A5; line-height: 1.7; }
.modal-body p { margin: .2rem 0; }
.modal-body strong { color: #5B8DB8; }
</style>
