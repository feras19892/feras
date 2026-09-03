<template>
  <div>
    <div class="metrics-header">
      <h2 class="panel__title">📈 مقاييس مباشرة</h2>
      <div class="metrics-controls">
        <label class="toggle">
          <input v-model="autoRefresh" type="checkbox" />
          <span>تحديث تلقائي</span>
        </label>
        <span class="last-updated">آخر تحديث: {{ lastUpdatedText }}</span>
        <button class="btn-refresh" @click="refresh">🔄</button>
      </div>
    </div>

    <SkeletonLoader v-if="dashLoading" type="cards" :count="6" />
    <ErrorState v-else-if="errorMsg" :error="errorMsg" show-retry @retry="refresh" />

    <template v-else>
      <!-- KPI Cards -->
      <div class="metric-cards">
        <div v-for="card in cards" :key="card.label" class="metric-card" :style="{ borderTopColor: card.color }">
          <div class="metric-card__value" :style="{ color: card.color }">{{ card.value }}</div>
          <div class="metric-card__label">{{ card.label }}</div>
        </div>
      </div>

      <div class="charts-row">
        <!-- Daily activity line chart -->
        <div class="chart-panel">
          <h3 class="chart-title">نشاط آخر {{ dailyActivity.length }} أيام</h3>
          <svg v-if="dailyActivity.length" class="line-chart" viewBox="0 0 280 100" preserveAspectRatio="none">
            <line v-for="(g, i) in gridLines" :key="'g'+i" x1="0" :y1="g" x2="280" :y2="g" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" />
            <polyline fill="none" :points="linePoints" stroke="#22d3ee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <circle v-for="(p, i) in dailyPoints" :key="'c'+i" :cx="p.x" :cy="p.y" r="3" fill="#22d3ee" />
            <text v-for="(p, i) in dailyPoints" :key="'l'+i" :x="p.x" y="96" text-anchor="middle" fill="#94a3b8" font-size="8">{{ p.label }}</text>
          </svg>
          <p v-else class="empty">لا توجد بيانات</p>
        </div>

        <!-- Hourly activity bar chart -->
        <div class="chart-panel">
          <h3 class="chart-title">نشاط الساعات</h3>
          <div v-if="hourlyBars.length" class="bar-chart">
            <div v-for="(b, i) in hourlyBars" :key="i" class="bar-group" :title="`${b.label}: ${b.count}`">
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: b.percent + '%' }"></div>
              </div>
              <span class="bar-label">{{ b.label }}</span>
            </div>
          </div>
          <p v-else class="empty">لا توجد بيانات</p>
        </div>
      </div>

      <div class="charts-row">
        <!-- Users by role -->
        <div class="chart-panel">
          <h3 class="chart-title">توزيع المستخدمين</h3>
          <div v-if="usersByRole.length" class="mini-list">
            <div v-for="item in usersByRole" :key="item.role" class="mini-row">
              <span class="dot" :style="{ background: item.color }"></span>
              <span>{{ item.label }}</span>
              <span class="mini-count">{{ item.count }}</span>
              <div class="mini-bar"><div class="mini-bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div></div>
            </div>
          </div>
          <p v-else class="empty">لا توجد بيانات</p>
        </div>

        <!-- Reports by status -->
        <div class="chart-panel">
          <h3 class="chart-title">التقارير حسب الحالة</h3>
          <div v-if="reportsByStatus.length" class="mini-list">
            <div v-for="item in reportsByStatus" :key="item.status" class="mini-row">
              <span class="dot" :style="{ background: item.color }"></span>
              <span>{{ item.label }}</span>
              <span class="mini-count">{{ item.count }}</span>
              <div class="mini-bar"><div class="mini-bar-fill" :style="{ width: item.percent + '%', background: item.color }"></div></div>
            </div>
          </div>
          <p v-else class="empty">لا توجد بيانات</p>
        </div>
      </div>

      <SystemMetricsExtra />
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import type { DetailedStats } from '@/types/admin-dashboard'
import SystemMetricsExtra from './SystemMetricsExtra.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'


const store = useAdminStore()
const autoRefresh = ref(true)
const lastUpdated = ref<Date | null>(null)
const detailed = computed<DetailedStats | null>(() => store.detailed as unknown as DetailedStats | null)

const dashLoading = computed(() => store.dashLoading)
const errorMsg = computed(() => store.errorMsg)

function formatSize(bytes: number) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const cards = computed(() => [
  { label: 'المستخدمون', value: detailed.value?.totals?.users ?? 0, color: '#3b82f6' },
  { label: 'الفصول', value: detailed.value?.totals?.classes ?? 0, color: '#10b981' },
  { label: 'التقارير', value: detailed.value?.totals?.reports ?? 0, color: '#f59e0b' },
  { label: 'معلّق', value: detailed.value?.totals?.pending ?? 0, color: '#ef4444' },
  { label: 'متوسط العلامة', value: Math.round(detailed.value?.totals?.avg_grade ?? 0) + '%', color: '#8b5cf6' },
  { label: 'دخول اليوم', value: detailed.value?.totals?.today_logins ?? 0, color: '#06b6d4' },
  { label: 'جلسات نشطة', value: detailed.value?.totals?.active_now ?? 0, color: '#f97316' },
  { label: 'قاعدة البيانات', value: formatSize(store.health?.dbSize ?? 0), color: '#6366f1' },
])

