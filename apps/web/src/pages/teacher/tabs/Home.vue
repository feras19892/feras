<template>
  <div class="teacher-home">
    <SkeletonLoader v-if="store.loading" type="cards" :count="4" />
    <ErrorState v-else-if="store.error" :error="store.error" show-retry @retry="load" />
    <template v-else>
      <header class="th-header">
        <div>
          <h1 class="th-title">نظرة عامة</h1>
          <p class="th-sub">{{ teacherName }} · {{ today }}</p>
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
          <h3 class="th-panel__title">الطلاب حسب الفصول</h3>
          <div v-if="classBarData.length" class="bar-chart">
            <div v-for="b in classBarData" :key="b.name" class="bar-group">
              <span class="bar-value">{{ b.count }}</span>
              <div class="bar-track">
                <div class="bar-fill" :style="{ height: b.percent + '%', background: b.color }"></div>
              </div>
              <span class="bar-name">{{ b.name }}</span>
            </div>
          </div>
          <p v-else class="th-empty">لا توجد فصول</p>
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
                <th>الطالب</th>
                <th>التجربة</th>
                <th>الحالة</th>
                <th>الدرجة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in lastReports" :key="r.id" @click="goToTab('grading')">
                <td class="th-table__name">{{ r.student_name || 'طالب' }}</td>
                <td class="th-table__exp">{{ r.experiment_name }}</td>
                <td><span class="th-dot" :class="r.status"></span></td>
                <td class="th-table__grade">{{ r.grade ?? '-' }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="th-empty">لا توجد تقارير</p>
        </div>

        <div class="th-panel" v-if="atRiskStudents.length">
          <h3 class="th-panel__title">⚠️ طلاب معرّضون للخطر</h3>
          <div class="at-risk-list">
            <div v-for="(s, i) in atRiskStudents" :key="`${s.name}-${i}`" class="at-risk-row">
              <span class="at-risk-name">{{ s.name }}</span>
              <span class="at-risk-grade">{{ s.avg }}%</span>
              <span class="at-risk-bar">
                <span class="at-risk-bar-fill" :style="{ width: s.avg + '%' }"></span>
              </span>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { useTeacherHome } from '@/composables/teacher/useTeacherHome'
import ErrorState from '@/components/shared/ErrorState.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'


const {
  store, teacherName, today, unreadNotif, unreadChat,
  cards, classBarData, lineData, gridLines, linePoints, lastReports, atRiskStudents,
  goToTab, load,
} = useTeacherHome()
</script>

<style scoped>
.teacher-home { height: 100%; width: 100%; max-width: none !important; display: flex; flex-direction: column; gap: 18px; overflow: hidden; }
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
.th-table__name, .th-table__exp { max-width: 70px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.th-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.th-dot.submitted { background: var(--as-warning); }
.th-dot.graded { background: var(--as-success); }
.th-dot.draft { background: var(--as-text-muted); }
.th-dot.resubmitted { background: var(--as-accent); }
.th-table__grade { color: var(--as-success); font-weight: 700; text-align: center; }
@media (max-width: 1000px) { .th-stats { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(4, minmax(0, 1fr)); } .th-analytics { grid-template-columns: 1fr; grid-template-rows: repeat(3, minmax(0, 1fr)); overflow-y: auto; } }
.at-risk-list { display: flex; flex-direction: column; gap: 8px; }
.at-risk-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.at-risk-name { min-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--as-text); }
.at-risk-grade { color: var(--as-danger, #ef4444); font-weight: 700; min-width: 36px; text-align: center; }
.at-risk-bar { flex: 1; height: 6px; border-radius: 3px; background: var(--as-raised, rgba(255,255,255,0.05)); overflow: hidden; }
.at-risk-bar-fill { display: block; height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--as-danger, #ef4444), var(--as-warning, #f59e0b)); }
</style>
