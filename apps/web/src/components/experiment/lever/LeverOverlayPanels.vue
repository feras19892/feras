<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'
import DraggablePanel from '../spring/DraggablePanel.vue'
import LeverPanelBody from './LeverPanelBody.vue'

const { t } = useI18n()
import type { BeamMass } from '../../../modules/physics/experiments/lever/useLeverBeamPhysics'

const props = defineProps<{
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: import('../../../composables/lever/useLeverTrials').LeverTrial[]
  forces: import('../../../modules/physics/experiments/lever/useLeverPhysics').LeverForce[]
  resultant: { fx: number; fy: number; magnitude: number; angleDeg: number }
  equilibriumForce: { magnitude: number; angleDeg: number } | null
  isBalanced: boolean
  mode: 'vector' | 'beam'
  masses?: BeamMass[]
  tiltDeg?: number
  netTorque?: number
}>()
const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'drop', id: string, x: number, y: number): void
  (e: 'removeTrial', id: number): void
  (e: 'clearTrials'): void
  (e: 'removeForce', id: number): void
  (e: 'updateForce', id: number, mag: number, angle: number): void
  (e: 'removeMass', id: number): void
  (e: 'updateMass', id: number, mass: number, distance: number): void
}>()
</script>
<template>
  <Teleport to="body">
    <template v-for="id in ['table','signal','equations','guide','report']" :key="id">
      <div v-if="maximized[id]" class="overlay-backdrop" @click="$emit('maximize', id)">
        <DraggablePanel class="overlay-panel" :id="id" :title="panelTitle(id)" @maximize="$emit('maximize', id)" @hide="$emit('maximize', id)" @drop="(panelId, x, y) => $emit('drop', panelId, x, y)">
          <LeverPanelBody :id="id" :mode="mode" :trials="trials" :forces="forces" :resultant="resultant" :equilibriumForce="equilibriumForce" :isBalanced="isBalanced"
            :masses="masses" :tiltDeg="tiltDeg" :netTorque="netTorque"
            @removeTrial="$emit('removeTrial', $event)" @clearTrials="$emit('clearTrials')" @removeForce="$emit('removeForce', $event)" @updateForce="$emit('updateForce', $event, $event, $event)"
            @removeMass="$emit('removeMass', $event)" @updateMass="$emit('updateMass', $event, $event, $event)" />
        </DraggablePanel>
      </div>
    </template>
  </Teleport>
</template>
<style scoped>
.overlay-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.6); z-index:100; display:flex; align-items:center; justify-content:center; padding:2rem; }
.overlay-panel { width:min(900px,90vw); height:min(600px,80vh); background:#161B22; border:1px solid #2D3645; border-radius:12px; }
</style>
