<script setup lang="ts">
const props = defineProps<{
  params: { p: number; v: number; n: number; T: number }
}>()
const emit = defineEmits<{
  (e: 'update:params', p: { p: number; v: number; n: number; T: number }): void
}>()
</script>
<template>
  <div class="panel-body">
    <div class="param-row read-only"><label>الضغط P</label>
      <span class="computed">{{ params.p.toFixed(2) }} atm</span>
      <span class="hint">محسوب من P = nRT/V</span>
    </div>
    <div class="param-row"><label>الحجم V (L)</label>
      <input type="range" :value="params.v" min="0.3" max="2" step="0.05" @input="emit('update:params', { ...params, v: +($event.target as HTMLInputElement).value })" />
      <span>{{ params.v.toFixed(2) }} L</span>
    </div>
    <div class="param-row"><label>n (mol)</label>
      <input type="range" :value="params.n" min="0.01" max="0.2" step="0.001" @input="emit('update:params', { ...params, n: +($event.target as HTMLInputElement).value })" />
      <span>{{ params.n.toFixed(3) }} mol</span>
    </div>
    <div class="param-row"><label>T (K)</label>
      <input type="range" :value="params.T" min="273" max="400" step="1" @input="emit('update:params', { ...params, T: +($event.target as HTMLInputElement).value })" />
      <span>{{ params.T }} K</span>
    </div>
  </div>
</template>
<style scoped>
.panel-body { padding:.45rem; display:flex; flex-direction:column; gap:.35rem; }
.param-row { display:flex; flex-direction:column; gap:.25rem; margin-bottom:.4rem; }
.param-row label { color:#8B95A5; font-size:.72rem; }
.param-row input[type=range] { width:100%; accent-color:#5B8DB8; }
.param-row span { color:#5B8DB8; font-weight:600; font-size:.72rem; text-align:right; }
.param-row.read-only .computed { color:#fbbf24; font-weight:700; font-size:.85rem; text-align:center; padding:.3rem; background:rgba(245,158,11,.06); border-radius:4px; border:1px solid rgba(245,158,11,.15); }
.param-row.read-only .hint { color:#64748b; font-size:.6rem; text-align:center; }
</style>
