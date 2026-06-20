<script setup lang="ts">
const props = defineProps<{ active: number }>();
const emit = defineEmits<(e: 'change', idx: number) => void>();
const tabs = ['📋 البيانات', '📈 التحليل', '📄 التقرير'];
</script>

<template>
  <div class="tabs-bar">
    <button
      v-for="(t, i) in tabs"
      :key="i"
      class="tab-btn"
      :class="{ active: i === props.active }"
      @click="emit('change', i)"
    >
      {{ t }}
    </button>
  </div>
</template>

<style scoped>
.tabs-bar {
  display: flex;
  gap: 0.25rem;
  padding: 0.35rem 0.5rem;
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.tab-btn {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.4rem 0.6rem;
  border-radius: 0.35rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all .15s;
  font-weight: 600;
}
.tab-btn.active {
  background: rgba(6,182,212,0.15);
  color: #67e8f9;
}
.tab-btn:hover:not(.active) { color: #e2e8f0; }
</style>
