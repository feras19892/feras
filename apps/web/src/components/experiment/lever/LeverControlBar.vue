<script setup lang="ts">
const props = defineProps<{
  launchLabel: string
  canUndo?: boolean
  canRedo?: boolean
}>()

const emit = defineEmits<{
  (e: 'togglePause'): void
  (e: 'reset'): void
  (e: 'recordTrial'): void
  (e: 'clearTrials'): void
  (e: 'exportCsv'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'startChallenge'): void
}>()

function onClear() {
  if (confirm('هل أنت متأكد من مسح جميع القراءات؟')) emit('clearTrials')
}
</script>

<template>
  <div class="control-bar">
    <button class="btn-primary" @click="$emit('togglePause')">{{ launchLabel }}</button>
    <button class="btn-secondary" @click="$emit('reset')">&#x1F504; إعادة</button>
    <button class="btn-secondary" @click="$emit('recordTrial')">&#x1F4CC; تسجيل</button>
    <button class="btn-undo" :disabled="!canUndo" @click="$emit('undo')" title="تراجع">&#x21A9; تراجع</button>
    <button class="btn-undo" :disabled="!canRedo" @click="$emit('redo')" title="إعادة">&#x21AA; إعادة</button>
    <button class="btn-undo" @click="onClear">&#x1F5D1; مسح</button>
    <button class="btn-undo" @click="$emit('exportCsv')">&#x1F4BE; CSV</button>
    <button class="btn-challenge" @click="$emit('startChallenge')">&#x1F3AF; تحدي</button>
  </div>
</template>

<style scoped>
.control-bar { display:flex; justify-content:center; gap:.4rem; padding:.5rem; background:#1E2530; border-radius:8px; border:1px solid #2D3645; margin-top:.2rem; flex-shrink:0; }
.control-bar button { font-size:.8rem; padding:.45rem .8rem; border-radius:5px; cursor:pointer; font-weight:600; transition:.2s; }
.btn-primary { background:rgba(91,141,184,.15); color:#5B8DB8; border:1px solid rgba(91,141,184,.3); }
.btn-primary:hover { background:rgba(91,141,184,.25); }
.btn-secondary { background:#252D3A; color:#8B95A5; border:1px solid #2D3645; }
.btn-secondary:hover { background:#2D3645; color:#D1D7E0; }
.btn-undo { background:#252D3A; color:#8B95A5; border:1px solid #2D3645; }
.btn-undo:disabled { opacity:.4; cursor:not-allowed; }
.btn-challenge { background:rgba(245,158,11,.15); color:#fbbf24; border:1px solid rgba(245,158,11,.3); }
.btn-challenge:hover { background:rgba(245,158,11,.25); }
</style>
