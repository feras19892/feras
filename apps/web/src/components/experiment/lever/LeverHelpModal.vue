<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
const { t } = useI18n()
defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
</script>
<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click="emit('close')">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>&#x2753; {{ t('experiments.leverHelpTitle') }}</h3>
          <button class="close-btn" @click="emit('close')">&#x2715;</button>
        </div>
        <div class="modal-body">
          <p><b>{{ t('experiments.theory') }}:</b> {{ t('experiments.leverHelpTheory') }}</p>
          <p><b>{{ t('experiments.method') }}:</b> {{ t('experiments.leverHelpMethod') }}</p>
          <p><b>{{ t('experiments.shortcuts') }}:</b></p>
          <ul>
            <li>R = {{ t('experiments.resetBtn') }}</li>
            <li>S = {{ t('experiments.recordBtn') }}</li>
            <li>Ctrl+Z = {{ t('experiments.undoBtn') }}</li>
            <li>Ctrl+Y = {{ t('experiments.redoBtn') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<style scoped>
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:200; display:flex; align-items:center; justify-content:center; padding:1rem; }
.modal-content { background:#161B22; border:1px solid #2D3645; border-radius:12px; max-width:560px; width:100%; max-height:80vh; overflow:auto; }
.modal-header { display:flex; justify-content:space-between; align-items:center; padding:.75rem 1rem; border-bottom:1px solid #2D3645; }
.modal-header h3 { margin:0; font-size:.95rem; color:#5B8DB8; }
.close-btn { background:transparent; border:none; color:#8B95A5; cursor:pointer; font-size:1rem; }
.modal-body { padding:1rem; font-size:.78rem; color:#D1D7E0; line-height:1.6; }
.modal-body ul { padding-left:1.2rem; margin:.3rem 0; }
.modal-body li { color:#8B95A5; margin:.15rem 0; }
</style>
