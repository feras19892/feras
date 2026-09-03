<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPlanPackages, deletePlanPackage, type AdminPlan, type AdminPlanPackage } from '@/services/core/admin-subscriptions.api'
import PackageList from './PackageList.vue'
import PackageForm from './PackageForm.vue'
import ConfirmModal from '@/components/shared/ConfirmModal.vue'

const props = defineProps<{ plan: AdminPlan }>()
const emit = defineEmits<{ (e: 'close'): void }>()

const packages = ref<AdminPlanPackage[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const confirmOpen = ref(false)
const pkgToDelete = ref<AdminPlanPackage | null>(null)

const fetchPackages = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await getPlanPackages(props.plan.id)
    packages.value = res.packages
  } catch (e: any) {
    error.value = e?.message || 'فشل تحميل الباقات'
  } finally {
    loading.value = false
  }
}

const askRemove = (pkg: AdminPlanPackage) => {
  pkgToDelete.value = pkg
  confirmOpen.value = true
}

const doRemove = async () => {
  if (!pkgToDelete.value) return
  try {
    await deletePlanPackage(props.plan.id, pkgToDelete.value.id)
    await fetchPackages()
  } catch (e: any) {
    error.value = e?.message || 'فشل حذف الباقة'
  } finally {
    confirmOpen.value = false
    pkgToDelete.value = null
  }
}

onMounted(fetchPackages)
</script>

<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="panel">
      <div class="header">
        <button type="button" class="btn-back" @click="emit('close')">← عودة</button>
        <h3 class="title">باقات الخطة: {{ plan.name }}</h3>
      </div>
      <div v-if="error" class="error">{{ error }}</div>
      <div v-else-if="loading" class="loading">جاري التحميل...</div>
      <PackageList v-else :packages="packages" @remove="askRemove" />
      <PackageForm :plan="plan" @added="fetchPackages" />
      <ConfirmModal
        :open="confirmOpen"
        icon="🗑️"
        title="تأكيد الحذف"
        message="هل تريد حذف الباقة المحددة؟ لا يمكن التراجع عن هذا الإجراء."
        confirm-label="حذف"
        cancel-label="إلغاء"
        variant="danger"
        @confirm="doRemove"
        @cancel="confirmOpen = false"
      />
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 1rem;
}
.panel {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  width: 720px;
  max-width: 100%;
  max-height: 90vh;
  overflow: auto;
  padding: 1.5rem;
  color: #e2e8f0;
}
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.title { margin: 0; font-size: 1.25rem; }
.btn-back { background: transparent; border: none; color: #94a3b8; font-size: 0.85rem; cursor: pointer; }
.btn-back:hover { color: #e2e8f0; }
.error { background: rgba(239, 68, 68, 0.15); color: #f87171; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
.loading { color: #94a3b8; text-align: center; padding: 1rem; }
</style>
