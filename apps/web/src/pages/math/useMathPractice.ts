import { ref, computed, type Ref } from 'vue';
import type { Equation, ApplicationProblem } from './math-types';
import { normalizeNumerals } from './math-utils';

const MAX_ATTEMPTS = 3;

export function useMathPractice(
  selectedEquation: Ref<Equation | undefined>,
  solverValues: Ref<Record<string, string>>,
  solverResult: Ref<{ result: string; steps: string[] } | null>
) {
  const practiceMode = ref(false);
  const practiceValues = ref<Record<string, string>>({});
  const practiceReveal = ref(false);
  const revealedProblems = ref<Record<number, { hint: boolean; answer: boolean }>>({});
  const problemAnswers = ref<Record<number, string>>({});
  const problemChecks = ref<Record<number, 'correct' | 'incorrect' | null>>({});
  const problemNoExpected = ref<Record<number, boolean>>({});
  const problemAttempts = ref<Record<number, number>>({});

  function reset() {
    practiceMode.value = false;
    practiceValues.value = {};
    practiceReveal.value = false;
    revealedProblems.value = {};
    problemAnswers.value = {};
    problemChecks.value = {};
    problemNoExpected.value = {};
    problemAttempts.value = {};
  }

  function generatePractice() {
    if (!selectedEquation.value) return;
    const values: Record<string, string> = {};
    selectedEquation.value.variables.forEach((v) => {
      if (v.type === 'list') {
        const len = Math.floor(Math.random() * 4) + 3;
        const arr = Array.from({ length: len }, () => Math.floor(Math.random() * 20) + 1);
        values[v.name] = arr.join(', ');
      } else {
        values[v.name] = String(Math.floor(Math.random() * 20) + 1);
      }
    });
    practiceValues.value = values;
    practiceMode.value = true;
    practiceReveal.value = false;
  }

  function loadProblemVariables(problem: ApplicationProblem) {
    solverValues.value = {};
    Object.entries(problem.variables).forEach(([key, value]) => {
      solverValues.value[key] = String(value);
    });
    solverResult.value = selectedEquation.value?.solve(normalizeValues(solverValues.value)) ?? null;
  }

  function checkProblemAnswer(idx: number, problem: ApplicationProblem) {
    if ((problemAttempts.value[idx] ?? 0) >= MAX_ATTEMPTS) return;
    const userAnswer = problemAnswers.value[idx]?.trim() ?? '';
    if (!userAnswer) return;

    const expected = problem.expectedValue;
    if (expected === undefined) {
      problemNoExpected.value[idx] = true;
      return;
    }
    problemAttempts.value[idx] = (problemAttempts.value[idx] ?? 0) + 1;
    const expectedStr = String(expected);
    const expectedParts = expectedStr.split(',').map((s) => s.trim());
    const userParts = normalizeNumerals(userAnswer).split(',').map((s) => s.trim());

    const allMatch = expectedParts.length === userParts.length && expectedParts.every((part) => {
      const expectedNum = Number(part);
      if (Number.isNaN(expectedNum)) {
        return userParts.includes(part);
      }
      return userParts.some((userPart) => {
        const userNum = Number(userPart);
        if (Number.isNaN(userNum)) return false;
        return Math.abs(userNum - expectedNum) < 1e-2;
      });
    });
    problemChecks.value[idx] = allMatch ? 'correct' : 'incorrect';
  }

  const solvedCount = computed(() =>
    Object.values(problemChecks.value).filter((c) => c === 'correct').length
  );

  const practiceResult = computed(() => {
    if (!selectedEquation.value || !practiceReveal.value) return null;
    return selectedEquation.value.solve(normalizeValues(practiceValues.value));
  });

  return {
    practiceMode,
    practiceValues,
    practiceReveal,
    revealedProblems,
    problemAnswers,
    problemChecks,
    problemNoExpected,
    problemAttempts,
    MAX_ATTEMPTS,
    solvedCount,
    practiceResult,
    generatePractice,
    loadProblemVariables,
    checkProblemAnswer,
    reset,
  };
}

function normalizeValues(values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key in values) {
    const v = values[key];
    out[key] = v ? normalizeNumerals(v) : '';
  }
  return out;
}
