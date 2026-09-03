<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
defineProps<{ open: boolean }>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="emit('close')">
      <div class="help-modal">
        <h3>✓ {{ t('experiments.lightRayHelp') }}</h3>
        <ul>
          <li><b>Space</b> — {{ t('experiments.shortcutStartStop') }}</li>
          <li><b>R</b> — {{ t('experiments.shortcutReset') }}</li>
          <li><b>S</b> — {{ t('experiments.shortcutRecord') }}</li>
          <li><b>Ctrl+Z</b> — {{ t('experiments.shortcutUndo') }}</li>
          <li><b>Ctrl+Y</b> — {{ t('experiments.shortcutRedo') }}</li>
          <li><b>?</b> — {{ t('experiments.shortcutToggleHelp') }}</li>
        </ul>
        <p>{{ t('experiments.lawOfReflection') }}</p>
        <p>{{ t('experiments.snellsLaw') }}</p>
        <button class="btn-close" @click="emit('close')">{{ t('experiments.shortcutToggleHelp') }}</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 300; }
.help-modal { background: #1e2530; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1.5rem; width: 90%; max-width: 420px; display: flex; flex-direction: column; gap: .75rem; }
.help-modal h3 { margin: 0; font-size: 1rem; color: #fbbf24; }
.help-modal ul { margin: 0; padding-inline-start: 1.2rem; font-size: .85rem; color: #8B95A5; line-height: 1.6; }
.help-modal p { margin: 0; font-size: .85rem; color: #8B95A5; }
.btn-close { padding: .5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #D1D7E0; cursor: pointer; font-family: inherit; margin-top: .5rem; }
</style>