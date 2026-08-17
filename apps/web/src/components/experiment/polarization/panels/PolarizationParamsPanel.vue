<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'

const { t } = useI18n()

interface Props {
  params: { polarizerAngle: number; analyzerAngle: number; I0: number }
}
const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:params', p: { polarizerAngle: number; analyzerAngle: number; I0: number }): void
}>()

function set(key: string, val: number) {
  emit('update:params', { ...props.params, [key]: val })
}
</script>

<template>
  <div class="panel-body">
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('experiments.poPolarizerAngle') }}</span>
        <span class="param-val cyan">{{ params.polarizerAngle }}°</span>
      </div>
      <input class="slider" type="range" min="0" max="180" step="1"
        :value="params.polarizerAngle"
        @input="set('polarizerAngle', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('experiments.poAnalyzerAngle') }}</span>
        <span class="param-val amber">{{ params.analyzerAngle }}°</span>
      </div>
      <input class="slider" type="range" min="0" max="180" step="1"
        :value="params.analyzerAngle"
        @input="set('analyzerAngle', Number(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="param-row">
      <div class="param-header">
        <span class="param-label">{{ t('experiments.poInputIntensity') }}</span>
        <span class="param-val green">{{ params.I0 }}</span>
      </div>
      <input class="slider" type="range" min="10" max="200" step="5"
        :value="params.I0"
        @input="set('I0', Number(($event.target as HTMLInputElement).value))" />
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
</style>
