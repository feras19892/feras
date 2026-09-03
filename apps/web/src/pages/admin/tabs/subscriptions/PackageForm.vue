<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed } from 'vue'
import { Users, GraduationCap, CreditCard, Banknote, Plus } from 'lucide-vue-next'
import { formatCurrency } from '@/services/core/currency'
import { createPlanPackage, type AdminPlan } from '@/services/core/admin-subscriptions.api'


const props = defineProps<{ plan: AdminPlan }>()
const emit = defineEmits<{ (e: 'added'): void }>()

const saving = ref(false)
const formError = ref<string | null>(null)
const form = ref({
  teacher_count: 0,
  student_count: 0,
  price_per_teacher_monthly: 0,
  price_per_student_monthly: 0,
  price_per_teacher_yearly: 0,
  price_per_student_yearly: 0,
  currency: props.plan.currency,
})

const monthlyTotal = computed(() =>
  (form.value.teacher_count * form.value.price_per_teacher_monthly) +
  (form.value.student_count * form.value.price_per_student_monthly),
)
const yearlyTotal = computed(() =>
  (form.value.teacher_count * form.value.price_per_teacher_yearly) +
  (form.value.student_count * form.value.price_per_student_yearly),
)
const teachersMonthly = computed(() => form.value.teacher_count * form.value.price_per_teacher_monthly)
const studentsMonthly = computed(() => form.value.student_count * form.value.price_per_student_monthly)
const teachersYearly = computed(() => form.value.teacher_count * form.value.price_per_teacher_yearly)
const studentsYearly = computed(() => form.value.student_count * form.value.price_per_student_yearly)

const reset = () => {
  form.value = { teacher_count: 0, student_count: 0, price_per_teacher_monthly: 0, price_per_student_monthly: 0, price_per_teacher_yearly: 0, price_per_student_yearly: 0, currency: props.plan.currency }
}

const submit = async () => {
  saving.value = true
  formError.value = null
  try {
    await createPlanPackage(props.plan.id, {
      teacher_count: form.value.teacher_count,
      student_count: form.value.student_count,
      price_cents_monthly: monthlyTotal.value,
      price_cents_yearly: yearlyTotal.value,
      currency: form.value.currency,
    })
    reset()
    emit('added')
  } catch (e: any) {
    formError.value = e?.message || 'فشل إضافة الباقة'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <div class="form-header">
      <Plus :size="18" />
      <span>إضافة باقة جديدة</span>
    </div>
    <div v-if="formError" class="error">{{ formError }}</div>
    <div class="form-row">
      <div class="field">
        <label><span class="label-icon"><Users :size="14" /></span> عدد المدرسين</label>
        <input v-model.number="form.teacher_count" type="number" min="0" class="input" required />
      </div>
      <div class="field">
        <label><span class="label-icon"><GraduationCap :size="14" /></span> عدد الطلاب</label>
        <input v-model.number="form.student_count" type="number" min="0" class="input" required />
      </div>
      <div class="field">
        <label><span class="label-icon"><CreditCard :size="14" /></span> سعر المدرس شهرياً (سنت)</label>
        <input v-model.number="form.price_per_teacher_monthly" type="number" min="0" class="input" required />
      </div>
      <div class="field">
        <label><span class="label-icon"><CreditCard :size="14" /></span> سعر الطالب شهرياً (سنت)</label>
        <input v-model.number="form.price_per_student_monthly" type="number" min="0" class="input" required />
      </div>
      <div class="field">
        <label><span class="label-icon"><Banknote :size="14" /></span> سعر المدرس سنوياً (سنت)</label>
        <input v-model.number="form.price_per_teacher_yearly" type="number" min="0" class="input" required />
      </div>
      <div class="field">
        <label><span class="label-icon"><Banknote :size="14" /></span> سعر الطالب سنوياً (سنت)</label>
        <input v-model.number="form.price_per_student_yearly" type="number" min="0" class="input" required />
      </div>
      <div class="field">
        <label><span class="label-icon"><Banknote :size="14" /></span> العملة</label>
        <input v-model="form.currency" type="text" maxlength="3" class="input" required />
      </div>
    </div>
    <div class="summary">
      <div class="summary-card">
        <div class="summary-label">مدرسون شهرياً</div>
        <div class="summary-value">{{ formatCurrency(teachersMonthly, form.currency) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">طلاب شهرياً</div>
        <div class="summary-value">{{ formatCurrency(studentsMonthly, form.currency) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">مدرسون سنوياً</div>
        <div class="summary-value">{{ formatCurrency(teachersYearly, form.currency) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">طلاب سنوياً</div>
        <div class="summary-value">{{ formatCurrency(studentsYearly, form.currency) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">إجمالي شهري</div>
        <div class="summary-value">{{ formatCurrency(monthlyTotal, form.currency) }}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">إجمالي سنوي</div>
        <div class="summary-value">{{ formatCurrency(yearlyTotal, form.currency) }}</div>
      </div>
    </div>
    <button type="submit" class="btn-add" :disabled="saving">
      <Plus :size="16" />
      {{ saving ? 'جاري الإضافة...' : 'إضافة الباقة' }}
    </button>
  </form>
</template>

<style scoped>
.form {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 1rem;
}
.form-header { display: flex; align-items: center; gap: 0.5rem; color: #a5b4fc; font-weight: 600; margin-bottom: 0.75rem; }
.error { background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 0.6rem; border-radius: 0.375rem; margin-bottom: 0.75rem; }
.form-row { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1rem; }
.field { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; min-width: 130px; }
.field label { display: flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; color: #94a3b8; }
.label-icon { display: inline-flex; color: #a5b4fc; }
.input { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); color: #e2e8f0; padding: 0.5rem 0.65rem; border-radius: 0.5rem; }
.summary { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.summary-card { flex: 1; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.5rem; padding: 0.75rem; text-align: center; }
.summary-label { font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.25rem; }
.summary-value { font-size: 1.1rem; font-weight: 700; color: #34d399; }
.btn-add { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; background: #6366f1; border: none; color: white; padding: 0.6rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
.btn-add:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
