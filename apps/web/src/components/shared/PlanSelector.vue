<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, onMounted } from 'vue'

import { Package, Users, GraduationCap, CreditCard, Banknote, CheckCircle } from 'lucide-vue-next'
import { fetchJson } from '@/services/http'
import { formatCurrency } from '@/services/core/currency'





interface PlanPackage {
  id: number
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
  features: string | null
  packages: PlanPackage[]
}

const emit = defineEmits<{
  (e: 'select', pkg: PlanPackage, plan: PlanWithPackages): void
}>()

const plans = ref<PlanWithPackages[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const maintenance = ref(true)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await fetchJson<{ success: boolean; plans: PlanWithPackages[] }>('/api/subscriptions/plans')
    if (res.success) plans.value = res.plans
  } catch (e: any) {
    error.value = e?.message || 'فشل تحميل الخطط'
  } finally {
    loading.value = false
  }
}

function typeLabel(type: string) {
  const map: Record<string, string> = { student: 'طالب', teacher: 'مدرس', school: 'مدرسة' }
  return map[type] || type
}

onMounted(load)
</script>

<template>
  <div class="selector">
    <div v-if="maintenance" class="maintenance">
      {{ t('subscriptions.maintenanceTitle') }}
    </div>
    <div v-if="loading" class="state">جاري تحميل الخطط...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
    <div v-else-if="plans.length === 0" class="state">لا توجد خطط متاحة</div>
    <div v-else class="plans">
      <div v-for="plan in plans" :key="plan.id" class="plan">
        <div class="plan-header">
          <Package :size="18" />
          <div>
            <div class="plan-name">{{ plan.name }}</div>
            <div class="plan-type">{{ typeLabel(plan.type) }}</div>
          </div>
        </div>
        <div v-if="plan.features" class="features">{{ plan.features }}</div>
        <div class="packages">
          <div v-for="pkg in plan.packages" :key="pkg.id" class="package">
            <div class="package-row">
              <span class="meta"><Users :size="14" /> {{ pkg.teacher_count }} مدرس</span>
              <span class="meta"><GraduationCap :size="14" /> {{ pkg.student_count }} طالب</span>
            </div>
            <div class="package-row">
              <span class="meta"><CreditCard :size="14" /> {{ formatCurrency(pkg.price_cents_monthly, pkg.currency) }}</span>
              <span class="meta"><Banknote :size="14" /> {{ formatCurrency(pkg.price_cents_yearly, pkg.currency) }}</span>
            </div>
            <button type="button" class="btn-select" @click="emit('select', pkg, plan)">
              <CheckCircle :size="16" /> اختيار
            </button>
          </div>
          <div v-if="plan.packages.length === 0" class="no-pkg">لا توجد باقات لهذه الخطة</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.selector { color: #e2e8f0; }
.maintenance { background: rgba(234, 179, 8, 0.12); border: 1px solid rgba(234, 179, 8, 0.25); color: #facc15; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center; font-weight: 600; }
.state { text-align: center; padding: 1rem; color: #94a3b8; }
.state.error { color: #f87171; }
.plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; }
.plan { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 0.75rem; padding: 1rem; }
.plan-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
.plan-header > div { flex: 1; }
.plan-name { font-weight: 700; color: #f1f5f9; }
.plan-type { font-size: 0.8rem; color: #94a3b8; }
.features { color: #cbd5e1; font-size: 0.85rem; margin-bottom: 0.75rem; }
.packages { display: flex; flex-direction: column; gap: 0.5rem; }
.package { background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 0.5rem; padding: 0.75rem; }
.package-row { display: flex; justify-content: space-between; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.5rem; }
.meta { display: flex; align-items: center; gap: 0.3rem; color: #94a3b8; font-size: 0.85rem; }
.btn-select { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.4rem; background: #6366f1; border: none; color: white; padding: 0.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; margin-top: 0.5rem; }
.btn-select:hover { opacity: 0.9; }
.maintenance-btn { width: 100%; text-align: center; background: rgba(100, 116, 139, 0.2); border: 1px solid rgba(100, 116, 139, 0.4); color: #94a3b8; padding: 0.5rem; border-radius: 0.5rem; font-weight: 600; margin-top: 0.5rem; }
.no-pkg { color: #64748b; text-align: center; font-size: 0.85rem; padding: 0.5rem; }
</style>
