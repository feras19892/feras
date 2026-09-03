<template>
  <div class="charts-row">
    <!-- Rate rings -->
    <div class="chart-panel">
      <h3 class="chart-title">المؤشرات الرئيسية</h3>
      <div v-if="hasData" class="rings">
        <div v-for="r in rates" :key="r.label" class="ring">
          <svg viewBox="0 0 36 36" class="ring__svg">
            <path class="ring__track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="ring__progress" :stroke="r.color" :stroke-dasharray="`${r.value}, 100`" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div class="ring__value" :style="{ color: r.color }">{{ r.value }}%</div>
          <div class="ring__label">{{ r.label }}</div>
        </div>
      </div>
      <p v-else class="empty">لا توجد بيانات</p>
    </div>

    <!-- Top schools -->
    <div class="chart-panel">
      <h3 class="chart-title">أعلى المدارس</h3>
      <div v-if="topSchools.length" class="mini-list">
        <div v-for="s in topSchools" :key="s.id" class="mini-row">
          <span class="dot" :style="{ background: s.color }"></span>
          <span class="mini-name">{{ s.name }}</span>
          <span class="mini-count">{{ s.count }}</span>
          <div class="mini-bar"><div class="mini-bar-fill" :style="{ width: s.percent + '%', background: s.color }"></div></div>
        </div>
      </div>
      <p v-else class="empty">لا توجد بيانات</p>
    </div>

    <!-- Top classes -->
    <div class="chart-panel">
      <h3 class="chart-title">أعلى الفصول</h3>
      <div v-if="topClasses.length" class="mini-list">
        <div v-for="c in topClasses" :key="c.id" class="mini-row">
          <span class="dot" :style="{ background: c.color }"></span>
          <span class="mini-name">{{ c.name }}</span>
          <span class="mini-count">{{ c.count }}</span>
          <div class="mini-bar"><div class="mini-bar-fill" :style="{ width: c.percent + '%', background: c.color }"></div></div>
        </div>
      </div>
      <p v-else class="empty">لا توجد بيانات</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import type { DetailedStats } from '@/types/admin-dashboard'


const store = useAdminStore()
const detailed = computed<DetailedStats | null>(() => store.detailed as unknown as DetailedStats | null)

const hasData = computed(() => !!detailed.value?.totals)

const rates = computed(() => {
  const t = detailed.value?.totals
  if (!t) return []
  return [
    { label: 'الإنجاز', value: Math.round((t.graded / (t.reports || 1)) * 100), color: '#10b981' },
    { label: 'التصحيح', value: Math.round((t.graded / ((t.graded + t.pending) || 1)) * 100), color: '#8b5cf6' },
    { label: 'النشاط', value: Math.round((t.active_users / (t.users || 1)) * 100), color: '#f59e0b' },
  ]
})

const topSchools = computed(() => {
  const list = detailed.value?.top_schools?.slice(0, 5) ?? []
  const max = Math.max(1, ...list.map(s => s.report_count))
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
  return list.map((s, i) => ({
    id: s.id,
    name: s.name,
    count: s.report_count,
    color: colors[i % colors.length],
    percent: Math.round((s.report_count / max) * 100),
  }))
})

const topClasses = computed(() => {
  const list = detailed.value?.top_classes?.slice(0, 5) ?? []
  const max = Math.max(1, ...list.map(c => c.report_count))
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444']
  return list.map((c, i) => ({
    id: c.id,
    name: c.name,
    count: c.report_count,
    color: colors[i % colors.length],
    percent: Math.round((c.report_count / max) * 100),
  }))
})
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 1.2rem; }
.chart-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.7rem; padding: 1rem; }
.chart-title { margin: 0 0 0.8rem; font-size: 0.9rem; font-weight: 700; color: #e2e8f0; }
.empty { padding: 2rem; text-align: center; color: #64748b; font-size: 0.85rem; }

.rings { display: flex; justify-content: space-around; gap: 12px; flex-wrap: wrap; }
.ring { display: flex; flex-direction: column; align-items: center; gap: 0.3rem; }
.ring__svg { width: 72px; height: 72px; }
.ring__track { fill: none; stroke: rgba(255,255,255,0.06); stroke-width: 3; }
.ring__progress { fill: none; stroke-width: 3; stroke-linecap: round; }
.ring__value { font-size: 0.9rem; font-weight: 800; }
.ring__label { font-size: 0.75rem; color: #94a3b8; }

.mini-list { display: flex; flex-direction: column; gap: 0.6rem; }
.mini-row { display: grid; grid-template-columns: 16px 1fr 40px 80px; align-items: center; gap: 8px; font-size: 0.85rem; color: #cbd5e1; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.mini-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.mini-count { text-align: end; font-weight: 700; }
.mini-bar { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
.mini-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
</style>
