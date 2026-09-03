<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
interface RankItem {
  id: number | string;
  name: string;
  meta: string;
}

interface Props {
  title: string;
  items: RankItem[];
}
defineProps<Props>();
</script>

<template>
  <div class="card">
    <div class="card-head">{{ title }}</div>
    <div class="rank-list">
      <div v-for="(item, i) in items" :key="item.id" class="rank-item">
        <div class="rank-num">{{ i + 1 }}</div>
        <div class="rank-info">
          <div class="rank-name">{{ item.name }}</div>
          <div class="rank-meta">{{ item.meta }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { background: rgba(15,23,42,0.4); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.6rem; padding: 1rem; }
.card-head { font-size: 0.9rem; font-weight: 700; color: #e2e8f0; margin-bottom: 0.8rem; padding-bottom: 0.6rem; border-bottom: 1px solid rgba(255,255,255,0.08); }
.rank-list { display: flex; flex-direction: column; gap: 0.6rem; }
.rank-item { display: flex; align-items: center; gap: 0.8rem; padding: 0.6rem; background: rgba(255,255,255,0.02); border-radius: 0.4rem; transition: all 0.2s; }
.rank-item:hover { background: rgba(255,255,255,0.04); }
.rank-num { width: 28px; height: 28px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; color: #fff; flex-shrink: 0; }
.rank-info { flex: 1; min-width: 0; }
.rank-name { font-size: 0.85rem; font-weight: 600; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rank-meta { font-size: 0.7rem; color: #94a3b8; margin-top: 0.1rem; }
</style>