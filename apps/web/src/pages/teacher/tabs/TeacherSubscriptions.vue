<template>
  <div class="dash-page">
    <h2>اشتراكي والدعوات</h2>

    <SkeletonLoader v-if="loading" type="cards" :count="2" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else>
      <div class="billing-card">
        <h3>📊 حالة الاشتراك</h3>
        <div v-if="subscription" class="sub-row">
          <span class="sub-name">{{ subscription.plan_name }}</span>
          <span :class="['verify-badge', statusClass(subscription.status)]">{{ statusLabel(subscription.status) }}</span>
          <span class="sub-meta">ينتهي: {{ formatDate(subscription.expires_at) }}</span>
        </div>
        <EmptyState v-else icon="💳" title="لا يوجد اشتراك نشط" />
      </div>

      <div class="billing-card">
        <h3>🛒 اشترك كمدرس</h3>
        <PlanSelector @select="selectPackage" />
      </div>

      <div class="billing-card">
        <h3>🔗 أكواد دعوة الطلاب</h3>
        <div class="students-input">
          <label>عدد الأكواد</label>
          <input v-model.number="codeCount" type="number" min="1" max="100" />
          <button class="btn-plan" :disabled="creating" @click="generateCodes">
            {{ creating ? '...' : 'توليد الأكواد' }}
          </button>
        </div>
        <div v-if="codes.length" class="compact-list">
          <div v-for="c in codes" :key="c.id" class="compact-row">
            <span class="cr-icon">🎟️</span>
            <span class="cr-name">{{ c.code }}</span>
            <span class="cr-meta">
              <span>{{ c.used_count }} / {{ c.max_uses }}</span>
              <span>{{ c.is_active ? 'نشط' : 'معطل' }}</span>
              <button class="btn-copy" @click="copy(c.code)">نسخ</button>
            </span>
          </div>
        </div>
        <EmptyState v-else icon="🎟️" title="لا توجد أكواد" />
      </div>

      <div class="billing-card">
        <h3>👥 الطلاب المنضمون</h3>
        <div v-if="members.length" class="compact-list">
          <div v-for="m in members" :key="m.member_id" class="compact-row">
            <span class="cr-icon">👤</span>
            <span class="cr-name">{{ m.name || 'طالب #' + m.member_id }}</span>
            <span class="cr-meta">
              <span>{{ m.email }}</span>
              <span>{{ formatDate(m.joined_at) }}</span>
            </span>
          </div>
        </div>
        <EmptyState v-else icon="👥" title="لا يوجد طلاب بعد" />
      </div>

      <div class="billing-card">
        <h3>🏫 الانضمام للمدرسة</h3>
        <p class="sub-info">إذا كان لديك كود من مدرستك، أدخله هنا:</p>
        <div class="code-row">
          <input v-model="schoolJoinCode" class="code-input" placeholder="XXXX-XXXX" :disabled="joining" />
          <button class="btn-join" :disabled="!schoolJoinCode || joining" @click="joinSchoolCode">
            {{ joining ? '...' : 'انضمام' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, computed, onMounted } from 'vue'

import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useSubscriptionSettings } from '@/composables/useSubscriptionSettings'
import PlanSelector from '@/components/shared/PlanSelector.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { getMySubscription, getInviteCodes, createInviteCodes, getTenantMembers, joinWithInviteCode, type SchoolSubscription, type InviteCode, type TenantMember } from '@/services/core/school.api'





const toast = useToast()
const router = useRouter()
const auth = useAuthStore()
const { get } = useSubscriptionSettings()

const subscription = ref<SchoolSubscription | null>(null)
const codes = ref<InviteCode[]>([])
const members = ref<TenantMember[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const creating = ref(false)
const joining = ref(false)
const billing = ref<'monthly' | 'yearly'>('monthly')
const studentCount = ref(10)
const codeCount = ref(10)
const schoolJoinCode = ref('')

const monthlyCents = computed(() => Number(get('teacher_price_student_month_cents', 150)) / 100)
const yearlyCents = computed(() => Number(get('teacher_price_student_year_cents', 1300)) / 100)
const freeThreshold = computed(() => Number(get('teacher_free_threshold', 10)))

const pricePerStudent = computed(() => (billing.value === 'monthly' ? monthlyCents.value : yearlyCents.value).toFixed(2))
const billingLabel = computed(() => (billing.value === 'monthly' ? 'شهر' : 'سنة'))
const totalPrice = computed(() => (studentCount.value * Number(pricePerStudent.value)).toFixed(2))
const isTeacherFree = computed(() => studentCount.value >= freeThreshold.value)

function statusLabel(status: string) {
  const map: Record<string, string> = { ACTIVE: 'نشط', TRIAL: 'تجريبي', EXPIRED: 'منتهي', CANCELLED: 'ملغى', PENDING: 'معلق' }
  return map[status] || status
}

function statusClass(status: string) {
  if (status === 'ACTIVE' || status === 'TRIAL') return ''
  if (status === 'PENDING') return 'unverified'
  return 'danger'
}

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('ar-SY') } catch { return d }
}

