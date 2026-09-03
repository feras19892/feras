<template>
  <div class="p-6">
    <h2 class="mb-4 text-2xl font-bold">التواصل</h2>
    <TeacherAnnouncementsTab :class-rows="classRows" />
  </div>
</template>

<script setup lang="ts">
import { useTeacherDashboard } from '@/composables/teacher/useTeacherDashboard'
import TeacherAnnouncementsTab from '@/components/teacher/TeacherAnnouncementsTab.vue'

const { classRows } = useTeacherDashboard()
</script>
