import { evaluateExpression } from './evaluator.js';
import type { GraphData, GraphOptions, GraphPoint } from './types.js';

export function generateGraphData(
  expression: string,
  options: GraphOptions,
): GraphData | null {
  const xMin = options.xMin ?? -10;
  const xMax = options.xMax ?? 10;
  const step = options.step ?? 0.1;

  const points: GraphPoint[] = [];
  let yMin = Infinity;
  let yMax = -Infinity;
  let hasValue = false;

  for (let x = xMin; x <= xMax; x += step) {
    try {
      const y = evaluateExpression(expression, { x });
      if (!Number.isFinite(y)) continue;
      points.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
      hasValue = true;
    } catch {
      // skip invalid sample
    }
  }

  if (!hasValue) return null;

  const yPadding = (yMax - yMin) * 0.1 || 1;

  return {
    function: expression,
    points,
    xRange: [xMin, xMax] as [number, number],
    yRange: [yMin - yPadding, yMax + yPadding] as [number, number],
  };
}
