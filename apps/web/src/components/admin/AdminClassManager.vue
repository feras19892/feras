<script setup lang="ts">
import { useI18n } from '../../composables/useI18n';
interface AdminClassItem {
  id: string;
  name: string;
  code: string;
  teacher_name: string;
  student_count: number;
  created_at?: string;
}
defineProps<{
  classes: AdminClassItem[];
}>();

defineEmits<{
  (e: 'delete', id: string): void;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="section">
    <h3>{{ t('admin.classes', { count: classes.length }) }}</h3>
    <div class="table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>{{ t('admin.name') }}</th><th>{{ t('admin.code') }}</th><th>{{ t('admin.teacher') }}</th><th>{{ t('admin.students') }}</th><th>{{ t('admin.createdAt') }}</th><th>{{ t('admin.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in classes" :key="c.id">
            <td>{{ c.id }}</td>
            <td>{{ c.name }}</td>
            <td><code>{{ c.code }}</code></td>
            <td>{{ c.teacher_name }}</td>
            <td>{{ c.student_count }}</td>
            <td>{{ c.created_at?.slice(0, 10) }}</td>
            <td>
              <button class="btn-danger" @click="$emit('delete', c.id)">{{ t('admin.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="classes.length === 0" class="empty">{{ t('admin.noClasses') }}</p>
    </div>
  </div>
</template>

<style scoped>
.section { color: #e2e8f0; }
.section h3 { font-size: 1.1rem; margin: 0 0 1rem; }
.table-wrapper { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.data-table th { text-align: right; padding: 0.6rem 0.75rem; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
.data-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.04); color: #e2e8f0; }
.data-table tr:hover { background: rgba(255,255,255,0.02); }
.data-table code { background: rgba(255,255,255,0.05); padding: 0.15rem 0.35rem; border-radius: 0.3rem; font-size: 0.8rem; }
.btn-danger { padding: 0.3rem 0.6rem; border-radius: 0.35rem; border: none; background: rgba(239,68,68,0.15); color: #f87171; cursor: pointer; font-family: inherit; font-size: 0.8rem; }
.btn-danger:hover { background: rgba(239,68,68,0.25); }
.empty { text-align: center; color: #64748b; padding: 2rem; }
</style>
