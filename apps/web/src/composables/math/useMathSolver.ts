import { ref } from 'vue';
import { solveProblem } from '../../services/math.service';
import type { MathSolutionResult, SolvePayload } from '../../types/math.types';

export function useMathSolver() {
  const solution = ref<MathSolutionResult | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function solve(payload: SolvePayload) {
    loading.value = true;
    error.value = null;
    try {
      solution.value = await solveProblem(payload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to solve';
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    solution.value = null;
    error.value = null;
  }

  return {
    solution,
    loading,
    error,
    solve,
    clear,
  };
}
