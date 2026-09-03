<template>
  <DashboardLayout :config="schoolDashboardConfig" role="school" />
</template>

<script setup lang="ts">
import { schoolDashboardConfig } from '@/config/dashboard/school.config'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
</script>
