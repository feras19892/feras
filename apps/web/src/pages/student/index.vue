<template>
  <DashboardLayout :config="studentDashboardConfig" role="student" />
</template>

<script setup lang="ts">
import { studentDashboardConfig } from '@/config/dashboard/student.config'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
</script>
