<template>
  <div class="dash-page">
    <h2>اشتراكي</h2>

    <SkeletonLoader v-if="loading" type="cards" :count="2" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else>
      <div class="billing-card">
        <h3>📊 حالة الاشتراك</h3>
        <div v-if="subscription" class="sub-row">
          <span class="sub-name">{{ subscription.plan_name }}</span>
          <span :class="['verify-badge', statusClass(subscription.status)]">{{ statusLabel(subscription.status) }}</span>
          <span class="sub-meta">ينتهي: {{ formatDate(subscription.expires_at) }}</span>
          <span class="sub-meta">التجديد: {{ formatDate(subscription.next_billing_at) }}</span>
        </div>
        <EmptyState v-else icon="💳" :title="String(get('no_subscription_title', 'لا يوجد اشتراك نشط'))" />
      </div>

      <div class="billing-card">
        <h3>{{ get('student_plan_title', 'اشترك الآن') }}</h3>
        <PlanSelector @select="selectPackage" />
      </div>

      <div class="billing-card">
        <h3>🔗 الانضمام بكود تفعيل</h3>
        <p class="sub-info">إذا كان لديك كود من مدرسك أو مدرستك، أدخله هنا:</p>
        <div class="code-row">
          <input v-model="joinCode" class="code-input" placeholder="XXXX-XXXX" :disabled="joining" />
          <button class="btn-join" :disabled="!joinCode || joining" @click="joinCodeHandler">
            {{ joining ? '...' : 'انضمام' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, computed, onMounted } from 'vue'

import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'
import EmptyState from '@/components/shared/EmptyState.vue'
import { getMySubscription, joinWithInviteCode, type SchoolSubscription } from '@/services/core/school.api'
import { useToast } from '@/composables/useToast'
import PlanSelector from '@/components/shared/PlanSelector.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useSubscriptionSettings } from '@/composables/useSubscriptionSettings'





const toast = useToast()
const router = useRouter()
const auth = useAuthStore()

const subscription = ref<SchoolSubscription | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const joinCode = ref('')
const joining = ref(false)
const { get } = useSubscriptionSettings()

const basicCents = computed(() => Number(get('student_price_month_cents', 200)) / 100)
const premiumCents = computed(() => Number(get('student_premium_price_month_cents', 1900)) / 100)

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

function selectPackage(pkg: any, plan: any) {
  router.push({
    name: 'StudentPayment',
    query: { package_id: String(pkg.id), plan_id: String(plan.id), billing: 'monthly' },
  })
}

function goToPayment(plan: string) {
  router.push({ name: 'StudentPayment', query: { plan } })
}

async function joinCodeHandler() {
  if (!joinCode.value) return
  joining.value = true
  try {
    const res = await joinWithInviteCode(joinCode.value.trim())
    if (res.success) {
      toast.success('تم الانضمام بنجاح')
      joinCode.value = ''
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
    const res = await getMySubscription()
    if (res.success) subscription.value = res.subscription || null
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
.plans-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
.plan-card { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.18); border-radius: 12px; padding: 1rem; text-align: center; }
.plan-card.featured { background: rgba(6,182,212,0.06); border-color: rgba(6,182,212,0.25); }
.plan-name { color: #a5b4fc; font-weight: 700; margin-bottom: 0.3rem; }
.featured .plan-name { color: #67e8f9; }
.plan-price { font-size: 1.6rem; font-weight: 800; color: #f1f5f9; }
.plan-price span { font-size: 0.85rem; color: #94a3b8; font-weight: 400; }
.plan-desc { color: #94a3b8; font-size: 0.8rem; margin: 0.6rem 0 1rem; }
.btn-plan { width: 100%; padding: 0.5rem; border: none; border-radius: 8px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-weight: 700; cursor: pointer; }
.btn-plan:hover { opacity: 0.9; }
.code-row { display: flex; gap: 0.5rem; margin-top: 0.6rem; }
.code-input { flex: 1; padding: 0.5rem 0.7rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: #0f172a; color: #f1f5f9; font-size: 0.9rem; }
.btn-join { padding: 0.5rem 1rem; border: none; border-radius: 8px; background: #22c55e; color: #fff; font-weight: 700; cursor: pointer; }
.btn-join:disabled { opacity: 0.5; cursor: not-allowed; }
.verify-badge { background: rgba(34,197,94,0.12); color: #4ade80; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; }
.verify-badge.unverified { background: rgba(234,179,8,0.12); color: #facc15; }
.verify-badge.danger { background: rgba(239,68,68,0.12); color: #f87171; }
</style>
