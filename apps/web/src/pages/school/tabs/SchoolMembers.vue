<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTenantMembers, type TenantMember } from '@/services/core/school.api'
import SchoolMembersControl from '@/components/school/SchoolMembersControl.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'
import ErrorState from '@/components/shared/ErrorState.vue'

const router = useRouter()
const members = ref<TenantMember[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await getTenantMembers()
    if (res.success) {
      members.value = res.members.map((m: any) => ({ ...m, role: m.role || 'student' }))
    } else {
      error.value = 'فشل تحميل الأعضاء'
    }
  } catch (e: any) {
    error.value = e.message || 'فشل تحميل الأعضاء'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="page-wrap">
    <div class="page-header">
      <h2>🛡️ التحكم بالأعضاء</h2>
      <button class="btn-back" @click="router.back()">← رجوع للفوترة</button>
    </div>
    <SkeletonLoader v-if="loading" type="cards" :count="1" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <SchoolMembersControl v-else :members="members" standalone @reload="load" />
  </div>
</template>

<style scoped>
.page-wrap { min-height: 100vh; background: #050914; padding: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; max-width: 1200px; margin-inline: auto; }
.page-header h2 { margin: 0; color: #f1f5f9; font-size: 1.4rem; }
.btn-back { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #e2e8f0; border-radius: 10px; padding: 0.5rem 1rem; cursor: pointer; font-weight: 700; }
</style>
