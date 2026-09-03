<template>
  <DashboardLayout :config="config" role="teacher" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { teacherDashboardConfig } from '@/config/dashboard/teacher.config'
import { useAuthStore } from '@/modules/auth/stores/auth'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const auth = useAuthStore()

const config = computed(() => {
  const joined = auth.user?.school_id != null
  return {
    ...teacherDashboardConfig,
    tabs: teacherDashboardConfig.tabs.filter(t => t.id !== 'subscriptions' || !joined),
    layout: {
      ...teacherDashboardConfig.layout,
      sidebar: {
        ...teacherDashboardConfig.layout.sidebar,
        items: teacherDashboardConfig.layout.sidebar.items.filter(i => i.tabId !== 'subscriptions' || !joined)
      }
    }
  }
})
</script>
