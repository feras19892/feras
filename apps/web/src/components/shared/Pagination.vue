<template>
  <div v-if="totalPages > 1" class="pagination">
    <button :disabled="page <= 1" @click="$emit('change', page - 1)" class="page-btn">‹</button>
    <span v-for="p in visiblePages" :key="p" 
      :class="['page-num', { active: p === page }]"
      @click="$emit('change', p)">
      {{ p }}
    </span>
    <button :disabled="page >= totalPages" @click="$emit('change', page + 1)" class="page-btn">›</button>
    <span class="page-info">{{ page }} / {{ totalPages }} ({{ total }})</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  limit: number
  total: number
}>()

defineEmits<{ change: [page: number] }>()

const totalPages = computed(() => Math.ceil(props.total / props.limit) || 1)

const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, props.page - 2)
  const end = Math.min(totalPages.value, props.page + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex; align-items: center; gap: 8px; justify-content: center;
  padding: 16px 0; flex-wrap: wrap;
}
.page-btn {
  width: 32px; height: 32px; border: 1px solid #e5e7eb; border-radius: 6px;
  background: white; cursor: pointer; font-size: 16px; color: #374151;
}
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-num {
  width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
  border-radius: 6px; cursor: pointer; font-size: 14px; color: #374151;
}
.page-num:hover { background: #f3f4f6; }
.page-num.active { background: #3b82f6; color: white; font-weight: 600; }
.page-info { color: #6b7280; font-size: 13px; margin-right: 8px; }
</style>
