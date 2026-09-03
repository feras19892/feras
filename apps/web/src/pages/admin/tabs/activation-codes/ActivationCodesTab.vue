<template>
  <div class="activation-codes-tab">
    <h2>أكواد التفعيل والمشتركين</h2>
    <div v-if="loading" class="status">جاري التحميل...</div>
    <div v-else-if="error" class="status error">{{ error }}</div>
    <div v-else-if="accounts.length === 0" class="status">لا توجد حسابات.</div>
    <template v-else>
    <div class="filters">
      <input v-model="search" placeholder="بحث بالاسم أو البريد..." class="search-input" />
      <select v-model="filterType" class="filter-select">
        <option value="all">الكل</option>
        <option value="school">مدرسة</option>
        <option value="teacher">مدرس</option>
        <option value="student">طالب</option>
      </select>
    </div>

    <table class="accounts-table">
      <thead>
        <tr>
          <th>الاسم</th>
          <th>البريد</th>
          <th>النوع</th>
          <th>الاشتراك</th>
          <th>أكواد</th>
          <th>غير مستخدمة</th>
          <th>مشتركين</th>
          <th>طلاب</th>
          <th>مدرسين</th>
          <th>إجراء</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="account in filteredAccounts" :key="account.id + account.type" @click="selectAccount(account)" :class="{ active: selected?.id === account.id && selected?.type === account.type }">
          <td>{{ account.name }}</td>
          <td>{{ account.email }}</td>
          <td>{{ typeLabel(account) }}</td>
          <td>{{ account.subscription_status }}</td>
          <td>{{ account.total_codes }}</td>
          <td>{{ account.unused_codes }}</td>
          <td>{{ account.total_members }}</td>
          <td>{{ account.student_members }}</td>
          <td>{{ account.teacher_members }}</td>
          <td><button class="btn-small" @click.stop="openCreate(account)">+ كود</button></td>
        </tr>
      </tbody>
    </table>

    <div v-if="selected" class="codes-section">
      <button class="btn-small" @click="selected = null">← رجوع</button>
      <h3>أكواد {{ selected.name }}</h3>
      <div class="code-filters">
        <select v-model="codeStatus" class="filter-select">
          <option value="all">كل الأكواد</option>
          <option value="active">نشطة</option>
          <option value="inactive">غير نشطة</option>
        </select>
        <select v-model="codeUsage" class="filter-select">
          <option value="all">كل الأكواد</option>
          <option value="used">مستخدمة</option>
          <option value="unused">غير مستخدمة</option>
        </select>
      </div>
      <table class="codes-table">
        <thead>
          <tr>
            <th>الكود</th>
            <th>الدور</th>
            <th>استخدام</th>
            <th>الحد</th>
            <th>الصلاحية</th>
            <th>نشط</th>
            <th>تحكم</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="code in filteredCodes" :key="code.id">
            <td><code>{{ code.code }}</code></td>
            <td>{{ code.role }}</td>
            <td>{{ code.used_count }}</td>
            <td>{{ code.max_uses ?? 'غير محدود' }}</td>
            <td>{{ code.expires_at ? formatDate(code.expires_at) : '—' }}</td>
            <td>{{ code.is_active ? 'نعم' : 'لا' }}</td>
            <td>
              <button class="btn-small" @click="toggleCode(code)">{{ code.is_active ? 'تعطيل' : 'تفعيل' }}</button>
              <button class="btn-small danger" @click="deleteCode(code.id)">حذف</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showCreate" class="modal-backdrop" @click.self="showCreate = false">
      <div class="modal">
        <h3>إنشاء كود</h3>
        <label>الدور</label>
        <select v-model="newCode.role" class="input">
          <option value="student">طالب</option>
          <option value="teacher">مدرس</option>
        </select>
        <label>الحد الأقصى للاستخدام (فارغ = غير محدود)</label>
        <input v-model.number="newCode.max_uses" type="number" min="1" class="input" placeholder="عدد الاستخدامات" />
        <label>تاريخ الانتهاء (اختياري)</label>
        <input v-model="newCode.expires_at" type="datetime-local" class="input" />
        <div class="modal-actions">
          <button class="btn-primary" @click="createCode">إنشاء</button>
          <button class="btn-secondary" @click="showCreate = false">إلغاء</button>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  getActivationAccounts,
  getAdminInviteCodes,
  createAdminInviteCode,
  updateAdminInviteCode,
  deleteAdminInviteCode,
  type ActivationAccount,
  type AdminInviteCode,
} from '@/services/core/admin-subscriptions.api'
import { useToast } from '@/composables/useToast'

const toast = useToast()
const accounts = ref<ActivationAccount[]>([])
const selected = ref<ActivationAccount | null>(null)
const codes = ref<AdminInviteCode[]>([])
const search = ref('')
const filterType = ref('all')
const codeStatus = ref('all')
const codeUsage = ref('all')
const showCreate = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const newCode = ref<{ role: 'student' | 'teacher'; max_uses: number | null; expires_at: string }>({ role: 'student', max_uses: null, expires_at: '' })

