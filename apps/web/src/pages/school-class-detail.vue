<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '../composables/useI18n';
import { useAuthStore } from '../modules/auth/stores/auth';
import {
  getSchoolClassDetail, 
  type SchoolClass, 
  type SchoolUser,
  type SchoolReportItem,
} from '../services/school.service';
import AccountSettingsModal from '../components/shared/AccountSettingsModal.vue';
import SchoolNotificationBell from '../components/shared/SchoolNotificationBell.vue';

const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();
const auth = useAuthStore();

const classId = route.params.id as string;
const loading = ref(true);
const error = ref('');

interface ClassMessage {
  id: number;
  user_name: string;
  user_role?: string;
  content: string;
  created_at: string;
  is_flagged?: boolean;
  flagged_reason?: string;
}

interface ClassStudent extends SchoolUser {
  report_count?: number;
  joined_at?: string;
}

const cls = ref<(SchoolClass & { is_active?: boolean; teacher_email?: string }) | null>(null);
const students = ref<ClassStudent[]>([]);
const messages = ref<ClassMessage[]>([]);
const reports = ref<SchoolReportItem[]>([]);
const stats = ref<Record<string, unknown>>({});

const activeTab = ref<'overview' | 'students' | 'chat' | 'reports'>('overview');

const dateLocaleStr = computed(() => locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US');

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const res = await getSchoolClassDetail(classId);
    if (res.success) {
      cls.value = res.class;
      students.value = res.students || [];
      messages.value = res.messages || [];
      reports.value = res.reports || [];
      stats.value = res.stats || {};
    } else {
      error.value = (res as any).message || 'Failed to load';
    }
  } catch (err) {
    error.value = 'Failed to load class data';
    if (import.meta.env.DEV) console.error('school-class-detail load failed:', err);
  } finally {
    loading.value = false;
  }
}

