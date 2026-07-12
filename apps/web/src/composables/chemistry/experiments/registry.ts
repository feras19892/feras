import type { ExperimentDefinition } from './types';

// ================== EXPERIMENT REGISTRY ==================
// Dynamic registry — experiments register themselves at import time.
// To add a new experiment: create a definition file and call registerExperiment().

const registry = new Map<string, ExperimentDefinition>();

export function registerExperiment(def: ExperimentDefinition): void {
  registry.set(def.id, def);
}

export function getExperiment(id: string): ExperimentDefinition | undefined {
  return registry.get(id);
}

export function listExperiments(): ExperimentDefinition[] {
  return Array.from(registry.values());
}

export function listByCategory(category: string): ExperimentDefinition[] {
  return Array.from(registry.values()).filter((e) => e.category === category);
}

export function listByLevel(level: string): ExperimentDefinition[] {
  return Array.from(registry.values()).filter((e) => e.level === level);
}

export function hasExperiment(id: string): boolean {
  return registry.has(id);
}

export function clearRegistry(): void {
  registry.clear();
}
