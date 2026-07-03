<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
const props = defineProps<{ params: { material: string; L0: number; t0: number; t1: number } }>()
const emit = defineEmits<{ (e: 'update:params', p: typeof props.params): void }>()

const materials: Record<string, string> = {
  copper: 'نحاس', aluminum: 'ألمنيوم', iron: 'حديد', steel: 'فولاذ', brass: 'سبائك نحاس', glass: 'زجاج',
}
</script>
<template>
  <div class="params-panel">
    <table class="params-table">
      <tr>
        <td class="label">{{ t('experiments.thermalMaterial') }}</td>
        <td colspan="2">
          <select :value="params.material" @change="emit('update:params', { ...params, material: ($event.target as HTMLSelectElement).value })">
            <option v-for="(name, key) in materials" :key="key" :value="key">{{ name }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <td class="label">L₀ (m)</td>
        <td><input type="range" min="0.1" max="3" step="0.05" :value="params.L0" @input="emit('update:params', { ...params, L0: Number(($event.target as HTMLInputElement).value) })" /></td>
        <td class="val">{{ params.L0.toFixed(2) }} m</td>
      </tr>
      <tr>
        <td class="label">t₀ (°C)</td>
        <td><input type="range" min="0" max="30" step="1" :value="params.t0" @input="emit('update:params', { ...params, t0: Number(($event.target as HTMLInputElement).value) })" /></td>
        <td class="val">{{ params.t0 }} °C</td>
      </tr>
      <tr>
        <td class="label">t₁ (°C)</td>
        <td><input type="range" min="50" max="200" step="5" :value="params.t1" @input="emit('update:params', { ...params, t1: Number(($event.target as HTMLInputElement).value) })" /></td>
        <td class="val">{{ params.t1 }} °C</td>
      </tr>
    </table>
  </div>
</template>
<style scoped>
.params-panel { padding: .25rem 0; }
.params-table { width: 100%; border-collapse: collapse; font-size: .75rem; }
.params-table td { padding: .25rem .3rem; vertical-align: middle; border-bottom: 1px solid rgba(255,255,255,.04); }
.params-table td.label { color: #8B95A5; white-space: nowrap; font-size: .72rem; width: 1%; }
.params-table td.val { color: #5B8DB8; font-weight: 700; text-align: right; white-space: nowrap; }
.params-table input[type=range] { width: 100%; min-width: 60px; }
.params-table select { width: 100%; padding: .2rem .3rem; border-radius: 4px; border: 1px solid #1e2530; background: #0d1117; color: #D1D7E0; font-size: .72rem; }
</style>
