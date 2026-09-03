<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { PolarizationTrial } from '../../../composables/polarization/usePolarizationTrials'
import PolarizationPanelBody from './PolarizationPanelBody.vue'


interface Props {
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: PolarizationTrial[]
  params: { polarizerAngle: number; analyzerAngle: number; I0: number }
  outputIntensity: number
  relativeAngle: number
  transmissionPercent: number
  intensityCurve: { theta: number; intensity: number }[]
  regressionSlope: number
  regressionIntercept: number
  rSquared: number
  i0FromRegression: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { polarizerAngle: number; analyzerAngle: number; I0: number }): void
}>()

const ids = ['readings', 'chart', 'trials', 'params', 'laws', 'results']
</script>

<template>
  <Teleport to="body">
    <template v-for="id in ids" :key="id">
      <div v-if="props.maximized[id]" class="overlay-backdrop" @click="emit('maximize', id)">
        <div class="overlay-panel" @click.stop>
          <div class="overlay-header">
            <span>{{ panelTitle(id) }}</span>
            <button class="overlay-close" @click.stop="emit('maximize', id)">&#x2715;</button>
          </div>
          <PolarizationPanelBody
            :id="id"
            :trials="trials"
            :params="params"
            :output-intensity="outputIntensity"
            :relative-angle="relativeAngle"
            :transmission-percent="transmissionPercent"
            :intensity-curve="intensityCurve"
            :regression-slope="regressionSlope"
            :regression-intercept="regressionIntercept"
            :r-squared="rSquared"
            :i0-from-regression="i0FromRegression"
            @remove="emit('remove', $event)"
            @clear="emit('clear')"
            @update:params="emit('update:params', $event)"
          />
        </div>
      </div>
    </template>
  </Teleport>
</template>

<style scoped>
.overlay-backdrop { position: fixed; inset: 0; z-index: 9998; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; padding: 2rem; }
.overlay-panel { position: relative; width: 100%; height: 100%; max-width: 900px; max-height: 90vh; background: #1A1F27; border: 1px solid #2D3645; border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; overflow-y: auto; }
.overlay-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; font-weight: 700; color: #5B8DB8; }
.overlay-close { background: none; border: none; color: #8B95A5; cursor: pointer; font-size: 1rem; }
</style>
