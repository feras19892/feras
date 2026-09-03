<template>
  <div class="stat-card" :class="{ clickable: clickable }" @click="clickable && $emit('click')">
    <div class="stat-icon">{{ icon }}</div>
    <div class="stat-body">
      <h3>{{ value }}</h3>
      <p>{{ label }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  value: string | number
  label: string
  clickable?: boolean
}>(), { clickable: false })

defineEmits<{ click: [] }>()
</script>

<style scoped>
.stat-card {
  background: white; padding: 20px; border-radius: 12px;
  border: 1px solid #e5e7eb; display: flex; align-items: center; gap: 16px;
}
.stat-card.clickable { cursor: pointer; transition: border-color 0.2s; }
.stat-card.clickable:hover { border-color: #3b82f6; }
.stat-icon { font-size: 32px; }
.stat-body h3 { font-size: 28px; margin: 0; color: #1a2332; }
.stat-body p { margin: 4px 0 0; color: #6b7280; }
</style>
