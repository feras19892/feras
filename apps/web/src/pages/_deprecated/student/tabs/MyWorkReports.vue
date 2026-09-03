<template>
  <ErrorState
    v-if="error"
    :error="error"
    show-retry
    @retry="emits('retry')"
  />
  <DashSection
    v-else
    :title="t('dashboard.dashNew.myWork')"
    icon="📝"
    :loading="loading"
    :empty="!loading && reports.length === 0"
    :empty-text="t('dashboard.dashNew.noReportsFound')"
  >
    <template #action>
      <button class="btn-add" @click="emits('create')">{{ t('dashboard.dashNew.createReport') }}</button>
      <button class="btn-export" @click="handleExport">{{ t('dashboard.dashNew.exportCsv') }}</button>
    </template>

    <DashStatusGrid :items="statusItems" @select="onStatusSelect" />

    <div v-if="!loading && pagedReports.length" class="dash-reports-list">
      <DashStatusCard
        v-for="report in pagedReports"
        :key="report.id"
        :title="report.experiment_name"
        :meta="metaFor(report)"
        :status-label="statusLabel(report.status)"
        :color="statusColor(report.status)"
        @click="emits('view', report.id)"
      />
    </div>

    <Pagination
      v-if="!loading && filteredReports.length > pageLimit"
      :page="currentPage"
      :limit="pageLimit"
      :total="filteredReports.length"
      @change="onPageChange"
    />
  </DashSection>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction, locale } = useI18n();
import { ref, computed } from 'vue'
import DashSection from '@/components/dashboard/DashSection.vue'
import DashStatusGrid from '@/components/dashboard/DashStatusGrid.vue'
import DashStatusCard from '@/components/dashboard/DashStatusCard.vue'
import Pagination from '@/components/shared/Pagination.vue'

import ErrorState from '@/components/shared/ErrorState.vue'

import { useI18nStore } from '@/stores/i18n.store'
import { statusLabel } from '@/composables/shared/useLabels'
import { exportToCSV } from '@/composables/shared/useExport'
import type { Report } from '@/services/report.service'




interface Props {
  reports: Report[]
  loading: boolean
  error: string | null
}

const props = defineProps<Props>()
const emits = defineEmits<{ create: []; view: [id: number]; retry: [] }>()

const i18nStore = useI18nStore()

const statusFilter = ref('')
const currentPage = ref(1)
const pageLimit = ref(10)

const statusItems = computed(() => {
  const counts: Record<string, number> = { draft: 0, submitted: 0, graded: 0, resubmitted: 0 }
  for (const r of props.reports) {
    if (counts[r.status] !== undefined) counts[r.status]++
  }
  return [
    { status: 'draft', label: t('dashboard.dashNew.statusDraft'), count: counts.draft, icon: '📝', color: 'warning' as const, active: statusFilter.value === 'draft' },
    { status: 'submitted', label: t('dashboard.dashNew.statusSubmitted'), count: counts.submitted, icon: '⏳', color: 'info' as const, active: statusFilter.value === 'submitted' },
    { status: 'graded', label: t('dashboard.dashNew.statusGraded'), count: counts.graded, icon: '✅', color: 'success' as const, active: statusFilter.value === 'graded' },
    { status: 'resubmitted', label: t('dashboard.dashNew.statusResubmitted'), count: counts.resubmitted, icon: '🔄', color: 'warning' as const, active: statusFilter.value === 'resubmitted' },
  ]
})

const filteredReports = computed(() => {
  if (!statusFilter.value) return props.reports
  return props.reports.filter((r) => r.status === statusFilter.value)
})

const pagedReports = computed(() => {
  const start = (currentPage.value - 1) * pageLimit.value
  return filteredReports.value.slice(start, start + pageLimit.value)
})

function onStatusSelect(status: string) {
  statusFilter.value = statusFilter.value === status ? '' : status
  currentPage.value = 1
}

function onPageChange(p: number) {
  currentPage.value = p
}

function statusColor(status: string): 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case 'graded':
      return 'success'
    case 'submitted':
      return 'info'
    case 'resubmitted':
    case 'draft':
      return 'warning'
    default:
      return 'info'
  }
}

function metaFor(report: Report): string {
  if (report.grade !== null && report.grade !== undefined) {
    return `${t('dashboard.dashNew.grade2')} ${report.grade}/100`
  }
  if (report.submitted_at) {
    return formatDate(report.submitted_at)
  }
  if (report.created_at) {
    return formatDate(report.created_at)
  }
  return '—'
}

function formatDate(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString(i18nStore.locale) : '—'
}

function handleExport() {
  exportToCSV(
    filteredReports.value.map((r) => ({
      id: r.id,
      experiment: r.experiment_name,
      status: r.status,
      grade: r.grade ?? '',
      feedback: r.feedback ?? '',
    })),
    'student-reports',
  )
}
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.dash-reports-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
