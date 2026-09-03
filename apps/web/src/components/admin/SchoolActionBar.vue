<template>
  <section class="class-toolbar">
    <button v-if="showView" class="toolbar-btn" @click="emit('view')">👁️ عرض</button>
    <button v-if="showUsers" class="toolbar-btn" @click="emit('users')">👥 المستخدمون</button>
    <button v-if="showClasses" class="toolbar-btn" @click="emit('classes')">📚 الفصول</button>
    <button v-if="showReports" class="toolbar-btn" @click="emit('reports')">📝 التقارير</button>
    <button v-if="showEdit" class="toolbar-btn" @click="emit('edit')">✏️ تعديل</button>
    <button v-if="showToggle" :class="['toolbar-btn', active ? '' : 'btn-success']" @click="emit('toggle')">{{ active ? '🚫 تعطيل' : '✅ تفعيل' }}</button>
    <button v-if="showDelete" class="toolbar-btn toolbar-danger" @click="emit('delete')">🗑️ حذف</button>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  active: boolean
  showView?: boolean
  showUsers?: boolean
  showClasses?: boolean
  showReports?: boolean
  showEdit?: boolean
  showToggle?: boolean
  showDelete?: boolean
}>(), {
  showView: true,
  showUsers: true,
  showClasses: true,
  showReports: true,
  showEdit: true,
  showToggle: true,
  showDelete: true,
})
const emit = defineEmits(['view', 'users', 'classes', 'reports', 'edit', 'toggle', 'delete'])
</script>

<style scoped>
@import '@/assets/styles/dashboard-shared.css';
@import '@/assets/styles/my-classes.css';
</style>
