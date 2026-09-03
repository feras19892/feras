<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useToast } from '@/composables/useToast'
import { approveRequest, rejectRequest } from '@/services/core/admin.api'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import EmptyState from '@/components/shared/EmptyState.vue'

const store = useAdminStore()
const toast = useToast()
const loading = ref(false)

async function approve(id: number) {
  try {
    const res = await approveRequest(id)
    if (res.success) toast.success('تمت الموافقة')
    await reload()
  } catch (e: any) { toast.error(e?.message || 'فشلت الموافقة') }
}

async function reject(id: number) {
  const reason = window.prompt('سبب الرفض')
  if (reason === null) return
  try {
    const res = await rejectRequest(id, reason)
    if (res.success) toast.success('تم الرفض')
    await reload()
  } catch (e: any) { toast.error(e?.message || 'فشل الرفض') }
}

async function reload() {
  loading.value = true
  await store.fetchRequests()
  loading.value = false
}

onMounted(reload)
</script>

<template>
  <div class="dash-page">
    <h2>الطلبات والموافقات</h2>
    <SkeletonLoader v-if="loading" type="table" :count="5" />
    <div v-else-if="store.requests.length" class="compact-list">
      <div v-for="r in store.requests" :key="r.id" class="compact-row">
        <span class="cr-icon">📋</span>
        <span class="cr-name">{{ r.user_name }}</span>
        <span class="cr-meta">
          <span>{{ r.user_email }}</span>
          <span class="role-pill">{{ r.user_role }}</span>
          <span class="status-badge">{{ r.type }}</span>
          <span :class="['status-badge', r.status]">{{ r.status }}</span>
        </span>
        <span class="cr-actions" @click.stop>
          <button v-if="r.status === 'pending'" class="btn-icon" title="موافقة" @click="approve(r.id)">✅</button>
          <button v-if="r.status === 'pending'" class="btn-icon delete" title="رفض" @click="reject(r.id)">❌</button>
        </span>
      </div>
    </div>
    <EmptyState v-else icon="📋" title="لا توجد طلبات" />
  </div>
</template>
