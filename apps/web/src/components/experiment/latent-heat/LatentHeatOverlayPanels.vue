<script setup lang="ts">
import type { LatentHeatTrial } from '../../../composables/latent-heat/useLatentHeatTrials'
import LatentHeatPanelBody from './LatentHeatPanelBody.vue'
interface Props { maximized: Record<string, boolean>; panelTitle: (id: string) => string; trials: LatentHeatTrial[]; params: { mass: number; phaseType: 'fusion' | 'vaporization'; heatingPower: number }; currentQ: number; totalQ: number; meltedMass: number; remainingMass: number; ratio: number; currentTemp: number }
defineProps<Props>()
const emit = defineEmits<{
  (e: 'maximize', id: string): void
  (e: 'remove', id: number): void
  (e: 'clear'): void
  (e: 'update:params', p: { mass: number; phaseType: 'fusion' | 'vaporization'; heatingPower: number }): void
}>()
</script>
<template>
  <div>
    <template v-for="id in Object.keys(maximized).filter(k => maximized[k])" :key="id">
      <div class="overlay-backdrop" @click="emit('maximize', id)">
        <div class="overlay-panel" @click.stop>
          <div class="overlay-header">
            <span>{{ panelTitle(id) }}</span>
            <button class="overlay-btn" @click="emit('maximize', id)">&#x2715;</button>
          </div>
          <div class="overlay-body">
            <LatentHeatPanelBody :id="id" :trials="trials" :params="params" :current-q="currentQ" :total-q="totalQ" :melted-mass="meltedMass" :remaining-mass="remainingMass" :ratio="ratio" :current-temp="currentTemp" @remove="emit('remove', $event)" @clear="emit('clear')" @update:params="emit('update:params', $event)" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<style scoped>
.overlay-backdrop { position:fixed; inset:0; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; z-index:9998; }
.overlay-panel { background:#1A1F27; border:1px solid #2D3645; border-radius:8px; width:min(90vw, 800px); max-height:85vh; display:flex; flex-direction:column; }
.overlay-header { display:flex; justify-content:space-between; align-items:center; padding:.5rem .7rem; border-bottom:1px solid #2D3645; color:#5B8DB8; font-weight:700; font-size:.85rem; }
.overlay-btn { background:transparent; border:none; color:#8B95A5; cursor:pointer; font-size:.9rem; padding:.15rem .35rem; }
.overlay-body { flex:1; overflow-y:auto; padding:.7rem; }
</style>
