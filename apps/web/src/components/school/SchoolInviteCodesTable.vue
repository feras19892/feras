<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import type { InviteCode } from '@/services/core/school.api'


defineProps<{
  codes: InviteCode[]
  title: string
}>()

const emit = defineEmits<{ (e: 'copy', code: string): void }>()

function copy(code: string) {
  emit('copy', code)
}
</script>

<template>
  <div class="table-card">
    <h3>{{ title }}</h3>
    <div class="table-wrap">
      <table v-if="codes.length" class="codes-table">
        <thead>
          <tr>
            <th>الكود</th>
            <th>الاستخدام</th>
            <th>الحالة</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in codes" :key="c.id">
            <td class="code-cell">{{ c.code }}</td>
            <td>{{ c.used_count }} / {{ c.max_uses }}</td>
            <td>
              <span :class="['status', c.is_active ? 'active' : 'inactive']">
                {{ c.is_active ? 'نشط' : 'معطل' }}
              </span>
            </td>
            <td>
              <button class="btn-copy" @click="copy(c.code)">نسخ</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">لا توجد أكواد</p>
    </div>
  </div>
</template>

<style scoped>
.table-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.table-card h3 { margin: 0 0 0.8rem; color: #e2e8f0; }
.table-wrap { max-height: 240px; overflow: auto; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
.codes-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.codes-table th, .codes-table td { padding: 0.5rem 0.7rem; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.06); color: #f1f5f9; }
.codes-table th { background: rgba(255,255,255,0.04); color: #cbd5e1; position: sticky; top: 0; }
.code-cell { font-weight: 700; color: #a5b4fc; direction: ltr; text-align: left; }
.status { padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.75rem; }
.status.active { background: rgba(34,197,94,0.15); color: #4ade80; }
.status.inactive { background: rgba(239,68,68,0.15); color: #f87171; }
.btn-copy { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #67e8f9; border-radius: 6px; padding: 0.15rem 0.5rem; cursor: pointer; font-size: 0.75rem; }
.empty { color: #94a3b8; text-align: center; padding: 1rem; margin: 0; }
</style>
