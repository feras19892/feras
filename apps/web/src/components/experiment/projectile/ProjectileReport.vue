<script setup lang="ts">
import { computed } from 'vue'
import ExperimentReport from '../ExperimentReport.vue'
import DeletableSection from '../DeletableSection.vue'

import type { ProjectileTrial } from '../../../composables/projectile/useProjectileTrials'

const props = defineProps<{
  trials: ProjectileTrial[]
  params?: { v0: number; angleDeg: number; g: number; dragCoeff: number }
  trialStats?: { range_mean: number; range_std: number; flightTime_mean: number; flightTime_std: number } | null
  fitResult?: { slope: number; intercept: number } | null
  gTheoretical: number
}>()

const emit = defineEmits<{ (e: 'close'): void; (e: 'open-full-report'): void }>()

const hasData = computed(() => props.trials.length > 0)
</script>

<template>
  <ExperimentReport student-storage-key="projectile_report_student" :has-data="hasData" @close="emit('close')" @open-full-report="emit('open-full-report')">
    <template #content>
      <DeletableSection v-if="params">
        <h5>الشروط الأولية</h5>
        <div class="info-grid">
          <div class="info-field"><label>v₀</label><span>{{ params.v0 }} m/s</span></div>
          <div class="info-field"><label>الزاوية</label><span>{{ params.angleDeg }}°</span></div>
          <div class="info-field"><label>g</label><span>{{ params.g }} m/s²</span></div>
          <div class="info-field"><label>مقاومة الهواء</label><span>{{ params.dragCoeff }}</span></div>
        </div>
      </DeletableSection>
      <DeletableSection v-if="trials.length">
        <h5>جدول القراءات ({{ trials.length }})</h5>
        <table class="report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>الزاوية</th>
              <th>v₀ (m/s)</th>
              <th>الزمن (s)</th>
              <th>أقصى ارتفاع (m)</th>
              <th>المدى (m)</th>
              <th>الخطأ (%)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in trials" :key="t.id">
              <td class="idx">{{ i + 1 }}</td>
              <td>{{ t.angleDegrees.toFixed(1) }}°</td>
              <td>{{ t.initialVelocity.toFixed(2) }}</td>
              <td>{{ t.flightTimeSec.toFixed(2) }}</td>
              <td>{{ t.maxHeightMeters.toFixed(2) }}</td>
              <td class="range">{{ t.rangeMeters.toFixed(2) }}</td>
              <td class="err">{{ t.err.toFixed(2) }}%</td>
            </tr>
          </tbody>
        </table>
      </DeletableSection>
      <DeletableSection v-if="trials.length && trialStats">
        <h5>الإحصائيات</h5>
        <div class="info-grid">
          <div class="info-field"><label>متوسط المدى</label><span>{{ trialStats.range_mean.toFixed(2) }} m</span></div>
          <div class="info-field"><label>الانحراف المعياري (المدى)</label><span>{{ trialStats.range_std.toFixed(2) }} m</span></div>
          <div class="info-field"><label>متوسط زمن التحليق</label><span>{{ trialStats.flightTime_mean.toFixed(2) }} s</span></div>
          <div class="info-field"><label>الانحراف المعياري (الزمن)</label><span>{{ trialStats.flightTime_std.toFixed(2) }} s</span></div>
        </div>
      </DeletableSection>
      <DeletableSection v-if="fitResult && trials.length >= 2">
        <h5>ملائمة منحنى المدى</h5>
        <div class="equation-box">
          <code>R = {{ fitResult.slope.toFixed(4) }} · sin(2θ) {{ fitResult.intercept >= 0 ? '+' : '' }} {{ fitResult.intercept.toFixed(4) }}</code>
        </div>
        <p class="equation-note">منحنى الانحدار الخطي لـ R مقابل sin(2θ)</p>
      </DeletableSection>
      <DeletableSection>
        <h5>المعادلات المستخدمة</h5>
        <div class="equations-list">
          <div class="eq">z = v₀ sin θ / g</div>
          <div class="eq">H = (v₀ sin θ)² / 2g</div>
          <div class="eq">R = v₀² sin(2θ) / g</div>
        </div>
      </DeletableSection>
      <div class="report-footer" v-if="trials.length">
        <span>g النظرية: <b>{{ gTheoretical }} m/s²</b></span>
        <span class="date">{{ new Date().toLocaleDateString('ar-SY') }}</span>
      </div>
    </template>
  </ExperimentReport>
</template>

<style scoped>
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: .5rem; }
.info-field { background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: .5rem .7rem; display: flex; justify-content: space-between; align-items: center; }
.info-field label { font-size: .75rem; color: #64748b; }
.info-field span { font-size: .82rem; color: #e2e8f0; font-weight: 600; font-family: monospace; }

.equation-box { background: #111827; border: 1px solid #1e293b; border-radius: 10px; padding: .8rem 1rem; text-align: center; }
.equation-box code { color: #f97316; font-size: .95rem; font-family: 'Courier New', monospace; }
.equation-note { margin: .3rem 0 0; font-size: .72rem; color: #64748b; text-align: center; }

.equations-list { display: flex; flex-wrap: wrap; gap: .5rem; }
.eq { background: #111827; border: 1px solid #1e293b; border-radius: 8px; padding: .4rem .8rem; font-size: .82rem; color: #94a3b8; font-family: 'Courier New', monospace; }

.idx { color: #64748b; font-weight: 600; }
.range { color: #5B8DB8; font-weight: 600; }
.err { color: #fbbf24; }

.report-footer { display: flex; justify-content: space-between; align-items: center; padding-top: .8rem; border-top: 1px solid #1e293b; font-size: .75rem; color: #475569; }
.report-footer b { color: #5B8DB8; }

@media print {
  .info-field, .equation-box, .eq { background: #f8fafc; border: 1px solid #e2e8f0; }
  .info-field label, .equation-note { color: #475569; }
  .info-field span { color: #000; }
  .report-footer { color: #475569; border-top: 1px solid #e2e8f0; }
  .report-footer b { color: #0369a1; }
}
</style>
