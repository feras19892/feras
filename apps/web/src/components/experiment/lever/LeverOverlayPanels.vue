<script setup lang="ts">
import DraggablePanel from '../spring/DraggablePanel.vue'
import LeverPanelBody from './LeverPanelBody.vue'

const props = defineProps<{
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: any[]
  sim: any
  challengeSolved?: boolean
}>()

const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'drop', id: string, x: number, y: number): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'startChallenge'): void
  (e: 'checkChallenge', guess: number): void
}>()
</script>

<template>
  <div class="overlay-layer">
    <template v-for="id in Object.keys(maximized)" :key="id">
      <div v-if="maximized[id]" class="overlay-backdrop" @click="emit('maximize', id)">
        <DraggablePanel
          class="overlay-panel"
          :id="id"
          :title="panelTitle(id)"
          @maximize="emit('maximize', $event)"
          @hide="emit('maximize', $event)"
          @drop="(...args: any[]) => emit('drop', args[0], args[1], args[2])"
        >
          <LeverPanelBody
            :id="id"
            :sim="sim"
            :trials="trials"
            :challenge-solved="challengeSolved"
            @remove="emit('remove', $event)"
            @clear="emit('clear')"
            @start-challenge="emit('startChallenge')"
            @check-challenge="emit('checkChallenge', $event)"
          />
        </DraggablePanel>
      </div>
    </template>
  </div>
</template>

<style scoped>
.overlay-layer { position:fixed; inset:0; z-index:100; pointer-events:none; }
.overlay-backdrop { position:absolute; inset:0; background:rgba(0,0,0,.6); display:flex; align-items:center; justify-content:center; pointer-events:auto; }
.overlay-panel { width:min(600px, 90vw); max-height:80vh; background:#161B22; border-radius:12px; border:1px solid #2D3645; box-shadow:0 20px 60px rgba(0,0,0,.5); }
</style>
