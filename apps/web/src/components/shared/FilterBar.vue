<template>
  <div class="filter-bar">
    <div v-for="filter in filters" :key="filter.key" class="filter-group">
      <label>{{ filter.label }}</label>
      <select v-if="(filter.type || 'select') === 'select'" v-model="selected[filter.key]" @change="emitChange" class="filter-select">
        <option value="">{{ t('dashboard.dashNew.all') }}</option>
        <option v-for="opt in (filter.options || [])" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input v-else-if="filter.type === 'date'" v-model="selected[filter.key]" @change="emitChange" type="date" class="filter-select" />
      <input v-else-if="filter.type === 'number'" v-model="selected[filter.key]" @input="debouncedEmit" type="number" min="0" max="100" class="filter-select" />
    </div>
    <input v-if="search" v-model="searchQuery" @input="debouncedEmit" class="search-input" :placeholder="t('dashboard.dashNew.searchPlaceholder')" />
    <button v-if="hasSelection" @click="reset" class="reset-btn">{{ t('dashboard.dashNew.clear') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t, direction } = useI18n();
import { ref, reactive, computed } from 'vue'

export interface FilterOption { value: string; label: string }
export interface FilterConfig { key: string; label: string; options?: FilterOption[]; type?: 'select' | 'date' | 'number' }

const props = defineProps<{
  filters: FilterConfig[]
  search?: boolean
}>()

const emit = defineEmits<{ change: [values: Record<string, string>, search: string] }>()

const selected = reactive<Record<string, string>>({})
const searchQuery = ref('')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const hasSelection = computed(() =>
  Object.values(selected).some(v => v) || searchQuery.value
)

function emitChange() {
  emit('change', { ...selected }, searchQuery.value)
}

function debouncedEmit() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(emitChange, 300)
}

function reset() {
  Object.keys(selected).forEach(k => selected[k] = '')
  searchQuery.value = ''
  emitChange()
}
</script>

<style scoped>
.filter-bar {
  display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;
  margin-bottom: 16px;
}
.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-group label { font-size: 12px; color: #6b7280; font-weight: 500; }
.filter-select {
  padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; background: white; cursor: pointer;
}
.search-input {
  padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 14px; flex: 1; min-width: 200px;
}
.reset-btn {
  padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 8px;
  background: white; cursor: pointer; color: #6b7280; font-size: 14px;
}
.reset-btn:hover { background: #f3f4f6; }
</style>
