<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Branch {
  id: string;
  name: string;
  color: string;
}

interface Equation {
  id: string;
  branchId: string;
  name: string;
}

const branches: Branch[] = [
  { id: 'algebra', name: 'الجبر', color: '#a78bfa' },
  { id: 'geometry', name: 'الهندسة', color: '#38bdf8' },
  { id: 'trigonometry', name: 'المثلثات', color: '#f472b6' },
  { id: 'calculus', name: 'التفاضل', color: '#22c55e' },
  { id: 'statistics', name: 'الإحصاء', color: '#fbbf24' },
];

const equations: Equation[] = [
  { id: 'linear-equation', branchId: 'algebra', name: 'المعادلة الخطية' },
  { id: 'quadratic-equation', branchId: 'algebra', name: 'المعادلة التربيعية' },
  { id: 'factor-quadratic', branchId: 'algebra', name: 'تحليل التربيعي' },
  { id: 'pythagorean-theorem', branchId: 'geometry', name: 'نظرية فيثاغورس' },
  { id: 'area-circle', branchId: 'geometry', name: 'مساحة الدائرة' },
  { id: 'sine-rule', branchId: 'trigonometry', name: 'قانون الجيب' },
  { id: 'cosine-rule', branchId: 'trigonometry', name: 'قانون جيب التمام' },
  { id: 'derivative-power-rule', branchId: 'calculus', name: 'قاعدة القوة' },
  { id: 'derivative-polynomial', branchId: 'calculus', name: 'مشتقة كثيرة الحدود' },
  { id: 'mean-median-mode', branchId: 'statistics', name: 'المتوسط والوسيط والمنوال' },
  { id: 'standard-deviation', branchId: 'statistics', name: 'الانحراف المعياري' },
];

const selectedBranchId = ref<string>('');
const selectedEquationId = ref<string>('');

const branchOptions = computed(() => [
  { id: '', name: 'اختر فرعاً' },
  ...branches,
]);

const filteredEquations = computed(() => {
  if (!selectedBranchId.value) return [];
  return equations.filter((eq) => eq.branchId === selectedBranchId.value);
});

const equationOptions = computed(() => [
  { id: '', name: 'اختر معادلة' },
  ...filteredEquations.value,
]);

watch(selectedBranchId, () => {
  selectedEquationId.value = '';
});

const selectedBranch = computed(() =>
  branches.find((b) => b.id === selectedBranchId.value)
);
</script>

<template>
  <div class="math-page">
    <header class="selector-bar">
      <div class="selector-group">
        <label class="selector-label" for="branch-select">الفرع</label>
        <select
          id="branch-select"
          v-model="selectedBranchId"
          class="selector"
          :style="selectedBranch ? { borderColor: selectedBranch.color } : undefined"
        >
          <option
            v-for="branch in branchOptions"
            :key="branch.id"
            :value="branch.id"
          >
            {{ branch.name }}
          </option>
        </select>
      </div>

      <div class="selector-group">
        <label class="selector-label" for="equation-select">المعادلة</label>
        <select
          id="equation-select"
          v-model="selectedEquationId"
          class="selector"
          :disabled="!selectedBranchId"
        >
          <option
            v-for="equation in equationOptions"
            :key="equation.id"
            :value="equation.id"
          >
            {{ equation.name }}
          </option>
        </select>
      </div>
    </header>

    <main class="content-area">
      <p v-if="!selectedBranchId" class="placeholder">
        اختر فرعاً ومعادلة لبدء العمل
      </p>
      <p v-else-if="!selectedEquationId" class="placeholder">
        اختر معادلة من القائمة
      </p>
    </main>
  </div>
</template>

<style scoped>
.math-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 20%, rgba(167, 139, 250, 0.08) 0%, transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 30%),
    linear-gradient(135deg, #080c15 0%, #0f172a 50%, #0b1220 100%);
  color: #e2e8f0;
  padding: 1rem;
}

.selector-bar {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  max-width: 1200px;
  margin: 0 auto 1rem;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 180px;
  flex: 1;
}

.selector-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
}

.selector {
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.6);
  color: #e2e8f0;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.selector:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.selector:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.selector option {
  background: #0f172a;
  color: #e2e8f0;
}

.content-area {
  max-width: 1200px;
  margin: 0 auto;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  color: #94a3b8;
  font-size: 0.95rem;
  text-align: center;
}

@media (max-width: 640px) {
  .selector-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
