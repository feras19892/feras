<script setup lang="ts">
const props = defineProps<{
  launchLabel: string
  speed: number
  canUndo: boolean
  canRedo: boolean
}>()

const emit = defineEmits<{
  (e: 'togglePause'): void
  (e: 'reset'): void
  (e: 'recordTrial'): void
  (e: 'clearTrials'): void
  (e: 'exportCsv'): void
  (e: 'undo'): void
  (e: 'redo'): void
  (e: 'update:speed', v: number): void
}>()
</script>

<template>
  <div class="control-bar">
    <button class="ctrl-btn primary" @click="emit('togglePause')">{{ launchLabel }}</button>
    <button class="ctrl-btn" @click="emit('reset')">🔄 إعادة</button>
    <button class="ctrl-btn" @click="emit('recordTrial')">📌 تسجيل</button>
    <button class="ctrl-btn" @click="emit('undo')" :disabled="!canUndo">↩️ تراجع</button>
    <button class="ctrl-btn" @click="emit('redo')" :disabled="!canRedo">↪️ إعادة</button>
    <button class="ctrl-btn" @click="emit('clearTrials')">🗑️ مسح</button>
    <button class="ctrl-btn" @click="emit('exportCsv')">📤 تصدير</button>
    <div class="speed-control">
      <label>السرعة:</label>
      <input type="range" min="0.25" max="3" step="0.25" :value="speed" @input="emit('update:speed', +($event.target as HTMLInputElement).value)" />
      <span>{{ speed }}x</span>
    </div>
  </div>
</template>

<style scoped>
.control-bar { display:flex; align-items:center; justify-content:center; gap:.4rem; padding:.5rem .6rem; background:rgba(30,37,48,0.6); border:1px solid #2D3645; border-radius:8px; flex-shrink:0; flex-wrap:wrap; margin-top:.3rem; }
.ctrl-btn { padding:.35rem .6rem; border:1px solid #2D3645; border-radius:6px; background:rgba(255,255,255,.03); color:#D1D7E0; cursor:pointer; font-size:.7rem; font-weight:600; transition:all .15s; white-space:nowrap; }
.ctrl-btn:hover { background:rgba(91,141,184,.1); border-color:#5B8DB8; }
.ctrl-btn.primary { background:rgba(91,141,184,.15); border-color:#5B8DB8; color:#5B8DB8; }
.ctrl-btn:disabled { opacity:.4; cursor:not-allowed; }
.speed-control { display:flex; align-items:center; gap:.3rem; }
.speed-control label { font-size:.68rem; color:#8B95A5; }
.speed-control span { font-size:.68rem; color:#D1D7E0; min-width:24px; }
</style>
