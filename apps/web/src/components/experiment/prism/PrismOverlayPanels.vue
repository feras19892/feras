<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { PrismTrial } from '../../../composables/prism/usePrismTrials'
import PrismPanelBody from './PrismPanelBody.vue'


interface Props {
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: PrismTrial[]
  params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }
  angleRefraction1: number | null
  angleIncidence2: number | null
  angleEmergence: number | null
  deviation: number | null
  totalInternalReflection: boolean
  criticalAngle: number | null
  slope: number
  intercept: number
  rSquared: number
  nValue: number
  avgN: number | null
  speedInMedium: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { prismAngle: number; angleIncidence: number; wavelength: number; material: string }): void
}>()

const ids = ['readings', 'chart', 'trials', 'params', 'laws', 'results']
</script>

<template>
  <div class="overlay-panels">
    <template v-for="id in ids" :key="id">
      <div v-if="props.maximized[id]" class="overlay-panel" @click="emit('maximize', id)">
        <div class="overlay-header">
          <span>{{ panelTitle(id) }}</span>
          <button class="overlay-close" @click.stop="emit('maximize', id)">&#x2715;</button>
        </div>
        <PrismPanelBody
          :id="id"
          :trials="trials"
          :params="params"
          :angle-refraction1="angleRefraction1"
          :angle-incidence2="angleIncidence2"
          :angle-emergence="angleEmergence"
          :deviation="deviation"
          :total-internal-reflection="totalInternalReflection"
          :critical-angle="criticalAngle"
          :slope="slope"
          :intercept="intercept"
          :r-squared="rSquared"
          :n-value="nValue"
          :avg-n="avgN"
          :speed-in-medium="speedInMedium"
          @remove="emit('remove', $event)"
          @clear="emit('clear')"
          @update:params="emit('update:params', $event)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.overlay-panels { position: fixed; inset: 0; z-index: 9998; pointer-events: none; }
.overlay-panel { position: absolute; inset: 2rem; background: #1A1F27; border: 1px solid #2D3645; border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; pointer-events: auto; }
.overlay-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem; font-weight: 700; color: #5B8DB8; }
.overlay-close { background: none; border: none; color: #8B95A5; cursor: pointer; font-size: 1rem; }
</style>
