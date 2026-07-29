<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { detectPlagiarism, getPlagiarismFlags, updatePlagiarismStatus, type PlagiarismFlag, type PlagiarismResult } from '../../services/plagiarism.service';

const props = defineProps<{ classId: string }>();

const experimentName = ref('');
const detecting = ref(false);
const results = ref<PlagiarismResult[]>([]);
const flags = ref<PlagiarismFlag[]>([]);
const loading = ref(false);

async function runDetection() {
  if (!experimentName.value.trim()) return;
  detecting.value = true;
  results.value = [];
  try {
    const res = await detectPlagiarism(props.classId, experimentName.value);
    if (res.success) results.value = res.results;
  } catch {
    // ignore
  }
  detecting.value = false;
  await loadFlags();
}

async function loadFlags() {
  loading.value = true;
  try {
    const res = await getPlagiarismFlags(props.classId);
    if (res.success) flags.value = res.flags;
  } catch {
    // ignore
  }
  loading.value = false;
}

async function updateStatus(id: number, status: string) {
  await updatePlagiarismStatus(id, status);
  await loadFlags();
}

function severityClass(score: number): string {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  return 'medium';
}

onMounted(loadFlags);
</script>

<template>
  <div class="plagiarism-checker">
    <h3>🔍 كشف الاحتيال والتشابه</h3>

    <div class="detect-form">
      <input v-model="experimentName" placeholder="اسم التجربة" class="input" />
      <button @click="runDetection" :disabled="detecting || !experimentName.trim()" class="btn">
        {{ detecting ? 'جاري الفحص...' : 'فحص التشابه' }}
      </button>
    </div>

    <div v-if="results.length > 0" class="results">
      <h4>النتائج المكتشفة ({{ results.length }})</h4>
      <div v-for="(r, i) in results" :key="i" :class="['result-item', severityClass(r.similarity_score)]">
        <div class="students">{{ r.student1_name }} ↔ {{ r.student2_name }}</div>
        <div class="score">التشابه: {{ r.similarity_score }}%</div>
        <div class="fields">{{ r.matched_fields.join(' | ') }}</div>
      </div>
    </div>

    <div v-if="flags.length > 0" class="flags">
      <h4>سجل الحالات ({{ flags.length }})</h4>
      <div v-for="f in flags" :key="f.id" :class="['flag-item', severityClass(f.similarity_score)]">
        <div class="flag-header">
          <span class="students">{{ f.student1_name }} ↔ {{ f.student2_name }}</span>
          <span class="score">{{ f.similarity_score }}%</span>
        </div>
        <div class="flag-exp">{{ f.experiment_name }}</div>
        <div class="flag-fields">{{ f.matched_fields }}</div>
        <div class="flag-actions">
          <select :value="f.status" @change="updateStatus(f.id, ($event.target as HTMLSelectElement).value)" class="status-select">
            <option value="pending">قيد المراجعة</option>
            <option value="reviewed">تمت المراجعة</option>
            <option value="confirmed">مؤكد</option>
            <option value="dismissed">مرفوض</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plagiarism-checker { padding: 0.5rem; }
.plagiarism-checker h3 { color: #e2e8f0; margin-bottom: 0.75rem; font-size: 1rem; }
.detect-form { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
.input {
  flex: 1; background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.35rem; padding: 0.5rem; color: #e2e8f0; font-size: 0.8rem;
}
.input:focus { outline: none; border-color: rgba(99,102,241,0.5); }
.btn {
  background: #6366f1; color: #fff; border: none; border-radius: 0.35rem;
  padding: 0.5rem 1rem; cursor: pointer; font-size: 0.8rem;
}
.btn:hover:not(:disabled) { background: #4f46e5; }
.btn:disabled { opacity: 0.5; }
.results, .flags { margin-top: 1rem; }
.results h4, .flags h4 { color: #94a3b8; font-size: 0.85rem; margin-bottom: 0.5rem; }
.result-item, .flag-item {
  padding: 0.6rem; border-radius: 0.4rem; margin-bottom: 0.4rem;
  border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02);
}
.result-item.critical, .flag-item.critical { border-color: rgba(239,68,68,0.4); background: rgba(239,68,68,0.05); }
.result-item.high, .flag-item.high { border-color: rgba(251,146,60,0.3); background: rgba(251,146,60,0.05); }
.students { color: #e2e8f0; font-size: 0.8rem; font-weight: 600; }
.score { color: #f59e0b; font-size: 0.75rem; font-weight: 700; }
.fields, .flag-fields { color: #94a3b8; font-size: 0.7rem; margin-top: 0.2rem; }
.flag-header { display: flex; justify-content: space-between; align-items: center; }
.flag-exp { color: #64748b; font-size: 0.7rem; }
.flag-actions { margin-top: 0.3rem; }
.status-select {
  background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 0.25rem; padding: 0.25rem 0.4rem; color: #e2e8f0; font-size: 0.7rem;
}
</style>
