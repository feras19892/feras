<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { computed } from 'vue'
import type { InviteCode, TenantMember, SchoolSubscription } from '@/services/core/school.api'


const props = defineProps<{
  subscription: SchoolSubscription | null
  codes: InviteCode[]
  members: TenantMember[]
}>()

const generatedTeacher = computed(() => props.codes.filter((c) => c.role === 'teacher').length)
const generatedStudent = computed(() => props.codes.filter((c) => !c.role || c.role === 'student').length)
const unusedTeacher = computed(() => props.codes.filter((c) => c.role === 'teacher' && c.used_count < c.max_uses).length)
const unusedStudent = computed(() => props.codes.filter((c) => (!c.role || c.role === 'student') && c.used_count < c.max_uses).length)
const usedCodes = computed(() =>
  props.codes
    .filter((c) => c.used_count > 0)
    .flatMap((c) => {
      const owners = props.members.filter((m) => m.invite_code_id === c.id)
      if (!owners.length) return [{ code: c, name: 'غير معروف', email: '—', role: '—' }]
      return owners.map((m) => ({ code: c, name: m.name, email: m.email, role: m.role }))
    }),
)

function roleLabel(r?: string | null) {
  if (r === 'teacher') return 'معلم'
  if (r === 'student') return 'طالب'
  return r || '—'
}

function statusLabel(status?: string) {
  const map: Record<string, string> = { ACTIVE: 'نشط', TRIAL: 'تجريبي', EXPIRED: 'منتهي', CANCELLED: 'ملغى', PENDING: 'معلق' }
  return map[status ?? ''] || status || '—'
}
</script>

<template>
  <div class="billing-card">
    <h3>📈 إحصائيات</h3>
    <div class="stats-grid">
      <div class="stat-box">
        <span class="stat-label">الاشتراك</span>
        <span class="stat-value">{{ statusLabel(subscription?.status) }}</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">أكواد المعلمين</span>
        <span class="stat-value">{{ generatedTeacher }}</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">أكواد الطلاب</span>
        <span class="stat-value">{{ generatedStudent }}</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">غير مستخدم (معلمين)</span>
        <span class="stat-value">{{ unusedTeacher }}</span>
      </div>
      <div class="stat-box">
        <span class="stat-label">غير مستخدم (طلاب)</span>
        <span class="stat-value">{{ unusedStudent }}</span>
      </div>
    </div>

    <h4 class="sub-title">🎟️ أكواد مستخدمة</h4>
    <div class="table-wrap">
      <table v-if="usedCodes.length" class="codes-table">
        <thead>
          <tr>
            <th>الكود</th>
            <th>العضو</th>
            <th>البريد</th>
            <th>الدور</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in usedCodes" :key="row.code.id + (row.email || '')">
            <td class="code-cell">{{ row.code.code }}</td>
            <td>{{ row.name }}</td>
            <td>{{ row.email }}</td>
            <td>{{ roleLabel(row.role) }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">لا يوجد أكواد مستخدمة</p>
    </div>
  </div>
</template>

<style scoped>
.billing-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.billing-card h3 { margin: 0 0 0.8rem; color: #e2e8f0; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.6rem; margin-bottom: 1rem; }
.stat-box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; padding: 0.6rem; text-align: center; }
.stat-label { display: block; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.2rem; }
.stat-value { display: block; font-weight: 700; color: #e2e8f0; }
.sub-title { color: #cbd5e1; font-size: 0.95rem; margin: 1rem 0 0.5rem; }
.table-wrap { max-height: 240px; overflow: auto; border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; }
.codes-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
.codes-table th, .codes-table td { padding: 0.5rem 0.7rem; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.06); color: #f1f5f9; }
.codes-table th { background: rgba(255,255,255,0.04); color: #cbd5e1; position: sticky; top: 0; }
.code-cell { font-weight: 700; color: #a5b4fc; direction: ltr; text-align: left; }
.empty { color: #94a3b8; text-align: center; padding: 1rem; margin: 0; }
</style>
