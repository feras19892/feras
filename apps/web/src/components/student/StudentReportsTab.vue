<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { StudentReportRow } from '../../composables/student/useStudentDashboard'

const props = defineProps<{ rows: StudentReportRow[]; locale?: string }>()
const emit = defineEmits<{ (e: 'open-report', id: number): void }>()
const { t, locale: i18nLocale } = useI18n()

const filter = ref<'all' | 'graded' | 'pending' | 'draft'>('all')
const searchQuery = ref('')
const dateFilter = ref<'all' | 'week' | 'month' | 'semester'>('all')
const sortBy = ref<'date-desc' | 'date-asc' | 'grade-desc' | 'grade-asc' | 'name-asc'>('date-desc')

const filtered = computed(() => {
  let result = props.rows
  if (filter.value === 'graded') result = result.filter(r => r.status === 'graded')
  if (filter.value === 'pending') result = result.filter(r => r.status === 'submitted' || r.status === 'resubmitted')
  if (filter.value === 'draft') result = result.filter(r => r.status === 'draft')

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter(r =>
      r.experimentName?.toLowerCase().includes(q)
    )
  }

  if (dateFilter.value !== 'all') {
    const now = new Date()
    const days = dateFilter.value === 'week' ? 7 : dateFilter.value === 'month' ? 30 : 120
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    result = result.filter(r => {
      if (!r.submittedAt) return false
      return new Date(r.submittedAt) >= cutoff
    })
  }

  const sorted = [...result]
  if (sortBy.value === 'date-desc') sorted.sort((a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || ''))
  else if (sortBy.value === 'date-asc') sorted.sort((a, b) => (a.submittedAt || '').localeCompare(b.submittedAt || ''))
  else if (sortBy.value === 'grade-desc') sorted.sort((a, b) => (b.grade ?? -1) - (a.grade ?? -1))
  else if (sortBy.value === 'grade-asc') sorted.sort((a, b) => (a.grade ?? 999) - (b.grade ?? 999))
  else if (sortBy.value === 'name-asc') sorted.sort((a, b) => (a.experimentName || '').localeCompare(b.experimentName || ''))
  return sorted
})

function statusLabel(s: string): string {
  if (s === 'graded') return t('dashboard.statusGraded')
  if (s === 'submitted') return t('dashboard.statusSubmitted')
  if (s === 'resubmitted') return t('dashboard.statusResubmitted')
  return t('dashboard.statusDraft')
}

function statusClass(s: string): string {
  if (s === 'graded') return 'graded'
  if (s === 'submitted') return 'pending'
  if (s === 'resubmitted') return 'resubmitted'
  return 'draft'
}

function timeShort(dateStr: string | null): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  const loc = props.locale || i18nLocale.value
  const localeStr = loc === 'ar' ? 'ar-SA' : loc === 'es' ? 'es-ES' : 'en-US'
  return d.toLocaleDateString(localeStr)
}
</script>