function copy(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success('تم النسخ'))
}

function selectPackage(pkg: any, plan: any) {
  router.push({
    name: 'TeacherPayment',
    query: { package_id: String(pkg.id), plan_id: String(plan.id), billing: 'monthly' },
  })
}

function goToPayment() {
  router.push({
    name: 'TeacherPayment',
    query: {
      billing: billing.value,
      students: String(studentCount.value),
      total: totalPrice.value,
    },
  })
}

async function generateCodes() {
  creating.value = true
  try {
    const res = await createInviteCodes(codeCount.value, 'student', 1)
    if (res.success) {
      toast.success(`تم إنشاء ${res.invites?.length ?? codeCount.value} كود`)
      await load()
    } else {
      toast.error(res.message || 'فشل إنشاء الأكواد')
    }
  } catch (e: any) {
    toast.error(e.message || t('common.error'))
  } finally {
    creating.value = false
  }
}

async function joinSchoolCode() {
  if (!schoolJoinCode.value) return
  joining.value = true
  try {
    const res = await joinWithInviteCode(schoolJoinCode.value.trim())
    if (res.success) {
      toast.success('تم الانضمام للمدرسة')
      schoolJoinCode.value = ''
      await auth.fetchMe()
      await load()
    } else {
      toast.error(res.message || 'رمز غير صالح')
    }
  } catch (e: any) {
    toast.error(e.message || t('common.error'))
  } finally {
    joining.value = false
  }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const [subRes, codesRes, membersRes] = await Promise.all([getMySubscription(), getInviteCodes(), getTenantMembers()])
    if (subRes.success) subscription.value = subRes.subscription || null
    if (codesRes.success) codes.value = codesRes.invite_codes
    if (membersRes.success) members.value = membersRes.members
  } catch (e: any) {
    error.value = e.message || t('common.error')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.dash-page { padding: 1rem; }
h2 { margin: 0 0 1rem; color: #f1f5f9; }
.billing-card { background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
.billing-card h3 { margin: 0 0 0.8rem; color: #e2e8f0; }
.sub-row { display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; }
.sub-name { font-weight: 700; color: #a5b4fc; }
.sub-meta { color: #94a3b8; font-size: 0.85rem; }
.sub-info { color: #cbd5e1; }
.plan-row { display: flex; gap: 1rem; margin-bottom: 0.8rem; }
.plan-toggle { display: flex; gap: 0.5rem; background: rgba(255,255,255,0.04); border-radius: 8px; padding: 0.2rem; }
.plan-toggle button { padding: 0.4rem 0.8rem; border: none; background: transparent; color: #94a3b8; border-radius: 6px; cursor: pointer; font-weight: 700; }
.plan-toggle button.active { background: rgba(99,102,241,0.2); color: #a5b4fc; }
.students-input { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.8rem; flex-wrap: wrap; }
.students-input label { color: #cbd5e1; font-weight: 600; }
.students-input input { width: 80px; padding: 0.4rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #f1f5f9; text-align: center; }
.total-row { display: flex; justify-content: space-between; color: #cbd5e1; margin: 0.4rem 0; }
.total-row .price { color: #67e8f9; font-weight: 800; }
.free-note { color: #4ade80; font-weight: 700; margin: 0.8rem 0; font-size: 0.9rem; }
.btn-plan { padding: 0.5rem 1rem; border: none; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-weight: 700; cursor: pointer; }
.btn-plan:disabled { opacity: 0.5; cursor: not-allowed; }
.compact-list { display: flex; flex-direction: column; gap: 0.5rem; }
.compact-row { display: flex; align-items: center; gap: 0.6rem; background: #1e293b; border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 0.5rem 0.8rem; }
.cr-icon { font-size: 1rem; }
.cr-name { flex: 1; color: #f1f5f9; font-weight: 600; }
.cr-meta { display: flex; gap: 0.5rem; color: #94a3b8; font-size: 0.8rem; align-items: center; }
.btn-copy { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #67e8f9; border-radius: 6px; padding: 0.15rem 0.4rem; cursor: pointer; font-size: 0.75rem; }
.code-row { display: flex; gap: 0.5rem; margin-top: 0.6rem; }
.code-input { flex: 1; padding: 0.5rem 0.7rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #f1f5f9; font-size: 0.9rem; }
.btn-join { padding: 0.5rem 1rem; border: none; border-radius: 8px; background: #22c55e; color: #fff; font-weight: 700; cursor: pointer; }
.btn-join:disabled { opacity: 0.5; cursor: not-allowed; }
.verify-badge { background: rgba(34,197,94,0.12); color: #4ade80; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; }
.verify-badge.unverified { background: rgba(234,179,8,0.12); color: #facc15; }
.verify-badge.danger { background: rgba(239,68,68,0.12); color: #f87171; }
</style>
