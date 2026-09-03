<template>
  <div class="action-bar">
    <div class="action-group">
      <button class="btn-sm btn-info" @click="emit('reports')">📊 التقارير</button>
      <button class="btn-sm btn-info" @click="emit('classes')">📚 الفصول</button>
      <button v-if="schoolId" class="btn-sm btn-info" @click="emit('school')">🏫 المدرسة</button>
    </div>
    <div class="action-divider"></div>
    <div class="action-group">
      <button class="btn-sm btn-primary" @click="emit('edit')">✏️ تعديل</button>
      <button class="btn-sm btn-primary" @click="emit('message')">✉️ رسالة</button>
      <button class="btn-sm btn-warn" @click="emit('warn')">⚠️ تحذير</button>
    </div>
    <div class="action-divider"></div>
    <div class="action-group">
      <button class="btn-sm btn-success" @click="emit('reset')">🔑 كلمة السر</button>
      <button v-if="!blocked" class="btn-sm btn-danger" @click="emit('ban')">🚫 حظر</button>
      <button v-else class="btn-sm btn-success" @click="emit('unban')">✅ إلغاء حظر</button>
      <button v-if="role !== 'admin'" class="btn-sm" @click="emit('impersonate')">👤 انتحال</button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ role: string; blocked: boolean; schoolId?: number | null }>()
const emit = defineEmits<{
  reports: []; classes: []; school: []
  edit: []; message: []; warn: []
  reset: []; ban: []; unban: []; impersonate: []
}>()
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
.action-bar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 16px 0; }
.action-group { display: flex; flex-wrap: wrap; gap: 6px; }
.action-divider { width: 1px; height: 24px; background: var(--border-color); }
</style>
