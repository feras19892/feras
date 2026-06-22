<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <span>&#x2753; {{ t('experiments.menuHelp') }}</span>
        <button class="modal-close" @click="emit('close')">&#x2715;</button>
      </div>
      <div class="modal-body">
        <p><strong>{{ t('experiments.keyboardShortcuts') }}:</strong></p>
        <ul>
          <li><kbd>Space</kbd> {{ t('experiments.startStop') }}</li>
          <li><kbd>R</kbd> {{ t('experiments.resetLabel') }}</li>
          <li><kbd>S</kbd> {{ t('experiments.recordReading') }}</li>
          <li><kbd>Ctrl+Z</kbd> {{ t('experiments.undoLabel') }}</li>
          <li><kbd>Ctrl+Y</kbd> {{ t('experiments.redoLabel') }}</li>
          <li><kbd>?</kbd> {{ t('experiments.thisWindow') }}</li>
        </ul>
        <p><strong>{{ t('experiments.mouseUsage') }}:</strong></p>
        <ul>
          <li>{{ t('experiments.clickEmptyPoint') }}</li>
          <li>{{ t('experiments.dragWeight') }}</li>
          <li>{{ t('experiments.doubleClickWeight') }}</li>
        </ul>
        <p><strong>{{ t('experiments.leverLaw') }}:</strong></p>
        <p>τ = m · g · x. {{ t('experiments.atEquilibrium') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal-box { background:#161B22; border:1px solid #2D3645; border-radius:12px; width:min(480px,90vw); max-height:80vh; overflow:auto; }
.modal-header { display:flex; justify-content:space-between; align-items:center; padding:.8rem 1rem; border-bottom:1px solid #2D3645; font-weight:700; color:#5B8DB8; }
.modal-close { background:none; border:none; color:#8B95A5; cursor:pointer; font-size:1.1rem; }
.modal-body { padding:1rem; font-size:.82rem; color:#D1D7E0; line-height:1.6; }
.modal-body ul { margin:.4rem 0; padding-right:1.2rem; }
.modal-body li { margin:.25rem 0; color:#94a3b8; }
kbd { background:#252D3A; border:1px solid #2D3645; border-radius:4px; padding:.1rem .35rem; font-size:.75rem; color:#e2e8f0; }
</style>
