<script setup lang="ts">
import type { NetForceParams, NetForceState, NetForceMeasured } from '../../../modules/physics/experiments/netforce/useNetForcePhysics'
import type { NetForceTrial } from '../../../composables/netforce/useNetForceTrials'
import NetForcePanelBody from './NetForcePanelBody.vue'

defineProps<{
  maximized: Record<string, boolean>
  panelTitle: (id: string) => string
  trials: NetForceTrial[]
  params: NetForceParams
  sim: NetForceState
  measured: NetForceMeasured
  trialStats: { f_mean: number; f_std: number; fc_mean: number; fc_std: number }
  calcResult: string
}>()

defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'update:params', v: Partial<NetForceParams>): void
  (e: 'remove', id: number): void
  (e: 'calc-net-force'): void
  (e: 'calc-centripetal'): void
  (e: 'calc-fit'): void
  (e: 'auto-balance'): void
  (e: 'add-force'): void
  (e: 'remove-force', id: number): void
  (e: 'update-force', id: number, patch: Partial<{ magnitude: number; angle: number; label: string }>): void
}>()
</script>

<template>
  <Teleport to="body">
    <div v-for="(isMax, id) in maximized" :key="id" v-show="isMax" class="overlay-panel">
      <div class="overlay-header">
        <span>{{ panelTitle(String(id)) }}</span>
        <button @click="$emit('maximize', String(id))">✕</button>
      </div>
      <NetForcePanelBody :id="String(id)" :trials="trials" :params="params" :sim="sim"
        :measured="measured" :trial-stats="trialStats" :calc-result="calcResult"
        @update:params="$emit('update:params', $event)" @remove="$emit('remove', $event)"
        @calc-net-force="$emit('calc-net-force')" @calc-centripetal="$emit('calc-centripetal')"
        @calc-fit="$emit('calc-fit')" @auto-balance="$emit('auto-balance')"
        @add-force="$emit('add-force')" @remove-force="(id: number) => $emit('remove-force', id)" @update-force="(id: number, patch: Partial<{ magnitude: number; angle: number; label: string }>) => $emit('update-force', id, patch)" />
    </div>
  </Teleport>
</template>

<style scoped>
.overlay-panel { position: fixed; inset: 5%; z-index: 100; background: #0d1117; border: 1px solid #2D3645; border-radius: 12px; overflow: auto; display: flex; flex-direction: column; }
.overlay-header { display: flex; justify-content: space-between; align-items: center; padding: .5rem .8rem; border-bottom: 1px solid #2D3645; font-size: .85rem; color: #5B8DB8; }
.overlay-header button { background: none; border: none; color: #8b9bb5; cursor: pointer; font-size: 1rem; }
</style>
