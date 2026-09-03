<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { LightRayTrial } from '../../../composables/lightray/useLightRayExperiment'
import LightRayPanelBody from './LightRayPanelBody.vue'


interface Props {
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: LightRayTrial[]
  params: { angleIncidence: number; n1: number; n2: number }
  angleReflection: number
  angleRefraction: number | null
  totalInternalReflection: boolean
  criticalAngle: number | null
  slope: number
  intercept: number
  rSquared: number
  calculatedN2: number | null
  speedInMedium: number | null
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { angleIncidence: number; n1: number; n2: number }): void
}>()

const panelIds = ['readings', 'chart', 'trials', 'params', 'laws', 'results']
</script>

<template>
  <template v-for="id in panelIds" :key="id">
    <div v-if="maximized[id]" class="overlay-panel" @click.self="emit('maximize', id)">
      <div class="overlay-card">
        <div class="overlay-header">
          <span>{{ panelTitle(id) }}</span>
          <button class="overlay-close" @click="emit('maximize', id)">✕</button>
        </div>
        <LightRayPanelBody
          :id="id"
          :trials="trials"
          :params="params"
          :angle-reflection="angleReflection"
          :angle-refraction="angleRefraction"
          :total-internal-reflection="totalInternalReflection"
          :critical-angle="criticalAngle"
          :slope="slope"
          :intercept="intercept"
          :r-squared="rSquared"
          :calculated-n2="calculatedN2"
          :speed-in-medium="speedInMedium"
          @remove="emit('remove', $event)"
          @clear="emit('clear')"
          @update:params="emit('update:params', $event)"
        />
      </div>
    </div>
  </template>
</template>

<style scoped>
.overlay-panel { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.overlay-card { background: #1e2530; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; }
.overlay-header { display: flex; justify-content: space-between; align-items: center; padding: .7rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); font-weight: 700; color: #67e8f9; }
.overlay-close { background: none; border: none; color: #8B95A5; cursor: pointer; font-size: 1rem; }
.overlay-close:hover { color: #fff; }
</style>
