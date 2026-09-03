<template>
  <DashboardLayout :config="adminDashboardConfig" role="admin" />
</template>

<script setup lang="ts">
import { adminDashboardConfig } from '@/config/dashboard/admin.config'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
</script>
