<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction, t } = useI18n();
import { reactive, computed } from 'vue';
import AnalysisChartWorkspace from './AnalysisChartWorkspace.vue';
import { useChartRegression } from '../../../composables/experiment/analysis/chart-regression';

import type { AnalysisColumnMeta, AnalysisEquation, AnalysisPlotConfig } from '../../../types/physics';





const props = defineProps<{
  student: { name: string; teacher: string; school: string; grade: string; age: number | null };
  sourceName: string;
  today: string;
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
  equations: AnalysisEquation[];
  suggestedPlots: AnalysisPlotConfig[];
  theoretical?: { value: number; label: string; unit: string };
  equipment?: string[];
}>();

const emit = defineEmits<{
  (e: 'send', report: Record<string, string>): void;
}>();

const activePlot = computed(() => props.suggestedPlots[0] ?? null);
const xKey = computed(() => activePlot.value?.xKey ?? '');
const yKey = computed(() => activePlot.value?.yKey ?? '');

const numericPoints = computed(() => {
  if (!xKey.value || !yKey.value) return [];
  return props.readings
    .map((r) => ({ x: Number(r[xKey.value]), y: Number(r[yKey.value]) }))
    .filter((p) => typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y));
});

const { regression, slopeCalc } = useChartRegression(numericPoints, xKey, yKey, t);

const calcCol = computed(() => props.columns.find((c) => c.key.endsWith('Calc')));
const calcValues = computed(() => {
  if (!calcCol.value) return [];
  return props.readings
    .map((r) => Number(r[calcCol.value!.key]))
    .filter((v) => Number.isFinite(v));
});
const calcMean = computed(() => {
  const arr = calcValues.value;
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
});
const calcStd = computed(() => {
  if (calcMean.value == null) return null;
  const arr = calcValues.value;
  const m = calcMean.value;
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
});
const percentError = computed(() => {
  if (!props.theoretical) return null;
  const measured = slopeCalc.value?.value ?? calcMean.value;
  if (measured == null) return null;
  return Math.abs((measured - props.theoretical.value) / props.theoretical.value) * 100;
});

const report = reactive({
  objective: '',
  procedure: '',
  whatILearned: '',
  results: '',
  errors: '',
  improvements: '',
  conclusion: '',
});
</script>

