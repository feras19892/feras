<script setup lang="ts">
import type { GratingTrial } from '../../../composables/grating/useGratingTrials'
import GratingPanelBody from './GratingPanelBody.vue'

interface Props {
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: GratingTrial[]
  params: { linesPerMm: number; screenDistance: number; wavelength: number }
  firstOrderAngle: number
  firstOrderY: number
  maxOrder: number
  orderPositions: { m: number; yMm: number; intensity: number }[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', params: { linesPerMm: number; screenDistance: number; wavelength: number }): void
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
        <GratingPanelBody
          :id="id"
          :trials="trials"
          :params="params"
          :first-order-angle="firstOrderAngle"
          :first-order-y="firstOrderY"
          :max-order="maxOrder"
          :order-positions="orderPositions"
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
