<template>
  <section class="stat-cards-grid">
    <div v-for="c in cards" :key="c.label" class="stat-card-modern" :class="{ clickable: c.click }" @click="c.click && emit(c.click as any)">
      <div class="stat-card-modern__icon" :style="{ background: c.color + '22', color: c.color }">{{ c.icon }}</div>
      <div class="stat-card-modern__body">
        <div class="stat-card-modern__value" :style="{ color: c.color }">{{ c.value }}</div>
        <div class="stat-card-modern__label">{{ c.label }}</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminUserFull } from '@/services/admin.service'

const props = defineProps<{ profile: AdminUserFull }>()
const emit = defineEmits(['classes', 'reports'])

const totalReports = computed(() => props.profile.reports?.length ?? 0)
const pendingReports = computed(() => props.profile.reports?.filter(r => r.status === 'submitted' || r.status === 'resubmitted').length ?? 0)
const gradedReports = computed(() => props.profile.reports?.filter(r => r.status === 'graded').length ?? 0)
const avg = computed(() => {
  const graded = props.profile.reports?.filter(r => r.grade != null) ?? []
  if (!graded.length) return '—'
  return Math.round(graded.reduce((a, b) => a + (b.grade || 0), 0) / graded.length)
})

const cards = computed(() => [
  { icon: '📚', label: 'الفصول', value: props.profile.classes?.length ?? 0, color: '#3b82f6', click: 'classes' },
  { icon: '📝', label: 'التقارير', value: totalReports.value, color: '#22c55e', click: 'reports' },
  { icon: '⏳', label: 'معلّق', value: pendingReports.value, color: '#f59e0b', click: 'reports' },
  { icon: '✅', label: 'مصحّح', value: gradedReports.value, color: '#22c55e', click: 'reports' },
  { icon: '📈', label: 'متوسط', value: avg.value, color: '#6366f1', click: 'reports' },
  { icon: '⚠️', label: 'التحذيرات', value: props.profile.warnings?.length ?? 0, color: '#ef4444' },
  { icon: '🌐', label: 'جلسات', value: props.profile.sessions?.length ?? 0, color: '#0891b2' },
  { icon: '🕒', label: 'آخر دخول', value: props.profile.lastLogin ? new Date(props.profile.lastLogin).toLocaleDateString() : '—', color: '#6b7280' }
])
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.stat-card-modern.clickable { cursor: pointer; }
</style>
