import { ref } from 'vue';
import { fetchPracticeProblem } from '../../services/math.service';
import type { MathPracticeProblem, PracticePayload } from '../../types/math.types';

export function useMathPractice() {
  const problem = ref<MathPracticeProblem | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load(payload: PracticePayload) {
    loading.value = true;
    error.value = null;
    try {
      problem.value = await fetchPracticeProblem(payload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load practice';
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    problem.value = null;
    error.value = null;
  }

  return {
    problem,
    loading,
    error,
    load,
    clear,
  };
}
