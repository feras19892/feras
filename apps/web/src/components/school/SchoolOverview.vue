<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { fetchJson } from '../../services/http';
import type { School, SchoolStats, SchoolUser, SchoolClass, SchoolReportItem, SchoolWarningItem } from '../../services/school.service';
import SchoolCapacitySection from './SchoolCapacitySection.vue';
import SchoolRecentItems from './SchoolRecentItems.vue';

const props = defineProps<{
  school: School | null;
  stats: SchoolStats | null;
  dateLocaleStr: string;
  users?: SchoolUser[];
  classes?: SchoolClass[];
  reports?: SchoolReportItem[];
  warnings?: SchoolWarningItem[];
}>();

const emit = defineEmits<{
  (e: 'navigate', tab: string): void
}>();

// Use props from parent if available, otherwise fetch independently
const users = ref<SchoolUser[]>(props.users ?? []);
const classes = ref<SchoolClass[]>(props.classes ?? []);
const reports = ref<SchoolReportItem[]>(props.reports ?? []);
const warnings = ref<SchoolWarningItem[]>(props.warnings ?? []);
const loadingExtra = ref(true);

watch(() => props.users, (v: SchoolUser[] | undefined) => { if (v) users.value = v; });
watch(() => props.classes, (v: SchoolClass[] | undefined) => { if (v) classes.value = v; });
watch(() => props.reports, (v: SchoolReportItem[] | undefined) => { if (v) reports.value = v; });
watch(() => props.warnings, (v: SchoolWarningItem[] | undefined) => { if (v) warnings.value = v; });

async function loadExtraData() {
  // Only fetch if props are not provided
  if (props.users && props.classes && props.reports && props.warnings) {
    loadingExtra.value = false;
    return;
  }
  loadingExtra.value = true;
  try {
    const [u, c, r, w] = await Promise.all([
      fetchJson<{ success: boolean; users: SchoolUser[] }>('/api/school/users?page=1&limit=200'),
      fetchJson<{ success: boolean; classes: SchoolClass[] }>('/api/school/classes'),
      fetchJson<{ success: boolean; reports: SchoolReportItem[] }>('/api/school/reports?page=1&limit=200'),
      fetchJson<{ success: boolean; warnings: SchoolWarningItem[] }>('/api/school/warnings'),
    ]);
    if (u.success) users.value = u.users;
    if (c.success) classes.value = c.classes;
    if (r.success) reports.value = r.reports;
    if (w.success) warnings.value = w.warnings;
  } catch { /* ignore */ }
  loadingExtra.value = false;
}

onMounted(() => {
  loadExtraData();
});

// Blocked users
const blockedUsers = computed(() => users.value.filter(u => u.blocked_at));

// Pending reports (submitted, not graded)
const pendingReports = computed(() => reports.value.filter(r => r.status === 'submitted'));

// Frozen classes
const frozenClasses = computed(() => classes.value.filter(c => c.is_frozen));

// Active warnings (high/critical)
const activeWarnings = computed(() => warnings.value.filter(w => w.severity === 'high' || w.severity === 'critical'));

// Empty classes (no students)
const emptyClasses = computed(() => classes.value.filter(c => c.student_count === 0));

// Has alerts
const hasAlerts = computed(() =>
  blockedUsers.value.length > 0 ||
  pendingReports.value.length > 0 ||
  activeWarnings.value.length > 0 ||
  frozenClasses.value.length > 0 ||
  emptyClasses.value.length > 0
);

// Reports distribution
const reportDist = computed(() => {
  const total = reports.value.length || 1;
  const graded = reports.value.filter(r => r.status === 'graded').length;
  const submitted = reports.value.filter(r => r.status === 'submitted').length;
  const draft = reports.value.filter(r => r.status === 'draft').length;
  const other = reports.value.length - graded - submitted - draft;
  return {
    graded: Math.round((graded / total) * 100),
    submitted: Math.round((submitted / total) * 100),
    draft: Math.round((draft / total) * 100),
    other: Math.round((other / total) * 100),
    gradedCount: graded,
    submittedCount: submitted,
    draftCount: draft,
  };
});

// Capacity percentage
const studentCapPct = computed(() => {
  if (!props.school || !props.stats) return 0;
  return Math.min(100, (props.stats.students / props.school.max_students) * 100);
});
const teacherCapPct = computed(() => {
  if (!props.school || !props.stats) return 0;
  return Math.min(100, (props.stats.teachers / props.school.max_teachers) * 100);
});

</script>

