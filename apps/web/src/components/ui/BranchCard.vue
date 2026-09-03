<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
interface Props {
  id: string;
  icon: string;
  title: string;
  desc: string;
  stats: string;
  action?: () => void;
}

defineProps<Props>();
</script>

<template>
  <div :class="['card', id]" @click="action">
    <div class="card-glow"></div>
    <div class="card-icon">{{ icon }}</div>
    <h3 class="card-title">{{ title }}</h3>
    <p v-if="desc" class="card-desc">{{ desc }}</p>
    <div v-if="stats" class="card-stats">
      <span>📊</span>
      <span>{{ stats }}</span>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 100%;
  max-width: 280px;
  min-height: 160px;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 6px;
  padding: 1.5rem 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: start;
  transition: border-color 0.15s;
  cursor: pointer;
  position: relative;
  color: inherit;
}

.card:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.physics:hover { border-color: rgba(59,130,246,0.3); }
.mathematics:hover { border-color: rgba(236,72,153,0.3); }
.general:hover { border-color: rgba(249,115,22,0.3); }
.chemistry:hover { border-color: rgba(16,185,129,0.3); }

.card-glow { display: none; }

.card-icon {
  font-size: 1.8rem;
  line-height: 1;
  margin-bottom: 0.8rem;
}

.card-title { font-size: 1rem; font-weight: 700; margin: 0; color: #f1f5f9; }
.card-desc { font-size: 0.8rem; color: #64748b; margin-top: 0.4rem; line-height: 1.4; }
.card-stats {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.6rem;
  color: #475569;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .card { max-width: 100%; min-height: 140px; }
  .card-icon { font-size: 1.4rem; }
}
</style>