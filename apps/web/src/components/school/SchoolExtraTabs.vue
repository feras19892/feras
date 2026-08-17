<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';

interface SchoolSessionRow {
  id: number;
  user_name: string;
  user_role: string;
  ip?: string;
  user_agent?: string;
  login_at: string;
  logout_at?: string | null;
}

interface SchoolActivityRow {
  id: number;
  action: string;
  actor_name: string;
  details?: string;
  created_at: string;
}

interface SchoolWarningRow {
  id: number;
  title: string;
  message: string;
  severity: string;
  user_name: string;
  user_role: string;
  created_at: string;
}

defineProps<{
  activeTab: string;
  sessions: SchoolSessionRow[];
  activityLog: SchoolActivityRow[];
  schoolWarnings: SchoolWarningRow[];
  dateLocaleStr: string;
}>();

const { t } = useI18n();
</script>

<template>
  <!-- Sessions Tab -->
  <div v-if="activeTab === 'sessions'" class="tab-panel">
    <div v-if="sessions.length === 0" class="empty-state"><div class="empty-icon">🔑</div><p>{{ t('school.noSessions') }}</p></div>
    <table v-else class="data-table">
      <thead><tr><th>{{ t('school.thUser') }}</th><th>{{ t('school.thRole') }}</th><th>{{ t('school.thIP') }}</th><th>{{ t('school.thBrowser') }}</th><th>{{ t('school.thLogin') }}</th><th>{{ t('school.thLogout') }}</th></tr></thead>
      <tbody>
        <tr v-for="s in sessions" :key="s.id">
          <td>{{ s.user_name }}</td>
          <td><span class="role-tag" :class="s.user_role">{{ s.user_role === 'teacher' ? '👨‍🏫' : '🎓' }} {{ s.user_role }}</span></td>
          <td>{{ s.ip || '—' }}</td>
          <td class="ua-cell">{{ s.user_agent || '—' }}</td>
          <td>{{ new Date(s.login_at).toLocaleString(dateLocaleStr) }}</td>
          <td>{{ s.logout_at ? new Date(s.logout_at).toLocaleString(dateLocaleStr) : t('school.sessionActive') }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Activity Tab -->
  <div v-if="activeTab === 'activity'" class="tab-panel">
    <div v-if="activityLog.length === 0" class="empty-state"><div class="empty-icon">📝</div><p>{{ t('school.noActivity') }}</p></div>
    <div v-else class="activity-list">
      <div v-for="a in activityLog" :key="a.id" class="activity-item">
        <div class="activity-dot"></div>
        <div class="activity-body">
          <span class="activity-action">{{ a.action }}</span>
          <span class="activity-actor">{{ a.actor_name }}</span>
          <span class="activity-details">{{ a.details }}</span>
          <span class="activity-date">{{ new Date(a.created_at).toLocaleString(dateLocaleStr) }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Warnings Tab -->
  <div v-if="activeTab === 'warnings'" class="tab-panel">
    <div v-if="schoolWarnings.length === 0" class="empty-state"><div class="empty-icon">⚠️</div><p>{{ t('school.noWarnings') }}</p></div>
    <div v-else class="warnings-list">
      <div v-for="w in schoolWarnings" :key="w.id" class="warning-card" :class="w.severity">
        <div class="warning-header">
          <span class="warning-sev" :class="w.severity">{{ w.severity }}</span>
          <span class="warning-title">{{ w.title }}</span>
          <span class="warning-user">{{ w.user_name }} ({{ w.user_role }})</span>
        </div>
        <p class="warning-msg">{{ w.message }}</p>
        <span class="warning-date">{{ new Date(w.created_at).toLocaleString(dateLocaleStr) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped src="./school-tables.css"></style>
