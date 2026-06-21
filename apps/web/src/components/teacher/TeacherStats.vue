<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { getMyClasses } from '../../services/class.service';
import { getClassStats, exportClassReports } from '../../services/report.service';
import type { ClassItem } from '../../services/class.service';

const classes = ref<ClassItem[]>([]);
const selectedClassId = ref('');
const loading = ref(false);
const stats = ref<any>(null);
const comparisonIds = ref<number[]>([]);

async function loadClasses() {
  const res = await getMyClasses();
  if (res.success) {
    classes.value = res.classes;
    if (res.classes.length > 0 && !selectedClassId.value) {
      selectedClassId.value = res.classes[0].id;
    }
  }
}

async function loadStats() {
  if (!selectedClassId.value) return;
  loading.value = true;
  try {
    const res = await getClassStats(selectedClassId.value);
    if (res.success) stats.value = res.stats;
  } catch (err) {
    console.error('load stats failed:', err);
  } finally {
    loading.value = false;
  }
}

watch(selectedClassId, loadStats);

function exportCsv() {
  if (!stats.value) return;
  const rows = stats.value.students.map((s: any) =>
    `${s.name},${s.reports},${s.avg},${s.lastSubmitted?.slice(0, 10) || ''}`
  );
  const csv = ['Student,Reports,Average Grade,Last Submitted', ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `class_${selectedClassId.value}_stats.csv`; a.click();
  URL.revokeObjectURL(url);
}

function exportFullReports() {
  if (!selectedClassId.value) return;
  exportClassReports(selectedClassId.value).then(res => {
    if (!res.success) return;
    const headers = 'ID,Student,Experiment,Status,Grade,Submitted\n';
    const rows = res.reports.map((r: any) =>
      `${r.id},"${r.student_name}","${r.experiment_name}",${r.status},${r.grade || ''},${r.submitted_at?.slice(0, 10) || ''}`
    );
    const csv = headers + rows.join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `class_${selectedClassId.value}_reports.csv`; a.click();
    URL.revokeObjectURL(url);
  });
}

/* ─── Charts ─── */
const barCanvas = ref<HTMLCanvasElement | null>(null);
const pieCanvas = ref<HTMLCanvasElement | null>(null);

function drawBarChart() {
  const canvas = barCanvas.value;
  if (!canvas || !stats.value) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = 500, h = 220;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);

  const dist = stats.value.distribution || {};
  const labels = Object.keys(dist);
  const values = Object.values(dist) as number[];
  const max = Math.max(...values, 1);

  ctx.clearRect(0, 0, w, h);
  const barW = 50, gap = 30, startX = 40, startY = 30, chartH = h - 60;
  const colors = ['#f87171', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa'];

  labels.forEach((label, i) => {
    const v = values[i];
    const barH = (v / max) * chartH;
    const x = startX + i * (barW + gap);
    const y = h - 40 - barH;
    ctx.fillStyle = colors[i];
    ctx.fillRect(x, y, barW, barH);
    // label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + barW / 2, h - 15);
    // value
    if (v > 0) {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(String(v), x + barW / 2, y - 5);
    }
  });
}

function drawPieChart() {
  const canvas = pieCanvas.value;
  if (!canvas || !stats.value) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  const w = 220, h = 220;
  canvas.width = w * dpr; canvas.height = h * dpr;
  canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
  ctx.scale(dpr, dpr);

  const dist = stats.value.distribution || {};
  const values = Object.values(dist) as number[];
  const total = values.reduce((a, b) => a + b, 0);
  if (total === 0) return;

  ctx.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, r = 80;
  const colors = ['#f87171', '#fbbf24', '#60a5fa', '#34d399', '#a78bfa'];
  let start = -Math.PI / 2;

  values.forEach((v, i) => {
    const slice = (v / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, start + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i];
    ctx.fill();
    start += slice;
  });

  // inner circle for donut
  ctx.beginPath();
  ctx.arc(cx, cy, 45, 0, 2 * Math.PI);
  ctx.fillStyle = 'rgba(15,23,42,0.95)';
  ctx.fill();
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${total}`, cx, cy - 6);
  ctx.font = '10px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('تقرير', cx, cy + 8);
}

watch(() => stats.value, () => {
  setTimeout(() => { drawBarChart(); drawPieChart(); }, 100);
}, { deep: true });

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
function onResize() {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { drawBarChart(); drawPieChart(); }, 200);
}

onMounted(() => {
  loadClasses().then(loadStats);
  window.addEventListener('resize', onResize);
});
onUnmounted(() => {
  window.removeEventListener('resize', onResize);
});

/* ─── Alerts ─── */
const alerts = computed(() => {
  const list: { type: 'warning' | 'info' | 'success'; msg: string }[] = [];
  if (!stats.value) return list;
  const s = stats.value;

  // inactive students (no submission in 7 days)
  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;
  const inactive = s.students?.filter((st: any) => {
    if (!st.lastSubmitted) return true;
    return now - new Date(st.lastSubmitted).getTime() > week;
  }) || [];
  if (inactive.length > 0) {
    list.push({ type: 'warning', msg: `${inactive.length} طالب لم يرسلوا تقارير منذ أسبوع` });
  }

  // high error rate experiments (low avg grade)
  const lowExp = s.experiments?.filter((e: any) => e.avg > 0 && e.avg < 50) || [];
  if (lowExp.length > 0) {
    list.push({ type: 'warning', msg: `تجارب بمتوسط درجة منخفض: ${lowExp.map((e: any) => e.name).join(', ')}` });
  }

  if (s.pending > 0) {
    list.push({ type: 'info', msg: `${s.pending} تقرير في انتظار التصحيح` });
  }

  const top = s.students?.[0];
  if (top && top.avg >= 90) {
    list.push({ type: 'success', msg: `🎉 الطالب الأفضل: ${top.name} (${top.avg}%)` });
  }

  return list;
});

/* ─── Comparison ─── */
const comparedStudents = computed(() => {
  if (!stats.value) return [];
  return stats.value.students?.filter((s: any) => comparisonIds.value.includes(s.id)) || [];
});
</script>

<template>
  <div class="stats-panel">
    <!-- Header -->
    <div class="stats-header">
      <div>
        <h2>📊 لوحة الإحصائيات</h2>
        <span v-if="stats" class="subtitle">{{ stats.total }} تقرير — {{ stats.students?.length || 0 }} طالب</span>
      </div>
      <select v-model="selectedClassId" @change="loadStats">
        <option v-for="cls in classes" :key="cls.id" :value="cls.id">{{ cls.name }}</option>
      </select>
    </div>

    <div v-if="loading" class="empty">...</div>
    <template v-else-if="stats">
      <!-- Alerts -->
      <div v-if="alerts.length" class="alerts-bar">
        <div v-for="(a, i) in alerts" :key="i" :class="['alert-chip', a.type]">
          {{ a.msg }}
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="sum-card">
          <span class="sum-val">{{ stats.total }}</span>
          <span class="sum-label">إجمالي التقارير</span>
        </div>
        <div class="sum-card">
          <span class="sum-val">{{ stats.average }}%</span>
          <span class="sum-label">متوسط الدرجات</span>
        </div>
        <div class="sum-card">
          <span class="sum-val">{{ stats.pending }}</span>
          <span class="sum-label">قيد التصحيح</span>
        </div>
        <div class="sum-card">
          <span class="sum-val">{{ stats.graded }}</span>
          <span class="sum-label">مصحح</span>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="charts-row">
        <div class="chart-box">
          <h4>توزيع الدرجات</h4>
          <canvas ref="barCanvas" class="chart-canvas"></canvas>
        </div>
        <div class="chart-box">
          <h4>نسبة التقارير</h4>
          <canvas ref="pieCanvas" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- Experiments Performance -->
      <div class="section">
        <h3>⚗️ أداء التجارب</h3>
        <div class="exp-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>التجربة</th>
                <th>التقارير</th>
                <th>متوسط</th>
                <th>أعلى</th>
                <th>أدنى</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in stats.experiments" :key="e.name">
                <td>{{ e.name }}</td>
                <td>{{ e.count }}</td>
                <td :class="{ low: e.avg < 50, high: e.avg >= 80 }">{{ e.avg }}%</td>
                <td class="high">{{ e.highest }}%</td>
                <td class="low">{{ e.lowest }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Student Ranking -->
      <div class="section">
        <h3>🏆 ترتيب الطلاب</h3>
        <div class="student-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>الطالب</th>
                <th>التقارير</th>
                <th>المتوسط</th>
                <th>آخر إرسال</th>
                <th>مقارنة</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in stats.students" :key="s.id" :class="{ top3: i < 3 }">
                <td>{{ i + 1 }}</td>
                <td>{{ s.name }}</td>
                <td>{{ s.reports }}</td>
                <td :class="{ low: s.avg < 50, high: s.avg >= 80 }">{{ s.avg }}%</td>
                <td>{{ s.lastSubmitted?.slice(0, 10) || '—' }}</td>
                <td>
                  <input
                    type="checkbox"
                    :checked="comparisonIds.includes(s.id)"
                    @change="comparisonIds = comparisonIds.includes(s.id)
                      ? comparisonIds.filter(id => id !== s.id)
                      : [...comparisonIds, s.id]"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Comparison -->
      <div v-if="comparedStudents.length >= 2" class="section comparison">
        <h3>📊 مقارنة الطلاب</h3>
        <div class="compare-cards">
          <div v-for="s in comparedStudents" :key="s.id" class="compare-card">
            <div class="compare-name">{{ s.name }}</div>
            <div class="compare-avg">{{ s.avg }}%</div>
            <div class="compare-reports">{{ s.reports }} تقرير</div>
            <div class="compare-bar">
              <div class="compare-fill" :style="{ width: s.avg + '%', background: s.avg >= 80 ? '#34d399' : s.avg >= 50 ? '#fbbf24' : '#f87171' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export -->
      <div class="export-bar">
        <button class="btn-export" @click="exportCsv">📄 تصدير ملخص CSV</button>
        <button class="btn-export" @click="exportFullReports">📑 تصدير كل التقارير CSV</button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stats-panel { width: 100%; padding: 1rem 1.5rem; }
.stats-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.stats-header h2 { font-size: 1.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #67e8f9, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.subtitle { font-size: 0.8rem; color: #64748b; margin-top: 0.2rem; display: block; }
.stats-header select { padding: 0.4rem 0.8rem; border-radius: 0.5rem; border: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.3); color: #e2e8f0; }
.empty { text-align: center; padding: 3rem; color: #64748b; }

.alerts-bar { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.2rem; }
.alert-chip { padding: 0.4rem 0.8rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; }
.alert-chip.warning { background: rgba(239,68,68,0.12); color: #f87171; }
.alert-chip.info { background: rgba(59,130,246,0.12); color: #60a5fa; }
.alert-chip.success { background: rgba(34,197,94,0.12); color: #4ade80; }

.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.sum-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.75rem; padding: 1rem; text-align: center; }
.sum-val { display: block; font-size: 1.8rem; font-weight: 800; color: #67e8f9; }
.sum-label { font-size: 0.8rem; color: #94a3b8; margin-top: 0.3rem; display: block; }

.charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
.chart-box { background: rgba(15,23,42,0.5); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; }
.chart-box h4 { margin: 0 0 0.8rem; color: #e2e8f0; font-size: 0.95rem; }
.chart-canvas { display: block; width: 100%; max-width: 500px; }

.section { margin-bottom: 1.5rem; }
.section h3 { font-size: 1.1rem; color: #e2e8f0; margin: 0 0 0.8rem; }

.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: right; padding: 0.5rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.data-table tr.top3 td:first-child { color: #fbbf24; font-weight: 800; }
.low { color: #f87171; }
.high { color: #4ade80; }

.exp-table-wrapper, .student-table-wrapper { overflow-x: auto; }

.comparison { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 1rem; }
.compare-cards { display: flex; gap: 1rem; flex-wrap: wrap; }
.compare-card { flex: 1; min-width: 160px; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.5rem; padding: 1rem; text-align: center; }
.compare-name { font-weight: 700; color: #f1f5f9; font-size: 0.9rem; }
.compare-avg { font-size: 1.5rem; font-weight: 800; color: #67e8f9; margin: 0.3rem 0; }
.compare-reports { font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.5rem; }
.compare-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.compare-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }

.export-bar { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem; }
.btn-export { padding: 0.55rem 1rem; border: none; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700; cursor: pointer; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; }
.btn-export:hover { opacity: 0.9; }
</style>
