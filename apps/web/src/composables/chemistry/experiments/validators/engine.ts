import type { ExperimentDefinition, StepDef } from '../types';
import { evaluateRule } from './rules';

// ================== VALIDATION ENGINE ==================
// Reads declarative rules from experiment definition and checks workspace state.
// One engine for all experiments — no per-experiment hardcoded validators.

export function validateSteps(def: ExperimentDefinition): boolean[] {
  return def.steps.map((step) => validateStep(step));
}

export function validateStep(step: StepDef): boolean {
  if (!step.rules || step.rules.length === 0) return false;
  return step.rules.every(evaluateRule);
}

export function completedCount(def: ExperimentDefinition): number {
  return validateSteps(def).filter(Boolean).length;
}

export function isComplete(def: ExperimentDefinition): boolean {
  return validateSteps(def).every(Boolean);
}
