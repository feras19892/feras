<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
type Point = { x: number; y: number };

const props = defineProps<{
  points: Point[];
}>();

const width = 400;
const height = 200;

const xValues = props.points.map((p) => p.x);
const yValues = props.points.map((p) => p.y);

const xMin = Math.min(...xValues);
const xMax = Math.max(...xValues);
const yMin = Math.min(...yValues);
const yMax = Math.max(...yValues);

const xPadding = (xMax - xMin) * 0.05 || 1;
const yPadding = (yMax - yMin) * 0.05 || 1;

const plotXMin = xMin - xPadding;
const plotXMax = xMax + xPadding;
const plotYMin = yMin - yPadding;
const plotYMax = yMax + yPadding;

function toSvgX(x: number): number {
  return ((x - plotXMin) / (plotXMax - plotXMin)) * width;
}

function toSvgY(y: number): number {
  return height - ((y - plotYMin) / (plotYMax - plotYMin)) * height;
}

const pathD = props.points
  .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toSvgX(p.x)} ${toSvgY(p.y)}`)
  .join(' ');
</script>

<template>
  <section class="math-graph">
    <h2 class="section-title">{{ t('math.graph.title') }}</h2>
    <svg class="graph-svg" :viewBox="`0 0 ${width} ${height}`">
      <line :x1="0" :y1="toSvgY(0)" :x2="width" :y2="toSvgY(0)" stroke="#9ca3af" stroke-width="1" />
      <line :x1="toSvgX(0)" :y1="0" :x2="toSvgX(0)" :y2="height" stroke="#9ca3af" stroke-width="1" />
      <path :d="pathD" fill="none" stroke="#2563eb" stroke-width="2" />
    </svg>
  </section>
</template>

<style scoped>
.math-graph {
  padding: 1rem;
  background-color: white;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.graph-svg {
  width: 100%;
  height: auto;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}
</style>