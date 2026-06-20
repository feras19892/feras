<script setup lang="ts">
import type { CollisionParams } from '../../../modules/physics/experiments/collision/useCollisionPhysics'

const props = defineProps<{
  params: CollisionParams
}>()

const emit = defineEmits<{
  (e: 'update:params', val: Partial<CollisionParams>): void
}>()

function update<K extends keyof CollisionParams>(key: K, value: CollisionParams[K]) {
  emit('update:params', { [key]: value })
}
</script>

<template>
  <div class="params-panel">
    <div class="param-row">
      <label>m₁ (kg)</label>
      <input type="range" min="0.1" max="10" step="0.1" :value="params.m1" @input="update('m1', +($event.target as HTMLInputElement).value)">
      <span>{{ params.m1 }}</span>
    </div>
    <div class="param-row">
      <label>m₂ (kg)</label>
      <input type="range" min="0.1" max="10" step="0.1" :value="params.m2" @input="update('m2', +($event.target as HTMLInputElement).value)">
      <span>{{ params.m2 }}</span>
    </div>
    <div class="param-row">
      <label>v₁i (m/s)</label>
      <input type="range" min="-10" max="10" step="0.5" :value="params.v1i" @input="update('v1i', +($event.target as HTMLInputElement).value)">
      <span :class="params.v1i < 0 ? 'neg' : 'pos'">{{ params.v1i > 0 ? '+' : '' }}{{ params.v1i }}</span>
    </div>
    <div class="param-row">
      <label>v₂i (m/s)</label>
      <input type="range" min="-10" max="10" step="0.5" :value="params.v2i" @input="update('v2i', +($event.target as HTMLInputElement).value)">
      <span :class="params.v2i < 0 ? 'neg' : 'pos'">{{ params.v2i > 0 ? '+' : '' }}{{ params.v2i }}</span>
    </div>
    <div class="param-row">
      <label>r₁ (m)</label>
      <input type="range" min="0.05" max="0.5" step="0.05" :value="params.r1" @input="update('r1', +($event.target as HTMLInputElement).value)">
      <span>{{ params.r1 }}</span>
    </div>
    <div class="param-row">
      <label>r₂ (m)</label>
      <input type="range" min="0.05" max="0.5" step="0.05" :value="params.r2" @input="update('r2', +($event.target as HTMLInputElement).value)">
      <span>{{ params.r2 }}</span>
    </div>
    <div class="param-row">
      <label>e (ارتداد)</label>
      <input type="range" min="0" max="1" step="0.1" :value="params.e" @input="update('e', +($event.target as HTMLInputElement).value)">
      <span>{{ params.e }}</span>
    </div>
    <div class="hint">السرعة السالبة = حركة لليسار</div>
  </div>
</template>

<style scoped>
.params-panel { padding: .5rem; }
.param-row { display: flex; align-items: center; gap: .5rem; margin-bottom: .5rem; font-size: .75rem; }
.param-row label { width: 80px; color: #D1D7E0; flex-shrink: 0; }
.param-row input[type="range"] { flex: 1; min-width: 0; }
.param-row span { width: 50px; text-align: left; color: #5B8DB8; font-family: monospace; }
.param-row span.pos { color: #22c55e; }
.param-row span.neg { color: #ef4444; }
.hint { font-size: .68rem; color: #94a3b8; text-align: center; margin-top: .3rem; border-top: 1px dashed #2D3645; padding-top: .3rem; }
</style>
