<template>
  <div>
    <div class="toolbar">
      <button class="btn btn-primary" @click="openCreate">➕ جديد</button>
      <input v-model="params.search" class="input-sm" placeholder="بحث..." @input="onSearch" />
      <select v-model="params.status" class="input-sm" @change="load">
        <option value="">كل الحالات</option>
        <option value="ACTIVE">نشط</option>
        <option value="TRIAL">تجريبي</option>
        <option value="EXPIRED">منتهي</option>
        <option value="CANCELLED">ملغى</option>
        <option value="PENDING">معلق</option>
        <option value="SUSPENDED">محظور</option>
      </select>
      <select v-model="params.owner_type" class="input-sm" @change="load">
        <option value="">كل الملاك</option>
        <option value="user">مستخدم</option>
        <option value="school">مدرسة</option>
      </select>
      <select v-model="params.sort" class="input-sm" @change="load">
        <option value="created_at">تاريخ الإنشاء</option>
        <option value="expires_at">تاريخ الانتهاء</option>
        <option value="price_cents">السعر</option>
      </select>
      <button class="btn" @click="toggleOrder">{{ params.order === 'asc' ? '⬆️' : '⬇️' }}</button>
      <button class="btn" @click="exportCSV">📄 CSV</button>
    </div>

    <SkeletonLoader v-if="loading" type="list" :count="8" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th>#</th>
            <th>المالك</th>
            <th>الخطة</th>
            <th>الحالة</th>
            <th>البدء</th>
            <th>الانتهاء</th>
            <th>الفوترة</th>
            <th>الحدود</th>
            <th>أدوات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in subs" :key="s.id" class="row" @click="select(s)">
            <td>{{ s.id }}</td>
            <td>{{ ownerLabel(s) }}</td>
            <td>{{ s.plan_name || '—' }}</td>
            <td><span :class="['verify-badge', statusClass(s.status)]">{{ statusLabel(s.status) }}</span></td>
            <td>{{ formatDate(s.starts_at) }}</td>
            <td>{{ formatDate(s.expires_at) }}</td>
            <td>{{ formatDate(s.next_billing_at) }}</td>
            <td>{{ limits(s) }}</td>
            <td class="tools">
              <button class="btn-small" @click.stop="select(s)">تعديل</button>
              <button class="btn-small" :class="s.status === 'SUSPENDED' ? 'btn-success' : 'btn-danger'" @click.stop="toggleSuspend(s)">
                {{ s.status === 'SUSPENDED' ? 'تفعيل' : 'حظر' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="subs.length" class="pagination">
        <button :disabled="params.page <= 1" class="btn" @click="prev">السابق</button>
        <span>صفحة {{ params.page }}</span>
        <button class="btn" @click="next">التالي</button>
      </div>
    </div>

    <SubscriptionModals
      :edit="edit"
      :create="create"
      :plans="plans"
      @update:edit="edit = $event"
      @update:create="create = $event"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import SubscriptionModals from './SubscriptionModals.vue'
import {
  getSubscriptions, updateSubscription, getAdminPlans,
  type AdminSubscription, type AdminPlan,
} from '@/services/core/admin.api'

const toast = useToast()
const subs = ref<AdminSubscription[]>([])
const plans = ref<AdminPlan[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const edit = ref<AdminSubscription | null>(null)
const create = ref(false)

const params = reactive({
  search: '',
  status: '',
  owner_type: '',
  sort: 'created_at' as 'created_at' | 'expires_at' | 'price_cents',
  order: 'desc' as 'asc' | 'desc',
  page: 1,
  limit: 15,
})

let searchTimer: number | undefined
function onSearch() { clearTimeout(searchTimer); searchTimer = window.setTimeout(() => { params.page = 1; load() }, 300) }

function toggleOrder() { params.order = params.order === 'asc' ? 'desc' : 'asc'; load() }
function next() { params.page++; load() }
function prev() { if (params.page > 1) { params.page--; load() } }

function statusLabel(status: string) {
  const map: Record<string, string> = { ACTIVE: 'نشط', TRIAL: 'تجريبي', EXPIRED: 'منتهي', CANCELLED: 'ملغى', PENDING: 'معلق', SUSPENDED: 'محظور' }
  return map[status] || status
}
function statusClass(status: string) {
  if (status === 'ACTIVE' || status === 'TRIAL') return ''
  if (status === 'PENDING') return 'unverified'
  if (status === 'SUSPENDED') return 'danger'
  return 'danger'
}
function formatDate(d?: string | null) { return d ? new Date(d).toLocaleDateString('ar-SY') : '—' }
function ownerLabel(s: AdminSubscription) { return s.owner_name || `${s.owner_type === 'school' ? 'مدرسة' : 'مستخدم'} #${s.owner_id}` }
function limits(s: AdminSubscription) {
  const parts: string[] = []
  if (s.max_students != null) parts.push(`ط${s.max_students}`)
  if (s.max_teachers != null) parts.push(`م${s.max_teachers}`)
  return parts.length ? parts.join('/') : '—'
}

function select(s: AdminSubscription) {
  edit.value = s
}

function openCreate() { create.value = true }

async function load() {
  loading.value = true
  try {
    const [subRes, planRes] = await Promise.all([getSubscriptions(params), getAdminPlans()])
    if (subRes.success) subs.value = subRes.subscriptions
    if (planRes.success) plans.value = planRes.plans
  } catch (e: any) { error.value = e.message || 'فشل التحميل' } finally { loading.value = false }
}

async function onSaved() {
  edit.value = null
  create.value = false
  await load()
}

async function toggleSuspend(s: AdminSubscription) {
  const next = s.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED'
  try {
    const res = await updateSubscription(s.id, { status: next })
    if (res.success) { toast.success(next === 'SUSPENDED' ? 'تم الحظر' : 'تم التفعيل'); await load() }
  } catch (e: any) { toast.error(e.message || 'فشل التغيير') }
}

function exportCSV() {
  const headers = ['id', 'owner_id', 'owner_name', 'owner_email', 'owner_type', 'plan_name', 'status', 'starts_at', 'expires_at', 'next_billing_at', 'max_students', 'max_teachers']
  const rows = subs.value.map(s => [s.id, s.owner_id, s.owner_name, s.owner_email, s.owner_type, s.plan_name, s.status, s.starts_at, s.expires_at, s.next_billing_at, s.max_students, s.max_teachers].map(v => `"${v ?? ''}"`).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url
  a.download = `subscriptions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

watch(() => [params.status, params.owner_type, params.sort, params.limit], () => { params.page = 1; load() })

onMounted(load)
onUnmounted(() => { if (searchTimer) clearTimeout(searchTimer) })
</script>

<style scoped>
.toolbar { display: flex; gap: 0.7rem; margin-bottom: 1.2rem; flex-wrap: wrap; align-items: center; }
.input-sm { padding: 0.55rem 0.8rem; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(15,23,42,0.8); color: #f1f5f9; font-size: 0.9rem; min-width: 120px; }
.input-sm:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
.btn { padding: 0.55rem 1rem; border: none; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; cursor: pointer; font-weight: 700; transition: transform 0.1s, box-shadow 0.1s; }
.btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(99,102,241,0.25); }
.btn-primary { background: linear-gradient(135deg, #22c55e, #16a34a); }
.btn-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
.btn-warn { background: linear-gradient(135deg, #64748b, #475569); }
.btn-danger { background: linear-gradient(135deg, #ef4444, #dc2626); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.btn-small { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #a5b4fc; border-radius: 8px; padding: 0.35rem 0.55rem; cursor: pointer; font-size: 0.8rem; font-weight: 600; }
.btn-small:hover { background: rgba(99,102,241,0.12); }
.btn-small.btn-success { background: rgba(34,197,94,0.14); color: #4ade80; border-color: rgba(34,197,94,0.3); }
.btn-small.btn-danger { background: rgba(239,68,68,0.14); color: #f87171; border-color: rgba(239,68,68,0.3); }
.table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.92rem; border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; overflow: hidden; }
.table th, .table td { padding: 0.85rem 1rem; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05); color: #cbd5e1; }
.table th { background: rgba(255,255,255,0.03); color: #94a3b8; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.02em; }
.table tr:last-child td { border-bottom: none; }
.row { cursor: pointer; transition: background 0.12s; }
.row:nth-child(even) { background: rgba(255,255,255,0.01); }
.row:hover { background: rgba(99,102,241,0.06); }
.tools { display: flex; gap: 0.4rem; justify-content: flex-end; }
.pagination { display: flex; gap: 0.6rem; justify-content: center; align-items: center; margin-top: 1.2rem; font-weight: 700; color: #94a3b8; }
.verify-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.7rem; border-radius: 999px; font-size: 0.8rem; font-weight: 700; }
.verify-badge:not(.unverified):not(.danger) { background: rgba(34,197,94,0.14); color: #4ade80; }
.verify-badge.unverified { background: rgba(234,179,8,0.14); color: #facc15; }
.verify-badge.danger { background: rgba(239,68,68,0.14); color: #f87171; }
</style>
