<script setup lang="ts">
import { computed } from 'vue';
import type { SchoolUser, SchoolReportItem, SchoolWarningItem } from '../../services/school.service';

const props = defineProps<{
  reports: SchoolReportItem[];
  users: SchoolUser[];
  warnings: SchoolWarningItem[];
  loading: boolean;
  dateLocaleStr: string;
}>();

const recentReports = computed(() =>
  [...props.reports]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)
);

const recentUsers = computed(() =>
  [...props.users]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5)
);

const recentWarnings = computed(() =>
  [...props.warnings]
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 4)
);

function formatTime(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const loc = props.dateLocaleStr;
  if (diffMin < 1) return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
  if (diffMin < 60) return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
  if (diffHr < 24) return d.toLocaleTimeString(loc, { hour: '2-digit', minute: '2-digit' });
  if (diffDay < 7) return d.toLocaleDateString(loc, { weekday: 'short', day: 'numeric' });
  return d.toLocaleDateString(loc);
}
</script>

<template>
  <!-- Recent Reports -->
  <div class="section-header">
    <h2 class="section-title">📄 أحدث التقارير</h2>
  </div>
  <div class="modern-card">
    <div v-if="loading" class="empty-inline">جاري التحميل...</div>
    <div v-else-if="recentReports.length === 0" class="empty-inline">لا توجد تقارير</div>
    <div v-else class="recent-list">
      <div v-for="r in recentReports" :key="r.id" class="recent-item">
        <span class="recent-icon">{{ r.status === 'graded' ? '✅' : r.status === 'submitted' ? '📝' : '✏️' }}</span>
        <div class="recent-info">
          <span class="recent-name">{{ r.experiment_name }}</span>
          <span class="recent-meta">{{ r.student_name }} • {{ r.class_name || '—' }}</span>
        </div>
        <span class="recent-badge" :class="r.status">{{ r.status === 'graded' ? 'مصحح' : r.status === 'submitted' ? 'معلّق' : 'مسودة' }}</span>
        <span class="recent-date">{{ formatTime(r.created_at) }}</span>
      </div>
    </div>
  </div>

  <!-- Recent Users -->
  <div class="section-header">
    <h2 class="section-title">👥 أحدث المستخدمين</h2>
  </div>
  <div class="modern-card">
    <div v-if="loading" class="empty-inline">جاري التحميل...</div>
    <div v-else-if="recentUsers.length === 0" class="empty-inline">لا يوجد مستخدمون</div>
    <div v-else class="recent-list">
      <div v-for="u in recentUsers" :key="u.id" class="recent-item">
        <span class="recent-icon">{{ u.role === 'teacher' ? '👨‍🏫' : '🎓' }}</span>
        <div class="recent-info">
          <span class="recent-name">{{ u.name }}</span>
          <span class="recent-meta">{{ u.email }}</span>
        </div>
        <span class="recent-badge" :class="u.role">{{ u.role === 'teacher' ? 'معلم' : 'طالب' }}</span>
        <span v-if="u.blocked_at" class="recent-badge danger">محظور</span>
        <span class="recent-date">{{ formatTime(u.created_at) }}</span>
      </div>
    </div>
  </div>

  <!-- Recent Warnings -->
  <div v-if="recentWarnings.length > 0" class="section-header">
    <h2 class="section-title">⚠️ أحدث التحذيرات</h2>
  </div>
  <div v-if="recentWarnings.length > 0" class="modern-card">
    <div class="recent-list">
      <div v-for="w in recentWarnings" :key="w.id" class="recent-item">
        <span class="recent-icon">{{ w.severity === 'critical' ? '🚨' : w.severity === 'high' ? '⚠️' : '🔔' }}</span>
        <div class="recent-info">
          <span class="recent-name">{{ w.title }}</span>
          <span class="recent-meta">{{ w.user_name }} ({{ w.user_role }}) • {{ w.message?.slice(0, 60) }}</span>
        </div>
        <span class="recent-badge" :class="w.severity === 'critical' ? 'danger' : w.severity === 'high' ? 'warn' : ''">{{ w.severity }}</span>
        <span class="recent-date">{{ formatTime(w.created_at) }}</span>
      </div>
    </div>
  </div>
</template>
