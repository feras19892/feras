<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import type { AnalysisColumnMeta, AnalysisPlotConfig } from '../../../types/physics';

const props = defineProps<{
  readings: Record<string, number>[];
  columns: AnalysisColumnMeta[];
  suggestedPlots: AnalysisPlotConfig[];
}>();

const xKey = ref('');
const yKey = ref('');
const containerRef = ref<HTMLDivElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const hoverPoint = ref<{ x: number; y: number; px: number; py: number } | null>(null);
const tooltip = ref('');

const numericKeys = computed(() => props.columns.map(c => c.key));

watch(() => props.suggestedPlots, (plots) => {
  if (plots.length) { xKey.value = plots[0].xKey; yKey.value = plots[0].yKey; }
  else if (props.columns.length >= 2) { xKey.value = props.columns[0].key; yKey.value = props.columns[1].key; }
}, { immediate: true });

const points = computed(() => {
  if (!xKey.value || !yKey.value) return [];
  return props.readings
    .map(r => ({ x: r[xKey.value], y: r[yKey.value] }))
    .filter(p => typeof p.x === 'number' && typeof p.y === 'number' && !isNaN(p.x) && !isNaN(p.y));
});

const sumX = computed(() => points.value.reduce((s, p) => s + p.x, 0));
const sumY = computed(() => points.value.reduce((s, p) => s + p.y, 0));
const sumXY = computed(() => points.value.reduce((s, p) => s + p.x * p.y, 0));
const sumX2 = computed(() => points.value.reduce((s, p) => s + p.x * p.x, 0));

const regression = computed(() => {
  const n = points.value.length;
  if (n < 2) return null;
  const sx = sumX.value, sy = sumY.value, sxy = sumXY.value, sx2 = sumX2.value;
  const sumY2 = points.value.reduce((s, p) => s + p.y * p.y, 0);
  const slope = (n * sxy - sx * sy) / (n * sx2 - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const rNumerator = n * sxy - sx * sy;
  const rDenominator = Math.sqrt((n * sx2 - sx * sx) * (n * sumY2 - sy * sy));
  const r = rDenominator === 0 ? 0 : rNumerator / rDenominator;
  return { slope, intercept, r2: r * r };
});

const slopeWarning = computed(() => {
  if (!regression.value || points.value.length < 2) return null;
  // Most physics relationships in these experiments have positive expected slopes
  const slope = regression.value.slope;
  if (slope < -0.001) {
    return '⚠️ الميل سالب — قد تشير البيانات إلى قياسات غير متناسقة. تأكد من تشغيل المحاكاة بعد تغيير المعاملات.';
  }
  if (Math.abs(slope) < 0.0001 && regression.value.r2 > 0.5) {
    return '⚠️ الميل شبه معدوم — ربما المتغير المستقل لا يؤثر في المتغير التابع.';
  }
  return null;
});

function draw() {
  const canvas = canvasRef.value;
  if (!canvas || !containerRef.value) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rect = containerRef.value.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor((rect.height - 32) * dpr);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = (rect.height - 32) + 'px';
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height - 4;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  if (points.value.length === 0) {
    ctx.fillStyle = '#64748b'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('اختر محورين للرسم', w / 2, h / 2);
    return;
  }

  const metrics = getChartMetrics(rect);
  const { pad, minX, maxX, minY, maxY, rangeX, rangeY, dataMinX, dataMinY, dataRangeX, dataRangeY } = metrics;

  const toPx = (x: number, y: number) => ({
    px: pad + ((x - minX) / rangeX) * (w - pad * 2),
    py: h - pad - ((y - minY) / rangeY) * (h - pad * 2),
  });

  // grid
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const gx = pad + (i / 5) * (w - pad * 2);
    const gy = pad + (i / 5) * (h - pad * 2);
    ctx.beginPath(); ctx.moveTo(gx, pad); ctx.lineTo(gx, h - pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(w - pad, gy); ctx.stroke();
  }

  // axes
  ctx.strokeStyle = '#94a3b8';
  ctx.beginPath(); ctx.moveTo(pad, h - pad); ctx.lineTo(w - pad, h - pad); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pad, pad); ctx.lineTo(pad, h - pad); ctx.stroke();

  // labels + ticks (larger font)
  ctx.fillStyle = '#94a3b8'; ctx.font = '13px sans-serif'; ctx.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const xv = dataMinX + (i / 5) * dataRangeX;
    const px = pad + ((xv - minX) / rangeX) * (w - pad * 2);
    ctx.fillText(xv.toFixed(2), px, h - pad + 16);
  }
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const yv = dataMinY + (i / 5) * dataRangeY;
    const py = h - pad - ((yv - minY) / rangeY) * (h - pad * 2);
    ctx.fillText(yv.toFixed(2), pad - 8, py + 4);
  }
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px sans-serif'; ctx.fillStyle = '#67e8f9';
  ctx.fillText(xKey.value || 'X', w / 2, h - 2);
  ctx.save(); ctx.translate(14, h / 2); ctx.rotate(-Math.PI / 2); ctx.fillText(yKey.value || 'Y', 0, 0); ctx.restore();

  // regression line
  if (regression.value) {
    const { slope, intercept } = regression.value;
    const { px: px1, py: py1 } = toPx(minX, slope * minX + intercept);
    const { px: px2, py: py2 } = toPx(maxX, slope * maxX + intercept);
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2); ctx.stroke();
  }

  // points (larger + glow effect)
  for (const p of points.value) {
    const { px, py } = toPx(p.x, p.y);
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fillStyle = 'rgba(34,197,94,0.25)'; ctx.fill();
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fillStyle = '#22c55e'; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }

  // hover highlight
  if (hoverPoint.value) {
    const { px, py } = hoverPoint.value;
    ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fillStyle = 'rgba(34,197,94,0.3)'; ctx.fill();
    ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 2; ctx.stroke();
    // tooltip (larger + clearer)
    const txt = tooltip.value;
    ctx.font = 'bold 13px sans-serif';
    const tw = ctx.measureText(txt).width + 20;
    const tx = Math.min(Math.max(px - tw/2, 6), w - tw - 6);
    const ty = py - 38;
    ctx.fillStyle = 'rgba(15,23,42,0.95)'; ctx.fillRect(tx, ty, tw, 28);
    ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 1.5; ctx.strokeRect(tx, ty, tw, 28);
    ctx.fillStyle = '#e2e8f0'; ctx.textAlign = 'center'; ctx.fillText(txt, tx + tw/2, ty + 19);
  }
}

