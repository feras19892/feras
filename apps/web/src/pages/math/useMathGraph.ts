import { computed, type Ref } from 'vue';
import type { Equation } from './math-types';
import { normalizeNumerals } from './math-utils';

export function useMathGraph(
  selectedEquation: Ref<Equation | undefined>,
  solverValues: Ref<Record<string, string>>
) {
  const graphParams = computed(() => {
    if (!selectedEquation.value?.graph) return null;
    const params = { ...selectedEquation.value.graph.params };
    selectedEquation.value.variables.forEach((v) => {
      const raw = solverValues.value[v.name];
      if (raw === undefined || raw === '') return;
      const n = Number(normalizeNumerals(raw));
      if (!Number.isNaN(n)) params[v.name] = n;
    });
    return params as Record<string, number>;
  });

  const graphAxes = computed(() => {
    if (!selectedEquation.value?.graph) return null;
    const cfg = selectedEquation.value.graph;
    const width = 300;
    const height = 180;
    const [xMin, xMax] = cfg.xRange;
    const yMin = cfg.yRange?.[0] ?? -10;
    const yMax = cfg.yRange?.[1] ?? 10;
    const xAxisY = yMin <= 0 && yMax >= 0 ? height - ((0 - yMin) / (yMax - yMin)) * height : null;
    const yAxisX = xMin <= 0 && xMax >= 0 ? ((0 - xMin) / (xMax - xMin)) * width : null;
    return { width, height, xAxisY, yAxisX };
  });

  const graphSegments = computed(() => {
    if (!selectedEquation.value?.graph || !graphParams.value) return [];
    const cfg = selectedEquation.value.graph;
    const width = 300;
    const height = 180;
    const [xMin, xMax] = cfg.xRange;
    const yMin = cfg.yRange?.[0] ?? -10;
    const yMax = cfg.yRange?.[1] ?? 10;
    const steps = 300;

    const lines = cfg.lines && cfg.lines.length > 0
      ? cfg.lines
      : [{ fn: cfg.fn, color: undefined }];

    const result: { points: string; color?: string }[] = [];

    lines.forEach((line) => {
      const lineParams = { ...graphParams.value!, ...line.params };

      if (line.verticalX) {
        const vx = line.verticalX(lineParams);
        if (Number.isFinite(vx) && vx >= xMin && vx <= xMax) {
          const px = ((vx - xMin) / (xMax - xMin)) * width;
          const pyMin = height;
          const pyMax = 0;
          result.push({ points: `${px.toFixed(1)},${pyMin.toFixed(1)} ${px.toFixed(1)},${pyMax.toFixed(1)}`, color: line.color });
        }
        return;
      }

      if (!line.fn) return;

      const segments: string[] = [];
      let current: string[] = [];
      let lastPy: number | null = null;

      for (let i = 0; i <= steps; i++) {
        const x = xMin + (xMax - xMin) * (i / steps);
        const y = line.fn(x, lineParams);
        if (!Number.isFinite(y) || y < yMin || y > yMax) {
          if (current.length) {
            segments.push(current.join(' '));
            current = [];
          }
          lastPy = null;
          continue;
        }
        const px = ((x - xMin) / (xMax - xMin)) * width;
        const py = height - ((y - yMin) / (yMax - yMin)) * height;
        if (lastPy !== null && Math.abs(py - lastPy) > height * 0.85) {
          if (current.length) {
            segments.push(current.join(' '));
            current = [];
          }
        }
        current.push(`${px.toFixed(1)},${py.toFixed(1)}`);
        lastPy = py;
      }
      if (current.length) segments.push(current.join(' '));
      segments.forEach((seg) => result.push({ points: seg, color: line.color }));
    });

    return result;
  });

  return { graphParams, graphAxes, graphSegments };
}
