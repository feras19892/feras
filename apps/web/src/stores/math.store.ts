import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as mathService from '../services/math.service';
import type {
  MathBranch,
  MathEquation,
  MathGraphData,
  MathPracticeProblem,
  MathSolutionResult,
  GraphPayload,
  PracticePayload,
  SolvePayload,
} from '../types/math.types';

export const useMathStore = defineStore('math', () => {
  const branches = ref<MathBranch[]>([]);
  const equations = ref<MathEquation[]>([]);
  const currentEquation = ref<MathEquation | null>(null);
  const solution = ref<MathSolutionResult | null>(null);
  const graphData = ref<MathGraphData | null>(null);
  const practice = ref<MathPracticeProblem | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const hasError = computed(() => error.value !== null);

  async function loadBranches() {
    loading.value = true;
    error.value = null;
    try {
      branches.value = await mathService.fetchBranches();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load branches';
    } finally {
      loading.value = false;
    }
  }

  async function loadEquations(branchSlug: string) {
    loading.value = true;
    error.value = null;
    try {
      equations.value = await mathService.fetchEquations(branchSlug);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load equations';
    } finally {
      loading.value = false;
    }
  }

  async function loadEquation(id: string) {
    loading.value = true;
    error.value = null;
    try {
      currentEquation.value = await mathService.fetchEquation(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load equation';
    } finally {
      loading.value = false;
    }
  }

  async function solve(payload: SolvePayload) {
    loading.value = true;
    error.value = null;
    try {
      solution.value = await mathService.solveProblem(payload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to solve';
    } finally {
      loading.value = false;
    }
  }

  async function loadGraph(payload: GraphPayload) {
    loading.value = true;
    error.value = null;
    try {
      graphData.value = await mathService.fetchGraphData(payload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load graph';
    } finally {
      loading.value = false;
    }
  }

  async function loadPractice(payload: PracticePayload) {
    loading.value = true;
    error.value = null;
    try {
      practice.value = await mathService.fetchPracticeProblem(payload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load practice';
    } finally {
      loading.value = false;
    }
  }

  function clearSolution() {
    solution.value = null;
  }

  function clearGraph() {
    graphData.value = null;
  }

  return {
    branches,
    equations,
    currentEquation,
    solution,
    graphData,
    practice,
    loading,
    error,
    hasError,
    loadBranches,
    loadEquations,
    loadEquation,
    solve,
    loadGraph,
    loadPractice,
    clearSolution,
    clearGraph,
  };
});
