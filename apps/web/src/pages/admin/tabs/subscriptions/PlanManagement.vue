<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import {
  getAdminPlans,
  toggleAdminPlan,
  type AdminPlan,
} from '@/services/core/admin-subscriptions.api'
import PlanForm from './PlanForm.vue'
import PlanPackages from './PlanPackages.vue'


const toast = useToast()
const search = ref('')
const statusFilter = ref('all')
const plans = ref<AdminPlan[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const showForm = ref(false)
const editingPlan = ref<AdminPlan | undefined>(undefined)
const viewingPlan = ref<AdminPlan | undefined>(undefined)

const filteredPlans = computed(() => {
  return plans.value.filter((plan) => {
    const matchesSearch = (plan.name || '').toLowerCase().includes(search.value.toLowerCase())
    const matchesStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'active' && plan.is_active === 1) ||
      (statusFilter.value === 'inactive' && plan.is_active === 0)
    return matchesSearch && matchesStatus
  })
})

const statusLabel = (plan: AdminPlan) => {
  return plan.is_active === 1 ? 'نشط' : 'غير نشط'
}

const statusClass = (plan: AdminPlan) => {
  return plan.is_active === 1 ? 'active' : 'inactive'
}

const fetchPlans = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getAdminPlans()
    plans.value = res.plans
  } catch (e: any) {
    error.value = e?.message || 'فشل تحميل الخطط'
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  editingPlan.value = undefined
  showForm.value = true
}

const openEdit = (plan: AdminPlan) => {
  editingPlan.value = plan
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  editingPlan.value = undefined
}

const openView = (plan: AdminPlan) => {
  viewingPlan.value = plan
}

const closeView = async () => {
  viewingPlan.value = undefined
  await fetchPlans()
}

const onSaved = async () => {
  closeForm()
  await fetchPlans()
}

const togglePlan = async (plan: AdminPlan) => {
  try {
    await toggleAdminPlan(plan.id)
    await fetchPlans()
  } catch (e: any) {
    toast.error(e?.message || 'فشل تغيير الحالة')
  }
}

onMounted(() => {
  fetchPlans()
})
</script>

<template>
  <div class="plan-management">
    <div class="toolbar">
      <input
        v-model="search"
        type="text"
        class="search-input"
        placeholder="بحث باسم الخطة..."
      />
      <select v-model="statusFilter" class="filter-select">
        <option value="all">الكل</option>
        <option value="active">نشط</option>
        <option value="inactive">غير نشط</option>
      </select>
      <button type="button" class="btn-create" @click="openCreate">
        + إضافة خطة جديدة
      </button>
    </div>

    <div v-if="error" class="error-banner">{{ error }}</div>
    <div v-else-if="loading" class="loading">جاري التحميل...</div>

    <template v-else>
      <table class="plans-table">
        <thead>
          <tr>
            <th v-for="h in ['الاسم', 'النوع', 'العملة', 'عدد الباقات', 'الحالة', 'إجراءات']" :key="h">{{ h }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="plan in filteredPlans" :key="plan.id">
            <td>{{ plan.name }}</td>
            <td>
              <span :class="['badge', `type-${plan.type}`]">{{ plan.type }}</span>
            </td>
            <td>{{ plan.currency }}</td>
            <td>{{ plan.package_count }}</td>
            <td>
              <span :class="['status', statusClass(plan)]">{{ statusLabel(plan) }}</span>
            </td>
            <td class="actions">
              <button type="button" class="btn-small" @click="openView(plan)">عرض</button>
              <button type="button" class="btn-small" @click="openEdit(plan)">تعديل</button>
              <button type="button" class="btn-small" @click="togglePlan(plan)">
                {{ plan.is_active === 1 ? 'إلغاء' : 'تفعيل' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="footer">
        عدد الخطط: {{ filteredPlans.length }}
      </div>
    </template>

    <PlanForm
      v-if="showForm"
      :plan="editingPlan"
      @saved="onSaved"
      @cancel="closeForm"
    />
    <PlanPackages
      v-if="viewingPlan"
      :plan="viewingPlan"
      @close="closeView"
    />
  </div>
</template>

<style scoped>
.plan-management {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  color: #e2e8f0;
}
.toolbar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}
.search-input,
.filter-select {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}
.search-input {
  flex: 1;
  min-width: 200px;
}
.btn-create {
  background: #6366f1;
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}
.plans-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.plans-table th,
.plans-table td {
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-align: right;
}
.plans-table th {
  color: #94a3b8;
  font-weight: 600;
}
.badge {
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  text-transform: uppercase;
}
.type-student { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.type-teacher { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.type-school { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.status {
  padding: 0.2rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8rem;
}
.status.active { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.status.inactive { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.actions {
  display: flex;
  gap: 0.5rem;
}
.btn-small {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.8rem;
}
.btn-small:hover {
  background: rgba(255, 255, 255, 0.05);
}
.loading,
.error-banner {
  padding: 1rem;
  border-radius: 0.375rem;
  text-align: center;
}
.loading {
  color: #94a3b8;
}
.error-banner {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}
.footer {
  color: #64748b;
  font-size: 0.85rem;
}
</style>
