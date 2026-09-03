<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, locale } = useI18n();
import type { SchoolUser } from '../../../services/school.service';
defineProps<{ users: SchoolUser[] }>();
const emit = defineEmits<{
  remove: [userId: number];
  block: [userId: number];
  unblock: [userId: number];
}>();

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(
    locale.value === 'ar' ? 'ar-SA' : locale.value === 'es' ? 'es-ES' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );
}
</script>

<template>
  <div class="tab-content">
    <div v-if="users.length === 0" class="empty-state">
      <p>{{ t('admin.schoolNoUsers') }}</p>
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>{{ t('admin.name') }}</th>
          <th>{{ t('admin.schoolEmail') }}</th>
          <th>{{ t('admin.teacher') }}</th>
          <th>{{ t('admin.schoolStatus') }}</th>
          <th>{{ t('admin.schoolDate') }}</th>
          <th>{{ t('admin.schoolActions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="u in users" :key="u.id" :class="{ blocked: !!u.blocked_at }">
          <td class="user-name">{{ u.name }}</td>
          <td>{{ u.email }}</td>
          <td>
            <span class="role-badge" :class="u.role">
              {{ u.role === 'student' ? t('admin.roleStudent') : u.role === 'teacher' ? t('admin.roleTeacher') : u.role }}
            </span>
          </td>
          <td>
            <span class="status-badge" :class="u.blocked_at ? 'suspended' : 'active'">
              {{ u.blocked_at ? t('admin.schoolSuspended') : t('admin.schoolActive') }}
            </span>
          </td>
          <td>{{ formatDate(u.created_at) }}</td>
          <td class="actions-cell">
            <button v-if="!u.blocked_at" class="btn-icon" @click="emit('block', u.id)" :title="t('admin.schoolBlock')">⛔</button>
            <button v-else class="btn-icon" @click="emit('unblock', u.id)" :title="t('admin.schoolUnblock')">✅</button>
            <button class="btn-icon" @click="emit('remove', u.id)" :title="t('admin.schoolRemove')">🚫</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tab-content { padding: 0.5rem 0; }
.empty-state { text-align: center; padding: 2rem; color: #64748b; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { text-align: start; padding: 0.6rem 0.8rem; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid rgba(255,255,255,0.06); text-transform: uppercase; letter-spacing: 0.5px; }
.data-table td { padding: 0.7rem 0.8rem; font-size: 0.85rem; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.04); }
.data-table tr.blocked { opacity: 0.5; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }

.user-name { font-weight: 600; color: #e2e8f0; }
.role-badge { font-size: 0.72rem; padding: 0.15rem 0.4rem; border-radius: 0.3rem; }
.role-badge.student { background: rgba(59,130,246,0.15); color: #93c5fd; }
.role-badge.teacher { background: rgba(168,85,247,0.15); color: #d8b4fe; }

.status-badge { font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 0.3rem; }
.status-badge.active { background: rgba(34,197,94,0.15); color: #4ade80; }
.status-badge.suspended { background: rgba(239,68,68,0.15); color: #fca5a5; }

.actions-cell { display: flex; gap: 0.3rem; }
.btn-icon { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 0.4rem; padding: 0.25rem 0.45rem; cursor: pointer; font-size: 0.85rem; }
.btn-icon:hover { background: rgba(255,255,255,0.1); }
</style>
