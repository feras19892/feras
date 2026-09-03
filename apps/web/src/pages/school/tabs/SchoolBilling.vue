<template>
  <div class="dash-page">
    <div class="header-row">
      <h2>الاشتراكات والفوترة</h2>
      <button class="btn-members" @click="router.push('/school/members')">
        🛡️ التحكم بالأعضاء
      </button>
    </div>

    <SkeletonLoader v-if="loading" type="cards" :count="2" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else>
      <SchoolBillingStats :subscription="subscription" :codes="codes" :members="members" />

      <div class="billing-card">
        <h3>📊 حالة الاشتراك</h3>
        <div v-if="subscription" class="sub-row">
          <span class="sub-name">{{ subscription.plan_name || 'اشتراك مجاني' }}</span>
          <span :class="['verify-badge', statusClass(subscription.status)]">{{ statusLabel(subscription.status) }}</span>
          <span class="sub-meta" v-if="subscription.expires_at">ينتهي: {{ formatDate(subscription.expires_at) }}</span>
          <span class="sub-meta">طلاب: {{ subscription.max_students ?? '—' }} | معلمون: {{ subscription.max_teachers ?? '—' }}</span>
        </div>
        <EmptyState v-else icon="💳" title="لا يوجد اشتراك نشط" />
      </div>

      <div class="billing-card">
        <h3>🛒 اشترك كمدرسة</h3>
        <PlanSelector @select="selectPackage" />
      </div>

      <div class="billing-card">
        <h3>🔗 أكواد دعوة المعلمين</h3>
        <div class="students-input">
          <label>العدد المطلوب</label>
          <input v-model.number="teacherCodeCount" type="number" min="1" max="100" />
          <button class="btn-plan" :disabled="creatingTeacher" @click="generateTeacherCodes">
            {{ creatingTeacher ? '...' : 'تحديث' }}
          </button>
        </div>
        <SchoolInviteCodesTable :codes="teacherCodes" title="" @copy="copy" />
      </div>

      <div class="billing-card">
        <h3>🔗 أكواد دعوة الطلاب</h3>
        <div class="students-input">
          <label>العدد المطلوب</label>
          <input v-model.number="studentCodeCount" type="number" min="1" max="100" />
          <button class="btn-plan" :disabled="creatingStudent" @click="generateStudentCodes">
            {{ creatingStudent ? '...' : 'تحديث' }}
          </button>
        </div>
        <SchoolInviteCodesTable :codes="studentCodes" title="" @copy="copy" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction, t } = useI18n();
import { ref, computed, onMounted, onActivated } from 'vue'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import SchoolInviteCodesTable from '@/components/school/SchoolInviteCodesTable.vue'
import SchoolBillingStats from '@/components/school/SchoolBillingStats.vue'
import PlanSelector from '@/components/shared/PlanSelector.vue'
import { useSubscriptionSettings } from '@/composables/useSubscriptionSettings'
import {
  getMySubscription,
  getInviteCodes,
  createInviteCodes,
  getTenantMembers,
  type SchoolSubscription,
  type InviteCode,
  type TenantMember,
} from '@/services/core/school.api'


const toast = useToast()
const router = useRouter()
const { get } = useSubscriptionSettings()

