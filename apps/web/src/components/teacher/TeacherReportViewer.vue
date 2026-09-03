<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { toRef } from 'vue'

import type { Report } from '../../services/report.service'
import { useReportParser } from '../../composables/teacher/useReportParser'
import ReportReadingsSection from './ReportReadingsSection.vue'
import ReportCalculationsSection from './ReportCalculationsSection.vue'
import ReportConclusionSection from './ReportConclusionSection.vue'





const props = defineProps<{ report: Report }>()

const r = toRef(props, 'report')
const parser = useReportParser(r)
</script>

<template>
  <div class="trv-container">
    <!-- Header -->
    <div class="trv-header">
      <div class="trv-title">
        <h2>{{ report.experiment_name }}</h2>
        <span class="trv-student">{{ report.student_name }}</span>
      </div>
      <div :class="['trv-status', 'st-' + report.status]">
        <span v-if="report.status === 'graded'">✅ {{ report.grade }}/100</span>
        <span v-else-if="report.status === 'resubmitted'">↩️ {{ t('report.status_resubmitted') }}</span>
        <span v-else>⏳ {{ t('report.status_submitted') }}</span>
      </div>
    </div>

    <!-- Sections -->
    <ReportConclusionSection :report="report" :student-info="parser.studentInfo.value" :plots="parser.plots.value" />
    <ReportReadingsSection :readings="parser.readings.value" :columns="parser.columns.value" :column-stats="parser.columnStats.value" :quality="parser.dataQuality.value" />
    <ReportCalculationsSection :equations="parser.equations.value" :solved-equations="parser.solvedEquations.value" :regression-data="parser.regressionData.value" :slope-calc-data="parser.slopeCalcData.value" :axes-data="parser.axesData.value" :error-calc-data="parser.errorCalcData.value" />
  </div>
</template>

<style scoped>
.trv-container { display: flex; flex-direction: column; gap: 0.8rem; }
.trv-header { display: flex; align-items: center; justify-content: space-between; padding: 0.8rem 1rem; border-radius: 0.6rem; background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(167, 139, 250, 0.06)); border: 1px solid rgba(99, 102, 241, 0.15); }
.trv-title h2 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #e5e7eb; }
.trv-student { font-size: 0.82rem; color: #94a3b8; }
.trv-status { padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.82rem; font-weight: 700; }
.st-graded { background: rgba(34, 197, 94, 0.12); color: #4ade80; }
.st-submitted { background: rgba(251, 191, 36, 0.12); color: #fbbf24; }
.st-resubmitted { background: rgba(168, 85, 247, 0.12); color: #c084fc; }
.st-draft { background: rgba(100, 116, 139, 0.12); color: #94a3b8; }
</style>
