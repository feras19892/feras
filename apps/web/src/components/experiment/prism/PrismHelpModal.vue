<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

interface Props { open: boolean }
defineProps<Props>()
const { t } = useI18n()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <div v-if="open" class="modal-overlay" @click="emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">&#x2753; {{ t('experiments.prismHelp') }}</div>
      <div class="modal-body">
        <p><strong>{{ t('experiments.keys') }}:</strong></p>
        <ul>
          <li>Space — {{ t('experiments.shortcutStartStop') }}</li>
          <li>S — {{ t('experiments.recordReading') }}</li>
          <li>R — {{ t('experiments.shortcutReset') }}</li>
          <li>Ctrl+Z — {{ t('experiments.shortcutUndo') }}</li>
          <li>Ctrl+Y — {{ t('experiments.shortcutRedo') }}</li>
          <li>? — {{ t('experiments.shortcutToggleHelp') }}</li>
        </ul>
        <p><strong>{{ t('experiments.equations') }}:</strong></p>
        <ul>
          <li>{{ t('experiments.snellsLaw') }}</li>
          <li>{{ t('experiments.prismEquation') }}: n = sin((A+D)/2) / sin(A/2)</li>
        </ul>
      </div>
      <button class="modal-close" @click="emit('close')">{{ t('experiments.closeLabel') }}</button>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 10000; }
.modal-card { background: #1A1F27; border: 1px solid #2D3645; border-radius: 10px; padding: 1.2rem; width: 420px; max-width: 90vw; }
.modal-header { font-weight: 700; color: #5B8DB8; margin-bottom: .6rem; font-size: .95rem; }
.modal-body { color: #B8C0CC; font-size: .82rem; line-height: 1.5; }
.modal-body ul { padding-right: 1.2rem; margin: .3rem 0; }
.modal-body li { margin-bottom: .15rem; }
.modal-close { margin-top: .8rem; padding: .35rem .9rem; border-radius: 6px; border: 1px solid #2D3645; background: #252D3A; color: #D1D7E0; cursor: pointer; font-family: inherit; }
</style>