watch([points, xKey, yKey], () => { draw(); }, { deep: true });

let ro: ResizeObserver | null = null;
// Shared metrics for draw + hover
function getChartMetrics(rect: DOMRect) {
  const xs = points.value.map(p => p.x); const ys = points.value.map(p => p.y);
  const dataMinX = Math.min(...xs); const dataMaxX = Math.max(...xs);
  const dataMinY = Math.min(...ys); const dataMaxY = Math.max(...ys);
  const dataRangeX = dataMaxX === dataMinX ? 1 : dataMaxX - dataMinX;
  const dataRangeY = dataMaxY === dataMinY ? 1 : dataMaxY - dataMinY;
  const pad = 20;
  const minX = dataMinX - dataRangeX * 0.12;
  const maxX = dataMaxX + dataRangeX * 0.12;
  const minY = dataMinY - dataRangeY * 0.12;
  const maxY = dataMaxY + dataRangeY * 0.12;
  const rangeX = maxX === minX ? 1 : maxX - minX;
  const rangeY = maxY === minY ? 1 : maxY - minY;
  return { pad, minX, maxX, minY, maxY, rangeX, rangeY, dataMinX, dataMinY, dataRangeX, dataRangeY };
}

function onMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value; if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  if (points.value.length === 0) return;
  const { pad, minX, minY, rangeX, rangeY } = getChartMetrics(rect);
  const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
  let closest: { x: number; y: number; px: number; py: number; dist: number } | null = null;
  for (const p of points.value) {
    const px = pad + ((p.x - minX) / rangeX) * (rect.width - pad * 2);
    const py = rect.height - pad - ((p.y - minY) / rangeY) * (rect.height - pad * 2);
    const dist = Math.hypot(mx - px, my - py);
    if (!closest || dist < closest.dist) closest = { x: p.x, y: p.y, px, py, dist };
  }
  if (closest && closest.dist < 20) {
    hoverPoint.value = { x: closest.x, y: closest.y, px: closest.px, py: closest.py };
    tooltip.value = `${xKey.value}=${closest.x.toFixed(3)}, ${yKey.value}=${closest.y.toFixed(3)}`;
  } else {
    hoverPoint.value = null; tooltip.value = '';
  }
  draw();
}

