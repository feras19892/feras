<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  sourceName: string;
}>();

const emit = defineEmits<{
  (e: 'clear'): void;
  (e: 'back'): void;
}>();

const title = computed(() => {
  return props.sourceName ? `تحليل: ${props.sourceName}` : 'التحليل والحساب';
});
</script>

<template>
  <nav class="analysis-menubar">
    <div class="left">
      <button class="btn-back" @click="emit('back')">← رجوع</button>
      <span class="title">📊 {{ title }}</span>
    </div>
    <div class="right">
      <button class="btn-clear" @click="emit('clear')">🗑️ مسح البيانات</button>
    </div>
  </nav>
</template>

<style scoped>
.analysis-menubar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 1rem;
  background: #161B22;
  border-bottom: 1px solid #2D3645;
  flex-shrink: 0;
}
.left, .right { display: flex; align-items: center; gap: 0.75rem; }
.title { font-weight: 700; color: #D1D7E0; font-size: 1rem; }
.btn-back {
  background: none;
  border: none;
  color: #67e8f9;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 0;
}
.btn-clear {
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  color: #f87171;
  border-radius: 0.4rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-clear:hover { background: rgba(239,68,68,0.2); }
</style>
