<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { sendToAnalysis } from '../../../composables/chemistry/sendToAnalysis';
import { buildTitrationPayload, hasTitrationData, clearTitrationReadings } from '../../../composables/chemistry/useTitrationRecorder';

const router = useRouter();
const canAnalyze = computed(() => hasTitrationData());

function onClick() {
  if (canAnalyze.value) {
    const payload = buildTitrationPayload('معايرة حمض-قاعدة');
    sendToAnalysis(router, payload);
  } else {
    router.push('/chemistry/analysis-calc');
  }
}
</script>

<template>
  <button
    class="analysis-btn"
    :class="{ disabled: !canAnalyze }"
    @click="onClick"
    title="تحليل وقياس"
  >
    📊 تحليل وقياس
  </button>
</template>

<style scoped>
.analysis-btn {
  position: fixed;
  bottom: 3.5rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(6,182,212,0.4);
  z-index: 9999;
  transition: all 0.15s;
}
.analysis-btn:hover {
  box-shadow: 0 6px 20px rgba(6,182,212,0.5);
}
.analysis-btn.disabled {
  background: linear-gradient(135deg, #64748b, #475569);
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
