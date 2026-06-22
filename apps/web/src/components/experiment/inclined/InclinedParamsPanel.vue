<script setup lang="ts">
import { bodyTypes } from '../../../composables/inclined/inclinedUtils'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  params: {
    thetaDeg: number
    length: number
    mass: number
    g: number
    mu: number
    airResistance: boolean
    bodyTypeId: string
    cd: number
    area: number
  }
}>()
const emit = defineEmits<{
  (e: 'update:params', p: Partial<typeof props.params>): void
}>()

function onBodyTypeChange(e: Event) {
  const id = (e.target as HTMLSelectElement).value
  const bt = bodyTypes.find(b => b.id === id)
  if (!bt) return
  emit('update:params', { bodyTypeId: id, cd: bt.cd, area: bt.area })
}
</script>

<template>
  <div class="params-panel">
    <div class="param-row">
      <label>{{ t('experiments.inclinedPlaneAngle') }} θ</label>
      <div class="param-inputs">
        <input type="range" min="1" max="89" step="1" :value="params.thetaDeg" @input="emit('update:params', { thetaDeg: Number(($event.target as HTMLInputElement).value) })" />
        <input type="number" min="1" max="89" step="1" :value="params.thetaDeg" @input="emit('update:params', { thetaDeg: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </div>
    <div class="param-row">
      <label>{{ t('experiments.inclinedPlaneLength') }} L (m)</label>
      <div class="param-inputs">
        <input type="range" min="0.5" max="10" step="0.1" :value="params.length" @input="emit('update:params', { length: Number(($event.target as HTMLInputElement).value) })" />
        <input type="number" min="0.1" step="0.1" :value="params.length" @input="emit('update:params', { length: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </div>
    <div class="param-row">
      <label>{{ t('experiments.mass') }} m (kg)</label>
      <div class="param-inputs">
        <input type="range" min="0.1" max="10" step="0.1" :value="params.mass" @input="emit('update:params', { mass: Number(($event.target as HTMLInputElement).value) })" />
        <input type="number" min="0.1" max="10" step="0.1" :value="params.mass" @input="emit('update:params', { mass: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </div>
    <div class="param-row">
      <label>g (m/s²)</label>
      <div class="param-inputs">
        <input type="range" min="1" max="20" step="0.01" :value="params.g" @input="emit('update:params', { g: Number(($event.target as HTMLInputElement).value) })" />
        <input type="number" min="1" max="20" step="0.01" :value="params.g" @input="emit('update:params', { g: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </div>
    <div class="param-row">
      <label>{{ t('experiments.frictionCoefficient') }} μ</label>
      <div class="param-inputs">
        <input type="range" min="0" max="1" step="0.01" :value="params.mu" @input="emit('update:params', { mu: Number(($event.target as HTMLInputElement).value) })" />
        <input type="number" min="0" max="1" step="0.01" :value="params.mu" @input="emit('update:params', { mu: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </div>

    <div class="param-row checkbox-row">
      <label class="toggle-label">
        <input type="checkbox" :checked="params.airResistance" @change="emit('update:params', { airResistance: ($event.target as HTMLInputElement).checked })" />
        <span class="toggle-text">{{ t('experiments.airResistance') }}</span>
      </label>
    </div>

    <div class="param-row" v-if="params.airResistance">
      <label>{{ t('experiments.bodyType') }}</label>
      <select class="body-select" :value="params.bodyTypeId" @change="onBodyTypeChange">
        <option v-for="bt in bodyTypes" :key="bt.id" :value="bt.id">{{ t('experiments.bodyType' + bt.id.charAt(0).toUpperCase() + bt.id.slice(1)) }} (Cd={{ bt.cd }})</option>
      </select>
    </div>

    <div class="param-row" v-if="params.airResistance">
      <label>Cd ({{ t('experiments.dragCoefficient') }})</label>
      <div class="param-inputs">
        <input type="range" min="0" max="2" step="0.01" :value="params.cd" @input="emit('update:params', { cd: Number(($event.target as HTMLInputElement).value) })" />
        <input type="number" min="0" step="0.01" :value="params.cd" @input="emit('update:params', { cd: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </div>

    <div class="param-row" v-if="params.airResistance">
      <label>Area ({{ t('experiments.areaLabel') }} m²)</label>
      <div class="param-inputs">
        <input type="range" min="0.001" max="0.1" step="0.001" :value="params.area" @input="emit('update:params', { area: Number(($event.target as HTMLInputElement).value) })" />
        <input type="number" min="0.001" step="0.001" :value="params.area" @input="emit('update:params', { area: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.params-panel { display: flex; flex-direction: column; gap: .6rem; padding: .4rem; }
.param-row { display: flex; flex-direction: column; gap: .15rem; }
.param-row label { font-size: .68rem; color: #8B95A5; font-weight: 600; }
.param-inputs { display: flex; gap: .3rem; align-items: center; }
.param-inputs input[type=range] { flex: 1; }
.param-inputs input[type=number] { width: 60px; text-align: center; padding: .25rem; border-radius: 4px; border: 1px solid #2D3645; background: #252D3A; color: #D1D7E0; font-size: .72rem; }
.checkbox-row { flex-direction: row; align-items: center; gap: .4rem; }
.toggle-label { display: flex; align-items: center; gap: .4rem; cursor: pointer; }
.toggle-label input { width: auto; }
.toggle-text { font-size: .75rem; color: #D1D7E0; font-weight: 700; }
.body-select { padding: .3rem .4rem; border-radius: 4px; border: 1px solid #2D3645; background: #252D3A; color: #D1D7E0; font-size: .72rem; }
</style>
