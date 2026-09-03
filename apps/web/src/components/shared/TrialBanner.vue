<template>
  <div v-if="show" class="trial-banner">
    <span class="trial-icon">🧪</span>
    <span class="trial-text">
      حساب تجريبي —
      <span v-if="daysLeft > 0">باقي {{ daysLeft }} يوم</span>
      <span v-else-if="daysLeft === 0">ينتهي اليوم</span>
      <span v-else>منتهي</span>
    </span>
    <button v-if="role !== 'student'" class="trial-btn" @click="goToSubscribe">اشترك الآن</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  role: 'admin' | 'school' | 'teacher' | 'student'
  subscription: { status: string; expires_at?: string | null } | null | undefined
}>()

const show = computed(() => props.subscription?.status === 'TRIAL')

const daysLeft = computed(() => {
  const expires = props.subscription?.expires_at
  if (!expires) return 0
  const diff = new Date(expires).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
})

function goToSubscribe() {
  const route = props.role === 'school' ? '/school/billing' : '/teacher/billing'
  router.push(route)
}
</script>

<style scoped>
.trial-banner {
  background: linear-gradient(90deg, #f59e0b, #f97316);
  color: white;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 1000;
}
.trial-icon { font-size: 18px; }
.trial-text { display: flex; align-items: center; gap: 6px; }
.trial-btn {
  background: white;
  color: #ea580c;
  border: none;
  border-radius: 6px;
  padding: 4px 12px;
  font-weight: 700;
  cursor: pointer;
}
</style>
