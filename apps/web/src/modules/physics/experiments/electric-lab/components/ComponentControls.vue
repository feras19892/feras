<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CircuitComponent } from '../types'

const props = defineProps<{
  selectedId: number | null
  components: CircuitComponent[]
}>()

const emit = defineEmits<{
  (e: 'update-comp', id: number, value: number): void
  (e: 'remove-comp', id: number): void
  (e: 'toggle-switch', id: number): void
}>()

const selectedComp = ref<CircuitComponent | null>(null)

watch(() => [props.selectedId, props.components], () => {
  if (props.selectedId !== null) {
    selectedComp.value = props.components.find(c => c.id === props.selectedId) ?? null
  } else {
    selectedComp.value = null
  }
}, { deep: true })
</script>

<template>
  <div v-if="selectedComp" class="comp-controls">
    <div class="comp-header">
      <span class="comp-name">{{ selectedComp.label }} #{{ selectedComp.id }}</span>
      <button class="btn-remove" @click="emit('remove-comp', selectedComp.id)">✕</button>
    </div>
    <div v-if="selectedComp.type === 'battery'" class="slider-row">
      <label>الجهد: <b>{{ selectedComp.value }}V</b></label>
      <input type="range" min="1" max="12" step="0.5" :value="selectedComp.value"
        @input="emit('update-comp', selectedComp.id, Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div v-else-if="selectedComp.type === 'resistor'" class="slider-row">
      <label>المقاومة: <b>{{ selectedComp.value }}Ω</b></label>
      <input type="range" min="10" max="1000" step="10" :value="selectedComp.value"
        @input="emit('update-comp', selectedComp.id, Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div v-else-if="selectedComp.type === 'switch'" class="switch-controls">
      <div class="switch-status" :class="selectedComp._closed ? 'closed' : 'open'">
        <span class="switch-icon">{{ selectedComp._closed ? '🔒' : '🔓' }}</span>
        <span class="switch-state">{{ selectedComp._closed ? 'مغلق (ON)' : 'مفتوح (OFF)' }}</span>
      </div>
      <button class="switch-toggle-btn" @click="emit('toggle-switch', selectedComp.id)">
        {{ selectedComp._closed ? '🔓 فتح المفتاح' : '🔒 إغلاق المفتاح' }}
      </button>
    </div>
    <div v-else-if="selectedComp.type === 'capacitor'" class="slider-row">
      <label>السعة: <b>{{ selectedComp.value }}µF</b></label>
      <input type="range" min="10" max="1000" step="10" :value="selectedComp.value"
        @input="emit('update-comp', selectedComp.id, Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div v-else-if="selectedComp.type === 'lamp'" class="slider-row">
      <label>جهد المصباح: <b>{{ selectedComp.value }}V</b></label>
      <input type="range" min="1" max="12" step="0.5" :value="selectedComp.value"
        @input="emit('update-comp', selectedComp.id, Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div v-else-if="selectedComp.type === 'galvanometer'" class="comp-info">
      <p>📐 جلفانوميتر — يقيس تيارات صغيرة (µA)</p>
      <p class="comp-detail">الحساسية: عالية جداً</p>
    </div>
    <div v-else class="comp-info">
      <p>{{ selectedComp.label }} — أداة قياس</p>
    </div>
  </div>
</template>

<style scoped>
.comp-controls {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.5rem;
  padding: 0.6rem;
}
.comp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.comp-name { font-size: 0.78rem; color: #e2e8f0; font-weight: 600; }
.btn-remove {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  color: #f87171;
  border-radius: 0.25rem;
  width: 22px; height: 22px;
  cursor: pointer;
  font-size: 0.7rem;
}
.slider-row { display: flex; flex-direction: column; gap: 0.3rem; }
.slider-row label { font-size: 0.75rem; color: #94a3b8; }
.slider-row input[type="range"] { width: 100%; accent-color: #f59e0b; }
.switch-controls { display: flex; flex-direction: column; gap: .5rem; }
.switch-status { display: flex; align-items: center; gap: .5rem; padding: .5rem; border-radius: 6px; font-size: .85rem; font-weight: 600; }
.switch-status.closed { background: rgba(34,197,94,.12); color: #4ade80; border: 1px solid rgba(34,197,94,.25); }
.switch-status.open { background: rgba(239,68,68,.12); color: #f87171; border: 1px solid rgba(239,68,68,.25); }
.switch-icon { font-size: 1.2rem; }
.switch-state { font-size: .82rem; }
.switch-toggle-btn {
  background: rgba(245,158,11,.12);
  border: 1px solid rgba(245,158,11,.3);
  color: #fbbf24;
  padding: .5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: .82rem;
  font-weight: 600;
  transition: all .15s;
}
.switch-toggle-btn:hover { background: rgba(245,158,11,.2); border-color: rgba(245,158,11,.5); }
.comp-info p { margin: 0; font-size: 0.75rem; color: #64748b; }
.comp-detail { font-size: .72rem; color: #64748b; margin-top: .2rem; }
</style>