onMounted(() => {
  setTimeout(() => draw(), 100);
  if (containerRef.value) {
    ro = new ResizeObserver(() => draw());
    ro.observe(containerRef.value);
  }
  const canvas = canvasRef.value;
  if (canvas) { canvas.addEventListener('mousemove', onMouseMove); canvas.addEventListener('mouseleave', () => { hoverPoint.value = null; tooltip.value = ''; draw(); }); }
});
onUnmounted(() => {
  if (ro) ro.disconnect();
  const canvas = canvasRef.value;
  if (canvas) { canvas.removeEventListener('mousemove', onMouseMove); }
});
</script>

<template>
  <div class="chart-panel" ref="containerRef">
    <div class="panel-header">
      <span>📈 رسم بياني</span>
      <div class="controls">
        <select v-model="xKey">
          <option v-for="k in numericKeys" :key="k" :value="k">{{ k }}</option>
        </select>
        <span class="vs">ضد</span>
        <select v-model="yKey">
          <option v-for="k in numericKeys" :key="k" :value="k">{{ k }}</option>
        </select>
      </div>
    </div>
    <canvas ref="canvasRef" style="flex:1;min-height:0;display:block;height:100%;"></canvas>
    <div v-if="regression" class="reg-stats">
      <span>y = {{ regression.slope.toFixed(4) }}x {{ regression.intercept >= 0 ? '+' : '' }} {{ regression.intercept.toFixed(4) }}</span>
      <span class="r2">R² = {{ regression.r2.toFixed(4) }}</span>
    </div>
    <div v-if="slopeWarning" class="slope-warning">{{ slopeWarning }}</div>
    <div v-if="regression && points.length >= 2" class="slope-calc">
      <div class="calc-title">📐 حساب الميل</div>
      <div class="calc-steps">
        <div class="step">m = (n·Σxy − Σx·Σy) / (n·Σx² − (Σx)²)</div>
        <div class="step">m = ({{ points.length }}·{{ sumXY.toFixed(3) }} − {{ sumX.toFixed(3) }}·{{ sumY.toFixed(3) }}) / ({{ points.length }}·{{ sumX2.toFixed(3) }} − {{ sumX.toFixed(3) }}²)</div>
        <div class="step final">m = {{ regression.slope.toFixed(4) }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-panel {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  font-size: 1rem;
  color: #67e8f9;
  font-weight: 700;
  flex-shrink: 0;
}
.controls { display: flex; align-items: center; gap: 0.4rem; }
select {
  background: #0f172a;
  border: 1px solid #334155;
  color: #e2e8f0;
  border-radius: 0.3rem;
  padding: 0.3rem 0.5rem;
  font-size: 0.9rem;
}
.vs { color: #64748b; font-size: 0.85rem; }
.reg-stats {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.9rem;
  font-size: 0.95rem;
  color: #fbbf24;
  background: rgba(245,158,11,0.08);
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
  font-weight: 700;
}
.reg-stats .r2 { color: #4ade80; font-weight: 700; }
.slope-warning {
  background: rgba(239,68,68,0.1);
  border-top: 1px solid rgba(239,68,68,0.2);
  color: #f87171;
  padding: 0.5rem 0.9rem;
  font-size: 0.9rem;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
}
.slope-calc {
  background: rgba(6,182,212,0.08);
  border-top: 1px solid rgba(6,182,212,0.2);
  padding: 0.5rem 0.9rem;
  flex-shrink: 0;
}
.calc-title { font-size: 0.9rem; color: #67e8f9; font-weight: 700; margin-bottom: 0.3rem; }
.calc-steps { display: flex; flex-direction: column; gap: 0.2rem; }
.step { font-size: 0.85rem; color: #94a3b8; font-family: 'Courier New', monospace; }
.step.final { color: #fbbf24; font-weight: 700; font-size: 0.95rem; }
</style>
