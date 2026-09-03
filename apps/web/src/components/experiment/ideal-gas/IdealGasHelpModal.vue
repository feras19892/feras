<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{ open: boolean }>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="help-overlay" @click.self="emit('close')">
    <div class="help-modal">
      <h3>{{ t('experiments.helpTitle') }}</h3>
      <div class="help-grid">
        <div><kbd>Space</kbd><span>{{ t('experiments.helpSpace') }}</span></div>
        <div><kbd>R</kbd><span>{{ t('experiments.helpR') }}</span></div>
        <div><kbd>S</kbd><span>{{ t('experiments.helpS') }}</span></div>
        <div><kbd>Ctrl+Z</kbd><span>{{ t('experiments.helpUndo') }}</span></div>
        <div><kbd>Ctrl+Y</kbd><span>{{ t('experiments.helpRedo') }}</span></div>
        <div><kbd>?</kbd><span>{{ t('experiments.helpQuestion') }}</span></div>
      </div>
      <button class="close-btn" @click="emit('close')">{{ t('experiments.helpQuestion') }}</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.help-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:9999; }
.help-modal { background:#1A1F27; border:1px solid #2D3645; border-radius:10px; padding:1.5rem; width:360px; max-width:90vw; }
.help-modal h3 { margin:0 0 .75rem; color:#5B8DB8; font-size:1rem; }
.help-grid { display:grid; gap:.5rem; margin-bottom:1rem; }
.help-grid div { display:flex; align-items:center; gap:.6rem; color:#B8C0CC; font-size:.8rem; }
kbd { display:inline-block; padding:.15rem .35rem; border-radius:4px; border:1px solid #2D3645; background:#0d1117; color:#8B95A5; font-size:.72rem; font-family:monospace; min-width:56px; text-align:center; }
.close-btn { width:100%; padding:.45rem; border-radius:6px; border:none; background:#5B8DB8; color:#fff; font-weight:700; cursor:pointer; }
.close-btn:hover { background:#4a7ba8; }
</style>