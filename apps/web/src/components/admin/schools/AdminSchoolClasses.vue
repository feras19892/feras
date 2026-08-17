<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n';
import type { SchoolClass } from '../../../services/school.service';

const { t, locale } = useI18n();

defineProps<{ classes: SchoolClass[] }>();

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
    <div v-if="classes.length === 0" class="empty-state">
      <p>{{ t('admin.schoolNoClasses') }}</p>
    </div>
    <table v-else class="data-table">
      <thead>
        <tr>
          <th>{{ t('admin.className') }}</th>
          <th>{{ t('admin.classCode') }}</th>
          <th>{{ t('admin.teacher') }}</th>
          <th>{{ t('admin.students') }}</th>
          <th>{{ t('admin.createdAt') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in classes" :key="c.id">
          <td class="class-name">{{ c.name }}</td>
          <td><code class="class-code">{{ c.code }}</code></td>
          <td>{{ c.teacher_name }}</td>
          <td>{{ c.student_count }}</td>
          <td>{{ formatDate(c.created_at) }}</td>
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
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.class-name { font-weight: 600; color: #e2e8f0; }
.class-code { background: rgba(168,85,247,0.1); border: 1px solid rgba(168,85,247,0.2); border-radius: 0.3rem; padding: 0.15rem 0.4rem; font-size: 0.78rem; color: #d8b4fe; }
</style>
