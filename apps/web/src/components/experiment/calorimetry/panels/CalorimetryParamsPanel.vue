<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
const { t } = useI18n()
const props = defineProps<{
  params: { mWater: number; tWater: number; mMetal: number; tMetal: number; cMetal: number; mCup: number; metalType: string }
  metalOptions?: Record<string, { c: number; nameAr: string; nameEn: string }>
}>()
const emit = defineEmits<{ (e: 'update:params', p: typeof props.params): void }>()

function onMetalSelect(e: Event) {
  const type = (e.target as HTMLSelectElement).value
  emit('update:params', { ...props.params, metalType: type })
}
</script>
<template>
  <div class="params-panel">
    <table class="params-table">
      <tr>
        <td class="label">{{ t('experiments.calorimetryMetalType') }}</td>
        <td colspan="2">
          <select :value="params.metalType" @change="onMetalSelect">
            <option v-for="(opt, key) in metalOptions" :key="key" :value="key">{{ opt.nameAr }}</option>
          </select>
        </td>
      </tr>
      <tr>
        <td class="label">{{ t('experiments.calorimetryMetalMass') }}</td>
        <td><input type="range" min="0.01" max="0.2" step="0.005" :value="params.mMetal" @input="emit('update:params', { ...params, mMetal: Number(($event.target as HTMLInputElement).value) })" /></td>
        <td class="val">{{ params.mMetal.toFixed(3) }} kg</td>
      </tr>
      <tr>
        <td class="label">{{ t('experiments.calorimetryMetalTemp') }}</td>
        <td><input type="range" min="50" max="200" step="5" :value="params.tMetal" @input="emit('update:params', { ...params, tMetal: Number(($event.target as HTMLInputElement).value) })" /></td>
        <td class="val">{{ params.tMetal }} °C</td>
      </tr>
      <tr>
        <td class="label">{{ t('experiments.calorimetryWaterMass') }}</td>
        <td><input type="range" min="0.05" max="0.5" step="0.01" :value="params.mWater" @input="emit('update:params', { ...params, mWater: Number(($event.target as HTMLInputElement).value) })" /></td>
        <td class="val">{{ params.mWater.toFixed(3) }} kg</td>
      </tr>
      <tr>
        <td class="label">{{ t('experiments.calorimetryWaterTemp') }}</td>
        <td><input type="range" min="10" max="35" step="1" :value="params.tWater" @input="emit('update:params', { ...params, tWater: Number(($event.target as HTMLInputElement).value) })" /></td>
        <td class="val">{{ params.tWater }} °C</td>
      </tr>
      <tr>
        <td class="label">{{ t('experiments.calorimetryCupMass') }}</td>
        <td><input type="range" min="0.01" max="0.1" step="0.005" :value="params.mCup" @input="emit('update:params', { ...params, mCup: Number(($event.target as HTMLInputElement).value) })" /></td>
        <td class="val">{{ params.mCup.toFixed(3) }} kg</td>
      </tr>
      <tr>
        <td class="label">{{ t('experiments.calorimetrySpecificHeat') }}</td>
        <td colspan="2">
          <span class="val read-only">{{ params.cMetal }} J/kg·K</span>
          <span class="hint">{{ t('experiments.calTrueValueHint') }}</span>
        </td>
      </tr>
    </table>
  </div>
</template>
<style scoped>
.params-panel { padding: .25rem 0; }
.params-table { width: 100%; border-collapse: collapse; font-size: .75rem; }
.params-table td { padding: .25rem .3rem; vertical-align: middle; border-bottom: 1px solid rgba(255,255,255,.04); }
.params-table td.label { color: #8B95A5; white-space: nowrap; font-size: .72rem; width: 1%; }
.params-table td.val { color: #5B8DB8; font-weight: 700; text-align: end; white-space: nowrap; }
.params-table td.val.read-only { color: #fbbf24; }
.params-table td .hint { color: #475569; font-size: .6rem; margin-right: .3rem; }
.params-table input[type=range] { width: 100%; min-width: 60px; }
.params-table select { width: 100%; padding: .2rem .3rem; border-radius: 4px; border: 1px solid #1e2530; background: #0d1117; color: #D1D7E0; font-size: .72rem; }
</style>