<template>
  <div class="tab-panel">

    <!-- ═══ Section 1: ملخص المدرسة ═══ -->
    <div class="section-header">
      <h2 class="section-title">📊 ملخص المدرسة</h2>
    </div>
    <div class="hero-stats">
      <div class="hero-card primary">
        <div class="hero-icon">🎓</div>
        <div class="hero-body">
          <div class="hero-label">الطلاب</div>
          <div class="hero-value">{{ stats?.students || 0 }}</div>
          <div class="hero-sub">من {{ school?.max_students || 0 }} • {{ studentCapPct.toFixed(0) }}%</div>
        </div>
      </div>
      <div class="hero-card">
        <div class="hero-icon">👨‍🏫</div>
        <div class="hero-body">
          <div class="hero-label">المعلمون</div>
          <div class="hero-value">{{ stats?.teachers || 0 }}</div>
          <div class="hero-sub">من {{ school?.max_teachers || 0 }} • {{ teacherCapPct.toFixed(0) }}%</div>
        </div>
      </div>
      <div class="hero-card">
        <div class="hero-icon">🏫</div>
        <div class="hero-body">
          <div class="hero-label">الفصول</div>
          <div class="hero-value">{{ stats?.classes || 0 }}</div>
          <div class="hero-sub">{{ frozenClasses.length }} مجمّد • {{ emptyClasses.length }} فارغ</div>
        </div>
      </div>
      <div class="hero-card accent">
        <div class="hero-icon">📄</div>
        <div class="hero-body">
          <div class="hero-label">التقارير</div>
          <div class="hero-value">{{ stats?.reports || 0 }}</div>
          <div class="hero-sub">{{ pendingReports.length }} معلّق</div>
        </div>
      </div>
    </div>

    <!-- ═══ Section 2: السعة ═══ -->
    <div class="section-header">
      <h2 class="section-title">📦 السعة</h2>
    </div>
    <div class="capacity-bar" v-if="school && stats">
      <div class="cap-row">
        <span>🎓 الطلاب: {{ stats.students }} / {{ school.max_students }}</span>
        <div class="bar"><div class="bar-fill" :style="{ width: studentCapPct + '%' }"></div></div>
      </div>
      <div class="cap-row">
        <span>👨‍🏫 المعلمون: {{ stats.teachers }} / {{ school.max_teachers }}</span>
        <div class="bar"><div class="bar-fill teacher" :style="{ width: teacherCapPct + '%' }"></div></div>
      </div>
    </div>

    <!-- ═══ Section 2.5: توزيع التقارير ═══ -->
    <div class="section-header">
      <h2 class="section-title">📊 توزيع التقارير</h2>
    </div>
    <div class="modern-card dist-card">
      <div class="dist-bar-container">
        <div class="dist-bar-segment graded" :style="{ width: reportDist.graded + '%' }" :title="'مصحح: ' + reportDist.gradedCount"></div>
        <div class="dist-bar-segment submitted" :style="{ width: reportDist.submitted + '%' }" :title="'معلّق: ' + reportDist.submittedCount"></div>
        <div class="dist-bar-segment draft" :style="{ width: reportDist.draft + '%' }" :title="'مسودة: ' + reportDist.draftCount"></div>
      </div>
      <div class="dist-legend">
        <span class="dist-leg-item"><span class="dist-dot graded"></span> مصحح ({{ reportDist.gradedCount }})</span>
        <span class="dist-leg-item"><span class="dist-dot submitted"></span> معلّق ({{ reportDist.submittedCount }})</span>
        <span class="dist-leg-item"><span class="dist-dot draft"></span> مسودة ({{ reportDist.draftCount }})</span>
      </div>
    </div>

    <!-- ═══ Section 3: إجراءات بانتظارك ═══ -->
    <div v-if="hasAlerts" class="section-header">
      <h2 class="section-title">⏳ إجراءات بانتظارك</h2>
    </div>
    <div v-if="hasAlerts" class="pending-grid">
      <button v-if="pendingReports.length > 0" class="pending-card warning" @click="emit('navigate', 'reports')">
        <span class="pending-icon">📄</span>
        <div class="pending-body">
          <span class="pending-label">تقارير معلّقة</span>
          <span class="pending-count">{{ pendingReports.length }}</span>
        </div>
        <span class="pending-arrow">←</span>
      </button>
      <button v-if="activeWarnings.length > 0" class="pending-card danger" @click="emit('navigate', 'warnings')">
        <span class="pending-icon">⚠️</span>
        <div class="pending-body">
          <span class="pending-label">تحذيرات نشطة</span>
          <span class="pending-count">{{ activeWarnings.length }}</span>
        </div>
        <span class="pending-arrow">←</span>
      </button>
      <button v-if="blockedUsers.length > 0" class="pending-card danger" @click="emit('navigate', 'users')">
        <span class="pending-icon">🚫</span>
        <div class="pending-body">
          <span class="pending-label">مستخدمون محظورون</span>
          <span class="pending-count">{{ blockedUsers.length }}</span>
        </div>
        <span class="pending-arrow">←</span>
      </button>
      <button v-if="frozenClasses.length > 0" class="pending-card info" @click="emit('navigate', 'classes')">
        <span class="pending-icon">❄️</span>
        <div class="pending-body">
          <span class="pending-label">فصول مجمّدة</span>
          <span class="pending-count">{{ frozenClasses.length }}</span>
        </div>
        <span class="pending-arrow">←</span>
      </button>
      <button v-if="emptyClasses.length > 0" class="pending-card info" @click="emit('navigate', 'classes')">
        <span class="pending-icon">📭</span>
        <div class="pending-body">
          <span class="pending-label">فصول فارغة</span>
          <span class="pending-count">{{ emptyClasses.length }}</span>
        </div>
        <span class="pending-arrow">←</span>
      </button>
    </div>

    <!-- ═══ Sections 4-6: أحدث العناصر ═══ -->
    <SchoolRecentItems :reports="reports" :users="users" :warnings="warnings" :loading="loadingExtra" :date-locale-str="dateLocaleStr" />

    <!-- ═══ Section 7: طلبات السعة ═══ -->
    <div class="section-header">
      <h2 class="section-title">📦 طلبات السعة</h2>
    </div>
    <SchoolCapacitySection :school="school" :date-locale-str="dateLocaleStr" />

  </div>
</template>

<style scoped src="./school-dashboard.css"></style>
