<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
interface Props {

  total: number
  average: number
  pending: number
  graded: number
}
defineProps<Props>()
</script>

<template>
  <div class="summary-cards">
    <div class="sum-card">
      <span class="sum-val">{{ total }}</span>
      <span class="sum-label">{{ t('teacher.totalReports') }}</span>
    </div>
    <div class="sum-card">
      <span class="sum-val">{{ average }}%</span>
      <span class="sum-label">{{ t('teacher.avgGrades') }}</span>
    </div>
    <div class="sum-card">
      <span class="sum-val">{{ pending }}</span>
      <span class="sum-label">{{ t('teacher.pendingGrading') }}</span>
    </div>
    <div class="sum-card">
      <span class="sum-val">{{ graded }}</span>
      <span class="sum-label">{{ t('teacher.graded') }}</span>
    </div>
  </div>
</template>

<style scoped>
.summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.sum-card { background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.75rem; padding: 1rem; text-align: center; }
.sum-val { display: block; font-size: 1.8rem; font-weight: 800; color: #67e8f9; }
.sum-label { font-size: 0.8rem; color: #94a3b8; margin-top: 0.3rem; display: block; }
</style>