function fmtDate(s?: string | null) {
  if (!s) return '—';
  return new Date(s).toLocaleDateString(dateLocaleStr.value, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

onMounted(loadData);
</script>

<template>
  <div class="scd-page">
    <!-- Header -->
    <div class="scd-header">
      <div class="scd-back" @click="router.push('/school')">
        <span>{{ t('shared.back') }}</span>
      </div>
      <div class="scd-header-right">
        <AccountSettingsModal />
        <SchoolNotificationBell />
        <button class="logout-btn" @click="auth.clearSchoolSession(); router.push('/')">{{ t('shared.logout') }}</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="scd-loading"><div class="spinner"></div></div>
    <div v-else-if="error" class="scd-error">❌ {{ error }}</div>

    <div v-else>
      <!-- Class Info Card -->
      <div class="scd-class-card">
        <div class="scd-class-icon">📚</div>
        <div class="scd-class-info">
          <h2>{{ cls?.name }}</h2>
          <div class="scd-class-meta">
            <span class="meta-item"><strong>{{ t('shared.scdCode') }}</strong> <code>{{ cls?.code }}</code></span>
            <span class="meta-item"><strong>{{ t('shared.scdTeacher') }}</strong> {{ cls?.teacher_name }}</span>
            <span class="meta-item"><strong>{{ t('shared.scdStatus') }}</strong> {{ cls?.is_active ? t('shared.scdActive') : t('shared.scdClosed') }}</span>
          </div>
        </div>
      </div>

      <!-- Stats Strip -->
      <div class="scd-stats-strip">
        <div class="stat-item"><span class="stat-icon">🎓</span><span class="stat-val">{{ stats.studentCount || 0 }}</span><span class="stat-lab">{{ t('shared.scdStatStudents') }}</span></div>
        <div class="stat-item"><span class="stat-icon">💬</span><span class="stat-val">{{ stats.messageCount || 0 }}</span><span class="stat-lab">{{ t('shared.scdStatMessages') }}</span></div>
        <div class="stat-item"><span class="stat-icon">🚩</span><span class="stat-val">{{ stats.flaggedCount || 0 }}</span><span class="stat-lab">{{ t('shared.scdStatFlagged') }}</span></div>
        <div class="stat-item"><span class="stat-icon">📄</span><span class="stat-val">{{ stats.reportCount || 0 }}</span><span class="stat-lab">{{ t('shared.scdStatReports') }}</span></div>
        <div class="stat-item"><span class="stat-icon">✅</span><span class="stat-val">{{ stats.gradedCount || 0 }}</span><span class="stat-lab">{{ t('shared.scdStatGraded') }}</span></div>
      </div>

      <!-- Tabs -->
      <div class="scd-tabs">
        <button :class="['tab', { active: activeTab === 'overview' }]" @click="activeTab = 'overview'"><span>📊</span> {{ t('shared.scdTabOverview') }}</button>
        <button :class="['tab', { active: activeTab === 'students' }]" @click="activeTab = 'students'"><span>🎓</span> {{ t('shared.scdTabStudents') }} <span v-if="students.length" class="tab-badge">{{ students.length }}</span></button>
        <button :class="['tab', { active: activeTab === 'chat' }]" @click="activeTab = 'chat'"><span>💬</span> {{ t('shared.scdTabChat') }} <span v-if="messages.length" class="tab-badge">{{ messages.length }}</span></button>
        <button :class="['tab', { active: activeTab === 'reports' }]" @click="activeTab = 'reports'"><span>📄</span> {{ t('shared.scdTabReports') }} <span v-if="reports.length" class="tab-badge">{{ reports.length }}</span></button>
      </div>

      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="scd-tab-panel">
        <div class="scd-grid">
          <div class="scd-card">
            <h3>{{ t('shared.scdClassInfo') }}</h3>
            <div class="info-row"><span>{{ t('shared.scdName') }}</span><strong>{{ cls?.name }}</strong></div>
            <div class="info-row"><span>{{ t('shared.scdCode') }}</span><strong><code>{{ cls?.code }}</code></strong></div>
            <div class="info-row"><span>{{ t('shared.scdTeacher') }}</span><strong>{{ cls?.teacher_name }}</strong></div>
            <div class="info-row"><span>{{ t('shared.scdTeacherEmail') }}</span><strong>{{ cls?.teacher_email }}</strong></div>
            <div class="info-row"><span>{{ t('shared.scdStatus') }}</span><strong>{{ cls?.is_active ? t('shared.scdActive').replace('✅ ', '') : t('shared.scdClosed').replace('🔴 ', '') }}</strong></div>
            <div class="info-row"><span>{{ t('shared.scdCreated') }}</span><strong>{{ fmtDate(cls?.created_at) }}</strong></div>
          </div>
          <div class="scd-card">
            <h3>{{ t('shared.scdStats') }}</h3>
            <div class="mini-stat"><span>🎓 {{ t('shared.scdStudentCount') }}</span><strong>{{ stats.studentCount || 0 }}</strong></div>
            <div class="mini-stat"><span>💬 {{ t('shared.scdMessageCount') }}</span><strong>{{ stats.messageCount || 0 }}</strong></div>
            <div class="mini-stat"><span>🚩 {{ t('shared.scdFlaggedCount') }}</span><strong>{{ stats.flaggedCount || 0 }}</strong></div>
            <div class="mini-stat"><span>📄 {{ t('shared.scdReportCount') }}</span><strong>{{ stats.reportCount || 0 }}</strong></div>
            <div class="mini-stat"><span>✅ {{ t('shared.scdGradedCount') }}</span><strong>{{ stats.gradedCount || 0 }}</strong></div>
          </div>
        </div>
      </div>

      <!-- Students Tab -->
      <div v-if="activeTab === 'students'" class="scd-tab-panel">
        <div v-if="students.length === 0" class="scd-empty">{{ t('shared.scdNoStudents') }}</div>
        <div v-else class="scd-table-wrap">
          <table class="scd-table">
            <thead><tr><th>{{ t('shared.scdThName') }}</th><th>{{ t('shared.scdThEmail') }}</th><th>{{ t('shared.scdThReports') }}</th><th>{{ t('shared.scdThJoined') }}</th></tr></thead>
            <tbody>
              <tr v-for="s in students" :key="s.id" class="clickable-row" @click="router.push(`/school/user/${s.id}`)">
                <td>{{ s.name }}</td>
                <td>{{ s.email }}</td>
                <td>{{ s.report_count }}</td>
                <td>{{ fmtDate(s.joined_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Chat Tab -->
      <div v-if="activeTab === 'chat'" class="scd-tab-panel">
        <div v-if="messages.length === 0" class="scd-empty">{{ t('shared.scdNoMessages') }}</div>
        <div v-else class="scd-chat">
          <div v-for="m in messages" :key="m.id" class="chat-msg" :class="{ flagged: m.is_flagged }">
            <div class="chat-msg-header">
              <span class="chat-author" :class="m.user_role">{{ m.user_name }}</span>
              <span class="chat-role">{{ m.user_role === 'teacher' ? '👨‍🏫' : '🎓' }}</span>
              <span v-if="m.is_flagged" class="chat-flag">{{ t('shared.scdFlaggedReason') }} {{ m.flagged_reason }}</span>
              <span class="chat-date">{{ fmtDate(m.created_at) }}</span>
            </div>
            <p class="chat-content">{{ m.content }}</p>
          </div>
        </div>
      </div>

      <!-- Reports Tab -->
      <div v-if="activeTab === 'reports'" class="scd-tab-panel">
        <div v-if="reports.length === 0" class="scd-empty">{{ t('shared.scdNoReports') }}</div>
        <div v-else class="scd-table-wrap">
          <table class="scd-table">
            <thead><tr><th>{{ t('shared.sudThExperiment') }}</th><th>{{ t('shared.scdThStudent') }}</th><th>{{ t('shared.sudThStatus') }}</th><th>{{ t('shared.sudThGrade') }}</th><th>{{ t('shared.sudThDate') }}</th></tr></thead>
            <tbody>
              <tr v-for="r in reports" :key="r.id">
                <td>{{ r.experiment_name }}</td>
                <td>{{ r.student_name }}</td>
                <td><span class="status-tag" :class="r.status">{{ r.status }}</span></td>
                <td>{{ r.grade != null ? r.grade : '—' }}</td>
                <td>{{ fmtDate(r.submitted_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped src='./school-class-detail.css'></style>
