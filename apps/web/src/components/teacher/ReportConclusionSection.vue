<script setup lang="ts">
import { useI18n } from '../../composables/useI18n'
import type { Report } from '../../services/report.service'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineProps<{
  report: Report
  studentInfo: any
  plots: any[]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="section">
    <!-- Student & Report Meta -->
    <h3 class="sec-title">👤 {{ t('report.studentAndMeta') }}</h3>
    <div class="meta-grid">
      <div class="meta-item">
        <span class="meta-label">{{ t('report.studentName') }}</span>
        <span class="meta-val">{{ report.student_name || studentInfo.name || '—' }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">{{ t('report.experimentName') }}</span>
        <span class="meta-val">{{ report.experiment_name }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">{{ t('report.experimentType') }}</span>
        <span class="meta-val">{{ report.experiment_type }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">{{ t('report.submittedAt') }}</span>
        <span class="meta-val">{{ report.submitted_at?.replace('T', ' ').slice(0, 19) || '—' }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">{{ t('report.version') }}</span>
        <span class="meta-val">v{{ report.version }}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">{{ t('report.status') }}</span>
        <span :class="['meta-val', 'status-' + report.status]">{{ t(`report.status_${report.status}`) }}</span>
      </div>
      <div v-if="report.graded_at" class="meta-item">
        <span class="meta-label">{{ t('report.gradedAt') }}</span>
        <span class="meta-val">{{ report.graded_at?.replace('T', ' ').slice(0, 19) }}</span>
      </div>
      <div v-if="report.graded_by_name" class="meta-item">
        <span class="meta-label">{{ t('report.gradedBy') }}</span>
        <span class="meta-val">{{ report.graded_by_name }}</span>
      </div>
      <div v-if="report.grade !== undefined" class="meta-item">
        <span class="meta-label">{{ t('report.currentGrade') }}</span>
        <span class="meta-val grade-val">{{ report.grade }}/100</span>
      </div>
      <div v-if="studentInfo.email" class="meta-item">
        <span class="meta-label">{{ t('report.email') }}</span>
        <span class="meta-val">{{ studentInfo.email }}</span>
      </div>
      <div v-if="studentInfo.grade" class="meta-item">
        <span class="meta-label">{{ t('report.classGrade') }}</span>
        <span class="meta-val">{{ studentInfo.grade }}</span>
      </div>
    </div>

    <div v-if="studentInfo.notes" class="notes-box">
      <b>{{ t('report.studentNotes') }}:</b> {{ studentInfo.notes }}
    </div>

    <!-- Chart -->
    <h3 v-if="report.chart_snapshot" class="sec-title">📈 {{ t('report.chartSnapshot') }}</h3>
    <div v-if="report.chart_snapshot" class="chart-box">
      <img :src="report.chart_snapshot" alt="Chart" class="chart-img" />
    </div>

    <!-- Plots -->
    <h3 v-if="plots.length" class="sec-title">📊 {{ t('report.suggestedPlots') }}</h3>
    <div v-if="plots.length" class="plot-list">
      <div v-for="(p, i) in plots" :key="i" class="plot-item">
        <span class="plot-type">{{ p.type === 'scatter' ? '●' : '━' }}</span>
        <span>{{ p.yLabel }} {{ t('report.vs') }} {{ p.xLabel }}</span>
      </div>
    </div>

    <!-- Conclusion -->
    <h3 v-if="report.conclusion || report.conclusion_errors || report.conclusion_improvements" class="sec-title">📝 {{ t('report.studentConclusion') }}</h3>
    <div v-if="report.conclusion" class="conclusion-box">
      <div class="conclusion-label">{{ t('report.mainConclusion') }}</div>
      <div class="conclusion-text">{{ report.conclusion }}</div>
    </div>
    <div v-if="report.conclusion_errors" class="conclusion-box errors">
      <div class="conclusion-label">{{ t('report.errorSources') }}</div>
      <div class="conclusion-text">{{ report.conclusion_errors }}</div>
    </div>
    <div v-if="report.conclusion_improvements" class="conclusion-box improvements">
      <div class="conclusion-label">{{ t('report.improvements') }}</div>
      <div class="conclusion-text">{{ report.conclusion_improvements }}</div>
    </div>

    <!-- Feedback -->
    <div v-if="report.feedback" class="feedback-box">
      <div class="fb-label">{{ t('report.teacherFeedback') }}</div>
      <div class="fb-text">{{ report.feedback }}</div>
    </div>
  </div>
</template>

<style scoped>
.section { margin-bottom: 1.2rem; }
.sec-title { font-size: 0.95rem; font-weight: 700; color: #fbbf24; margin: 0 0 0.6rem; padding-bottom: 0.3rem; border-bottom: 1px solid rgba(251, 191, 36, 0.15); }

.meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.5rem; margin-bottom: 0.8rem; }
.meta-item { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 0.4rem; padding: 0.4rem 0.6rem; display: flex; flex-direction: column; gap: 0.1rem; }
.meta-label { font-size: 0.68rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.meta-val { font-size: 0.82rem; color: #e2e8f0; font-weight: 600; }
.grade-val { color: #4ade80; font-weight: 800; font-size: 0.95rem; }
.status-graded { color: #4ade80; }
.status-submitted { color: #fbbf24; }
.status-resubmitted { color: #c084fc; }
.status-draft { color: #64748b; }

.notes-box { background: rgba(103, 232, 249, 0.04); border: 1px solid rgba(103, 232, 249, 0.1); border-radius: 0.4rem; padding: 0.5rem 0.7rem; font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.8rem; }

.chart-box { border-radius: 0.5rem; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); margin-bottom: 0.8rem; background: #fff; }
.chart-img { width: 100%; display: block; }

.plot-list { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 0.8rem; }
.plot-item { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); padding: 0.3rem 0.6rem; border-radius: 0.3rem; font-size: 0.8rem; color: #94a3b8; }
.plot-type { color: #4ade80; margin-inline-end: 0.2rem; }

.conclusion-box { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.5rem; padding: 0.6rem 0.8rem; margin-bottom: 0.5rem; }
.conclusion-box.errors { border-color: rgba(239, 68, 68, 0.15); }
.conclusion-box.improvements { border-color: rgba(34, 197, 94, 0.15); }
.conclusion-label { font-size: 0.75rem; font-weight: 700; color: #fbbf24; margin-bottom: 0.3rem; }
.conclusion-box.errors .conclusion-label { color: #f87171; }
.conclusion-box.improvements .conclusion-label { color: #4ade80; }
.conclusion-text { font-size: 0.85rem; color: #e2e8f0; line-height: 1.6; white-space: pre-wrap; }

.feedback-box { background: rgba(99, 102, 241, 0.06); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 0.5rem; padding: 0.6rem 0.8rem; margin-top: 0.5rem; }
.fb-label { font-size: 0.75rem; font-weight: 700; color: #c7d2fe; margin-bottom: 0.3rem; }
.fb-text { font-size: 0.85rem; color: #e2e8f0; line-height: 1.6; white-space: pre-wrap; }
</style>