const dailyActivity = computed(() => (detailed.value?.daily_activity ?? []).slice(-7))
const maxDaily = computed(() => Math.max(1, ...dailyActivity.value.map(d => d.count)))
const dailyPoints = computed(() => {
  const n = dailyActivity.value.length
  const step = n > 1 ? 260 / (n - 1) : 0
  return dailyActivity.value.map((d, i) => ({
    x: n === 1 ? 140 : 10 + i * step,
    y: 90 - (d.count / maxDaily.value) * 70,
    label: new Date(d.date).toLocaleDateString('ar', { day: 'numeric' }),
  }))
})
const linePoints = computed(() => dailyPoints.value.map(p => `${p.x},${p.y}`).join(' '))
const gridLines = [20, 40, 60, 80]

const hourlyBars = computed(() => {
  const list = (detailed.value?.hourly_activity ?? []).slice(-24)
  const max = Math.max(1, ...list.map(h => h.count))
  return list.map(h => ({
    label: h.hour,
    count: h.count,
    percent: Math.round((h.count / max) * 100),
  }))
})

const usersByRole = computed(() => {
  const list = detailed.value?.users_by_role ?? []
  const max = Math.max(1, ...list.map(u => u.count))
  const colors: Record<string, string> = { admin: '#ef4444', teacher: '#3b82f6', student: '#10b981', school: '#06b6d4', parent: '#f59e0b' }
  const labels: Record<string, string> = { admin: 'أدمن', teacher: 'مدرس', student: 'طالب', school: 'مدرسة', parent: 'ولي أمر' }
  return list.map(u => ({
    role: u.role,
    label: labels[u.role] || u.role,
    count: u.count,
    color: colors[u.role] || '#94a3b8',
    percent: Math.round((u.count / max) * 100),
  }))
})

const reportsByStatus = computed(() => {
  const list = detailed.value?.reports_by_status ?? []
  const max = Math.max(1, ...list.map(r => r.count))
  const colors: Record<string, string> = { graded: '#10b981', submitted: '#f59e0b', resubmitted: '#ef4444', draft: '#64748b' }
  const labels: Record<string, string> = { graded: 'مصحّح', submitted: 'معلّق', resubmitted: 'معاد', draft: 'مسودة' }
  return list.map(r => ({
    status: r.status,
    label: labels[r.status] || r.status,
    count: r.count,
    color: colors[r.status] || '#94a3b8',
    percent: Math.round((r.count / max) * 100),
  }))
})

const lastUpdatedText = computed(() => lastUpdated.value ? lastUpdated.value.toLocaleTimeString('ar') : '—')

async function refresh() {
  await store.loadDashboard(true)
  lastUpdated.value = new Date()
}

let timer: ReturnType<typeof setInterval> | null = null

function startTimer() {
  stopTimer()
  timer = setInterval(() => { if (autoRefresh.value) refresh() }, 30000)
}

function stopTimer() { if (timer) clearInterval(timer); timer = null }

onMounted(async () => {
  await refresh()
  startTimer()
})

onUnmounted(() => stopTimer())
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.metrics-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 1rem; }
.metrics-controls { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.toggle { display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 0.85rem; cursor: pointer; }
.toggle input { accent-color: #6366f1; }
.last-updated { color: #64748b; font-size: 0.8rem; }
.btn-refresh { padding: 6px 12px; border: none; border-radius: 6px; background: rgba(99,102,241,0.15); color: #a5b4fc; cursor: pointer; font-family: inherit; }
.btn-refresh:hover { background: rgba(99,102,241,0.25); }

.metric-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 1.2rem; }
.metric-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; text-align: center; border-top: 3px solid transparent; }
.metric-card__value { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.3rem; }
.metric-card__label { font-size: 0.75rem; color: #94a3b8; }

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 1.2rem; }
.chart-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; }
.chart-title { margin: 0 0 0.8rem; font-size: 0.9rem; font-weight: 700; color: #e2e8f0; }
.empty { padding: 2rem; text-align: center; color: #64748b; font-size: 0.85rem; }

.line-chart { width: 100%; height: 120px; }

.bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 120px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bar-track { width: 100%; flex: 1; background: rgba(255,255,255,0.04); border-radius: 4px; position: relative; overflow: hidden; }
.bar-fill { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, #6366f1, #22d3ee); border-radius: 4px; transition: height 0.4s; }
.bar-label { font-size: 0.6rem; color: #64748b; transform: rotate(-45deg); transform-origin: top left; }

.mini-list { display: flex; flex-direction: column; gap: 0.6rem; }
.mini-row { display: grid; grid-template-columns: 16px 80px 40px 1fr; align-items: center; gap: 8px; font-size: 0.85rem; color: #cbd5e1; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.mini-count { text-align: end; font-weight: 700; }
.mini-bar { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
.mini-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
</style>
