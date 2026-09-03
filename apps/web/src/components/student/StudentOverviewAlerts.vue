<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { computed } from 'vue'
import type { StudentKPI, StudentReportRow } from '@/composables/student/useStudentDashboard'

const props = defineProps<{
  kpi: StudentKPI
  overdue: StudentReportRow[]
  recent: StudentReportRow[]
}>()

const emit = defineEmits<{
  (e: 'open-report', id: number): void
}>()

const feedbackRows = computed(() => props.recent.filter(r => r.hasFeedback && !r.feedbackSeen))
const pendingRows = computed(() => props.recent.filter(r => r.status === 'submitted' || r.status === 'resubmitted'))

function statusLabel(s: string): string {
  if (s === 'graded') return t('dashboard.statusGraded')
  if (s === 'submitted') return t('dashboard.statusSubmitted')
  if (s === 'resubmitted') return t('dashboard.statusResubmitted')
  return t('dashboard.statusDraft')
}

function timeShort(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-SA') + ' ' + d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="alerts">
    <div v-if="kpi.newFeedback > 0" class="alert-card feedback">
      <div class="alert-head">💬 تغذية راجعة جديدة</div>
      <div v-if="feedbackRows.length === 0" class="alert-empty">تحقق من أحدث التقارير</div>
      <div v-for="r in feedbackRows.slice(0, 5)" :key="r.id" class="alert-row" @click="emit('open-report', r.id)">
        <span class="dot feedback"></span>
        <span class="name">{{ r.experimentName }}</span>
        <span class="time">{{ timeShort(r.submittedAt) }}</span>
      </div>
    </div>

    <div v-if="kpi.pendingCount > 0" class="alert-card pending">
      <div class="alert-head">⏳ تقارير بانتظار التصحيح</div>
      <div v-for="r in pendingRows.slice(0, 5)" :key="r.id" class="alert-row" @click="emit('open-report', r.id)">
        <span class="dot pending"></span>
        <span class="name">{{ r.experimentName }}</span>
        <span class="time">{{ timeShort(r.submittedAt) }}</span>
      </div>
    </div>

    <div v-if="overdue.length > 0" class="alert-card danger">
      <div class="alert-head">🚨 تقارير متأخرة</div>
      <div v-for="r in overdue.slice(0, 10)" :key="r.id" class="alert-row" @click="emit('open-report', r.id)">
        <span class="dot danger"></span>
        <span class="name">{{ r.experimentName }}</span>
        <span class="sub">{{ statusLabel(r.status) }}</span>
        <span class="time">{{ timeShort(r.submittedAt) }}</span>
      </div>
    </div>

    <div v-if="!kpi.newFeedback && !kpi.pendingCount && !overdue.length" class="all-good">
      ✅ لا توجد تنبيهات حالياً
    </div>
  </div>
</template>

<style scoped>
.alerts { display: flex; flex-direction: column; gap: 0.8rem; }
.alert-card { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 0.9rem; }
.alert-head { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: #e5e7eb; }
.alert-empty { font-size: 0.75rem; color: #64748b; padding: 0.3rem 0; }
.alert-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem; border-radius: 3px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.03); cursor: pointer; transition: background 0.12s; margin-bottom: 0.25rem; }
.alert-row:hover { background: rgba(99, 102, 241, 0.04); }
.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dot.feedback { background: #8b5cf6; }
.dot.pending { background: #f59e0b; }
.dot.danger { background: #f87171; }
.name { flex: 1; font-size: 0.78rem; font-weight: 600; color: #f1f5f9; }
.sub { font-size: 0.68rem; color: #94a3b8; }
.time { font-size: 0.65rem; color: #475569; }
.all-good { text-align: center; padding: 2rem; color: #34d399; background: #0f172a; border-radius: 6px; font-size: 0.9rem; }
</style>
