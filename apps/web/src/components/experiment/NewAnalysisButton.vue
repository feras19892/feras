<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { useRouter } from 'vue-router';

const router = useRouter();

function go() {
  router.push('/analysis-v2');
}
</script>

<template>
  <button class="new-analysis-btn" @click="go">
    {{ t('analysis.newDesign') }}
  </button>
</template>

<style scoped>
.new-analysis-btn {
  background: rgba(34, 211, 238, 0.12);
  border: 1px solid rgba(34, 211, 238, 0.35);
  color: #22d3ee;
  border-radius: 0.35rem;
  padding: 0.35rem 0.8rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}
.new-analysis-btn:hover {
  background: rgba(34, 211, 238, 0.2);
}
</style>
