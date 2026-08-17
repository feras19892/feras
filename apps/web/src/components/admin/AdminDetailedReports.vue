<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { getDetailedStats, getAcademicTracking, getAdminDetailedReports } from '../../services/admin.service';
import DetailedOverview from './detailed/DetailedOverview.vue';
import DetailedAcademic from './detailed/DetailedAcademic.vue';
import DetailedDaily from './detailed/DetailedDaily.vue';

const loading = ref(false);
const error = ref('');
const activeSection = ref<'overview' | 'academic' | 'daily'>('overview');
const selectedPeriod = ref<'today' | 'week' | 'month' | 'year' | 'all'>('today');
const selectedDate = ref(new Date().toISOString().slice(0, 10));

const stats = ref<Record<string, unknown> | null>(null);
const academic = ref<Record<string, unknown> | null>(null);
const daily = ref<Record<string, unknown> | null>(null);

const sections = [
  { key: 'overview' as const, icon: '📊', label: 'نظرة شاملة', desc: 'إحصائيات عامة ورسوم بيانية' },
  { key: 'academic' as const, icon: '🎓', label: 'الحالة الدراسية', desc: 'تتبع الفصول والأداء الأكاديمي' },
  { key: 'daily' as const, icon: '📋', label: 'تقارير يومية', desc: 'نشاط الفصول اليومي' },
];

const periodLabels: Record<string, string> = {
  today: 'اليوم',
  week: 'آخر أسبوع',
  month: 'آخر شهر',
  year: 'آخر سنة',
  all: 'كل الفترات',
};

const currentSectionLabel = computed(() => sections.find(s => s.key === activeSection.value)?.label || '');

async function loadOverview() {
  loading.value = true; error.value = '';
  try {
    const res = await getDetailedStats(selectedPeriod.value);
    if (res.success) stats.value = res.stats;
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : String(e) || 'خطأ'; }
  finally { loading.value = false; }
}

async function loadAcademic() {
  loading.value = true; error.value = '';
  try {
    const res = await getAcademicTracking();
    if (res.success) academic.value = res.tracking;
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : String(e) || 'خطأ'; }
  finally { loading.value = false; }
}

async function loadDaily() {
  loading.value = true; error.value = '';
  try {
    const res = await getAdminDetailedReports(selectedDate.value);
    if (res.success) daily.value = res.report;
  } catch (e: unknown) { error.value = e instanceof Error ? e.message : String(e) || 'خطأ'; }
  finally { loading.value = false; }
}

function switchSection(s: 'overview' | 'academic' | 'daily') {
  activeSection.value = s;
  if (s === 'overview') loadOverview();
  else if (s === 'academic') loadAcademic();
  else if (s === 'daily') loadDaily();
}

onMounted(() => loadOverview());
</script>

<template>
  <div class="admin-detailed-reports">
    <!-- Header -->
    <div class="dr-header">
      <div class="dr-header-title">
        <span class="dr-header-icon">📈</span>
        <div>
          <h2>التقارير المفصلة</h2>
          <p>{{ currentSectionLabel }}</p>
        </div>
      </div>
    </div>

    <!-- Section Tabs -->
    <div class="dr-sections">
      <button
        v-for="s in sections"
        :key="s.key"
        :class="['dr-section-btn', { active: activeSection === s.key }]"
        @click="switchSection(s.key)"
      >
        <span class="dr-section-icon">{{ s.icon }}</span>
        <span class="dr-section-text">
          <span class="dr-section-label">{{ s.label }}</span>
          <span class="dr-section-desc">{{ s.desc }}</span>
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="dr-loading">
      <div class="dr-spinner"></div>
      <p>جاري تحميل البيانات...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="dr-error">
      <span>⚠️</span>
      <p>{{ error }}</p>
    </div>

    <!-- Content -->
    <template v-else-if="activeSection === 'overview'">
      <div class="dr-toolbar">
        <div class="dr-period-group">
          <button
            v-for="(label, key) in periodLabels"
            :key="key"
            :class="['dr-period-btn', { active: selectedPeriod === key }]"
            @click="selectedPeriod = key as any; loadOverview()"
          >{{ label }}</button>
        </div>
      </div>
      <DetailedOverview :stats="stats" />
    </template>

    <template v-else-if="activeSection === 'academic'">
      <DetailedAcademic :academic="academic" />
    </template>

    <template v-else-if="activeSection === 'daily'">
      <div class="dr-toolbar">
        <div class="dr-date-group">
          <label>التاريخ</label>
          <input type="date" v-model="selectedDate" @change="loadDaily" />
          <button class="dr-refresh-btn" @click="loadDaily">🔄 تحديث</button>
        </div>
      </div>
      <DetailedDaily :daily="daily" />
    </template>
  </div>
</template>

<style scoped src='./AdminDetailedReports.css'></style>
