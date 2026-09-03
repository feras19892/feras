<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CreditCard, Calendar, Lock, User, Banknote } from 'lucide-vue-next'
import { fetchJson } from '@/services/http'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/services/core/currency'

interface PlanPackage {
  id: number
  plan_id: number
  teacher_count: number
  student_count: number
  price_cents_monthly: number
  price_cents_yearly: number
  currency: string
}

interface PlanWithPackages {
  id: number
  type: 'student' | 'teacher' | 'school'
  name: string
  currency: string
  packages: PlanPackage[]
}

const props = defineProps<{
  ownerId: number
  ownerType: 'user' | 'school'
  backRoute: string
  successRoute: string
}>()

const route = useRoute()
const router = useRouter()
const toast = useToast()

const plans = ref<PlanWithPackages[]>([])
const loading = ref(true)
const processing = ref(false)
const error = ref<string | null>(null)

const packageId = computed(() => Number(route.query.package_id) || 0)
const planId = computed(() => Number(route.query.plan_id) || 0)
const billing = computed(() => (route.query.billing as string) || 'monthly')

const pkg = computed<PlanPackage | undefined>(() => {
  for (const plan of plans.value) {
    for (const p of plan.packages) {
      if (p.id === packageId.value) return p
    }
  }
  return undefined
})

const plan = computed(() => plans.value.find((p) => p.id === planId.value))
const priceCents = computed(() => (billing.value === 'yearly' ? pkg.value?.price_cents_yearly : pkg.value?.price_cents_monthly) ?? 0)
const currency = computed(() => pkg.value?.currency || 'EUR')

const cardNumber = ref('')
const cardHolder = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const agreed = ref(false)

const isFormValid = computed(() =>
  cardNumber.value.length >= 16 &&
  cardHolder.value.trim().length > 0 &&
  cardExpiry.value.length >= 4 &&
  cardCvc.value.length >= 3 &&
  agreed.value,
)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await fetchJson<{ success: boolean; plans: PlanWithPackages[] }>('/api/subscriptions/plans')
    if (res.success) plans.value = res.plans
  } catch (e: any) {
    error.value = e?.message || 'فشل تحميل الباقة'
  } finally {
    loading.value = false
  }
}

async function submit() {
  if (!isFormValid.value || !pkg.value || !plan.value) {
    toast.error('أكمل بيانات البطاقة')
    return
  }
  processing.value = true
  try {
    const months = billing.value === 'yearly' ? 12 : 1
    const days = months * 30
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    const res = await fetchJson<{ success: boolean; id?: number; message?: string }>('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_id: props.ownerId,
        owner_type: props.ownerType,
        plan_id: plan.value.id,
        status: 'ACTIVE',
        starts_at: new Date().toISOString(),
        expires_at: expiresAt,
        next_billing_at: expiresAt,
        payment_provider: 'simulated',
        payment_reference: `sim-${pkg.value.id}-${Date.now()}`,
        max_students: pkg.value.student_count,
        max_teachers: pkg.value.teacher_count,
      }),
    })
    if (res.success) {
      toast.success('تم الدفع والتفعيل بنجاح (محاكاة)')
      router.push(props.successRoute)
    } else {
      toast.error(res.message || 'فشل إنشاء الاشتراك')
    }
  } catch (e: any) {
    toast.error(e?.message || 'فشل الدفع')
  } finally {
    processing.value = false
  }
}

function back() { router.push(props.backRoute) }

onMounted(load)
</script>

<template>
  <div class="payment-page">
    <div class="payment-card">
      <h2><Banknote :size="24" /> معلومات الدفع</h2>
      <p class="desc">محاكاة دفع. لاحقاً بتستبدل ببوابة دفع حقيقية.</p>

      <div v-if="loading" class="state">جاري تحميل الباقة...</div>
      <div v-else-if="error" class="state error">{{ error }}</div>
      <div v-else-if="!pkg || !plan" class="state error">الباقة المختارة غير موجودة</div>

      <template v-else>
        <div class="plan-summary">
          <div><span class="label">الخطة:</span> <span class="value">{{ plan.name }}</span></div>
          <div><span class="label">المعلمين:</span> <span class="value">{{ pkg.teacher_count }}</span></div>
          <div><span class="label">الطلاب:</span> <span class="value">{{ pkg.student_count }}</span></div>
          <div><span class="label">المدة:</span> <span class="value">{{ billing === 'yearly' ? 'سنوي' : 'شهري' }}</span></div>
          <div class="price-row">
            <span class="label">المبلغ:</span>
            <span class="price">{{ formatCurrency(priceCents, currency) }}</span>
          </div>
        </div>

        <div class="form">
          <div class="field">
            <label><CreditCard :size="14" /> رقم البطاقة</label>
            <input v-model="cardNumber" type="text" maxlength="19" placeholder="0000 0000 0000 0000" />
          </div>
          <div class="field">
            <label><User :size="14" /> اسم حامل البطاقة</label>
            <input v-model="cardHolder" type="text" placeholder="John Doe" />
          </div>
          <div class="form-row">
            <div class="field">
              <label><Calendar :size="14" /> انتهاء الصلاحية</label>
              <input v-model="cardExpiry" type="text" maxlength="5" placeholder="MM/YY" />
            </div>
            <div class="field">
              <label><Lock :size="14" /> CVC</label>
              <input v-model="cardCvc" type="text" maxlength="4" placeholder="123" />
            </div>
          </div>
        </div>

        <div class="policy-row">
          <input id="agree" v-model="agreed" type="checkbox" />
          <label for="agree">
            {{ t('subscriptions.policyAgreement') }}
            <a :href="t('subscriptions.policyUrl')" target="_blank" rel="noopener">{{ t('subscriptions.policyName') }}</a>
          </label>
        </div>

        <div class="actions">
          <button class="btn-back" @click="back">رجوع</button>
          <button class="btn-confirm" :disabled="!isFormValid || processing" @click="submit">
            {{ processing ? 'جاري المعالجة...' : 'تأكيد الدفع' }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.payment-page { padding: 2rem; display: flex; justify-content: center; }
.payment-card { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 1rem; padding: 1.5rem; max-width: 480px; width: 100%; color: #e2e8f0; }
h2 { margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.5rem; }
.desc { color: #94a3b8; margin-bottom: 1.2rem; font-size: 0.85rem; }
.state { text-align: center; padding: 1rem; color: #94a3b8; }
.state.error { color: #f87171; }
.plan-summary { background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.18); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1.2rem; display: flex; flex-direction: column; gap: 0.4rem; }
.plan-summary .label { color: #94a3b8; font-size: 0.85rem; }
.plan-summary .value { color: #e2e8f0; font-weight: 700; }
.price-row { display: flex; justify-content: space-between; align-items: center; margin-top: 0.4rem; }
.price { color: #67e8f9; font-weight: 800; font-size: 1.2rem; }
.form { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.2rem; }
.form-row { display: flex; gap: 0.75rem; }
.field { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.field label { color: #94a3b8; font-size: 0.8rem; display: flex; align-items: center; gap: 0.3rem; }
.field input { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); color: #e2e8f0; padding: 0.6rem; border-radius: 0.5rem; }
.policy-row { display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 1.2rem; font-size: 0.85rem; color: #94a3b8; }
.policy-row input { margin-top: 0.2rem; }
.policy-row a { color: #67e8f9; text-decoration: underline; }
.actions { display: flex; gap: 0.5rem; }
.actions button { flex: 1; padding: 0.6rem; border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; }
.btn-back { background: rgba(255, 255, 255, 0.08); color: #e2e8f0; }
.btn-confirm { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; }
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
