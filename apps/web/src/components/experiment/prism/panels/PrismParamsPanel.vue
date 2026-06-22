<script setup lang="ts">
import { getMaterialList } from '../../../../composables/prism/usePrismCalculations'
import { useI18n } from '../../../../composables/useI18n'
import { useMaterialName } from '../../../../composables/prism/useMaterialName'

const { t } = useI18n()
const { materialName } = useMaterialName()

interface Props {
  params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:params', params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }): void
}>()

const materials = getMaterialList()
</script>

<template>
  <div class="panel-body">
    <div class="param-row">
      <label>{{ t('prism.material') }}</label>
      <select :value="params.material" @change="emit('update:params', { ...props.params, material: ($event.target as HTMLSelectElement).value })">
        <option v-for="m in materials" :key="m.key" :value="m.key">{{ materialName(m.key) }}</option>
      </select>
    </div>
    <div class="param-row">
      <label>{{ t('prism.prismAngle') }}</label>
      <input type="range" min="30" max="90" step="1" :value="params.prismAngle" @input="emit('update:params', { ...props.params, prismAngle: Number(($event.target as HTMLInputElement).value) })" />
      <span class="param-val">{{ params.prismAngle }}°</span>
    </div>
    <div class="param-row">
      <label>{{ t('prism.incidentAngle') }}</label>
      <input type="range" min="0" max="89" step="1" :value="params.angleIncidence" @input="emit('update:params', { ...props.params, angleIncidence: Number(($event.target as HTMLInputElement).value) })" />
      <span class="param-val">{{ params.angleIncidence }}°</span>
    </div>
    <div class="param-row">
      <label>{{ t('prism.wavelength') }}</label>
      <input type="range" min="380" max="700" step="5" :value="params.wavelength" @input="emit('update:params', { ...props.params, wavelength: Number(($event.target as HTMLInputElement).value) })" />
      <span class="param-val">{{ params.wavelength }} nm</span>
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .4rem; font-size: .82rem; }
.param-row { display: flex; flex-direction: column; gap: .25rem; }
.param-row label { font-size: .75rem; color: #8B95A5; }
.param-row input[type='range'] { accent-color: #67e8f9; }
.param-row select { background: #161B22; color: #D1D7E0; border: 1px solid #2D3645; border-radius: 4px; padding: .25rem; font-family: inherit; }
.param-val { font-family: monospace; color: #67e8f9; font-size: .8rem; text-align: center; }
</style>
