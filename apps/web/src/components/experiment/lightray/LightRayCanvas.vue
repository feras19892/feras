<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

interface Props {
  angleIncidence: number;
  n1: number;
  n2: number;
  angleReflection: number;
  angleRefraction: number | null;
  totalInternalReflection: boolean;
  running: boolean;
}

const props = defineProps<Props>();
const canvasRef = ref<HTMLCanvasElement | null>(null);

function draw() {
  const cvs = canvasRef.value;
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  if (!ctx) return;

  const rect = cvs.getBoundingClientRect();
  const w = rect.width || cvs.width;
  const h = rect.height || cvs.height;
  ctx.clearRect(0, 0, w, h);

  // Background
  ctx.fillStyle = '#161B22';
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const maxRayLen = Math.min(w, h) * 0.4;

  // Normal line (dashed)
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, 20);
  ctx.lineTo(cx, h - 20);
  ctx.stroke();
  ctx.setLineDash([]);

  // Surface line
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, cy);
  ctx.lineTo(w - 20, cy);
  ctx.stroke();

  // Medium labels
  ctx.fillStyle = 'rgba(148,163,184,0.6)';
  ctx.font = '12px sans-serif';
  ctx.fillText(`Medium 1: n₁ = ${props.n1.toFixed(2)}`, 30, cy - 20);
  ctx.fillText(`Medium 2: n₂ = ${props.n2.toFixed(2)}`, 30, cy + 35);

  const incRad = (props.angleIncidence * Math.PI) / 180;
  const reflRad = (props.angleReflection * Math.PI) / 180;

  // Incident ray
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const x1 = cx - maxRayLen * Math.sin(incRad);
  const y1 = cy - maxRayLen * Math.cos(incRad);
  ctx.moveTo(x1, y1);
  ctx.lineTo(cx, cy);
  ctx.stroke();
  // Arrowhead on incident
  drawArrow(ctx, x1, y1, cx, cy, '#fbbf24');

  // Reflected ray
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const xr = cx + maxRayLen * Math.sin(reflRad);
  const yr = cy - maxRayLen * Math.cos(reflRad);
  ctx.moveTo(cx, cy);
  ctx.lineTo(xr, yr);
  ctx.stroke();
  drawArrow(ctx, cx, cy, xr, yr, '#fbbf24');

  // Refracted ray (if not TIR)
  if (!props.totalInternalReflection && props.angleRefraction !== null) {
    const refrRad = (props.angleRefraction * Math.PI) / 180;
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const xt = cx + maxRayLen * Math.sin(refrRad);
    const yt = cy + maxRayLen * Math.cos(refrRad);
    ctx.moveTo(cx, cy);
    ctx.lineTo(xt, yt);
    ctx.stroke();
    drawArrow(ctx, cx, cy, xt, yt, '#67e8f9');
  } else if (props.totalInternalReflection) {
    // TIR label
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Total Internal Reflection', cx, cy + maxRayLen * 0.5);
    ctx.textAlign = 'left';
  }

  // Angle arcs
  drawAngleArc(ctx, cx, cy, incRad, '#fbbf24', 'θᵢ', -30, -50);
  drawAngleArc(ctx, cx, cy, reflRad, '#fbbf24', 'θᵣ', 30, -50);
  if (!props.totalInternalReflection && props.angleRefraction !== null) {
    const refrRad = (props.angleRefraction * Math.PI) / 180;
    drawAngleArc(ctx, cx, cy, refrRad, '#67e8f9', 'θₜ', 30, 50);
  }

  // Point of incidence
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
  const headLen = 10;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(midX - headLen * Math.cos(angle - Math.PI / 6), midY - headLen * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(midX - headLen * Math.cos(angle + Math.PI / 6), midY - headLen * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fill();
}

function drawAngleArc(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, rad: number,
  color: string, label: string, labelDx: number, labelDy: number
) {
  const arcR = 40;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (label === 'θᵢ' || label === 'θᵣ') {
    ctx.arc(cx, cy, arcR, -Math.PI / 2 - rad, -Math.PI / 2 + (label === 'θᵣ' ? rad : 0));
  } else {
    ctx.arc(cx, cy, arcR, Math.PI / 2, Math.PI / 2 + rad);
  }
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = '11px sans-serif';
  const lx = cx + labelDx;
  const ly = cy + labelDy;
  ctx.fillText(label, lx, ly);
}

watch(
  () => [props.angleIncidence, props.n1, props.n2, props.angleReflection, props.angleRefraction, props.totalInternalReflection],
  draw,
  { immediate: true }
);

function setupCanvas() {
  const cvs = canvasRef.value;
  if (!cvs) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = cvs.getBoundingClientRect();
  cvs.width = rect.width * dpr;
  cvs.height = rect.height * dpr;
  const ctx = cvs.getContext('2d');
  if (ctx) ctx.scale(dpr, dpr);
  draw();
}

onMounted(() => {
  setupCanvas();
  window.addEventListener('resize', setupCanvas);
});
onUnmounted(() => window.removeEventListener('resize', setupCanvas));
</script>

<template>
  <canvas ref="canvasRef" class="lightray-canvas"></canvas>
</template>

<style scoped>
.lightray-canvas {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  min-height: 300px;
}
</style>
