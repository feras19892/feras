import { ref } from 'vue';
import { fetchGraphData } from '../../services/math.service';
import type { MathGraphData, GraphPayload } from '../../types/math.types';

export function useMathGraph() {
  const graphData = ref<MathGraphData | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function load(payload: GraphPayload) {
    loading.value = true;
    error.value = null;
    try {
      graphData.value = await fetchGraphData(payload);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load graph';
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    graphData.value = null;
    error.value = null;
  }

  return {
    graphData,
    loading,
    error,
    load,
    clear,
  };
}
