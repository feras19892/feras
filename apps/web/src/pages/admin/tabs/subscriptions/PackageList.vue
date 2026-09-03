<script setup lang="ts">
import { Users, GraduationCap, CreditCard, Banknote, Trash2 } from 'lucide-vue-next'
import { formatCurrency } from '@/services/core/currency'
import EmptyState from '@/components/shared/EmptyState.vue'
import type { AdminPlanPackage } from '@/services/core/admin-subscriptions.api'

const props = defineProps<{
  packages: AdminPlanPackage[]
}>()

const emit = defineEmits<{
  (e: 'remove', pkg: AdminPlanPackage): void
}>()
</script>

<template>
  <div class="list">
    <EmptyState
      v-if="packages.length === 0"
      icon="📭"
      title="لا توجد باقات"
      description="أضف باقة جديدة لتحديد الأسعار والمقاعد"
    />
    <table v-else class="packages-table">
      <thead>
        <tr>
          <th><span class="th-label"><Users :size="14" /> مدرسون</span></th>
          <th><span class="th-label"><GraduationCap :size="14" /> طلاب</span></th>
          <th><span class="th-label"><CreditCard :size="14" /> شهري</span></th>
          <th><span class="th-label"><Banknote :size="14" /> سنوي</span></th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pkg in packages" :key="pkg.id">
          <td class="num">{{ pkg.teacher_count }}</td>
          <td class="num">{{ pkg.student_count }}</td>
          <td class="num">{{ formatCurrency(pkg.price_cents_monthly, pkg.currency) }}</td>
          <td class="num">{{ formatCurrency(pkg.price_cents_yearly, pkg.currency) }}</td>
          <td class="actions">
            <button type="button" class="btn-icon danger" @click="emit('remove', pkg)" title="حذف">
              <Trash2 :size="16" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.list { margin-bottom: 1.5rem; }
.packages-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.packages-table th,
.packages-table td {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: right;
}
.packages-table th { color: #94a3b8; font-weight: 600; }
.th-label { display: flex; align-items: center; gap: 0.35rem; }
.num { font-variant-numeric: tabular-nums; }
.actions { text-align: center; }
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0.35rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.btn-icon.danger { color: #f87171; border-color: rgba(239, 68, 68, 0.3); }
.btn-icon:hover { background: rgba(255, 255, 255, 0.05); }
</style>
