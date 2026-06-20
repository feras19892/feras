<script setup lang="ts">
const props = defineProps<{
  launchLabel: string
  speed: number
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
  (e: 'update:speed', val: number): void
}>()

function onClear() {
  if (confirm('هل أنت متأكد من مسح جميع القراءات؟')) emit('clearTrials')
}

function incSpeed() {
  const next = Math.round((props.speed + 0.25) * 100) / 100
  emit('update:speed', Math.min(3, next))
}
function decSpeed() {
  const next = Math.round((props.speed - 0.25) * 100) / 100
  emit('update:speed', Math.max(0.25, next))
}
</script>

<template>
  <div class="control-bar">
    <button class="btn-primary" @click="$emit('togglePause')">{{ launchLabel }}</button>
    <button class="btn-secondary" @click="$emit('reset')">&#x1F504; إعادة</button>
    <button class="btn-secondary" @click="$emit('recordTrial')">&#x1F4CC; تسجيل</button>
    <button class="btn-undo" :disabled="!canUndo" @click="$emit('undo')" title="تراجع (Ctrl+Z)">&#x21A9; تراجع</button>
    <button class="btn-undo" :disabled="!canRedo" @click="$emit('redo')" title="إعادة (Ctrl+Y)">&#x21AA; إعادة</button>
    <button class="btn-undo" @click="onClear">&#x1F5D1; مسح</button>
    <button class="btn-undo" @click="$emit('exportCsv')">&#x1F4BE; CSV</button>
    <div class="speed-group">
      <button class="btn-speed" @click="decSpeed">−</button>
      <span class="speed-val">×{{ speed.toFixed(2) }}</span>
      <button class="btn-speed" @click="incSpeed">+</button>
    </div>
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
.speed-group { display:flex; align-items:center; gap:.2rem; background:#161B22; border:1px solid #2D3645; border-radius:5px; padding:.2rem .3rem; }
.btn-speed { background:#252D3A; color:#5B8DB8; border:1px solid #2D3645; width:24px; height:24px; display:flex; align-items:center; justify-content:center; padding:0; font-size:.9rem; border-radius:4px; cursor:pointer; }
.btn-speed:hover { background:#2D3645; }
.speed-val { font-family:monospace; font-size:.75rem; color:#5B8DB8; min-width:36px; text-align:center; }
</style>
