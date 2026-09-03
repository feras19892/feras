<template>
  <div class="stats-section">
    <h3>إحصائيات أسئلة التجارب</h3>
    <SkeletonLoader v-if="loading" type="cards" :count="4" />
    <ErrorState v-else-if="error" :error="error" show-retry @retry="load" />
    <div v-else-if="stats" class="stats-grid">
      <div class="stat-card"><span class="label">النماذج</span><span class="value">{{ stats.total_templates }}</span></div>
      <div class="stat-card"><span class="label">منشور</span><span class="value">{{ stats.published_templates }}</span></div>
      <div class="stat-card"><span class="label">مسودة</span><span class="value">{{ stats.draft_templates }}</span></div>
      <div class="stat-card"><span class="label">الأسئلة</span><span class="value">{{ stats.total_questions }}</span></div>
      <div class="stat-card"><span class="label">التعيينات</span><span class="value">{{ stats.total_assignments }}</span></div>
      <div class="stat-card"><span class="label">التقارير</span><span class="value">{{ stats.total_reports }}</span></div>
      <div class="stat-card"><span class="label">الإجابات</span><span class="value">{{ stats.total_answers }}</span></div>
      <div class="stat-card"><span class="label">المجموع</span><span class="value">{{ stats.total_score }} / {{ stats.total_max_score }}</span></div>
      <div class="stat-card"><span class="label">المتوسط</span><span class="value">{{ stats.average_percentage }}%</span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { direction } = useI18n();
import { ref, onMounted } from 'vue'
import * as api from '@/services/experiment-questions.service'
import type { ExpQuestionsStats } from '@/services/experiment-questions.service'
import ErrorState from '@/components/shared/ErrorState.vue'
import SkeletonLoader from '@/components/shared/SkeletonLoader.vue'


const stats = ref<ExpQuestionsStats | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await api.getStats()
    if (res.success && res.stats) stats.value = res.stats
    else error.value = res.message || 'فشل تحميل الإحصائيات'
  } catch (e: any) { error.value = e.message || 'فشل تحميل الإحصائيات' }
  finally { loading.value = false }
}

onMounted(load)
</script>

<style scoped>
.stats-section { margin-bottom: 24px; }
.stats-section h3 { margin-bottom: 12px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.stat-card {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
}
.stat-card .label { font-size: 13px; color: #64748b; margin-bottom: 6px; }
.stat-card .value { font-size: 20px; font-weight: 700; color: #0f172a; }
</style>
