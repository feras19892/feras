<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAnalysisStore } from '../stores/analysis.store';
import AnalysisDataTable from '../components/experiment/analysis-calc/AnalysisDataTable.vue';
import AnalysisChartWorkspace from '../components/experiment/analysis-calc/AnalysisChartWorkspace.vue';
import ReportSection from '../components/experiment/analysis-calc/ReportSection.vue';
import SubmitReportModal from '../components/experiment/SubmitReportModal.vue';
import type { AnalysisPayload, AnalysisPlotConfig } from '../types/physics';
import defaultEquipment, { loadPendingPayload, buildSpringDemo } from '../composables/analysis/analysisHelpers';
import { resolveExperimentId } from '../composables/useExperimentId';





const router = useRouter();
const route = useRoute();
const store = useAnalysisStore();

const currentStep = ref(1);
const showGuide = ref(false);

const student = reactive({
  name: '',
  teacher: '',
  school: '',
  grade: '',
  age: null as number | null,
});

onMounted(() => {
  const isPreview = route.path === '/analysis-v3';
  const pending = isPreview ? null : loadPendingPayload();
  const payload = isPreview ? buildSpringDemo() : pending;
  if (payload) {
    store.setPayload(payload);
  }
  selectedPlot.value = suggestedPlots.value[0] ?? null;
  const info = store.studentInfo;
  student.name = info.name || '';
  student.grade = info.grade || '';
});

watch(student, () => {
  store.updateStudentInfo({
    name: student.name,
    email: '',
    grade: student.grade,
    notes: `مدرس: ${student.teacher || ''} | مدرسة: ${student.school || ''} | عمر: ${student.age ?? ''}`,
  });
}, { deep: true });

const today = computed(() => store.reportDate);
const sourceName = computed(() => store.sourceName || 'تحليل البيانات');
const columns = computed(() => store.columns);
const readings = computed(() => store.readings);
const equations = computed(() => store.equations);
const suggestedPlots = computed(() => store.plots);
const theoretical = computed(() => store.payload?.theoretical);
const equipment = computed(() => store.payload?.equipment ?? defaultEquipment[store.payload?.sourceExperiment ?? ''] ?? []);

const selectedPlot = ref<AnalysisPlotConfig | null>(null);
const reportPlot = computed(() => (selectedPlot.value ? [selectedPlot.value] : suggestedPlots.value));
const resolvedExperimentId = computed(() => resolveExperimentId('physics', store.payload?.sourceExperiment));
const chartRegression = ref<any>(null);
const chartSlopeCalc = ref<any>(null);
const showSubmit = ref(false);
const submitPayload = ref<Record<string, string> | null>(null);

function openSubmit(report: Record<string, string>) {
  submitPayload.value = report;
  showSubmit.value = true;
}

function updateCell(row: number, key: string, value: number) {
  store.updateCell(row, key, value);
}

function addRow() {
  store.addRow();
}

function removeRow(index: number) {
  store.removeRow(index);
}

function goBack() {
  const referrer = localStorage.getItem('analysis-referrer');
  if (referrer) { router.push(referrer); }
  else { router.back(); }
}
</script>

