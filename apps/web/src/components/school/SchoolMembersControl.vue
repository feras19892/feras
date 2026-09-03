<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  activateTenantMember,
  suspendTenantMember,
  removeTenantMember,
  blockUser,
  unblockUser,
  removeUser,
  type TenantMember,
} from '@/services/core/school.api'

const props = defineProps<{ members: TenantMember[]; standalone?: boolean }>()
const emit = defineEmits<{ (e: 'reload'): void }>()

const toast = useToast()
const show = ref(props.standalone ?? false)

const now = new Date().toISOString()

function isBlocked(m: TenantMember) {
  return !!m.blocked_at && (!m.block_until || m.block_until > now)
}

const rows = computed(() => props.members.map((m) => ({ ...m, blocked: isBlocked(m) })))

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('ar-SY') } catch { return d }
}

async function call(name: string, action: () => Promise<{ success: boolean }>) {
  try {
    const res = await action()
    if (res.success) {
      toast.success(`${name} نجح`)
      emit('reload')
    } else {
      toast.error(`${name} فشل`)
    }
  } catch (e: any) {
    toast.error(e.message || `${name} فشل`)
  }
}

function activate(id: number) { call('التفعيل', () => activateTenantMember(id)) }
function suspend(id: number) { call('التعليق', () => suspendTenantMember(id)) }
function remove(id: number) {
  if (!confirm('هل أنت متأكد من إزالة العضو؟')) return
  call('إزالة العضو', () => removeTenantMember(id))
}

function deleteUser(id: number, name: string) {
  if (!confirm(`هل تريد حذف حساب ${name} نهائياً؟ لا يمكن التراجع.`)) return
  call('حذف الحساب', () => removeUser(id))
}

async function block(member: TenantMember) {
  const daysInput = window.prompt('عدد أيام الحظر (0 = دائم):', '7')
  if (daysInput === null) return
  const days = Number(daysInput)
  if (Number.isNaN(days) || days < 0) {
    toast.error('عدد الأيام غير صالح')
    return
  }
  const reason = window.prompt('سبب الحظر:', '') || 'بدون سبب'
  await call('الحظر', () => blockUser(member.member_id, days, reason))
}

async function unblock(id: number) { await call('إلغاء الحظر', () => unblockUser(id)) }
</script>

<template>
  <div class="members-card">
    <div v-if="!standalone" class="control-header" @click="show = !show">
      <h3>🛡️ التحكم بالأعضاء</h3>
      <span class="toggle-icon">{{ show ? '▾' : '▸' }}</span>
    </div>

    <div v-if="show || standalone" class="control-body">
      <div v-if="!rows.length" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-title">لا يوجد أعضاء بعد</div>
        <div class="empty-hint">ستظهر هنا قائمة الطلاب والمعلمين المنضمين للمدرسة.</div>
      </div>
      <table v-else class="members-table">
        <thead>
          <tr>
            <th>العضو</th>
            <th>البريد</th>
            <th>الدور</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in rows" :key="m.member_id" :class="['member-row', m.blocked ? 'blocked' : '']">
            <td>
              <div class="member-name">{{ m.name || 'عضو #' + m.member_id }}</div>
              <div v-if="m.block_reason" class="block-reason">{{ m.block_reason }}</div>
            </td>
            <td>{{ m.email }}</td>
            <td>{{ m.role === 'teacher' ? 'معلم' : 'طالب' }}</td>
            <td>
              <span v-if="m.blocked" class="badge danger">
                محظور {{ m.block_until ? 'حتى ' + formatDate(m.block_until) : '' }}
              </span>
              <span v-else-if="m.status === 'active'" class="badge success">نشط</span>
              <span v-else class="badge warn">{{ m.status }}</span>
            </td>
            <td class="actions">
              <button v-if="!m.blocked && m.status !== 'active'" class="btn" @click="activate(m.member_id)">تفعيل</button>
              <button v-if="!m.blocked && m.status === 'active'" class="btn" @click="suspend(m.member_id)">تعليق</button>
              <button v-if="!m.blocked" class="btn danger" @click="block(m)">حظر</button>
              <button v-else class="btn success" @click="unblock(m.member_id)">إلغاء حظر</button>
              <button class="btn" @click="remove(m.member_id)">إزالة</button>
              <button class="btn danger" @click="deleteUser(m.member_id, m.name)">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.members-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.25); }
.control-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; padding-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.control-header h3 { margin: 0; color: #e2e8f0; font-size: 1.1rem; }
.toggle-icon { color: #94a3b8; font-size: 1.2rem; }
.control-body { margin-top: 1.2rem; }
.members-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.9rem; }
.members-table th { padding: 0.8rem 1rem; text-align: right; background: rgba(99,102,241,0.1); color: #a5b4fc; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.08); }
.members-table td { padding: 1rem; text-align: right; color: #e2e8f0; border-bottom: 1px solid rgba(255,255,255,0.05); }
.member-row { transition: background 0.15s; }
.member-row:hover { background: rgba(255,255,255,0.03); }
.member-row.blocked td { background: rgba(239,68,68,0.05); }
.member-name { font-weight: 700; color: #f1f5f9; }
.block-reason { font-size: 0.75rem; color: #fca5a5; margin-top: 0.2rem; }
.actions { display: flex; gap: 0.4rem; flex-wrap: wrap; }
.btn { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #e2e8f0; border-radius: 8px; padding: 0.35rem 0.7rem; cursor: pointer; font-size: 0.8rem; transition: all 0.15s; }
.btn:hover { background: rgba(255,255,255,0.1); }
.btn.danger { color: #f87171; border-color: rgba(239,68,68,0.25); }
.btn.danger:hover { background: rgba(239,68,68,0.12); }
.btn.success { color: #4ade80; border-color: rgba(34,197,94,0.25); }
.btn.success:hover { background: rgba(34,197,94,0.12); }
.badge { padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge.success { background: rgba(34,197,94,0.12); color: #4ade80; }
.badge.warn { background: rgba(234,179,8,0.12); color: #facc15; }
.badge.danger { background: rgba(239,68,68,0.12); color: #f87171; }
.empty-state { text-align: center; padding: 3rem 1rem; }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-title { color: #e2e8f0; font-size: 1.1rem; font-weight: 700; margin-bottom: 0.4rem; }
.empty-hint { color: #94a3b8; font-size: 0.85rem; }
</style>
