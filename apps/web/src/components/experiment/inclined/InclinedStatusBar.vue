<script setup lang="ts">
const props = defineProps<{
  running: boolean
  paused: boolean
  arrived: boolean
}>()
</script>

<template>
  <div class="status-bar">
    <span v-if="running && !arrived">▶️ الجسم ينزلق...</span>
    <span v-else-if="arrived">✅ وصل للقاعدة! اضغط "تسجيل"</span>
    <span v-else>⏸️ جاهز — اضبط المعاملات واضغط "بدء"</span>
  </div>
</template>

<style scoped>
.status-bar { font-size: .72rem; color: #8B95A5; text-align: center; padding: .25rem; }
</style>
