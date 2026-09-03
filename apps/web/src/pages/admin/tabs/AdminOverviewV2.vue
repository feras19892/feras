<template>
  <div class="dash-page aov">
    <SkeletonLoader v-if="store.loading || store.dashLoading" type="cards" :count="4" />
    <ErrorState v-else-if="store.errorMsg" :error="store.errorMsg" show-retry @retry="load" />
    <template v-else>
      <header class="aov-head">
        <div>
          <h1 class="aov-title">لوحة القيادة</h1>
          <p class="aov-sub">{{ today }}</p>
        </div>
        <button class="aov-refresh" title="تحديث" @click="load">↻</button>
      </header>

      <section class="aov-top">
        <div class="aov-hero" :class="heroClass">
          <div class="aov-hero__main">
            <div class="aov-hero__num">{{ attentionCount }}</div>
            <div class="aov-hero__label">{{ attentionCount ? 'عنصر يحتاج اهتمامك' : 'لا توجد مشاكل بارزة' }}</div>
          </div>
          <div v-if="attentionCount" class="aov-hero__tags">
            <span v-for="a in topAttention" :key="a.label" class="aov-hero__tag" :class="a.type">{{ a.label }}: {{ a.value }}</span>
          </div>
        </div>

        <div class="aov-today">
          <h3 class="aov-h3">نشاط اليوم</h3>
          <div class="aov-today__grid">
            <div class="aov-today__cell"><span class="aov-today__num">{{ h?.today?.logins ?? 0 }}</span><span class="aov-today__label">دخول</span></div>
            <div class="aov-today__cell"><span class="aov-today__num">{{ h?.today?.signups ?? 0 }}</span><span class="aov-today__label">جدد</span></div>
            <div class="aov-today__cell"><span class="aov-today__num">{{ h?.today?.reports ?? 0 }}</span><span class="aov-today__label">تقارير</span></div>
            <div class="aov-today__cell"><span class="aov-today__num">{{ t?.active_now ?? 0 }}</span><span class="aov-today__label">نشط</span></div>
            <div class="aov-today__cell"><span class="aov-today__num">{{ t?.sessions ?? 0 }}</span><span class="aov-today__label">جلسات</span></div>
            <div class="aov-today__cell" :class="store.systemStatus.cls"><span class="aov-today__num">{{ systemIcon }}</span><span class="aov-today__label">{{ store.systemStatus.label }}</span></div>
          </div>
        </div>
      </section>

      <section class="aov-status">
        <div v-for="s in statusBar" :key="s.label" class="aov-status__card" :class="s.type" @click="s.tab && goToTab(s.tab)">
          <div class="aov-status__num">{{ s.value }}</div>
          <div class="aov-status__label">{{ s.label }}</div>
        </div>
      </section>

      <section class="aov-kpis">
        <div v-for="c in kpiCards" :key="c.label" class="aov-kpi" :class="{ link: c.tab }" @click="c.tab && goToTab(c.tab)">
          <div class="aov-kpi__top">
            <span class="aov-kpi__icon" :style="{ background: c.color + '20', color: c.color }">{{ c.icon }}</span>
            <span class="aov-kpi__small">إجمالي</span>
          </div>
          <div class="aov-kpi__value" :style="{ color: c.color }">{{ c.value }}</div>
          <div class="aov-kpi__label">{{ c.label }}</div>
        </div>
      </section>

      <section v-if="attentionQueue.length" class="aov-attention">
        <h3 class="aov-h3">يحتاج إجراء</h3>
        <div class="aov-attention__list">
          <div v-for="a in attentionQueue" :key="a.label" class="aov-attention__row" @click="a.tab && goToTab(a.tab)">
            <span class="aov-attention__name">{{ a.label }}</span>
            <span class="aov-attention__num" :style="{ color: a.color }">{{ a.value }}</span>
            <div class="aov-attention__bar"><span :style="{ width: a.percent + '%', background: a.color }"></span></div>
          </div>
        </div>
      </section>

      <section class="aov-charts">
        <div class="aov-panel">
          <h3 class="aov-h3">النشاط 7 أيام</h3>
          <svg v-if="trendData.length" class="aov-line" viewBox="0 0 280 100" preserveAspectRatio="none">
            <line v-for="(g, i) in gridLines" :key="i" x1="0" :y1="g" x2="280" :y2="g" stroke="var(--as-border)" stroke-width="0.5" />
            <polyline fill="none" :points="linePoints" stroke="var(--as-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            <circle v-for="(p, i) in trendData" :key="i" :cx="p.x" :cy="p.y" r="3" fill="var(--as-accent)" />
            <text v-for="(p, i) in trendData" :key="'l'+i" :x="p.x" y="96" text-anchor="middle" fill="var(--as-text-muted)" font-size="8">{{ p.label }}</text>
          </svg>
          <p v-else class="aov-empty">لا توجد بيانات</p>
        </div>

        <div class="aov-panel">
          <h3 class="aov-h3">توزيع المستخدمين</h3>
          <div v-if="roleDistribution.length" class="aov-dist">
            <div v-for="r in roleDistribution" :key="r.role" class="aov-dist__row">
              <span class="aov-dist__label">{{ r.label }}</span>
              <div class="aov-dist__bar"><span :style="{ width: r.percent + '%', background: r.color }"></span></div>
              <span class="aov-dist__num">{{ r.count }}</span>
            </div>
          </div>
          <p v-else class="aov-empty">لا يوجد</p>
        </div>

        <div class="aov-panel">
          <h3 class="aov-h3">حالات التقارير</h3>
          <div v-if="reportStatus.length" class="aov-dist">
            <div v-for="r in reportStatus" :key="r.status" class="aov-dist__row">
              <span class="aov-dist__label">{{ r.label }}</span>
              <div class="aov-dist__bar"><span :style="{ width: r.percent + '%', background: r.color }"></span></div>
              <span class="aov-dist__num">{{ r.count }}</span>
            </div>
          </div>
          <p v-else class="aov-empty">لا يوجد</p>
        </div>

        <div class="aov-panel">
          <h3 class="aov-h3">صحة الفصول</h3>
          <div v-if="classHealth.length" class="aov-health">
            <div v-for="h in classHealth" :key="h.key" class="aov-health__item">
              <span class="aov-health__num" :style="{ color: h.color }">{{ h.value }}</span>
              <span class="aov-health__label">{{ h.label }}</span>
            </div>
          </div>
          <p v-else class="aov-empty">لا يوجد</p>
        </div>
      </section>

      <section class="aov-lists">
        <div class="aov-panel">
          <h3 class="aov-h3">أعلى المدارس</h3>
          <table v-if="topSchools.length" class="aov-table">
            <thead><tr><th>المدرسة</th><th>المستخدمون</th><th>التقارير</th></tr></thead>
            <tbody>
              <tr v-for="s in topSchools" :key="s.id" @click="goToTab('schools')">
                <td class="aov-table__name">{{ s.name }}</td>
                <td>{{ s.user_count }}</td>
                <td>{{ s.report_count }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="aov-empty">لا توجد</p>
        </div>

        <div class="aov-panel">
          <h3 class="aov-h3">أعلى الفصول</h3>
          <table v-if="topClasses.length" class="aov-table">
            <thead><tr><th>الفصل</th><th>طلاب</th><th>التقارير</th></tr></thead>
            <tbody>
              <tr v-for="c in topClasses" :key="c.id" @click="goToTab('classes')">
                <td class="aov-table__name">{{ c.name }}</td>
                <td>{{ c.student_count }}</td>
                <td>{{ c.report_count }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="aov-empty">لا توجد</p>
        </div>

        <div class="aov-panel aov-panel--wide">
          <h3 class="aov-h3">آخر الأحداث</h3>
          <div v-if="recentActivity.length" class="aov-activity">
            <div v-for="a in recentActivity.slice(0,8)" :key="(a.created_at || '') + a.action + a.actor_name" class="aov-activity__row">
              <span class="aov-activity__dot" :class="a.action"></span>
              <div class="aov-activity__info">
                <span class="aov-activity__actor">{{ a.actor_name }}<small v-if="a.actor_role">{{ a.actor_role }}</small></span>
                <span class="aov-activity__action">{{ actionLabel(a.action) }}</span>
              </div>
              <span class="aov-activity__time">{{ formatDate(a.created_at) }}</span>
            </div>
          </div>
          <p v-else class="aov-empty">لا يوجد</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { eventBus } from '@/composables/shared/useEventBus'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'

const store = useAdminStore()
const auth = useAuthStore()

const today = computed(() => new Date().toLocaleDateString('ar', { weekday: 'long', month: 'long', day: 'numeric' }))
const t = computed(() => store.detailed?.totals)
const h = computed(() => store.health)
const i = computed(() => store.insights)

const pendingReports = computed(() => t.value?.pending ?? 0)
const overdueReports = computed(() => t.value?.overdue ?? 0)
const ungradedCount = computed(() => i.value?.ungradedCount ?? 0)
const pendingUsers = computed(() => store.pendingUsers.length)
const approvalRequests = computed(() => store.requests.length)
const emptyClasses = computed(() => i.value?.emptyClasses?.length ?? 0)
const inactiveUsers = computed(() => i.value?.inactiveUsers?.length ?? 0)
const noReportsTeachers = computed(() => i.value?.noReportsTeachers?.length ?? 0)

const attentionItems = computed(() => [
  { label: 'تقارير متأخرة', value: overdueReports.value, type: 'danger', color: '#ef4444', tab: 'reports' },
  { label: 'تقارير معلّقة', value: pendingReports.value, type: 'warn', color: '#f59e0b', tab: 'reports' },
  { label: 'تقارير غير مصحّحة', value: ungradedCount.value, type: 'danger', color: '#f97316', tab: 'reports' },
  { label: 'فصول فارغة', value: emptyClasses.value, type: 'info', color: '#8b5cf6', tab: 'classes' },
  { label: 'مستخدمون غير نشطين', value: inactiveUsers.value, type: 'info', color: '#64748b', tab: 'users' },
  { label: 'مدرسون بدون تقارير', value: noReportsTeachers.value, type: 'warn', color: '#f59e0b', tab: 'users' },
  { label: 'طلبات موافقة', value: approvalRequests.value, type: 'info', color: '#3b82f6', tab: 'requests-approvals' },
  { label: 'مستخدمون معلّقون', value: pendingUsers.value, type: 'warn', color: '#f59e0b', tab: 'users' },
].filter(x => x.value > 0))

const attentionCount = computed(() => attentionItems.value.reduce((sum, x) => sum + x.value, 0))
const criticalCount = computed(() => attentionItems.value.filter(x => x.type === 'danger').length)
const topAttention = computed(() => attentionItems.value.slice(0, 4))
const heroClass = computed(() => criticalCount.value ? 'danger' : attentionItems.value.length ? 'warn' : 'ok')

const systemIcon = computed(() => ({ success: '✓', warning: '⚠', error: '✕' }[store.systemStatus.cls] || '?'))

const statusBar = computed(() => [
  { label: 'تقارير معلّقة', value: pendingReports.value, type: 'warn', tab: 'reports' },
  { label: 'متأخرة', value: overdueReports.value, type: 'danger', tab: 'reports' },
  { label: 'طلبات', value: approvalRequests.value, type: 'info', tab: 'requests-approvals' },
  { label: 'غير مفعّلين', value: pendingUsers.value, type: 'warn', tab: 'users' },
  { label: 'غير نشطين', value: inactiveUsers.value, type: 'info', tab: 'users' },
  { label: 'نشط الآن', value: t.value?.active_now ?? 0, type: 'success', tab: '' },
])

const kpiCards = computed(() => [
  { icon: '👥', label: 'المستخدمون', value: store.totalUsers, color: '#3b82f6', tab: 'users' },
  { icon: '🏫', label: 'المدارس', value: store.totalSchools, color: '#8b5cf6', tab: 'schools' },
  { icon: '📚', label: 'الفصول', value: t.value?.classes ?? 0, color: '#10b981', tab: 'classes' },
  { icon: '📝', label: 'التقارير', value: t.value?.reports ?? 0, color: '#f59e0b', tab: 'reports' },
  { icon: '🎯', label: 'متوسط العلامة', value: (t.value?.avg_grade ?? 0) + '%', color: '#06b6d4', tab: '' },
  { icon: '⚡', label: 'جلسات نشطة', value: t.value?.sessions ?? t.value?.active_now ?? 0, color: '#ef4444', tab: '' },
])

const attentionQueue = computed(() => {
  const max = Math.max(1, ...attentionItems.value.map(x => x.value))
  return attentionItems.value.map(x => ({ ...x, percent: Math.round((x.value / max) * 100) })).slice(0, 4)
})

const trendData = computed(() => {
  const counts: Record<string, number> = {}
  for (const d of store.detailed?.daily_activity ?? []) counts[d.date] = d.count
  const list: { label: string; count: number }[] = []
  for (let k = 6; k >= 0; k--) {
    const d = new Date()
    d.setDate(d.getDate() - k)
    const key = d.toISOString().split('T')[0]
    list.push({ label: d.toLocaleDateString('ar', { day: 'numeric' }), count: counts[key] || 0 })
  }
  const max = Math.max(1, ...list.map(x => x.count))
  const step = list.length > 1 ? 260 / (list.length - 1) : 0
  return list.map((d, i) => ({ label: d.label, x: 10 + i * step, y: 90 - (d.count / max) * 70 }))
})
const gridLines = [20, 40, 60, 80]
const linePoints = computed(() => trendData.value.map(p => `${p.x},${p.y}`).join(' '))

const roleLabels: Record<string, string> = { admin: 'أدمن', teacher: 'مدرس', student: 'طالب', school: 'مدرسة', parent: 'ولي أمر' }
const roleColors: Record<string, string> = { admin: '#ef4444', teacher: '#3b82f6', student: '#10b981', school: '#06b6d4', parent: '#f59e0b' }
const roleDistribution = computed(() => {
  const total = store.totalUsers || 1
  return (store.detailed?.users_by_role ?? []).map(r => ({
    role: r.role,
    label: roleLabels[r.role] || r.role,
    count: r.count,
    percent: Math.round((r.count / total) * 100),
    color: roleColors[r.role] || '#94a3b8',
  }))
})

const statusColors: Record<string, string> = { submitted: '#f59e0b', graded: '#10b981', pending: '#3b82f6', overdue: '#ef4444' }
const statusLabels: Record<string, string> = { submitted: 'مقدم', graded: 'مصحح', pending: 'معلق', overdue: 'متأخر' }
const reportStatus = computed(() => {
  const list = store.detailed?.reports_by_status ?? []
  const total = Math.max(1, t.value?.reports ?? 1)
  return list.map(s => ({ status: s.status, label: statusLabels[s.status] || s.status, count: s.count, percent: Math.round((s.count / total) * 100), color: statusColors[s.status] || '#94a3b8' }))
})

const classHealth = computed(() => {
  const ch = store.academic?.class_health
  if (!ch) return []
  return [
    { key: 'healthy', label: 'سليم', value: ch.healthy, color: '#10b981' },
    { key: 'warning', label: 'تحذير', value: ch.warning, color: '#f59e0b' },
    { key: 'critical', label: 'حرج', value: ch.critical, color: '#ef4444' },
    { key: 'inactive', label: 'غير نشط', value: ch.inactive, color: '#64748b' },
  ]
})

const topSchools = computed(() => (store.detailed?.top_schools ?? []).slice(0, 3))
const topClasses = computed(() => (store.detailed?.top_classes ?? []).slice(0, 3))
const recentActivity = computed(() => (store.recentActivityList ?? []).slice(0, 5))

const actionLabels: Record<string, string> = {
  login: 'تسجيل دخول', logout: 'تسجيل خروج', create_report: 'إنشاء تقرير', create_class: 'إنشاء فصل',
  join_class: 'انضمام', grade_report: 'تصحيح تقرير', signup: 'تسجيل جديد', impersonate: 'انتحال',
}
function actionLabel(action: string) { return actionLabels[action] || action }

function formatDate(d?: string | null) { return d ? new Date(d).toLocaleDateString('ar') : '—' }
function goToTab(tabId: string) { eventBus.emit('admin:switch-tab', { tabId }) }

async function load() {
  await store.fetchOverview()
  await store.loadDashboard()
  await store.fetchRequests()
}
onMounted(load)
</script>

<style scoped src="@/pages/admin/tabs/AdminOverviewV2.css"></style>