<template>
  <div class="report-page">
    <!-- الحقول التي يكتبها الطالب -->
    <aside class="composer">
      <h3>كتابة التقرير</h3>
      <div class="field"><label>هدف التجربة</label><textarea v-model="report.objective" rows="3" placeholder="ماذا نريد أن نعرف؟"></textarea></div>
      <div class="field"><label>خطوات التجربة</label><textarea v-model="report.procedure" rows="3" placeholder="ماذا فعلت؟"></textarea></div>
      <div class="field"><label>ما فهمته من التجربة</label><textarea v-model="report.whatILearned" rows="4" placeholder="اشرح بكلماتك ما تعلمته..."></textarea></div>
      <div class="field"><label>النتائج</label><textarea v-model="report.results" rows="3" placeholder="ما هي نتائجك؟"></textarea></div>
      <div class="field"><label>مصادر الخطأ</label><textarea v-model="report.errors" rows="3" placeholder="ما الذي أثر على الدقة؟"></textarea></div>
      <div class="field"><label>التحسينات</label><textarea v-model="report.improvements" rows="3" placeholder="كيف يمكن تحسين النتائج؟"></textarea></div>
      <div class="field"><label>الاستنتاج</label><textarea v-model="report.conclusion" rows="3" placeholder="ما خلاصة التجربة؟"></textarea></div>
      <div class="report-actions">
        <button class="act-save">حفظ</button>
        <button class="act-pdf">PDF</button>
        <button class="act-send" @click="emit('send', report)">إرسال للمدرس</button>
      </div>
    </aside>

    <!-- الصورة النهائية للتقرير -->
    <main class="final-report">
      <div class="paper">
        <header class="paper-head">
          <h2>تقرير التجربة: {{ sourceName }}</h2>
          <div class="meta">
            <span>الطالب: <b>{{ student.name || '—' }}</b></span>
            <span>المدرس: <b>{{ student.teacher || '—' }}</b></span>
            <span>المدرسة: <b>{{ student.school || '—' }}</b></span>
            <span>الصف: <b>{{ student.grade || '—' }}</b></span>
            <span>التاريخ: <b>{{ today }}</b></span>
          </div>
        </header>

        <section class="paper-section" v-if="equipment && equipment.length">
          <h4>1. أدوات ومعدات التجربة</h4>
          <ul class="equip-list">
            <li v-for="item in equipment" :key="item">{{ item }}</li>
          </ul>
        </section>

        <section class="paper-section" v-if="report.objective">
          <h4>2. هدف التجربة</h4>
          <p>{{ report.objective }}</p>
        </section>

        <section class="paper-section" v-if="report.procedure">
          <h4>3. خطوات العمل</h4>
          <p>{{ report.procedure }}</p>
        </section>

        <section class="paper-section">
          <h4>4. جدول القياسات</h4>
          <table class="report-table">
            <thead>
              <tr>
                <th>#</th>
                <th v-for="col in columns" :key="col.key">{{ col.label }} ({{ col.unit }})</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in readings" :key="i">
                <td>{{ i + 1 }}</td>
                <td v-for="col in columns" :key="col.key">{{ (row[col.key] ?? 0).toFixed(3) }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="paper-section" v-if="equations.length">
          <h4>5. المعادلة والحساب</h4>
          <div v-for="eq in equations" :key="eq.name" class="eq-block">
            <strong>{{ eq.name }}:</strong>
            <code>{{ eq.formula }}</code>
          </div>
          <div class="graph-wrap">
            <AnalysisChartWorkspace
              :readings="readings"
              :columns="columns"
              :suggested-plots="suggestedPlots"
              read-only
              :show-stats="false"
            />
          </div>
          <div v-if="regression" class="regression-block">
            <div class="reg-line">
              <b>خط الانحدار:</b> y = {{ regression.slope.toFixed(4) }}x {{ regression.intercept >= 0 ? '+' : '' }} {{ regression.intercept.toFixed(4) }}
            </div>
            <div class="reg-r2">R² = {{ regression.r2.toFixed(4) }}</div>
          </div>
          <div v-if="slopeCalc" class="derived-block">
            <h5>{{ slopeCalc.label }}</h5>
            <div class="formula">{{ slopeCalc.formula }}</div>
            <div class="expr">
              {{ slopeCalc.expr }} = <span class="val">{{ slopeCalc.value.toFixed(3) }} {{ slopeCalc.unit }}</span>
            </div>
          </div>
          <div v-if="theoretical" class="theoretical-block">
            <h5>القيمة النظرية</h5>
            <div class="theo-line">{{ theoretical.label }} = {{ theoretical.value }} {{ theoretical.unit }}</div>
            <div v-if="percentError != null" class="error-line">نسبة الخطأ = {{ percentError.toFixed(2) }}%</div>
          </div>
          <div v-if="calcMean != null" class="stats-block">
            <h5>إحصائيات القراءات</h5>
            <div class="stat-line">متوسط {{ calcCol?.label }} = {{ calcMean.toFixed(3) }} {{ calcCol?.unit }}</div>
            <div v-if="calcStd != null" class="stat-line">الانحراف المعياري = {{ calcStd.toFixed(4) }}</div>
          </div>
        </section>

        <section class="paper-section" v-if="report.whatILearned">
          <h4>6. ما فهمته من التجربة</h4>
          <p>{{ report.whatILearned }}</p>
        </section>

        <section class="paper-section" v-if="report.results">
          <h4>7. النتائج</h4>
          <p>{{ report.results }}</p>
        </section>

        <section class="paper-section" v-if="report.errors || report.improvements">
          <h4>8. أخطاء التجربة والتحسينات</h4>
          <p v-if="report.errors"><strong>مصادر الخطأ:</strong> {{ report.errors }}</p>
          <p v-if="report.improvements"><strong>التحسينات:</strong> {{ report.improvements }}</p>
        </section>

        <section class="paper-section" v-if="report.conclusion">
          <h4>9. الاستنتاج</h4>
          <p>{{ report.conclusion }}</p>
        </section>

        <section class="paper-section" v-if="!report.objective && !report.procedure && !report.whatILearned && !report.results && !report.conclusion">
          <p class="empty-hint">اكتب في الحقول على اليسار لترى تقريرك النهائي هنا.</p>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.report-page {
  height: 100%;
  display: flex;
  gap: 0.75rem;
  overflow: hidden;
}
.composer {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  padding: 0.75rem;
  overflow: auto;
}
.composer h3 { margin: 0 0 0.2rem; color: #67e8f9; font-size: 0.95rem; text-align: center; }
.composer .field { display: flex; flex-direction: column; gap: 0.2rem; }
.composer label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; }
.composer textarea {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.3rem;
  padding: 0.4rem;
  font-size: 0.85rem;
  resize: none;
  width: 100%;
}
.final-report {
  flex: 1;
  overflow: auto;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  padding: 0.75rem;
}
.paper {
  background: #ffffff;
  color: #0f172a;
  border-radius: 0.4rem;
  padding: 1.25rem;
  max-width: 720px;
  margin: 0 auto;
  min-height: 100%;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}
.paper-head { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 0.8rem; margin-bottom: 1rem; }
.paper-head h2 { margin: 0; font-size: 1.15rem; color: #0f172a; }
.meta { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem; margin-top: 0.6rem; font-size: 0.8rem; color: #334155; }
.meta span b { color: #0f172a; }
.paper-section { margin-bottom: 1rem; }
.paper-section h4 { margin: 0 0 0.3rem; color: #7c3aed; font-size: 0.95rem; border-right: 3px solid #7c3aed; padding-right: 0.5rem; }
.paper-section p { margin: 0; font-size: 0.9rem; line-height: 1.6; color: #1e293b; white-space: pre-wrap; }
.empty-hint { text-align: center; color: #64748b; font-size: 0.9rem; padding: 1rem; }
.report-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin-top: 0.4rem; }
.report-table th, .report-table td { border: 1px solid #cbd5e1; padding: 0.35rem; text-align: center; }
.report-table th { background: #f1f5f9; color: #0f172a; font-weight: 700; }
.report-table td { color: #0f172a; }
.eq-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.3rem; padding: 0.5rem; margin-bottom: 0.5rem; }
.eq-block code { display: block; color: #047857; font-family: monospace; margin-top: 0.2rem; font-size: 0.9rem; }
.graph-wrap { height: 260px; margin-top: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.4rem; overflow: hidden; background: #0f172a; display: flex; flex-direction: column; min-height: 0; }
.regression-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.3rem; padding: 0.5rem; margin-top: 0.4rem; font-size: 0.85rem; color: #0f172a; font-family: monospace; }
.reg-line { margin-bottom: 0.2rem; }
.reg-r2 { color: #047857; font-weight: 700; }
.derived-block { background: #ecfdf5; border: 1px solid #d1fae5; border-radius: 0.3rem; padding: 0.5rem; margin-top: 0.4rem; }
.derived-block h5 { margin: 0 0 0.2rem; color: #047857; font-size: 0.9rem; }
.derived-block .formula { color: #334155; font-size: 0.85rem; margin-bottom: 0.2rem; }
.derived-block .expr { color: #0f172a; font-family: monospace; font-size: 0.9rem; }
.derived-block .val { color: #047857; font-weight: 700; font-size: 1rem; }
.report-actions { display: flex; gap: 0.4rem; margin-top: 0.3rem; }
.report-actions button { flex: 1; padding: 0.45rem; border: none; border-radius: 0.3rem; font-weight: 700; color: #fff; cursor: pointer; font-size: 0.8rem; }
.act-save { background: #475569; }
.act-pdf { background: #7c3aed; }
.act-send { background: #2563eb; }
.equip-list { padding-right: 1.2rem; margin: 0; font-size: 0.9rem; color: #1e293b; }
.theoretical-block, .stats-block { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.3rem; padding: 0.5rem; margin-top: 0.4rem; }
.theoretical-block h5, .stats-block h5 { margin: 0 0 0.3rem; color: #0369a1; font-size: 0.9rem; }
.theo-line, .stat-line { color: #0f172a; font-size: 0.88rem; margin-bottom: 0.2rem; }
.error-line { color: #dc2626; font-size: 0.88rem; font-weight: 700; }
</style>
