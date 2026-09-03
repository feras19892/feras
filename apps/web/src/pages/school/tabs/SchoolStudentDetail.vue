<script setup lang="ts">
import SchoolHelpButton from '@/components/school/SchoolHelpButton.vue'
import { computed, ref } from 'vue'
import type { SchoolUserDetailResult } from '@/services/school.service'
import type { StudentEvaluation } from '@/services/school-reports.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'

const props = defineProps<{
  detailData: SchoolUserDetailResult | null
  detailLoading: boolean
  student: StudentEvaluation
}>()

const activeTab = ref('overview')
const tabLabels: Record<string, string> = {
  overview: 'نظرة عامة',
  classes: 'الفصول',
  reports: 'التقارير',
  warnings: 'التحذيرات',
  activity: 'النشاط',
  sessions: 'الجلسات',
}
const tabs = Object.keys(tabLabels)

const status = computed(() => props.detailData?.user?.blocked_at ? 'محظور' : 'نشط')
const lastLogin = computed(() => props.detailData?.sessions?.[0]?.login_at)

function formatDate(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString('ar') : '—'
}
function formatDateTime(d: string | null | undefined) {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('ar') + ' ' + dt.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="student-expand" @click.stop>
    <SkeletonLoader v-if="detailLoading" type="table" :count="3" />
    <div v-else-if="detailData" class="student-detail">
      <div class="student-profile">
        <div class="avatar-circle avatar--lg">{{ detailData.user.name.charAt(0) }}</div>
        <div class="student-profile__body">
          <h4>
            {{ detailData.user.name }}
            <span :class="['status-badge', detailData.user.blocked_at ? 'status-blocked' : 'status-active']">{{ status }}</span>
          </h4>
          <SchoolHelpButton tab-id="student-detail" />
          <p class="text-secondary">{{ detailData.user.email }}</p>
          <div class="profile-meta">
            <span>🗓️ التسجيل: {{ formatDate(detailData.user.created_at) }}</span>
            <span v-if="lastLogin">⏱️ آخر دخول: {{ formatDateTime(lastLogin) }}</span>
            <span v-if="detailData.user.blocked_at" class="text-danger">🚫 محظور: {{ formatDate(detailData.user.blocked_at) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-tabs">
        <button v-for="tab in tabs" :key="tab" :class="['detail-tab', { active: activeTab === tab }]" @click="activeTab = tab">{{ tabLabels[tab] }}</button>
      </div>

      <div v-if="activeTab === 'overview'" class="tab-panel">
        <div class="stat-cards-grid">
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">📄</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detailData.stats.totalReports }}</div>
              <div class="stat-card-modern__label">إجمالي التقارير</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">✅</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detailData.stats.gradedReports }}</div>
              <div class="stat-card-modern__label">مصحّحة</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">⏳</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detailData.stats.pendingReports }}</div>
              <div class="stat-card-modern__label">معلّقة</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">🎯</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ Math.round(detailData.stats.avgGrade) }}%</div>
              <div class="stat-card-modern__label">معدل العلامات</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">🏫</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detailData.stats.totalClasses }}</div>
              <div class="stat-card-modern__label">الفصول</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">⭐</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ Math.round(student.student_score) }}</div>
              <div class="stat-card-modern__label">التقييم</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'classes'" class="tab-panel">
        <div v-if="detailData.joinedClasses.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>الفصل</th><th>المعلّم</th><th>الحالة</th></tr></thead>
            <tbody><tr v-for="c in detailData.joinedClasses" :key="c.id"><td>{{ c.name }}</td><td>{{ c.teacher_name || '—' }}</td><td>{{ c.is_frozen ? '🔒 مجمد' : '✅ نشط' }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">لا توجد فصول</p>
      </div>

      <div v-if="activeTab === 'reports'" class="tab-panel">
        <div v-if="detailData.reports.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>التجربة</th><th>الفصل</th><th>الحالة</th><th>العلامة</th><th>التاريخ</th></tr></thead>
            <tbody><tr v-for="r in detailData.reports" :key="r.id"><td>{{ r.experiment_name }}</td><td>{{ r.class_name ?? '—' }}</td><td>{{ r.status }}</td><td>{{ r.grade ?? '—' }}</td><td>{{ formatDate(r.submitted_at || r.created_at) }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">لا توجد تقارير</p>
      </div>

      <div v-if="activeTab === 'warnings'" class="tab-panel">
        <div v-if="detailData.warnings.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>العنوان</th><th>الرسالة</th><th>الخطورة</th><th>التاريخ</th></tr></thead>
            <tbody><tr v-for="w in detailData.warnings" :key="w.id"><td>{{ w.title }}</td><td>{{ w.message }}</td><td>{{ w.severity }}</td><td>{{ formatDate(w.created_at) }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">لا توجد تحذيرات</p>
      </div>

      <div v-if="activeTab === 'activity'" class="tab-panel">
        <div v-if="detailData.activity.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>الإجراء</th><th>التفاصيل</th><th>التاريخ</th></tr></thead>
            <tbody><tr v-for="(a, i) in detailData.activity" :key="i"><td>{{ a.action }}</td><td>{{ a.details || '—' }}</td><td>{{ formatDateTime(a.created_at) }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">لا يوجد نشاط</p>
      </div>

      <div v-if="activeTab === 'sessions'" class="tab-panel">
        <div v-if="detailData.sessions.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>تاريخ الدخول</th><th>تاريخ الخروج</th></tr></thead>
            <tbody><tr v-for="(s, i) in detailData.sessions" :key="i"><td>{{ formatDateTime(s.login_at) }}</td><td>{{ s.logout_at ? formatDateTime(s.logout_at) : '—' }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">لا توجد جلسات</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.student-detail { padding: 16px; border-top: 1px dashed var(--border-color); }
.student-profile { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.avatar--lg { width: 64px; height: 64px; font-size: 28px; }
.student-profile__body h4 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font-size: 18px; }
.profile-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.detail-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border-color); margin-bottom: 14px; }
.detail-tab { background: transparent; border: none; padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; transition: color 0.12s; }
.detail-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-panel { animation: fadeIn 0.15s; }
.empty { text-align: center; color: var(--text-secondary); padding: 12px; }
.text-secondary { color: var(--text-secondary); margin: 0; }
.text-danger { color: var(--danger-text); }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
