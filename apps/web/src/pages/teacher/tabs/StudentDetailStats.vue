<template>
  <div class="student-detail">
    <div class="student-profile">
      <div class="avatar-circle avatar--lg">{{ profile.student.name.charAt(0) }}</div>
      <div class="student-profile__body">
        <h4>
          {{ profile.student.name }}
          <span :class="['status-badge', isFrozen ? 'status-blocked' : 'status-active']">{{ isFrozen ? 'مجمد' : 'نشط' }}</span>
        </h4>
        <p class="text-secondary">{{ maskedEmail }}</p>
        <div class="profile-meta">
          <span>🏫 الفصل: {{ profile.className }}</span>
          <span v-if="profile.membership">🗓️ الانضمام: {{ formatDate(profile.membership.joined_at) }}</span>
          <span>⏱️ آخر دخول: {{ formatDateTime(profile.stats.lastLogin) }}</span>
          <span v-if="profile.student.blocked_at" class="text-danger">🚫 مجمد بتاريخ: {{ formatDate(profile.student.blocked_at) }}</span>
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
            <div class="stat-card-modern__value">{{ profile.stats.totalReports }}</div>
            <div class="stat-card-modern__label">إجمالي التقارير</div>
          </div>
        </div>
        <div class="stat-card-modern">
          <div class="stat-card-modern__icon">✅</div>
          <div class="stat-card-modern__body">
            <div class="stat-card-modern__value">{{ profile.stats.gradedReports }}</div>
            <div class="stat-card-modern__label">مصحّحة</div>
          </div>
        </div>
        <div class="stat-card-modern">
          <div class="stat-card-modern__icon">⏳</div>
          <div class="stat-card-modern__body">
            <div class="stat-card-modern__value">{{ profile.stats.pendingReports }}</div>
            <div class="stat-card-modern__label">معلّقة</div>
          </div>
        </div>
        <div class="stat-card-modern">
          <div class="stat-card-modern__icon">🎯</div>
          <div class="stat-card-modern__body">
            <div class="stat-card-modern__value">{{ Math.round(profile.stats.avgGrade) }}%</div>
            <div class="stat-card-modern__label">معدل التقارير</div>
          </div>
        </div>
        <div class="stat-card-modern">
          <div class="stat-card-modern__icon">🧮</div>
          <div class="stat-card-modern__body">
            <div class="stat-card-modern__value">{{ profile.stats.completedQuizzes }} / {{ profile.stats.totalQuizzes }}</div>
            <div class="stat-card-modern__label">الاختبارات</div>
          </div>
        </div>
        <div class="stat-card-modern">
          <div class="stat-card-modern__icon">⭐</div>
          <div class="stat-card-modern__body">
            <div class="stat-card-modern__value">{{ Math.round(profile.stats.quizAvg) }}%</div>
            <div class="stat-card-modern__label">معدل الاختبارات</div>
          </div>
        </div>
        <div class="stat-card-modern">
          <div class="stat-card-modern__icon">🏆</div>
          <div class="stat-card-modern__body">
            <div class="stat-card-modern__value">{{ profile.stats.badges }}</div>
            <div class="stat-card-modern__label">أوسمة</div>
          </div>
        </div>
        <div class="stat-card-modern">
          <div class="stat-card-modern__icon">⚠️</div>
          <div class="stat-card-modern__body">
            <div class="stat-card-modern__value">{{ profile.stats.penaltyPoints }}</div>
            <div class="stat-card-modern__label">نقاط جزاء</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'reports'" class="tab-panel">
      <div v-if="profile.reports.length" class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>التجربة</th><th>الحالة</th><th>العلامة</th><th>التاريخ</th></tr></thead>
          <tbody>
            <tr v-for="r in profile.reports" :key="r.id">
              <td>{{ r.experiment_name }}</td>
              <td>{{ statusLabel(r.status) }}</td>
              <td>{{ r.grade ?? '—' }}</td>
              <td>{{ formatDate(r.submitted_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-note">لا توجد تقارير</p>
    </div>

    <div v-if="activeTab === 'quizzes'" class="tab-panel">
      <div v-if="profile.quizzes.length" class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>الاختبار</th><th>الدرجة</th><th>التاريخ</th></tr></thead>
          <tbody>
            <tr v-for="q in profile.quizzes" :key="q.id">
              <td>{{ q.title }}</td>
              <td>{{ q.score ?? '—' }}</td>
              <td>{{ formatDate(q.submitted_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-note">لا توجد اختبارات</p>
    </div>

    <div v-if="activeTab === 'badges'" class="tab-panel">
      <div v-if="profile.badges.length" class="badges-row">
        <span v-for="b in profile.badges" :key="b.id" class="badge-chip">{{ b.icon }} {{ b.name }}</span>
      </div>
      <p v-else class="empty-note">لا توجد أوسمة</p>
    </div>

    <div v-if="activeTab === 'penalties'" class="tab-panel">
      <div v-if="profile.penalties.length" class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>النوع</th><th>السبب</th><th>النقاط</th><th>التاريخ</th></tr></thead>
          <tbody>
            <tr v-for="p in profile.penalties" :key="p.id">
              <td>{{ p.type }}</td>
              <td>{{ p.reason }}</td>
              <td>{{ p.points }}</td>
              <td>{{ formatDate(p.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-note">لا توجد جزاءات</p>
    </div>

    <div v-if="activeTab === 'activity'" class="tab-panel">
      <div v-if="profile.activity.length" class="detail-table-wrap">
        <table class="detail-table">
          <thead><tr><th>الإجراء</th><th>التفاصيل</th><th>التاريخ</th></tr></thead>
          <tbody>
            <tr v-for="(a, i) in profile.activity" :key="i">
              <td>{{ a.action }}</td>
              <td>{{ a.details || '—' }}</td>
              <td>{{ formatDateTime(a.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="empty-note">لا يوجد نشاط</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { StudentProfile } from '@/services/core/teacher.api'

const props = defineProps<{ profile: StudentProfile }>()

const activeTab = ref('overview')
const tabLabels: Record<string, string> = {
  overview: 'نظرة عامة',
  reports: 'التقارير',
  quizzes: 'الاختبارات',
  badges: 'الأوسمة',
  penalties: 'الجزاءات',
  activity: 'النشاط',
}
const tabs = Object.keys(tabLabels)

const isFrozen = computed(() => !!props.profile.student.blocked_at)

const maskedEmail = computed(() => {
  const email = props.profile.student.email
  const [name, domain] = email.split('@')
  return (!domain || name.length <= 2) ? email : name.slice(0, 2) + '•••@' + domain
})

function formatDate(d: string | null) { return d ? new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'short', day: 'numeric' }) : '—' }
function formatDateTime(d: string | null) {
  return d ? new Date(d).toLocaleString('ar', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
}
function statusLabel(s: string) { return ({ submitted: 'مرسل', graded: 'مصحح', draft: 'مسودة', resubmitted: 'إعادة إرسال' } as Record<string, string>)[s] || s }
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.student-detail { padding: 14px; }
.student-profile { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.avatar--lg { width: 64px; height: 64px; font-size: 28px; }
.student-profile__body h4 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font-size: 18px; }
.profile-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.detail-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border-color); margin-bottom: 14px; }
.detail-tab { background: transparent; border: none; padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; transition: color 0.12s; }
.detail-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-panel { animation: fadeIn 0.15s; }
.empty-note { text-align: center; color: var(--text-secondary); padding: 12px; }
.text-secondary { color: var(--text-secondary); margin: 0; }
.text-danger { color: var(--danger-text); }
.badges-row { display: flex; gap: 8px; flex-wrap: wrap; }
.badge-chip { padding: 5px 12px; border-radius: 16px; background: var(--bg-hover, #f8fafc); font-size: 12px; border: 1px solid var(--border-color, #e5e7eb); font-weight: 600; }
.status-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 700; }
.status-active { background: #dcfce7; color: #16a34a; }
.status-blocked { background: #fee2e2; color: #dc2626; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