const subscription = ref<SchoolSubscription | null>(null)
const codes = ref<InviteCode[]>([])
const members = ref<TenantMember[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const creatingStudent = ref(false)
const creatingTeacher = ref(false)
const billing = ref<'monthly' | 'yearly'>('monthly')
const teacherCount = ref(2)
const studentCount = ref(10)
const studentCodeCount = ref(10)
const teacherCodeCount = ref(2)

const teacherMonthlyCents = computed(() => Number(get('school_teacher_price_month_cents', 100)) / 100)
const teacherYearlyCents = computed(() => Number(get('school_teacher_price_year_cents', 1000)) / 100)
const studentMonthlyCents = computed(() => Number(get('school_student_price_month_cents', 100)) / 100)
const studentYearlyCents = computed(() => Number(get('school_student_price_year_cents', 1000)) / 100)
const freeTeachers = computed(() => Number(get('school_free_teachers', 15)))
const freeStudents = computed(() => Number(get('school_free_students', 0)))

const pricePerTeacher = computed(() => (billing.value === 'monthly' ? teacherMonthlyCents.value : teacherYearlyCents.value).toFixed(2))
const pricePerStudent = computed(() => (billing.value === 'monthly' ? studentMonthlyCents.value : studentYearlyCents.value).toFixed(2))
const billingLabel = computed(() => (billing.value === 'monthly' ? 'شهر' : 'سنة'))
const totalPrice = computed(() => {
  const t = teacherCount.value * Number(pricePerTeacher.value)
  const s = studentCount.value * Number(pricePerStudent.value)
  return (t + s).toFixed(2)
})
const isFree = computed(() => teacherCount.value <= freeTeachers.value && studentCount.value <= freeStudents.value)
const studentCodes = computed(() => codes.value.filter((c) => !c.role || c.role === 'student'))
const teacherCodes = computed(() => codes.value.filter((c) => c.role === 'teacher'))

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
    name: 'SchoolPayment',
    query: { package_id: String(pkg.id), plan_id: String(plan.id), billing: 'monthly' },
  })
}

function goToPayment() {
  router.push({
    name: 'SchoolPayment',
    query: {
      billing: billing.value,
      teachers: String(teacherCount.value),
      students: String(studentCount.value),
      total: totalPrice.value,
    },
  })
}

async function generateStudentCodes() {
  await generateCodes('student')
}

async function generateTeacherCodes() {
  await generateCodes('teacher')
}

async function generateCodes(role: 'student' | 'teacher') {
  const isStudent = role === 'student'
  const current = isStudent ? studentCodes.value.length : teacherCodes.value.length
  const target = isStudent ? studentCodeCount.value : teacherCodeCount.value
  const missing = target - current
  if (missing <= 0) {
    toast.info('العدد الحالي يغطي المطلوب')
    return
  }
  const flag = isStudent ? creatingStudent : creatingTeacher
  flag.value = true
  try {
    const res = await createInviteCodes(missing, role, 1)
    if (res.success) {
      toast.success(`تم الوصول إلى ${target} كود`)
      await load()
    } else {
      toast.error(res.message || 'فشل إنشاء الأكواد')
    }
  } catch (e: any) {
    toast.error(e.message || t('common.error'))
  } finally {
    creatingStudent.value = false
    creatingTeacher.value = false
  }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const [subRes, codesRes, membersRes] = await Promise.all([getMySubscription(), getInviteCodes(), getTenantMembers()])
    if (subRes.success) subscription.value = subRes.subscription || null
    if (codesRes.success) codes.value = codesRes.invite_codes
    if (membersRes.success) {
      members.value = membersRes.members.map((m: any) => ({ ...m, role: m.role || 'student' }))
      if (subscription.value) {
        studentCodeCount.value = subscription.value.max_students ?? 10
        teacherCodeCount.value = subscription.value.max_teachers ?? 2
      }
    }
  } catch (e: any) {
    error.value = e.message || t('common.error')
  } finally {
    loading.value = false
  }
}

onMounted(load)
onActivated(load)
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
.header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.header-row h2 { margin: 0; }
.btn-members { background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); color: #a5b4fc; border-radius: 8px; padding: 0.4rem 0.8rem; cursor: pointer; font-weight: 700; }
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
.btn-danger { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; border-radius: 6px; padding: 0.15rem 0.4rem; cursor: pointer; font-size: 0.75rem; }
.stats-row { display: flex; gap: 1rem; color: #94a3b8; margin-bottom: 0.8rem; font-size: 0.9rem; }
.verify-badge { background: rgba(34,197,94,0.12); color: #4ade80; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; }
.verify-badge.danger { background: rgba(239,68,68,0.12); color: #f87171; }
</style>
