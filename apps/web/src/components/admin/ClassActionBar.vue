<template>
  <section class="class-toolbar">
    <button v-if="showView" class="toolbar-btn" @click="emit('view')">👁️ عرض</button>
    <button v-if="showReports" class="toolbar-btn" @click="emit('reports')">📝 التقارير</button>
    <button v-if="showFreeze" class="toolbar-btn toolbar-warn" @click="emit('freeze')">{{ frozen ? '🔓 إلغاء التجميد' : '🔒 تجميد' }}</button>
    <button v-if="showEdit" class="toolbar-btn" @click="emit('edit')">✏️ تعديل</button>
    <button v-if="showDelete" class="toolbar-btn toolbar-danger" @click="emit('delete')">🗑️ حذف</button>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  showView?: boolean
  showReports?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showFreeze?: boolean
  frozen?: boolean
}>(), {
  showView: true,
  showReports: true,
  showEdit: true,
  showDelete: true,
  showFreeze: false,
  frozen: false,
})
const emit = defineEmits(['view', 'reports', 'edit', 'delete', 'freeze'])
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';
</style>
