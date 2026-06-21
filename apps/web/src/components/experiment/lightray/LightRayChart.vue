<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

export interface ChartPoint {
  sinI: number;
  sinT: number;
  thetaI: number;
}

interface Props {
  points: ChartPoint[];
  slope?: number | null;
  intercept?: number;
}

const props = defineProps<Props>();
const canvasRef = ref<HTMLCanvasElement | null>(null);

function toRad(deg: number) { return (deg * Math.PI) / 180; }

function draw() {
  const cvs = canvasRef.value;
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  if (!ctx) return;

  const w = cvs.width;
  const h = cvs.height;
  const dpr = window.devicePixelRatio || 1;
  cvs.width = w * dpr;
  cvs.height = h * dpr;
  ctx.scale(dpr, dpr);

  const padding = 50;
  const graphW = w - padding * 2;
  const graphH = h - padding * 2;

  // Clear
  ctx.fillStyle = '#161B22';
  ctx.fillRect(0, 0, w, h);

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, h - padding);
  ctx.lineTo(w - padding, h - padding);
  ctx.stroke();

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  for (let i = 1; i <= 5; i++) {
    const x = padding + (graphW / 5) * i;
    const y = h - padding - (graphH / 5) * i;
    ctx.beginPath(); ctx.moveTo(x, padding); ctx.lineTo(x, h - padding); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(w - padding, y); ctx.stroke();
  }

  // Labels
  ctx.fillStyle = 'rgba(148,163,184,0.6)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const x = padding + (graphW / 5) * i;
    const val = (i / 5).toFixed(1);
    ctx.fillText(val, x, h - padding + 16);
  }
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const y = h - padding - (graphH / 5) * i;
    const val = (i / 5).toFixed(1);
    ctx.fillText(val, padding - 8, y + 4);
  }

  // Axis titles
  ctx.fillStyle = '#67e8f9';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('sin(θₜ)', w / 2, h - 10);
  ctx.save();
  ctx.translate(12, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('sin(θᵢ)', 0, 0);
  ctx.restore();

  if (props.points.length === 0) {
    ctx.fillStyle = '#475569';
    ctx.textAlign = 'center';
    ctx.fillText('سجل قراءات لرسم البيانات', w / 2, h / 2);
    return;
  }

  // Scale functions
  const scaleX = (sinT: number) => padding + sinT * graphW;
  const scaleY = (sinI: number) => h - padding - sinI * graphH;

  // Best-fit line
  if (props.slope !== null && props.slope !== undefined) {
    const m = props.slope;
    const b = props.intercept ?? 0;
    ctx.strokeStyle = 'rgba(99,102,241,0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const x0 = 0;
    const y0 = m * x0 + b;
    const x1 = 1;
    const y1 = m * x1 + b;
    ctx.moveTo(scaleX(x0), scaleY(Math.min(y0, 1)));
    ctx.lineTo(scaleX(x1), scaleY(Math.min(y1, 1)));
    ctx.stroke();
    ctx.setLineDash([]);

    // Equation label
    ctx.fillStyle = '#a5b4fc';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`y = ${m.toFixed(3)}x`, w - padding - 80, padding + 20);
  }

  // Data points
  for (const p of props.points) {
    const cx = scaleX(p.sinT);
    const cy = scaleY(p.sinI);
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Tooltip on hover would need mouse tracking, skip for simplicity
  }
}

watch(() => [props.points.length, props.slope], draw, { immediate: true });
onMounted(draw);
</script>

<template>
  <canvas ref="canvasRef" class="lightray-chart" width="400" height="300"></canvas>
</template>

<style scoped>
.lightray-chart {
  width: 100%;
  height: 250px;
  border-radius: 8px;
  background: #161B22;
}
</style>
