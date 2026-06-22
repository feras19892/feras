import { defineAsyncComponent } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const experimentMap: Record<string, () => Promise<any>> = {
  'acid-base-titration': () => import('./experiments/ChemistryExperiment.vue'),
};

export function loadChemistryExperiment(id: string) {
  const loader = experimentMap[id];
  if (!loader) return null;
  return defineAsyncComponent({
    loader,
    loadingComponent: () => import('../physics/experiment-template/ExperimentShell.vue'),
  });
}

export function isChemistryExperimentAvailable(id: string): boolean {
  return id in experimentMap;
}
