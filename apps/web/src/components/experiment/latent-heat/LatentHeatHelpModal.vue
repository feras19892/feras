<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
defineProps<{ open: boolean }>()

const emit = defineEmits<{ (e: 'close'): void }>()
</script>
<template>
  <Teleport to="body">
    <div v-if="open" class="help-overlay" @click="emit('close')">
      <div class="help-box" @click.stop>
        <h3>{{ t('experiments.helpTitle') }}</h3>
        <p><b>Space</b> — {{ t('experiments.helpSpace') }}</p>
        <p><b>S</b> — {{ t('experiments.helpS') }}</p>
        <p><b>Ctrl+Z</b> — {{ t('experiments.helpUndo') }}</p>
        <p><b>Ctrl+Y</b> — {{ t('experiments.helpRedo') }}</p>
        <p><b>R</b> — {{ t('experiments.helpR') }}</p>
        <button class="close-btn" @click="emit('close')">{{ t('experiments.helpQuestion') }}</button>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.help-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; z-index:10000; }
.help-box { background:#1A1F27; border:1px solid #2D3645; border-radius:10px; padding:1.2rem 1.5rem; min-width:280px; color:#D1D7E0; }
.help-box h3 { margin:0 0 .6rem; color:#5B8DB8; font-size:.95rem; }
.help-box p { margin:.35rem 0; font-size:.8rem; color:#8B95A5; }
.close-btn { margin-top:.8rem; padding:.4rem 1rem; border-radius:6px; border:1px solid #2D3645; background:#161B22; color:#8B95A5; cursor:pointer; font-size:.78rem; }
.close-btn:hover { background:#1e2530; color:#D1D7E0; }
</style>