<template>
  <div class="tab-panel">
    <div class="panel-card">
      <div class="pc-header">
        <h3>📋 {{ t('dashboard.myReportsTitle') }}</h3>
        <div class="filter-pills">
          <button :class="['fp', { active: filter === 'all' }]" @click="filter = 'all'">{{ t('dashboard.dash.allReports') }}</button>
          <button :class="['fp', { active: filter === 'graded' }]" @click="filter = 'graded'">{{ t('dashboard.statusGraded') }}</button>
          <button :class="['fp', { active: filter === 'pending' }]" @click="filter = 'pending'">{{ t('dashboard.dash.pendingReview') }}</button>
          <button :class="['fp', { active: filter === 'draft' }]" @click="filter = 'draft'">{{ t('dashboard.statusDraft') }}</button>
        </div>
      </div>
      <div class="search-row">
        <input v-model="searchQuery" class="search-input" :placeholder="t('dashboard.dash.searchReports')" />
        <select v-model="dateFilter" class="date-select">
          <option value="all">{{ t('dashboard.dash.allTime') }}</option>
          <option value="week">{{ t('dashboard.dash.lastWeek') }}</option>
          <option value="month">{{ t('dashboard.dash.lastMonth') }}</option>
          <option value="semester">{{ t('dashboard.dash.lastSemester') }}</option>
        </select>
        <select v-model="sortBy" class="date-select">
          <option value="date-desc">⬇️ {{ t('dashboard.dash.sortDateDesc') || 'الأحدث' }}</option>
          <option value="date-asc">⬆️ {{ t('dashboard.dash.sortDateAsc') || 'الأقدم' }}</option>
          <option value="grade-desc">⬇️ {{ t('dashboard.dash.sortGradeDesc') || 'أعلى درجة' }}</option>
          <option value="grade-asc">⬆️ {{ t('dashboard.dash.sortGradeAsc') || 'أقل درجة' }}</option>
          <option value="name-asc">🔤 {{ t('dashboard.dash.sortNameAsc') || 'الاسم' }}</option>
        </select>
      </div>
      <div v-if="filtered.length === 0" class="pc-empty">📝 {{ t('dashboard.noReportsSent') }}</div>
      <div v-else class="full-table">
        <table>
          <thead><tr>
            <th>{{ t('dashboard.dash.experimentName') }}</th><th>{{ t('dashboard.dash.status') }}</th><th>⭐</th><th>{{ t('dashboard.dash.submittedAt') }}</th>
          </tr></thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id" class="t-row" @click="emit('open-report', r.id)">
              <td><span class="t-name">{{ r.experimentName }}</span><span v-if="r.hasFeedback" :class="['t-feedback', { unseen: !r.feedbackSeen }]">💬 {{ r.feedbackSeen ? t('dashboard.dash.hasFeedback') : t('dashboard.dash.newFeedback') }}</span></td>
              <td><span :class="['badge', statusClass(r.status)]">{{ statusLabel(r.status) }}</span></td>
              <td :class="{ 't-grade': r.grade !== null }">{{ r.grade !== null ? r.grade + '/100' : '—' }}</td>
              <td class="t-date">{{ timeShort(r.submittedAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-card { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.8rem; padding: 1rem; margin-bottom: 0.8rem; }
.pc-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem; }
.pc-header h3 { margin: 0; font-size: 0.9rem; font-weight: 700; color: #e5e7eb; }
.search-row { display: flex; gap: 0.5rem; margin-bottom: 0.6rem; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 150px; padding: 0.35rem 0.7rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.78rem; }
.search-input:focus { outline: none; border-color: rgba(99,102,241,0.4); }
.date-select { padding: 0.35rem 0.5rem; border-radius: 0.4rem; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.3); color: #e2e8f0; font-family: inherit; font-size: 0.78rem; cursor: pointer; }
.filter-pills { display: flex; gap: 0.25rem; flex-wrap: wrap; }
.fp { padding: 0.2rem 0.5rem; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #64748b; cursor: pointer; font-size: 0.68rem; font-weight: 700; font-family: inherit; }
.fp.active { background: rgba(99,102,241,0.12); color: #c7d2fe; border-color: rgba(99,102,241,0.2); }
.pc-empty { text-align: center; color: #64748b; padding: 1.2rem; font-size: 0.82rem; }
.full-table { overflow-x: auto; }
.full-table table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.full-table th { padding: 0.45rem 0.6rem; text-align: center; color: #475569; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
.full-table th:first-child { text-align: start; }
.full-table td { padding: 0.45rem 0.6rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.full-table td:first-child { text-align: start; }
.t-row { cursor: pointer; transition: background 0.12s; }
.t-row:hover { background: rgba(99,102,241,0.04); }
.t-name { font-weight: 700; color: #f1f5f9; display: block; }
.t-feedback { display: block; font-size: 0.62rem; color: #a5b4fc; }
.t-feedback.unseen { color: #fbbf24; font-weight: 700; }
.badge { padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
.badge.graded { background: rgba(34,197,94,0.15); color: #22c55e; }
.badge.pending { background: rgba(245,158,11,0.15); color: #fbbf24; }
.badge.resubmitted { background: rgba(99,102,241,0.15); color: #a5b4fc; }
.badge.draft { background: rgba(148,163,184,0.15); color: #94a3b8; }
.t-grade { color: #67e8f9; font-weight: 800; font-family: monospace; }
.t-date { color: #64748b; font-size: 0.72rem; }
</style>