<template>
  <div class="lab-page">
    <header class="top-bar">
      <button class="btn-back" @click="goBack">{{ t('analysis.back') }}</button>
      <span class="title">{{ sourceName }}</span>
      <div class="steps">
        <button class="step" :class="{ active: currentStep === 1 }" @click="currentStep = 1">1. البيانات</button>
        <button class="step" :class="{ active: currentStep === 2 }" @click="currentStep = 2">2. التحليل</button>
        <button class="step" :class="{ active: currentStep === 3 }" @click="currentStep = 3">3. التقرير</button>
      </div>
    </header>

    <main v-if="store.hasData" class="stage">
      <!-- الصفحة 1 -->
      <section v-if="currentStep === 1" class="page-step">
        <div class="student-bar">
          <div class="field"><label>الطالب</label><input v-model="student.name" placeholder="الاسم" /></div>
          <div class="field"><label>المدرس</label><input v-model="student.teacher" placeholder="اسم المدرس" /></div>
          <div class="field"><label>المدرسة</label><input v-model="student.school" placeholder="المدرسة" /></div>
          <div class="field"><label>الصف</label><input v-model="student.grade" placeholder="الصف" /></div>
          <div class="field small"><label>العمر</label><input v-model.number="student.age" type="number" placeholder="العمر" /></div>
          <div class="field small"><label>التاريخ</label><input :value="today" readonly /></div>
        </div>

        <div class="actions-row">
          <button class="guide-btn" @click="showGuide = !showGuide">شرح التجربة</button>
          <div v-if="showGuide" class="guide-pop">
            الهدف: إيجاد ثابت الزنبرك k.<br>
            القياسات: كتلة معلقة (m) والزمن الدوري (T).<br>
            الحصول على القيم: T² = 4π²·m/k.
          </div>
        </div>

        <div class="table-wrap-outer">
          <AnalysisDataTable
            :readings="readings"
            :columns="columns"
            @update-cell="updateCell"
            @add-row="addRow"
            @remove-row="removeRow"
          />
        </div>
      </section>

      <!-- الصفحة 2 -->
      <section v-if="currentStep === 2" class="page-step split">
        <div class="chart-col">
          <AnalysisChartWorkspace
            :readings="readings"
            :columns="columns"
            :suggested-plots="suggestedPlots"
            :show-stats="false"
            @change-axes="selectedPlot = $event"
            @update:regression="chartRegression = $event"
            @slope-calc="chartSlopeCalc = $event"
          />
        </div>
        <aside class="calc-col">
          <div class="card">
            <h4>المعادلة</h4>
            <div v-for="eq in equations" :key="eq.name" class="eq">
              <strong>{{ eq.name }}</strong>
              <code>{{ eq.formula }}</code>
            </div>
          </div>
          <div v-if="chartRegression || chartSlopeCalc" class="card calc-result">
            <h4>حساب الميل</h4>
            <div v-if="chartRegression" class="reg-line">
              y = {{ chartRegression.slope.toFixed(4) }}x {{ chartRegression.intercept >= 0 ? '+' : '' }} {{ chartRegression.intercept.toFixed(4) }}
              <br />
              R² = {{ chartRegression.r2.toFixed(4) }}
            </div>
            <div v-if="chartSlopeCalc" class="slope-res">
              <h5>{{ chartSlopeCalc.label }}</h5>
              <div class="formula">{{ chartSlopeCalc.formula }}</div>
              <div class="expr">{{ chartSlopeCalc.expr }} = <span class="val">{{ chartSlopeCalc.value.toFixed(3) }} {{ chartSlopeCalc.unit }}</span></div>
            </div>
          </div>
        </aside>
      </section>

      <!-- الصفحة 3 -->
      <section v-if="currentStep === 3" class="page-step">
        <ReportSection
          :student="student"
          :source-name="sourceName"
          :today="today"
          :readings="readings"
          :columns="columns"
          :equations="equations"
          :suggested-plots="reportPlot"
          :theoretical="theoretical"
          :equipment="equipment"
          @send="openSubmit"
        />
      </section>

      <SubmitReportModal
        v-model:show="showSubmit"
        experiment-type="physics"
        :experiment-id="resolvedExperimentId"
        :experiment-name="sourceName"
        :readings="JSON.stringify(readings)"
        :params="JSON.stringify(columns.map((c) => ({ key: c.key, label: c.label, unit: c.unit })))"
        :student-info="JSON.stringify(student)"
        :conclusion="JSON.stringify(submitPayload ?? { conclusion: '', errors: '', improvements: '' })"
        :columns="JSON.stringify(columns)"
        :equations="JSON.stringify(equations)"
        :plots="JSON.stringify(suggestedPlots)"
        :regression-data="JSON.stringify(chartRegression)"
        :slope-calc-data="JSON.stringify(chartSlopeCalc)"
        :axes-data="JSON.stringify(selectedPlot)"
        :error-calc-data="JSON.stringify(null)"
        chart-snapshot=""
        @submitted="showSubmit = false"
      />
    </main>
    <div v-else class="no-data">
      <div class="no-data-box">
        <h2>لا توجد بيانات</h2>
        <p>اذهب إلى تجربة الزنبرك واضغط زر التحليل لإرسال قراءاتها.</p>
        <button class="btn-action" @click="goBack">العودة للتجربة</button>
      </div>
    </div>
  </div>
</template>

<style scoped src="./analysis-v3.css"></style>
