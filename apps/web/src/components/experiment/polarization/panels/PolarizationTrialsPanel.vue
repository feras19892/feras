<script setup lang="ts">
import { useI18n } from '../../../../composables/useI18n'
import type { PolarizationTrial } from '../../../../composables/polarization/usePolarizationTrials'

const { t } = useI18n()

interface Props {
  trials: PolarizationTrial[]
}
defineProps<Props>()
const emit = defineEmits<{
  (e: 'remove', id: number): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="panel-body">
    <table class="trial-table" v-if="trials.length">
      <thead><tr><th>#</th><th>θ₁</th><th>θ₂</th><th>Δθ</th><th>cos²θ</th><th>I₀</th><th>I</th><th></th></tr></thead>
      <tbody>
        <tr v-for="tr in trials" :key="tr.id">
          <td>{{ tr.id }}</td>
          <td>{{ tr.polarizerAngle }}</td>
          <td>{{ tr.analyzerAngle }}</td>
          <td>{{ tr.relativeAngle.toFixed(1) }}°</td>
          <td>{{ Math.pow(Math.cos(tr.relativeAngle * Math.PI / 180), 2).toFixed(3) }}</td>
          <td>{{ tr.I0 }}</td>
          <td>{{ tr.outputIntensity.toFixed(2) }}</td>
          <td><button class="rm" @click="emit('remove', tr.id)">x</button></td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">{{ t('experiments.noTrialsYet') }}</p>
    <button v-if="trials.length" class="clear-btn" @click="emit('clear')">{{ t('experiments.clearData') }}</button>
  </div>
</template>

<style scoped>
.panel-body { font-size: .8rem; }
.trial-table { width: 100%; border-collapse: collapse; }
.trial-table th, .trial-table td { padding: 4px 6px; text-align: center; border-bottom: 1px solid #2D3645; font-size: .75rem; }
.trial-table th { color: #8B95A5; font-weight: 600; }
.rm { background: none; border: none; color: #f87171; cursor: pointer; font-size: .8rem; }
.empty { color: #64748b; text-align: center; padding: 1rem; }
.clear-btn { margin-top: .5rem; width: 100%; padding: .3rem; background: rgba(248,113,113,.1); border: 1px solid rgba(248,113,113,.3); color: #f87171; border-radius: 4px; cursor: pointer; font-size: .75rem; }
</style>
