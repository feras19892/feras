<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDetailedStats, getAcademicTracking, getAdminDetailedReports } from '../../services/admin.service';

const loading = ref(false);
const error = ref('');
const activeSection = ref<'overview' | 'academic' | 'daily'>('overview');
const selectedPeriod = ref<'today' | 'week' | 'month' | 'year' | 'all'>('today');
const selectedDate = ref(new Date().toISOString().slice(0, 10));

interface Totals {
  users: number; students: number; teachers: number; schools: number;
  classes: number; reports: number; graded: number; pending: number;
  overdue: number; sessions: number; active_now: number; avg_grade: number;
}
interface HourlyActivity { hour: string; count: number }
interface DailyActivity { date: string; count: number }
interface StatusCount { status: string; count: number }
interface RoleCount { role: string; count: number }
interface TopSchool { id: number; name: string; user_count: number; class_count: number; report_count: number }
interface TopClass { id: string; name: string; teacher_name: string; report_count: number; student_count: number }

interface DetailedStats {
  period: string;
  totals: Totals;
  hourly_activity: HourlyActivity[];
  daily_activity: DailyActivity[];
  reports_by_status: StatusCount[];
  users_by_role: RoleCount[];
  top_schools: TopSchool[];
  top_classes: TopClass[];
}

interface AcademicClass {
  id: string; name: string; code: string; is_frozen: number; is_active: number;
  teacher_name: string; teacher_email: string; school_name: string | null;
  student_count: number; report_count: number; pending_count: number;
  graded_count: number; avg_grade: number; quiz_count: number; overdue_count: number;
  health_status: string;
}

interface AcademicTracking {
  global: { total_students: number; total_teachers: number; total_classes: number; total_reports: number; total_graded: number; total_pending: number; total_overdue: number; global_avg: number };
  class_health: { healthy: number; warning: number; critical: number; inactive: number };
  classes: AcademicClass[];
}

interface DailyClass {
  class_id: string; class_name: string; class_code: string;
  teacher_name: string; school_name: string | null;
  is_frozen: boolean; is_active: boolean;
  student_count: number; active_today: number; reports_today: number;
  graded_today: number; pending_reports: number; overdue_reports: number;
  quiz_submissions_today: number; issues: string[];
}

interface DailyReport {
  date: string;
  summary: { total_classes: number; reports_today: number; graded_today: number; pending_reports: number; overdue_reports: number };
  classes: DailyClass[];
}

const stats = ref<DetailedStats | null>(null);
const academic = ref<AcademicTracking | null>(null);
const daily = ref<DailyReport | null>(null);

async function loadOverview() {
  loading.value = true; error.value = '';
  try {
    const res = await getDetailedStats(selectedPeriod.value);
    if (res.success) stats.value = res.stats;
  } catch (e: any) { error.value = e?.message || 'خطأ'; }
  finally { loading.value = false; }
}

async function loadAcademic() {
  loading.value = true; error.value = '';
  try {
    const res = await getAcademicTracking();
    if (res.success) academic.value = res.tracking;
  } catch (e: any) { error.value = e?.message || 'خطأ'; }
  finally { loading.value = false; }
}

async function loadDaily() {
  loading.value = true; error.value = '';
  try {
    const res = await getAdminDetailedReports(selectedDate.value);
    if (res.success) daily.value = res.report;
  } catch (e: any) { error.value = e?.message || 'خطأ'; }
  finally { loading.value = false; }
}

function switchSection(s: 'overview' | 'academic' | 'daily') {
  activeSection.value = s;
  if (s === 'overview') loadOverview();
  else if (s === 'academic') loadAcademic();
  else if (s === 'daily') loadDaily();
}

function healthColor(status: string): string {
  switch (status) {
    case 'healthy': return '#22c55e';
    case 'warning': return '#f59e0b';
    case 'critical': return '#ef4444';
    case 'inactive': return '#64748b';
    default: return '#64748b';
  }
}

