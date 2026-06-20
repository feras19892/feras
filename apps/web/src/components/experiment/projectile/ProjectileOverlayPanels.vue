<script setup lang="ts">
const props = defineProps<{
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: any[]
  calcResult: string
  fitResult?: { slope: number; intercept: number } | null
  params: any
  sim: any
  measured: any
  trialStats: any
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'drop', id: string, x: number, y: number): void
  (e: 'update:trials', val: any[]): void
  (e: 'update:params', val: any): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'calcFlightTime'): void
  (e: 'calcMaxHeight'): void
  (e: 'calcRange'): void
  (e: 'calcFitRange'): void
  (e: 'showCalc', html: string): void
}>()

import ProjectilePanelBody from './ProjectilePanelBody.vue'
</script>

<template>
  <Teleport to="body">
    <div v-for="[id, _active] in Object.entries(maximized).filter(([,a]) => a)" :key="id" class="overlay-backdrop" @click="emit('maximize', id)">
      <div class="overlay-panel" @click.stop @drop.prevent="emit('drop', id, $event.clientX, $event.clientY)" @dragover.prevent>
        <div class="overlay-header">
          <span>{{ panelTitle(id) }}</span>
          <button @click="emit('maximize', id)">×</button>
        </div>
        <ProjectilePanelBody
          :id="id" :trials="trials" :calc-result="calcResult" :params="params" :sim="sim"
          :measured="measured" :trial-stats="trialStats" :fit-result="fitResult"
          @update:trials="emit('update:trials', $event)" @update:params="emit('update:params', $event)"
          @remove="emit('remove', $event)" @clear="emit('clear')"
          @calc-flight-time="emit('calcFlightTime')" @calc-max-height="emit('calcMaxHeight')"
          @calc-range="emit('calcRange')" @calc-fit-range="emit('calcFitRange')"
          @show-calc="emit('showCalc', $event)"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 150; display: flex; align-items: center; justify-content: center; padding: 2rem; }
.overlay-panel { background: #1A1F27; border: 1px solid #2D3645; border-radius: 12px; width: 80%; max-width: 800px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,.5); }
.overlay-header { display: flex; justify-content: space-between; align-items: center; padding: .5rem .8rem; border-bottom: 1px solid #2D3645; font-size: .85rem; font-weight: 700; color: #5B8DB8; }
.overlay-header button { background: none; border: none; color: #8B95A5; font-size: 1.2rem; cursor: pointer; }
.overlay-header button:hover { color: #ef4444; }
</style>
