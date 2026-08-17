<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '../../../../composables/useI18n'
import { wavelengthToColor } from '../../../../composables/diffraction/useDiffractionCalculations'

const { t } = useI18n()

interface Props {
  mode: 'single' | 'grating'
  params: { slitWidth: number; linesPerMm: number; screenDistance: number; wavelength: number }
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:params', p: { slitWidth: number; linesPerMm: number; screenDistance: number; wavelength: number }): void
}>()

const waveColor = computed(() => wavelengthToColor(props.params.wavelength))

function set(key: string, val: number) {
  emit('update:params', { ...props.params, [key]: val })
}
</script>

<template>
  <div class="panel-body">
    <div v-if="mode === 'single'" class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('experiments.dfSlitWidth') }}</span>
        <span class="param-val">{{ params.slitWidth }} mm</span>
      </div>
      <input class="slider" type="range" min="0.02" max="1.0" step="0.01"
        :value="params.slitWidth"
        @input="set('slitWidth', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div v-else class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('experiments.dfGratingN') }}</span>
        <span class="param-val">{{ params.linesPerMm }}</span>
      </div>
      <input class="slider" type="range" min="100" max="2000" step="50"
        :value="params.linesPerMm"
        @input="set('linesPerMm', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('experiments.dfScreenDistance') }}</span>
        <span class="param-val cyan">{{ params.screenDistance }} m</span>
      </div>
      <input class="slider" type="range" min="0.1" max="5.0" step="0.1"
        :value="params.screenDistance"
        @input="set('screenDistance', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('experiments.wavelength') }} λ</span>
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
.param-row { display: flex; flex-direction: column; gap: .3rem; }
.param-header { display: flex; justify-content: space-between; align-items: center; }
.param-label { font-size: .75rem; color: #8B95A5; }
.param-val { font-family: monospace; color: #67e8f9; font-size: .8rem; font-weight: 700; }
.slider { width: 100%; accent-color: #67e8f9; height: 3px; }
.wave-row { display: flex; align-items: center; gap: .5rem; }
.wavelength-slider { flex: 1; -webkit-appearance: none; appearance: none; height: 6px; border-radius: 3px; outline: none;
  background: linear-gradient(to right, #8B00FF, #4B0082, #0000FF, #00AAFF, #00CC00, #DDDD00, #FF7F00, #FF0000); }
.wavelength-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 2px solid #67e8f9; cursor: pointer; box-shadow: 0 0 6px rgba(103,232,249,.6); }
.wavelength-slider::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: #fff; border: 2px solid #67e8f9; cursor: pointer; }
.color-dot { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.15); box-shadow: 0 0 8px currentColor; }
</style>