function healthLabel(status: string): string {
  switch (status) {
    case 'healthy': return 'سليم';
    case 'warning': return 'تحذير';
    case 'critical': return 'حرج';
    case 'inactive': return 'خامل';
    default: return status;
  }
}

onMounted(() => loadOverview());
</script>

<template>
  <div class="admin-detailed-reports">
    <div class="reports-tabs">
      <button :class="['tab-btn', { active: activeSection === 'overview' }]" @click="switchSection('overview')">📊 نظرة شاملة</button>
      <button :class="['tab-btn', { active: activeSection === 'academic' }]" @click="switchSection('academic')">🎓 تتبع الحالة الدراسية</button>
      <button :class="['tab-btn', { active: activeSection === 'daily' }]" @click="switchSection('daily')">📋 تقارير يومية</button>
    </div>

    <div v-if="loading" class="loading">جاري التحميل...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <!-- Overview -->
    <template v-else-if="activeSection === 'overview'">
      <div class="period-picker">
        <label>الفترة: </label>
        <select v-model="selectedPeriod" @change="loadOverview">
          <option value="today">اليوم</option>
          <option value="week">آخر أسبوع</option>
          <option value="month">آخر شهر</option>
          <option value="year">آخر سنة</option>
          <option value="all">الكل</option>
        </select>
      </div>

      <div v-if="stats" class="overview">
        <div class="stats-grid">
          <div class="stat-card"><span class="val">{{ stats.totals.users }}</span><span class="lbl">مستخدمين</span></div>
          <div class="stat-card"><span class="val">{{ stats.totals.students }}</span><span class="lbl">طلاب</span></div>
          <div class="stat-card"><span class="val">{{ stats.totals.teachers }}</span><span class="lbl">مدرسين</span></div>
          <div class="stat-card"><span class="val">{{ stats.totals.schools }}</span><span class="lbl">مدارس</span></div>
          <div class="stat-card"><span class="val">{{ stats.totals.classes }}</span><span class="lbl">فصول</span></div>
          <div class="stat-card"><span class="val">{{ stats.totals.reports }}</span><span class="lbl">تقارير</span></div>
          <div class="stat-card"><span class="val">{{ stats.totals.graded }}</span><span class="lbl">صححت</span></div>
          <div class="stat-card warn" v-if="stats.totals.pending > 0"><span class="val">{{ stats.totals.pending }}</span><span class="lbl">معلقة</span></div>
          <div class="stat-card danger" v-if="stats.totals.overdue > 0"><span class="val">{{ stats.totals.overdue }}</span><span class="lbl">متأخرة</span></div>
          <div class="stat-card"><span class="val">{{ stats.totals.sessions }}</span><span class="lbl">جلسات</span></div>
          <div class="stat-card active-now"><span class="val">{{ stats.totals.active_now }}</span><span class="lbl">نشط الآن</span></div>
          <div class="stat-card"><span class="val">{{ stats.totals.avg_grade }}</span><span class="lbl">المتوسط العام</span></div>
        </div>

        <div class="two-col">
          <div class="panel-box">
            <h4>النشاط بالساعة (اليوم)</h4>
            <div class="bar-chart">
              <div v-for="h in stats.hourly_activity" :key="h.hour" class="bar-item">
                <div class="bar" :style="{ height: `${Math.min(100, h.count * 5)}px` }"></div>
                <span class="bar-label">{{ h.hour }}</span>
              </div>
            </div>
          </div>
          <div class="panel-box">
            <h4>النشاط اليومي (آخر 30 يوم)</h4>
            <div class="bar-chart horizontal">
              <div v-for="d in stats.daily_activity" :key="d.date" class="bar-row">
                <span class="bar-date">{{ d.date.slice(5) }}</span>
                <div class="bar-h" :style="{ width: `${Math.min(100, d.count * 2)}%` }"></div>
                <span class="bar-count">{{ d.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="panel-box">
            <h4>التقارير حسب الحالة</h4>
            <div class="status-list">
              <div v-for="s in stats.reports_by_status" :key="s.status" class="status-row">
                <span class="status-label">{{ s.status }}</span>
                <span class="status-count">{{ s.count }}</span>
              </div>
            </div>
          </div>
          <div class="panel-box">
            <h4>المستخدمون حسب الدور</h4>
            <div class="status-list">
              <div v-for="r in stats.users_by_role" :key="r.role" class="status-row">
                <span class="status-label">{{ r.role }}</span>
                <span class="status-count">{{ r.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="two-col">
          <div class="panel-box">
            <h4>أكثر المدارس نشاطاً</h4>
            <table class="mini-table">
              <thead><tr><th>المدرسة</th><th>مستخدمين</th><th>فصول</th><th>تقارير</th></tr></thead>
              <tbody>
                <tr v-for="s in stats.top_schools" :key="s.id">
                  <td>{{ s.name }}</td><td>{{ s.user_count }}</td><td>{{ s.class_count }}</td><td>{{ s.report_count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="panel-box">
            <h4>أكثر الفصول تقارير</h4>
            <table class="mini-table">
              <thead><tr><th>الفصل</th><th>المدرس</th><th>طلاب</th><th>تقارير</th></tr></thead>
              <tbody>
                <tr v-for="c in stats.top_classes" :key="c.id">
                  <td>{{ c.name }}</td><td>{{ c.teacher_name }}</td><td>{{ c.student_count }}</td><td>{{ c.report_count }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- Academic Tracking -->
    <template v-else-if="activeSection === 'academic'">
      <div v-if="academic" class="academic">
        <div class="stats-grid">
          <div class="stat-card"><span class="val">{{ academic.global.total_students }}</span><span class="lbl">طلاب</span></div>
          <div class="stat-card"><span class="val">{{ academic.global.total_teachers }}</span><span class="lbl">مدرسين</span></div>
          <div class="stat-card"><span class="val">{{ academic.global.total_classes }}</span><span class="lbl">فصول</span></div>
          <div class="stat-card"><span class="val">{{ academic.global.total_reports }}</span><span class="lbl">تقارير</span></div>
          <div class="stat-card warn"><span class="val">{{ academic.global.total_pending }}</span><span class="lbl">معلقة</span></div>
          <div class="stat-card danger"><span class="val">{{ academic.global.total_overdue }}</span><span class="lbl">متأخرة</span></div>
          <div class="stat-card"><span class="val">{{ academic.global.global_avg }}</span><span class="lbl">المتوسط العام</span></div>
        </div>

        <div class="health-grid">
          <div class="health-card healthy"><span class="val">{{ academic.class_health.healthy }}</span><span class="lbl">سليمة</span></div>
          <div class="health-card warning"><span class="val">{{ academic.class_health.warning }}</span><span class="lbl">تحذير</span></div>
          <div class="health-card critical"><span class="val">{{ academic.class_health.critical }}</span><span class="lbl">حرجة</span></div>
          <div class="health-card inactive"><span class="val">{{ academic.class_health.inactive }}</span><span class="lbl">خاملة</span></div>
        </div>

        <div class="section-title">حالة جميع الفصول</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الفصل</th><th>المدرس</th><th>المدرسة</th>
                <th>الطلاب</th><th>التقارير</th><th>معلقة</th><th>متأخرة</th>
                <th>المتوسط</th><th>اختبارات</th><th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in academic.classes" :key="c.id">
                <td class="name-cell"><div>{{ c.name }}</div><div class="code">{{ c.code }}</div></td>
                <td>{{ c.teacher_name }}</td>
                <td>{{ c.school_name || '—' }}</td>
                <td>{{ c.student_count }}</td>
                <td>{{ c.report_count }}</td>
                <td :class="{ 'warn-text': c.pending_count > 5 }">{{ c.pending_count }}</td>
                <td :class="{ 'danger-text': c.overdue_count > 0 }">{{ c.overdue_count }}</td>
                <td>{{ c.avg_grade || '—' }}</td>
                <td>{{ c.quiz_count }}</td>
                <td><span class="health-badge" :style="{ background: healthColor(c.health_status) + '22', color: healthColor(c.health_status) }">{{ healthLabel(c.health_status) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Daily Reports -->
    <template v-else-if="activeSection === 'daily'">
      <div class="date-picker">
        <label>التاريخ: </label>
        <input type="date" v-model="selectedDate" @change="loadDaily" />
        <button class="btn-primary" @click="loadDaily">تحديث</button>
      </div>

      <div v-if="daily" class="daily-report">
        <div class="stats-grid">
          <div class="stat-card"><span class="val">{{ daily.summary.total_classes }}</span><span class="lbl">فصول</span></div>
          <div class="stat-card"><span class="val">{{ daily.summary.reports_today }}</span><span class="lbl">تقارير اليوم</span></div>
          <div class="stat-card"><span class="val">{{ daily.summary.graded_today }}</span><span class="lbl">صححت اليوم</span></div>
          <div class="stat-card warn" v-if="daily.summary.pending_reports > 0"><span class="val">{{ daily.summary.pending_reports }}</span><span class="lbl">معلقة</span></div>
          <div class="stat-card danger" v-if="daily.summary.overdue_reports > 0"><span class="val">{{ daily.summary.overdue_reports }}</span><span class="lbl">متأخرة</span></div>
        </div>

        <div class="section-title">تفاصيل الفصول — {{ daily.date }}</div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>الفصل</th><th>المدرس</th><th>المدرسة</th>
                <th>الطلاب</th><th>نشط اليوم</th><th>تقارير اليوم</th>
                <th>صححت اليوم</th><th>معلقة</th><th>متأخرة</th>
                <th>اختبارات اليوم</th><th>المشاكل</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="c in daily.classes" :key="c.class_id" :class="{ 'row-frozen': c.is_frozen, 'row-inactive': !c.is_active }">
                <td class="name-cell"><div>{{ c.class_name }}</div><div class="code">{{ c.class_code }}</div></td>
                <td>{{ c.teacher_name }}</td>
                <td>{{ c.school_name || '—' }}</td>
                <td>{{ c.student_count }}</td>
                <td>{{ c.active_today }}</td>
                <td>{{ c.reports_today }}</td>
                <td>{{ c.graded_today }}</td>
                <td :class="{ 'warn-text': c.pending_reports > 5 }">{{ c.pending_reports }}</td>
                <td :class="{ 'danger-text': c.overdue_reports > 0 }">{{ c.overdue_reports }}</td>
                <td>{{ c.quiz_submissions_today }}</td>
                <td>
                  <div v-if="c.issues.length" class="issues-list">
                    <span v-for="(issue, i) in c.issues" :key="i" class="issue-tag">{{ issue }}</span>
                  </div>
                  <span v-else class="ok-tag">✓</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-detailed-reports { padding: 0.5rem; }
.reports-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.tab-btn { padding: 0.5rem 1rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #94a3b8; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
.tab-btn.active { background: rgba(59,130,246,0.15); color: #60a5fa; border-color: rgba(59,130,246,0.3); }
.tab-btn:hover { background: rgba(255,255,255,0.06); }
.loading, .empty, .error { text-align: center; color: #64748b; padding: 2rem; }
.error { color: #ef4444; }
.period-picker, .date-picker { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
.period-picker label, .date-picker label { color: #94a3b8; font-size: 0.8rem; }
.period-picker select, .date-picker input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 0.375rem; padding: 0.3rem 0.5rem; font-size: 0.8rem; }
.btn-primary { padding: 0.3rem 0.8rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.8rem; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
.stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.75rem; text-align: center; }
.stat-card .val { display: block; font-size: 1.4rem; font-weight: 700; color: #e2e8f0; }
.stat-card .lbl { display: block; font-size: 0.65rem; color: #64748b; margin-top: 0.2rem; }
.stat-card.warn { border-color: rgba(245,158,11,0.3); }
.stat-card.warn .val { color: #f59e0b; }
.stat-card.danger { border-color: rgba(239,68,68,0.3); }
.stat-card.danger .val { color: #ef4444; }
.stat-card.active-now { border-color: rgba(34,197,94,0.3); }
.stat-card.active-now .val { color: #22c55e; }
.health-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1.5rem; }
.health-card { border-radius: 0.5rem; padding: 0.75rem; text-align: center; }
.health-card .val { display: block; font-size: 1.4rem; font-weight: 700; }
.health-card .lbl { display: block; font-size: 0.65rem; margin-top: 0.2rem; }
.health-card.healthy { background: rgba(34,197,94,0.08); } .health-card.healthy .val, .health-card.healthy .lbl { color: #22c55e; }
.health-card.warning { background: rgba(245,158,11,0.08); } .health-card.warning .val, .health-card.warning .lbl { color: #f59e0b; }
.health-card.critical { background: rgba(239,68,68,0.08); } .health-card.critical .val, .health-card.critical .lbl { color: #ef4444; }
.health-card.inactive { background: rgba(100,116,139,0.08); } .health-card.inactive .val, .health-card.inactive .lbl { color: #64748b; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
.panel-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.5rem; padding: 0.75rem; }
.panel-box h4 { color: #e2e8f0; font-size: 0.8rem; margin-bottom: 0.5rem; }
.bar-chart { display: flex; align-items: flex-end; gap: 2px; height: 80px; overflow-x: auto; }
.bar-chart.horizontal { flex-direction: column; height: auto; max-height: 200px; overflow-y: auto; }
.bar-item { display: flex; flex-direction: column; align-items: center; min-width: 20px; }
.bar { width: 12px; background: linear-gradient(180deg, #3b82f6, #1d4ed8); border-radius: 2px 2px 0 0; min-height: 2px; }
.bar-label { font-size: 0.55rem; color: #64748b; margin-top: 2px; }
.bar-row { display: flex; align-items: center; gap: 0.3rem; margin-bottom: 2px; }
.bar-date { font-size: 0.6rem; color: #64748b; width: 35px; text-align: left; }
.bar-h { height: 8px; background: linear-gradient(90deg, #3b82f6, #1d4ed8); border-radius: 4px; min-width: 4px; }
.bar-count { font-size: 0.6rem; color: #94a3b8; }
.status-list { display: flex; flex-direction: column; gap: 0.3rem; }
.status-row { display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.status-label { color: #94a3b8; font-size: 0.75rem; }
.status-count { color: #e2e8f0; font-weight: 600; font-size: 0.75rem; }
.mini-table { width: 100%; border-collapse: collapse; }
.mini-table th { color: #64748b; font-size: 0.65rem; text-align: right; padding: 0.3rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.mini-table td { color: #e2e8f0; font-size: 0.7rem; padding: 0.3rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
.section-title { color: #e2e8f0; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th { color: #64748b; font-size: 0.7rem; text-align: right; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap; }
td { color: #e2e8f0; font-size: 0.75rem; padding: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.04); white-space: nowrap; }
.name-cell .code { color: #64748b; font-size: 0.65rem; }
.row-frozen { opacity: 0.6; }
.row-inactive { opacity: 0.5; }
.warn-text { color: #f59e0b; font-weight: 600; }
.danger-text { color: #ef4444; font-weight: 600; }
.issues-list { display: flex; flex-direction: column; gap: 0.15rem; }
.issue-tag { font-size: 0.6rem; padding: 0.1rem 0.3rem; background: rgba(239,68,68,0.1); color: #f87171; border-radius: 0.2rem; white-space: nowrap; }
.ok-tag { color: #22c55e; font-size: 0.8rem; }
.health-badge { font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 0.2rem; }
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } .health-grid { grid-template-columns: repeat(2, 1fr); } }
</style>