const filteredCodes = computed(() => {
  return codes.value.filter((c) => {
    const matchesStatus = codeStatus.value === 'all' || (codeStatus.value === 'active' && c.is_active) || (codeStatus.value === 'inactive' && !c.is_active)
    const matchesUsage = codeUsage.value === 'all' || (codeUsage.value === 'used' && c.used_count > 0) || (codeUsage.value === 'unused' && c.used_count === 0)
    return matchesStatus && matchesUsage
  })
})

const filteredAccounts = computed(() => {
  return accounts.value.filter((a) => {
    const matchesSearch = a.name.includes(search.value) || a.email.includes(search.value)
    const matchesType = filterType.value === 'all' || a.type === filterType.value || (filterType.value === 'teacher' && a.role === 'teacher') || (filterType.value === 'student' && a.role === 'student')
    return matchesSearch && matchesType
  })
})

function typeLabel(a: ActivationAccount) {
  if (a.type === 'school') return 'مدرسة'
  if (a.role === 'teacher') return 'مدرس'
  return 'طالب'
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('ar-SA')
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await getActivationAccounts()
    if (res.success) accounts.value = res.accounts
    else error.value = 'فشل تحميل الحسابات'
  } catch (e) {
    error.value = 'حدث خطأ أثناء تحميل الحسابات'
  } finally {
    loading.value = false
  }
}

async function selectAccount(account: ActivationAccount) {
  selected.value = account
  const ownerType = account.type === 'school' ? 'school' : 'teacher'
  try {
    const res = await getAdminInviteCodes(account.id, ownerType)
    if (res.success) codes.value = res.invite_codes
    else toast.error('فشل تحميل الأكواد')
  } catch (e) {
    toast.error('حدث خطأ أثناء تحميل الأكواد')
  }
}

function openCreate(account: ActivationAccount) {
  selected.value = account
  showCreate.value = true
  newCode.value = { role: 'student', max_uses: null, expires_at: '' }
}

async function createCode() {
  if (!selected.value) return
  const ownerType: 'teacher' | 'school' = selected.value.type === 'school' ? 'school' : 'teacher'
  const body = {
    owner_id: selected.value.id,
    owner_type: ownerType,
    role: newCode.value.role,
    max_uses: newCode.value.max_uses || null,
    expires_at: newCode.value.expires_at || null,
  }
  const res = await createAdminInviteCode(body)
  if (res.success) {
    toast.success('تم إنشاء الكود')
    showCreate.value = false
    await selectAccount(selected.value)
    await load()
  } else {
    toast.error('فشل إنشاء الكود')
  }
}

async function toggleCode(code: AdminInviteCode) {
  const res = await updateAdminInviteCode(code.id, { is_active: code.is_active ? 0 : 1 })
  if (res.success && selected.value) {
    await selectAccount(selected.value)
    await load()
  }
}

async function deleteCode(id: number) {
  if (!confirm('هل أنت متأكد من حذف الكود؟')) return
  const res = await deleteAdminInviteCode(id)
  if (res.success && selected.value) {
    await selectAccount(selected.value)
    await load()
  }
}

onMounted(load)
</script>

<style scoped>
.activation-codes-tab { padding: 20px; color: #e2e8f0; }
h2, h3 { margin-top: 0; color: #f8fafc; }
.filters, .code-filters { display: flex; gap: 12px; margin-bottom: 16px; }
.search-input, .filter-select, .input { padding: 8px 12px; border-radius: 6px; border: 1px solid #d1d5db; }
.search-input { flex: 1; }
.accounts-table, .codes-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; background: #1e293b; color: #e2e8f0; border-radius: 8px; overflow: hidden; }
.accounts-table th, .accounts-table td, .codes-table th, .codes-table td { border: 1px solid #334155; padding: 10px; text-align: right; }
.accounts-table th, .codes-table th { background: #334155; color: #f8fafc; }
.accounts-table tr:hover { background: #334155; cursor: pointer; }
.accounts-table tr.active { background: #0f172a; color: #e2e8f0; border-left: 4px solid #3b82f6; }
.codes-table tr:nth-child(even) { background: #293548; }
.btn-small { background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; margin-left: 4px; }
.btn-small.danger { background: #ef4444; }
.btn-primary { background: #10b981; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
.btn-secondary { background: #6b7280; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; padding: 20px; border-radius: 12px; width: 360px; }
.modal h3 { margin-top: 0; }
.modal label { display: block; margin: 12px 0 4px; font-size: 14px; }
.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
.status { padding: 20px; text-align: center; color: #6b7280; }
.status.error { color: #ef4444; }
.codes-section { margin-top: 24px; }
</style>
