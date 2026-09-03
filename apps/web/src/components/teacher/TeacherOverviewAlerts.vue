<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import type { Report } from '../../services/report.service'
import type { ClassRow } from '../../composables/teacher/useTeacherDashboard'


const props = defineProps<{
  unopened: Report[]
  overdue: Report[]
  classRows: ClassRow[]
  unreadChatCounts?: Record<string, number>
}>()

const emit = defineEmits<{
  (e: 'open-report', id: number): void
  (e: 'open-tab', tab: 'overview' | 'daily' | 'classes' | 'students'): void
  (e: 'open-chat', cls: { id: string; name: string }): void
}>()

const chatAlerts = computed(() => {
  if (!props.unreadChatCounts) return []
  return props.classRows
    .filter(c => (props.unreadChatCounts?.[c.id] || 0) > 0)
    .map(c => ({ id: c.id, name: c.name, count: props.unreadChatCounts![c.id] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

function timeShort(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-SA') + ' ' + d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
}

function daysSince(dateStr?: string): number {
  if (!dateStr) return 0
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}
</script>

<template>
  <div class="alerts">
    <div v-if="unopened.length > 0" class="alert-card info">
      <div class="alert-head">📬 تقارير جديدة غير مفتوحة</div>
      <div v-for="r in unopened.slice(0, 5)" :key="r.id" class="alert-row" @click="emit('open-report', r.id)">
        <span class="dot info"></span>
        <div class="info-col">
          <span class="name">{{ r.student_name }}</span>
          <span class="sub">{{ r.experiment_name }}</span>
        </div>
        <span class="time">{{ timeShort(r.submitted_at) }}</span>
      </div>
      <button v-if="unopened.length > 5" class="pc-more" @click="emit('open-tab', 'daily')">عرض الكل</button>
    </div>

    <div v-if="overdue.length > 0" class="alert-card danger">
      <div class="alert-head">🚨 تقارير متأخرة</div>
      <div v-for="r in overdue.slice(0, 5)" :key="r.id" class="alert-row" @click="emit('open-report', r.id)">
        <span class="dot danger"></span>
        <div class="info-col">
          <span class="name">{{ r.student_name }}</span>
          <span class="sub">{{ r.experiment_name }}</span>
        </div>
        <span class="days">{{ daysSince(r.submitted_at) }} يوم</span>
      </div>
      <button v-if="overdue.length > 5" class="pc-more" @click="emit('open-tab', 'daily')">عرض الكل</button>
    </div>

    <div v-if="chatAlerts.length > 0" class="alert-card chat">
      <div class="alert-head">💬 رسائل محادثة جديدة</div>
      <div v-for="c in chatAlerts" :key="c.id" class="alert-row" @click="emit('open-chat', { id: c.id, name: c.name })">
        <span class="dot chat"></span>
        <span class="name">{{ c.name }}</span>
        <span class="count">{{ c.count }}</span>
      </div>
    </div>

    <div v-if="!unopened.length && !overdue.length && !chatAlerts.length" class="all-good">
      ✅ لا توجد تنبيهات حالياً
    </div>
  </div>
</template>

<style scoped>
.alerts { display: flex; flex-direction: column; gap: 0.8rem; }
.alert-card { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 6px; padding: 0.9rem; }
.alert-head { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; color: #e5e7eb; }
.alert-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.5rem; border-radius: 3px; background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.03); cursor: pointer; transition: background 0.12s; margin-bottom: 0.25rem; }
.alert-row:hover { background: rgba(99, 102, 241, 0.04); }
.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dot.info { background: #3b82f6; }
.dot.danger { background: #f87171; }
.dot.chat { background: #8b5cf6; }
.info-col { display: flex; flex-direction: column; flex: 1; }
.name { font-size: 0.78rem; font-weight: 600; color: #f1f5f9; }
.sub { font-size: 0.65rem; color: #64748b; }
.time { font-size: 0.65rem; color: #475569; }
.days { font-size: 0.68rem; font-weight: 600; color: #f87171; }
.count { font-size: 0.7rem; padding: 0.05rem 0.4rem; background: rgba(139, 92, 246, 0.12); border-radius: 999px; color: #a5b4fc; font-weight: 700; }
.pc-more { margin-top: 0.25rem; padding: 0.25rem; border: 1px solid rgba(99, 102, 241, 0.12); border-radius: 3px; background: transparent; color: #a5b4fc; font-size: 0.7rem; font-weight: 600; cursor: pointer; font-family: inherit; }
.pc-more:hover { background: rgba(99, 102, 241, 0.06); }
.all-good { text-align: center; padding: 2rem; color: #34d399; background: #0f172a; border-radius: 6px; font-size: 0.9rem; }
</style>
