<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { SchoolClassBar, SchoolLinePoint } from '@/composables/school/useSchoolOverview'
import type { TeacherEvaluation, OutstandingStudent } from '@/services/school-reports.service'


defineProps<{
  classBarData: SchoolClassBar[]
  lineData: SchoolLinePoint[]
  linePoints: string
  gridLines: number[]
  recentUsers: { id: number; name: string; role: string; created_at?: string | null }[]
  teachers: TeacherEvaluation[]
  outstanding: OutstandingStudent[]
  formatDate: (d: string | null | undefined) => string
}>()
</script>

<template>
  <div class="analytics">
    <div class="sh-panel bar">
      <h3 class="sh-panel__title">الطلاب حسب الفصول</h3>
      <div v-if="classBarData.length" class="bar-chart">
        <div v-for="b in classBarData" :key="b.name" class="bar-group">
          <span class="bar-value">{{ b.count }}</span>
          <div class="bar-track">
            <div class="bar-fill" :style="{ height: b.percent + '%', background: b.color }"></div>
          </div>
          <span class="bar-name">{{ b.name }}</span>
        </div>
      </div>
      <p v-else class="sh-empty">لا توجد فصول</p>
    </div>

    <div class="sh-panel line">
      <h3 class="sh-panel__title">التقارير خلال آخر 7 أيام</h3>
      <svg v-if="lineData.length" class="line-chart" viewBox="0 0 280 100" preserveAspectRatio="none">
        <line v-for="(g, i) in gridLines" :key="i" x1="0" :y1="g" x2="280" :y2="g" stroke="var(--as-border)" stroke-width="0.5" />
        <polyline fill="none" :points="linePoints" stroke="var(--as-accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        <circle v-for="(p, i) in lineData" :key="i" :cx="p.x" :cy="p.y" r="3" fill="var(--as-accent)" />
        <text v-for="(p, i) in lineData" :key="'l'+i" :x="p.x" y="96" text-anchor="middle" fill="var(--as-text-muted)" font-size="8">{{ p.label }}</text>
      </svg>
      <p v-else class="sh-empty">لا توجد بيانات</p>
    </div>

    <div class="sh-panel users">
      <h3 class="sh-panel__title">آخر المستخدمين</h3>
      <table v-if="recentUsers.length" class="sh-table">
        <thead><tr><th>الاسم</th><th>الدور</th><th>التاريخ</th></tr></thead>
        <tbody>
          <tr v-for="u in recentUsers" :key="u.id"><td class="sh-table__name">{{ u.name }}</td><td><span class="sh-dot" :class="u.role"></span></td><td>{{ formatDate(u.created_at) }}</td></tr>
        </tbody>
      </table>
      <p v-else class="sh-empty">لا يوجد</p>
    </div>

    <div v-if="teachers.length" class="sh-panel teachers">
      <h3 class="sh-panel__title">تقييم المدرسين</h3>
      <div class="teacher-list">
        <div v-for="t in teachers" :key="t.id" class="teacher-row">
          <span class="teacher-name">{{ t.name }}</span>
          <span class="teacher-avg">{{ Math.round(t.avg_grade || 0) }}%</span>
          <div class="teacher-bar"><div class="teacher-bar-fill" :style="{ width: Math.round(t.avg_grade || 0) + '%' }"></div></div>
        </div>
      </div>
    </div>

    <div v-if="outstanding.length" class="sh-panel outstanding">
      <h3 class="sh-panel__title">🌟 طلاب متميزون</h3>
      <div class="out-list">
        <div v-for="(s, i) in outstanding" :key="`${s.name}-${i}`" class="out-row">
          <span class="out-name">{{ s.name }}</span>
          <span class="out-grade">{{ Math.round(s.avg_grade) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics { flex: 1; min-height: 0; display: grid; grid-template-columns: 1.2fr 1.2fr 0.9fr; gap: 16px; }
.sh-panel { background: var(--as-surface); border: 1px solid var(--as-border); border-radius: 14px; padding: 14px; display: flex; flex-direction: column; overflow: hidden; }
.sh-panel__title { margin: 0 0 12px; font-size: 13px; font-weight: 700; color: var(--as-text); }
.sh-empty { margin: auto; font-size: 12px; color: var(--as-text-muted); }
.bar-chart { flex: 1; min-height: 0; display: flex; align-items: flex-end; justify-content: space-around; gap: 8px; padding: 0 4px; }
.bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
.bar-value { font-size: 10px; color: var(--as-text-muted); }
.bar-track { width: 100%; max-width: 32px; height: 100px; background: var(--as-raised); border-radius: 6px 6px 0 0; display: flex; align-items: flex-end; overflow: hidden; }
.bar-fill { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.3s ease; }
.bar-name { font-size: 10px; color: var(--as-text-muted); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
.line-chart { flex: 1; min-height: 0; width: 100%; }
.sh-table { width: 100%; border-collapse: collapse; font-size: 11px; color: var(--as-text); }
.sh-table th { text-align: right; padding: 6px 4px; color: var(--as-text-muted); border-bottom: 1px solid var(--as-border); font-weight: 600; }
.sh-table td { padding: 8px 4px; border-bottom: 1px solid var(--as-border); }
.sh-table tbody tr { cursor: pointer; }
.sh-table tbody tr:hover { background: var(--as-raised); }
.sh-table__name { max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sh-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.sh-dot.teacher { background: var(--as-accent); }
.sh-dot.student { background: var(--as-success); }
.teacher-list, .out-list { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
.teacher-row, .out-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.teacher-name, .out-name { flex: 1; min-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--as-text); }
.teacher-avg, .out-grade { color: var(--as-accent); font-weight: 700; min-width: 36px; text-align: center; }
.teacher-bar { flex: 1; height: 6px; border-radius: 3px; background: var(--as-raised); overflow: hidden; }
.teacher-bar-fill { display: block; height: 100%; border-radius: 3px; background: var(--as-accent); }
.out-row { border-bottom: 1px solid var(--as-border); padding-bottom: 4px; }
@media (max-width: 1000px) { .analytics { grid-template-columns: 1fr; grid-template-rows: repeat(auto, minmax(0, 1fr)); overflow-y: auto; } }
</style>
