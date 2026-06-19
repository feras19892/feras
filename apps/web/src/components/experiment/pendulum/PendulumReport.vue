<script setup lang="ts">
import { computed } from 'vue'
import ExperimentReport from '../ExperimentReport.vue'
import DeletableSection from '../DeletableSection.vue'
import type { PendulumTrial } from '../../../composables/pendulum/usePendulumTrials'

const props = defineProps<{ trials: PendulumTrial[]; gTheoretical: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'open-full-report'): void }>()

const gAvg = computed(() => { if (!props.trials.length) return null; const gs = props.trials.map(t => t.gCalc); return gs.reduce((a, b) => a + b, 0) / gs.length })
const errorPercent = computed(() => { if (gAvg.value === null) return null; return Math.abs((gAvg.value - props.gTheoretical) / props.gTheoretical) * 100 })

const sourcesOfError = ['احتكاك الهواء مع الثقل', 'دقة ساعة الإيقاف البشرية', 'خطأ زاوية النظر (parallax)', 'حركة اليد عند الإطلاق', 'كتلة الخيط غير مهملة', 'زاوية كبيرة (>10°) تخرج عن التقريب']
</script>

<template>
  <ExperimentReport student-storage-key="pendulum_report_student" :has-data="trials.length > 0" @close="emit('close')" @open-full-report="emit('open-full-report')">
    <template #content>
      <DeletableSection v-if="trials.length">
        <h5>الجزء الديناميكي (البندول)</h5>
        <table class="report-table">
          <thead><tr><th>#</th><th>L (m)</th><th>T (s)</th><th>f (Hz)</th><th>g (m/s²)</th></tr></thead>
          <tbody>
            <tr v-for="(t, i) in trials" :key="i">
              <td>{{ i + 1 }}</td><td>{{ t.length.toFixed(3) }}</td><td>{{ t.T.toFixed(3) }}</td><td>{{ t.f.toFixed(3) }}</td><td>{{ t.gCalc.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </DeletableSection>
      <DeletableSection v-if="gAvg !== null">
        <h5>المقارنة والاستنتاج</h5>
        <div class="result-line"><b>g المتوسط:</b> {{ gAvg.toFixed(2) }} m/s²</div>
        <div class="result-line"><b>g النظري:</b> {{ gTheoretical.toFixed(2) }} m/s²</div>
        <div class="result-line" v-if="errorPercent !== null"><b>نسبة الخطأ:</b> {{ errorPercent.toFixed(2) }}%</div>
        <div class="error-sources"><h6>مصادر الأخطاء:</h6><ul><li v-for="err in sourcesOfError" :key="err">{{ err }}</li></ul></div>
      </DeletableSection>
    </template>
  </ExperimentReport>
</template>

<style src="../spring/SpringReport.css" scoped></style>
