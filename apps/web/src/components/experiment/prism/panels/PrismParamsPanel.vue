<script setup lang="ts">
import { computed } from 'vue'
import { getMaterialList } from '../../../../composables/prism/usePrismCalculations'
import { useI18n } from '../../../../composables/useI18n'
import { useMaterialName } from '../../../../composables/prism/useMaterialName'
import { wavelengthToColor } from '../../../../composables/prism/prism-drawing'

const { t } = useI18n()
const { materialName } = useMaterialName()

interface Props {
  params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:params', p: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }): void
}>()

const materials = getMaterialList()
const waveColor = computed(() => wavelengthToColor(props.params.wavelength))

function set(key: string, val: number | string) {
  emit('update:params', { ...props.params, [key]: val })
}
</script>

<template>
  <div class="panel-body">
    <div class="section-label">{{ t('prism.material') }}</div>
    <div class="mat-grid">
      <button
        v-for="m in materials" :key="m.key"
        class="mat-btn"
        :class="{ active: params.material === m.key }"
        @click="set('material', m.key)"
      >{{ materialName(m.key) }}</button>
    </div>

    <div class="divider" />

    <div class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('prism.prismAngle') }}</span>
        <span class="param-val">{{ params.prismAngle }}°</span>
      </div>
      <input class="slider" type="range" min="30" max="90" step="1"
        :value="params.prismAngle"
        @input="set('prismAngle', Number(($event.target as HTMLInputElement).value))" />
    </div>

    <div class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('prism.incidentAngle') }} <span class="hint-drag">↕ {{ t('chemistryLab.dragHint') }}</span></span>
        <span class="param-val cyan">{{ params.angleIncidence }}°</span>
      </div>
      <input class="slider" type="range" min="0" max="89" step="1"
        :value="params.angleIncidence"
        @input="set('angleIncidence', Number(($event.target as HTMLInputElement).value))" />
    </div>

    <div class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('prism.wavelength') }}</span>
        <span class="param-val" :style="{ color: waveColor }">{{ params.wavelength }} nm</span>
      </div>
      <div class="wave-row">
        <input class="slider wavelength-slider" type="range" min="380" max="700" step="5"
          :value="params.wavelength"
          @input="set('wavelength', Number(($event.target as HTMLInputElement).value))" />
        <span class="color-dot" :style="{ background: waveColor }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-body { display: flex; flex-direction: column; gap: .55rem; font-size: .82rem; padding: .1rem 0; }
.section-label { font-size: .7rem; text-transform: uppercase; letter-spacing: .06em; color: #475569; font-weight: 700; }
.mat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .3rem; }
.mat-btn { padding: .28rem .4rem; border-radius: 5px; border: 1px solid #2D3645; background: #161B22; color: #8B95A5; font-size: .72rem; cursor: pointer; transition: all .12s; text-align: center; }
.mat-btn:hover { background: #1e2530; color: #D1D7E0; }
.mat-btn.active { background: rgba(103,232,249,.12); border-color: rgba(103,232,249,.5); color: #67e8f9; font-weight: 700; }
.divider { height: 1px; background: #2D3645; margin: .1rem 0; }
.param-row { display: flex; flex-direction: column; gap: .3rem; }
.param-header { display: flex; justify-content: space-between; align-items: center; }
.param-label { font-size: .75rem; color: #8B95A5; }
.hint-drag { font-size: .66rem; color: #475569; margin-left: .3rem; }
.param-val { font-family: monospace; color: #67e8f9; font-size: .8rem; font-weight: 700; }
.param-val.cyan { color: #67e8f9; }
.slider { width: 100%; accent-color: #67e8f9; height: 3px; }
.wave-row { display: flex; align-items: center; gap: .5rem; }
.wavelength-slider {
  flex: 1;
  -webkit-appearance: none; appearance: none; height: 6px; border-radius: 3px; outline: none;
  background: linear-gradient(to right, #8B00FF, #4B0082, #0000FF, #00AAFF, #00CC00, #DDDD00, #FF7F00, #FF0000);
}
.wavelength-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 2px solid #67e8f9; cursor: pointer; box-shadow: 0 0 6px rgba(103,232,249,.6); }
.wavelength-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 2px solid #67e8f9; cursor: pointer; }
.color-dot { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.15); box-shadow: 0 0 8px currentColor; }
</style>
