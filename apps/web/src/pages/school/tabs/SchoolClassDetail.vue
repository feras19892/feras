<script setup lang="ts">
import SchoolHelpButton from '@/components/school/SchoolHelpButton.vue'
import { computed, ref } from 'vue'
import type { SchoolClassDetailResult } from '@/services/school.service'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'

const props = defineProps<{
  detail: SchoolClassDetailResult | null
  extra: { pendingCount: number; classAverage: number }
  loading: boolean
}>()

const activeTab = ref('overview')
const tabLabels: Record<string, string> = {
  overview: 'نظرة عامة',
  students: 'الطلاب',
  reports: 'التقارير',
  messages: 'الرسائل',
}
const tabs = Object.keys(tabLabels)

const status = computed(() => props.detail?.class?.is_frozen ? 'مجمد' : 'نشط')

function formatDate(d?: string | null) {
  return d ? new Date(d).toLocaleDateString('ar') : '—'
}
</script>

<template>
  <div class="class-expand" @click.stop>
    <SkeletonLoader v-if="loading" type="table" :count="3" />
    <div v-else-if="detail" class="class-detail">
      <div class="class-profile">
        <div class="class-profile__body">
          <h4>
            {{ detail.class.name }}
            <span :class="['status-badge', detail.class.is_frozen ? 'status-blocked' : 'status-active']">{{ status }}</span>
          </h4>
          <SchoolHelpButton tab-id="class-detail" />
          <p class="text-secondary">الكود: {{ detail.class.code }} · المدرس: {{ detail.class.teacher_name || '—' }}</p>
          <div class="profile-meta">
            <span>🗓️ الإنشاء: {{ formatDate(detail.class.created_at) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-tabs">
        <button v-for="tab in tabs" :key="tab" :class="['detail-tab', { active: activeTab === tab }]" @click="activeTab = tab">{{ tabLabels[tab] }}</button>
      </div>

      <div v-if="activeTab === 'overview'" class="tab-panel">
        <div class="stat-cards-grid">
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">👨‍🎓</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detail.stats.studentCount }}</div>
              <div class="stat-card-modern__label">الطلاب</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">📄</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detail.stats.reportCount }}</div>
              <div class="stat-card-modern__label">التقارير</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">✅</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detail.stats.gradedCount }}</div>
              <div class="stat-card-modern__label">مصحّحة</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">⏳</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ extra.pendingCount }}</div>
              <div class="stat-card-modern__label">معلّقة</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">🎯</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ Math.round(extra.classAverage) }}%</div>
              <div class="stat-card-modern__label">معدل الفصل</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">💬</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detail.stats.messageCount }}</div>
              <div class="stat-card-modern__label">الرسائل</div>
            </div>
          </div>
          <div class="stat-card-modern">
            <div class="stat-card-modern__icon">⚠️</div>
            <div class="stat-card-modern__body">
              <div class="stat-card-modern__value">{{ detail.stats.flaggedCount }}</div>
              <div class="stat-card-modern__label">مُبلّغ</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'students'" class="tab-panel">
        <div v-if="detail.students.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>الطالب</th><th>البريد</th><th>تقارير</th><th>الانضمام</th></tr></thead>
            <tbody><tr v-for="s in detail.students" :key="s.id"><td>{{ s.name }}</td><td>{{ s.email }}</td><td>{{ s.report_count }}</td><td>{{ formatDate(s.joined_at) }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">لا يوجد طلاب</p>
      </div>

      <div v-if="activeTab === 'reports'" class="tab-panel">
        <div v-if="detail.reports.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>التجربة</th><th>الطالب</th><th>الحالة</th><th>الدرجة</th></tr></thead>
            <tbody><tr v-for="r in detail.reports" :key="r.id"><td>{{ r.experiment_name }}</td><td>{{ r.student_name }}</td><td>{{ r.status }}</td><td>{{ r.grade ?? '—' }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">لا توجد تقارير</p>
      </div>

      <div v-if="activeTab === 'messages'" class="tab-panel">
        <div v-if="detail.messages.length" class="detail-table-wrap">
          <table class="detail-table">
            <thead><tr><th>المستخدم</th><th>المحتوى</th><th>التاريخ</th></tr></thead>
            <tbody><tr v-for="m in detail.messages" :key="m.id"><td>{{ m.user_name }}</td><td>{{ m.content }}</td><td>{{ formatDate(m.created_at) }}</td></tr></tbody>
          </table>
        </div>
        <p v-else class="empty">لا توجد رسائل</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.class-detail { padding: 16px; border-top: 1px dashed var(--border-color); }
.class-profile__body h4 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font-size: 18px; }
.profile-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.detail-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border-color); margin-bottom: 14px; }
.detail-tab { background: transparent; border: none; padding: 8px 14px; font-size: 13px; font-weight: 600; color: var(--text-secondary); cursor: pointer; border-bottom: 2px solid transparent; font-family: inherit; transition: color 0.12s; }
.detail-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
.tab-panel { animation: fadeIn 0.15s; }
.empty { text-align: center; color: var(--text-secondary); padding: 12px; }
.text-secondary { color: var(--text-secondary); margin: 0; }
.status-badge { font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 700; }
.status-active { background: #dcfce7; color: #16a34a; }
.status-blocked { background: #fee2e2; color: #dc2626; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
