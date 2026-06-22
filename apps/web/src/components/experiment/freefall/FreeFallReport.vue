<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import ExperimentReport from '../ExperimentReport.vue'
import DeletableSection from '../DeletableSection.vue'
import type { FreeFallTrial } from '../../../composables/freefall/useFreeFallTrials'
import { useI18n } from '../../../composables/useI18n'

const { t } = useI18n()
const props = defineProps<{
  trials: FreeFallTrial[]
  params?: { h: number; g: number; mass: number; airResistance: boolean }
  trialStats?: { time_mean: number; time_std: number; g_mean: number; g_std: number } | null
  gTheoretical: number
}>()

const emit = defineEmits<{ (e: 'close'): void; (e: 'open-full-report'): void }>()

const trialsEdit = shallowRef<FreeFallTrial[]>([])
const isEditing = shallowRef(false)

watch(() => props.trials, (v) => { if (!isEditing.value) trialsEdit.value = v.map(t => ({ ...t })) }, { immediate: true, deep: true })

function updateTrial(i: number, key: keyof FreeFallTrial, raw: string) {
  const n = parseFloat(raw)
  if (Number.isNaN(n)) return
  const t = { ...trialsEdit.value[i] }
  ;(t as Record<string, unknown>)[key] = n
  if (key === 'timeSec') {
    t.timeSquaredSec2 = n * n
    t.gCalc = (2 * t.heightMeters) / (n * n)
    t.err = Math.abs((t.gCalc - props.gTheoretical) / props.gTheoretical) * 100
  }
  if (key === 'heightMeters') {
    t.gCalc = (2 * n) / (t.timeSec * t.timeSec)
    t.err = Math.abs((t.gCalc - props.gTheoretical) / props.gTheoretical) * 100
  }
  trialsEdit.value[i] = t
  trialsEdit.value = [...trialsEdit.value]
}

const hasData = computed(() => props.trials.length > 0)
const gAvg = computed(() => {
  if (!trialsEdit.value.length) return null
  const gs = trialsEdit.value.map(t => t.gCalc)
  return gs.reduce((a, b) => a + b, 0) / gs.length
})
const errorPercent = computed(() => {
  if (gAvg.value === null) return null
  return Math.abs((gAvg.value - props.gTheoretical) / props.gTheoretical) * 100
})
</script>

<template>
  <ExperimentReport student-storage-key="freefall_report_student" :has-data="hasData" @close="emit('close')" @open-full-report="emit('open-full-report')">
    <template #content>
      <DeletableSection v-if="params">
        <h5>{{ t('experiments.initialConditions') }}</h5>
        <div class="info-grid">
          <div class="info-field"><label>{{ t('experiments.heightLabel') }}</label><span>{{ params.h }} m</span></div>
          <div class="info-field"><label>g</label><span>{{ params.g }} m/s²</span></div>
          <div class="info-field"><label>{{ t('experiments.mass') }}</label><span>{{ params.mass }} kg</span></div>
          <div class="info-field"><label>{{ t('experiments.airResistance') }}</label><span>{{ params.airResistance ? t('experiments.enabled') : t('experiments.disabled') }}</span></div>
        </div>
      </DeletableSection>
      <DeletableSection v-if="trialsEdit.length">
        <h5>{{ t('experiments.readingsTable') }} ({{ trialsEdit.length }}) <span class="edit-hint">✏️ {{ t('experiments.editable') }}</span></h5>
        <table class="report-table">
          <thead>
            <tr><th>#</th><th>h (m)</th><th>t (s)</th><th>t² (s²)</th><th>v_impact (m/s)</th><th>g_calc (m/s²)</th><th>{{ t('experiments.error') }} (%)</th></tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in trialsEdit" :key="t.id">
              <td>{{ i + 1 }}</td>
              <td><input class="edit-input" :value="t.heightMeters.toFixed(2)" @change="e => updateTrial(i, 'heightMeters', (e.target as HTMLInputElement).value)" /></td>
              <td><input class="edit-input" :value="t.timeSec.toFixed(3)" @change="e => updateTrial(i, 'timeSec', (e.target as HTMLInputElement).value)" /></td>
              <td>{{ t.timeSquaredSec2.toFixed(4) }}</td>
              <td>{{ t.impactVelocityMs.toFixed(2) }}</td>
              <td>{{ t.gCalc.toFixed(2) }}</td>
              <td>{{ t.err.toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </DeletableSection>
      <DeletableSection v-if="gAvg !== null">
        <h5>{{ t('experiments.comparisonAndConclusion') }}</h5>
        <div class="result-line"><b>{{ t('experiments.averageG') }}:</b> {{ gAvg.toFixed(2) }} m/s²</div>
        <div class="result-line"><b>{{ t('experiments.theoreticalG') }}:</b> {{ gTheoretical.toFixed(2) }} m/s²</div>
        <div class="result-line" v-if="errorPercent !== null"><b>{{ t('experiments.errorPercentage') }}:</b> {{ errorPercent.toFixed(2) }}%</div>
      </DeletableSection>
      <div class="report-footer" v-if="trialsEdit.length">
        <span>{{ t('experiments.theoreticalG') }}: <b>{{ gTheoretical }} m/s²</b></span>
        <span class="date">{{ new Date().toLocaleDateString('ar-SY') }}</span>
      </div>
    </template>
  </ExperimentReport>
</template>

<style scoped>
@import '../spring/SpringReport.css';
</style>
