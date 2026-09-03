<template>
  <div class="student-home">
    <SkeletonLoader v-if="loading" type="cards" :count="4" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <template v-else>
      <header class="th-header">
        <div>
          <h1 class="th-title">نظرة عامة</h1>
          <p class="th-sub">{{ studentName }} · {{ today }}</p>
        </div>
        <div class="th-badges">
          <button class="th-badge" @click="goToTab('notifications')">
            <span>🔔</span>
            <span v-if="unreadNotif" class="th-count">{{ unreadNotif }}</span>
          </button>
          <button class="th-badge" @click="goToTab('chat')">
            <span>💬</span>
            <span v-if="unreadChat" class="th-count">{{ unreadChat }}</span>
          </button>
        </div>
      </header>

      <section class="th-stats">
        <div v-for="c in cards" :key="c.label" class="th-card" :style="{ borderInlineStartColor: c.color }">
          <div class="th-card__top">
            <div class="th-card__icon" :style="{ background: c.color + '22', color: c.color }">{{ c.icon }}</div>
            <span class="th-card__total">{{ c.totalLabel }}</span>
          </div>
          <div class="th-card__bottom">
            <div>
              <div class="th-card__value" :style="{ color: c.color }">{{ c.value }}</div>
              <div class="th-card__label">{{ c.label }}</div>
            </div>
            <button v-if="c.tab" class="th-card__view" :style="{ color: c.color }" @click="goToTab(c.tab)">عرض</button>
          </div>
        </div>
      </section>

      <section class="th-analytics">
        <div class="th-panel">
          <h3 class="th-panel__title">درجات آخر التقارير</h3>
          <div v-if="reportBarData.length" class="bar-chart">
            <div v-for="b in reportBarData" :key="b.name" class="bar-group">
              <span class="bar-value">{{ b.grade }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: b.percent + '%', background: b.color }"></div>
              </div>
              <span class="bar-name">{{ b.name }}</span>
            </div>
          </div>
          <p v-else class="th-empty">لا توجد تقارير مصحّحة</p>
        </div>

        <div class="th-panel">
          <h3 class="th-panel__title">التقارير خلال آخر 7 أيام</h3>
          <svg v-if="lineData.length" class="line-chart" viewBox="0 0 280 100" preserveAspectRatio="none">
            <line v-for="(g, i) in gridLines" :key="i" x1="0" :y1="g" x2="280" :y2="g" stroke="var(--as-border)" stroke-width="0.5" />
            <polyline fill="none" :points="linePoints" stroke="var(--as-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <circle v-for="(p, i) in lineData" :key="i" :cx="p.x" :cy="p.y" r="3" fill="var(--as-accent)" />
            <text v-for="(p, i) in lineData" :key="'l'+i" :x="p.x" y="96" text-anchor="middle" fill="var(--as-text-muted)" font-size="8">{{ p.label }}</text>
          </svg>
          <p v-else class="th-empty">لا توجد بيانات</p>
        </div>

        <div class="th-panel">
          <h3 class="th-panel__title">آخر التقارير</h3>
          <table v-if="lastReports.length" class="th-table">
            <thead>
              <tr>
                <th>التجربة</th>
                <th>الحالة</th>
                <th>الدرجة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in lastReports" :key="r.id">
                <td class="th-table__exp">{{ r.experiment_name }}</td>
                <td><span class="th-dot" :class="r.status"></span></td>
                <td class="th-table__grade">{{ r.grade ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="th-empty">لا توجد تقارير</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useStudentStore } from '@/stores/student.store'
import { eventBus } from '@/composables/shared/useEventBus'
import ErrorState from '@/components/shared/ErrorState.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import { getStudentStats } from '@/services/core/student.api'
import { getUnreadCount } from '@/services/notification.service'
import { getUnreadChatCounts } from '@/services/chat.service'
import { getComplaintStats, type ComplaintStats } from '@/services/complaint.service'
import { getRatingStats, type RatingStats } from '@/services/enhancements.service'
import { getAvailableQuizzes, getStudentQuizStats, type QuizStats, type Quiz } from '@/services/quiz.service'
import type { Report } from '@/services/report.service'


const store = useStudentStore()
const auth = useAuthStore()
let isMounted = true
const loading = ref(false)
const error = ref('')
const statsData = ref<{ total: number; graded: number; pending: number; average: number } | null>(null)
const quizzes = ref<Quiz[]>([])
const quizStats = ref<QuizStats | null>(null)
const unreadNotif = ref(0)
const unreadChat = ref(0)
const complaintStats = ref<ComplaintStats | null>(null)
const ratingStats = ref<RatingStats | null>(null)

const studentName = computed(() => auth.user?.name || 'طالب')
const today = ref(new Date().toLocaleDateString('ar', { weekday: 'long', month: 'long', day: 'numeric' }))

const totalUnread = computed(() => unreadNotif.value + unreadChat.value)
const quizPassRate = computed(() => {
  if (quizStats.value && quizStats.value.totalSubmissions > 0) {
    return Math.round((quizStats.value.passedCount / quizStats.value.totalSubmissions) * 100) + '%'
  }
  const attempted = quizzes.value.filter((q: any) => q.score !== undefined && q.score !== null)
  const passed = attempted.filter((q: any) => Number(q.max_score) > 0 && Number(q.score) >= Number(q.max_score) / 2).length
  return attempted.length ? Math.round((passed / attempted.length) * 100) + '%' : '0%'
})
const quizAvg = computed(() => Math.round(quizStats.value?.avgScore ?? 0))
const reportAvg = computed(() => Math.round(statsData.value?.average ?? 0))

const cards = computed(() => [
  { icon: '📚', value: store.totalClasses, totalLabel: 'الإجمالي', label: 'فصولي', color: 'var(--as-accent)', tab: 'my-classes' },
  { icon: '📄', value: statsData.value?.total ?? 0, totalLabel: 'الإجمالي', label: 'تقاريري', color: 'var(--as-success)', tab: 'my-reports' },
  { icon: '✅', value: statsData.value?.graded ?? 0, totalLabel: 'الإجمالي', label: 'مصحّح', color: 'var(--as-success)', tab: 'my-reports' },
  { icon: '📝', value: statsData.value?.pending ?? 0, totalLabel: 'قيد الانتظار', label: 'معلّق', color: 'var(--as-warning)', tab: 'my-reports' },
  { icon: '🧮', value: reportAvg.value, totalLabel: 'المعدل', label: 'متوسط التقارير', color: 'var(--as-info)', tab: 'my-reports' },
  { icon: '🎯', value: quizAvg.value, totalLabel: 'المعدل', label: 'متوسط الامتحانات', color: 'var(--as-danger)', tab: 'quizzes' },
  { icon: '⚡', value: quizPassRate.value, totalLabel: 'النسبة', label: 'نسبة النجاح', color: 'var(--as-warning)', tab: 'quizzes' },
  { icon: '🔔', value: totalUnread.value, totalLabel: 'غير مقروء', label: 'إشعارات ودردشة', color: 'var(--as-info)', tab: 'notifications' },
  { icon: '⭐', value: Math.round((ratingStats.value?.receivedAvg ?? 0) / 5 * 100), totalLabel: 'نسبة', label: 'التقييمات', color: 'var(--as-warning)', tab: 'complaints' },
])

const barColors = ['var(--as-accent)', 'var(--as-success)', 'var(--as-warning)', 'var(--as-danger)', 'var(--as-info)', 'var(--as-accent-hover)']
const reportBarData = computed(() => {
  const graded = store.reports.filter((r: Report) => r.status === 'graded' && typeof r.grade === 'number')
    .sort((a, b) => new Date((b.submitted_at || b.created_at || 0)).getTime() - new Date((a.submitted_at || a.created_at || 0)).getTime())
    .slice(0, 6)
  return graded.map((r, i) => ({
    name: r.experiment_name,
    grade: r.grade ?? 0,
    percent: Math.min(100, Math.round(r.grade ?? 0)),
    color: barColors[i % barColors.length],
  }))
})

const lineData = computed(() => {
  const counts: Record<string, number> = {}
  for (const r of store.reports) {
    const key = (r.submitted_at || r.created_at || '').slice(0, 10)
    if (key) counts[key] = (counts[key] || 0) + 1
  }
  const days: { label: string; x: number; y: number }[] = []
  const list: { label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('ar', { day: 'numeric' })
    list.push({ label, count: counts[key] || 0 })
  }
  const max = Math.max(1, ...list.map(x => x.count))
  const step = list.length > 1 ? 260 / (list.length - 1) : 0
  list.forEach((d, i) => {
    days.push({ label: d.label, x: 10 + i * step, y: 90 - (d.count / max) * 70 })
  })
  return days
})

const linePoints = computed(() => lineData.value.map(p => `${p.x},${p.y}`).join(' '))
const gridLines = [20, 45, 70]

const lastReports = computed(() =>
  [...store.reports]
    .filter((r: Report) => r.submitted_at || r.created_at)
    .sort((a, b) => new Date((b.submitted_at || b.created_at || 0)).getTime() - new Date((a.submitted_at || a.created_at || 0)).getTime())
    .slice(0, 4)
    .map(r => ({ id: r.id, experiment_name: r.experiment_name, status: r.status, grade: r.grade ?? null }))
)

function goToTab(tabId: string) { eventBus.emit('student:switch-tab', { tabId }) }

async function load() {
  loading.value = true
  error.value = ''
  try {
    await store.refreshAll()
    if (!isMounted) return
    error.value = store.error ?? ''
    const [statsRes, quizRes, quizStatsRes, notifRes, chatRes, complaintRes, ratingRes] = await Promise.allSettled([
      auth.user?.id != null ? getStudentStats(auth.user.id) : Promise.resolve(null),
      getAvailableQuizzes(),
      getStudentQuizStats(),
      getUnreadCount(),
      getUnreadChatCounts(),
      getComplaintStats(),
      getRatingStats(),
    ])
    if (statsRes.status === 'fulfilled' && statsRes.value?.success) statsData.value = statsRes.value.stats
    if (quizRes.status === 'fulfilled' && quizRes.value.success) quizzes.value = quizRes.value.quizzes || []
    if (quizStatsRes.status === 'fulfilled' && quizStatsRes.value.success) quizStats.value = quizStatsRes.value.stats
    if (notifRes.status === 'fulfilled' && notifRes.value.success) unreadNotif.value = notifRes.value.count
    if (chatRes.status === 'fulfilled' && chatRes.value.success) unreadChat.value = Object.values(chatRes.value.counts).reduce((a, b) => a + b, 0)
    if (complaintRes.status === 'fulfilled' && complaintRes.value.success) complaintStats.value = complaintRes.value.stats
    if (ratingRes.status === 'fulfilled' && ratingRes.value.success) ratingStats.value = ratingRes.value.stats
  } catch (e: any) { error.value = e?.message || 'فشل التحميل' }
  finally { if (isMounted) loading.value = false }
}

onMounted(() => {
  isMounted = true
  load()
  eventBus.on('report:graded', load)
  eventBus.on('report:submitted', load)
})

onUnmounted(() => {
  isMounted = false
  eventBus.off('report:graded', load)
  eventBus.off('report:submitted', load)
})
</script>

<style scoped>
.student-home { height: 100%; width: 100%; max-width: none !important; display: flex; flex-direction: column; gap: 18px; overflow: hidden; }
.th-header { display: flex; justify-content: space-between; align-items: center; padding: 0 4px; flex-shrink: 0; }
.th-title { margin: 0; font-size: 20px; font-weight: 800; color: var(--as-text); }
.th-sub { margin: 4px 0 0; font-size: 13px; color: var(--as-text-muted); }
.th-badges { display: flex; gap: 8px; }
.th-badge { position: relative; width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--as-border); background: var(--as-raised); color: var(--as-text); cursor: pointer; display: flex; align-items: center; justify-content: center; }
.th-count { position: absolute; top: -4px; right: -4px; min-width: 16px; height: 16px; border-radius: 999px; background: var(--as-danger); color: #fff; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.th-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-template-rows: repeat(2, minmax(0, 1fr)); gap: 16px; flex-shrink: 0; }
.th-card { background: var(--as-surface); border: 1px solid var(--as-border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; justify-content: space-between; border-inline-start: 4px solid var(--as-accent); overflow: hidden; }
.th-card__top { display: flex; justify-content: space-between; align-items: flex-start; }
.th-card__icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.th-card__total { font-size: 11px; color: var(--as-text-muted); }
.th-card__bottom { display: flex; justify-content: space-between; align-items: flex-end; gap: 8px; }
.th-card__value { font-size: 24px; font-weight: 800; line-height: 1; }
.th-card__label { font-size: 12px; color: var(--as-text-muted); }
.th-card__view { background: transparent; border: none; font-size: 11px; cursor: pointer; padding: 0; }
.th-card__view:hover { text-decoration: underline; }
.th-analytics { flex: 1; min-height: 0; display: grid; grid-template-columns: 1.2fr 1.2fr 0.9fr; gap: 16px; }
.th-panel { background: var(--as-surface); border: 1px solid var(--as-border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; overflow: hidden; }
.th-panel__title { margin: 0 0 12px; font-size: 13px; font-weight: 700; color: var(--as-text); }
.th-empty { margin: auto; font-size: 12px; color: var(--as-text-muted); }
.bar-chart { flex: 1; min-height: 0; display: flex; align-items: flex-end; justify-content: space-around; gap: 8px; padding: 0 4px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
.bar-value { font-size: 10px; color: var(--as-text-muted); }
.bar-track { width: 100%; max-width: 32px; height: 100px; background: var(--as-raised); border-radius: 6px 6px 0 0; display: flex; align-items: flex-end; overflow: hidden; }
.bar-fill { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.3s ease; }
.bar-name { font-size: 10px; color: var(--as-text-muted); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
.line-chart { flex: 1; min-height: 0; width: 100%; }
.th-table { width: 100%; border-collapse: collapse; font-size: 11px; color: var(--as-text); }
.th-table th { text-align: right; padding: 6px 4px; color: var(--as-text-muted); border-bottom: 1px solid var(--as-border); font-weight: 600; }
.th-table td { padding: 8px 4px; border-bottom: 1px solid var(--as-border); }
.th-table tbody tr { cursor: pointer; }
.th-table tbody tr:hover { background: var(--as-raised); }
.th-table__exp { max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.th-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.th-dot.submitted { background: var(--as-warning); }
.th-dot.graded { background: var(--as-success); }
.th-dot.draft { background: var(--as-text-muted); }
.th-dot.resubmitted { background: var(--as-accent); }
.th-table__grade { color: var(--as-success); font-weight: 700; text-align: center; }
@media (max-width: 1000px) { .th-stats { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(4, minmax(0, 1fr)); } .th-analytics { grid-template-columns: 1fr; grid-template-rows: repeat(3, minmax(0, 1fr)); overflow-y: auto; } }
</style>
