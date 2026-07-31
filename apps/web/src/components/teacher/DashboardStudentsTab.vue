<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../composables/useI18n'
import type { StudentRow } from '../../composables/teacher/useTeacherDashboard'
import CreateApprovalButton from '../shared/CreateApprovalButton.vue'

const props = defineProps<{ rows: StudentRow[] }>()
const { t } = useI18n()

const filter = ref<'all' | 'pending' | 'missing'>('all')

const filtered = computed(() => {
  if (filter.value === 'pending') return props.rows.filter(r => r.pendingCount > 0)
  if (filter.value === 'missing') return props.rows.filter(r => r.missingReports)
  return props.rows
})

function lastSub(dateStr: string | null): string {
  if (!dateStr) return t('dashboard.dash.never')
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return t('dashboard.justNow')
  if (diff === 1) return `1 ${t('dashboard.daysAgo')}`
  return `${diff} ${t('dashboard.daysAgo')}`
}
</script>

<template>
  <div class="tab-panel">
    <div class="panel-card">
      <div class="pc-header">
        <h3>🎓 {{ t('dashboard.dash.studentsReport') }}</h3>
        <div class="filter-pills">
          <button :class="['fp', { active: filter === 'all' }]" @click="filter = 'all'">{{ t('dashboard.dash.allStudents') }}</button>
          <button :class="['fp', { active: filter === 'pending' }]" @click="filter = 'pending'">{{ t('dashboard.dash.withPending') }}</button>
          <button :class="['fp', { active: filter === 'missing' }]" @click="filter = 'missing'">{{ t('dashboard.dash.noReports') }}</button>
        </div>
      </div>
      <div class="full-table">
        <table>
          <thead><tr>
            <th>{{ t('dashboard.dash.studentName') }}</th><th>{{ t('dashboard.dash.class') }}</th><th>📄</th><th>✅</th><th>⏳</th><th>📊</th><th>{{ t('dashboard.dash.lastSubmission') }}</th><th>⚙️</th>
          </tr></thead>
          <tbody>
            <tr v-for="s in filtered" :key="s.id" :class="{ 'row-missing': s.missingReports, 'row-pending': s.pendingCount > 0 }">
              <td><span class="t-name">{{ s.name }}</span><span v-if="s.missingReports" class="t-tag">⚠️ {{ t('dashboard.dash.noReportsShort') }}</span></td>
              <td class="t-class">{{ s.className }}</td>
              <td>{{ s.reportCount }}</td><td class="t-graded">{{ s.gradedCount }}</td>
              <td :class="{ 't-pending': s.pendingCount > 0 }">{{ s.pendingCount }}</td>
              <td :class="{ 't-avg': s.avgGrade > 0 }">{{ s.avgGrade > 0 ? s.avgGrade + '%' : '—' }}</td>
              <td class="t-last">{{ lastSub(s.lastSubmission) }}</td>
              <td class="t-actions">
                <CreateApprovalButton
                  type="student_removal"
                  approverType="school"
                  :targetUserId="s.id"
                  :targetUserName="s.name"
                  :classId="s.classId"
                >
                  <button class="remove-btn" @click.stop>🚫</button>
                </CreateApprovalButton>
              </td>
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
.filter-pills { display: flex; gap: 0.25rem; }
.fp { padding: 0.2rem 0.5rem; border-radius: 999px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.03); color: #64748b; cursor: pointer; font-size: 0.68rem; font-weight: 700; font-family: inherit; }
.fp.active { background: rgba(99,102,241,0.12); color: #c7d2fe; border-color: rgba(99,102,241,0.2); }
.full-table { overflow-x: auto; }
.full-table table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
.full-table th { padding: 0.45rem 0.5rem; text-align: center; color: #475569; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
.full-table th:first-child { text-align: start; }
.full-table td { padding: 0.4rem 0.5rem; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.full-table td:first-child { text-align: start; }
.t-name { font-weight: 700; color: #f1f5f9; display: block; }
.t-tag { display: block; font-size: 0.62rem; color: #f87171; }
.t-class { color: #94a3b8; font-size: 0.75rem; }
.t-graded { color: #4ade80; font-weight: 700; }
.t-pending { color: #fbbf24; font-weight: 700; }
.t-avg { color: #a5b4fc; font-weight: 700; }
.t-last { color: #64748b; font-size: 0.72rem; }
.row-missing { background: rgba(239,68,68,0.03); }
.row-pending { background: rgba(251,191,36,0.02); }
.t-actions { text-align: center; }
.remove-btn { border: none; border-radius: 0.35rem; padding: 0.2rem 0.4rem; background: rgba(239,68,68,0.12); color: #f87171; font-size: 0.8rem; cursor: pointer; transition: all 0.15s; }
.remove-btn:hover { background: rgba(239,68,68,0.22); }
</style>
