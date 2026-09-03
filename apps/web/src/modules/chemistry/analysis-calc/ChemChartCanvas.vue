<script setup lang="ts">
import { useI18n } from '@/composables/useI18n';
const { t } = useI18n();
import { ref, watch, onMounted } from 'vue';

interface Point { x: number; y: number }
const props = defineProps<{
  data: Point[];
  xLabel: string;
  yLabel: string;
  type: 'scatter' | 'line';
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);

function draw() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const pad = { top: 30, right: 30, bottom: 50, left: 60 };
  const gw = w - pad.left - pad.right;
  const gh = h - pad.top - pad.bottom;

  ctx.clearRect(0, 0, w, h);
  if (!props.data.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('chemistryLab.noData'), w / 2, h / 2);
    return;
  }

  const xs = props.data.map(p => p.x);
  const ys = props.data.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;

  function tx(x: number) { return pad.left + ((x - minX) / dx) * gw; }
  function ty(y: number) { return pad.top + gh - ((y - minY) / dy) * gh; }

  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const gx = pad.left + (gw / 5) * i;
    const gy = pad.top + (gh / 5) * i;
    ctx.beginPath(); ctx.moveTo(gx, pad.top); ctx.lineTo(gx, pad.top + gh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(pad.left + gw, gy); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(pad.left, pad.top); ctx.lineTo(pad.left, pad.top + gh); ctx.lineTo(pad.left + gw, pad.top + gh); ctx.stroke();

  // Labels
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(props.xLabel, pad.left + gw / 2, h - 10);
  ctx.save();
  ctx.translate(15, pad.top + gh / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(props.yLabel, 0, 0);
  ctx.restore();

  // Ticks
  ctx.fillStyle = '#64748b';
  ctx.font = '10px sans-serif';
  for (let i = 0; i <= 5; i++) {
    const xv = minX + (dx / 5) * i;
    const yv = minY + (dy / 5) * i;
    ctx.textAlign = 'center';
    ctx.fillText(xv.toFixed(1), pad.left + (gw / 5) * i, pad.top + gh + 15);
    ctx.textAlign = 'right';
    ctx.fillText(yv.toFixed(1), pad.left - 8, pad.top + gh - (gh / 5) * i + 4);
  }

  // Data
  if (props.type === 'line' && props.data.length > 1) {
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tx(props.data[0].x), ty(props.data[0].y));
    for (let i = 1; i < props.data.length; i++) ctx.lineTo(tx(props.data[i].x), ty(props.data[i].y));
    ctx.stroke();
  }

  for (const p of props.data) {
    ctx.beginPath();
    ctx.arc(tx(p.x), ty(p.y), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#06b6d4';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

watch(() => props.data, draw, { deep: true });
onMounted(draw);

defineExpose({ getCanvas: () => canvasRef.value, draw });
</script>

<template>
  <canvas ref="canvasRef" width="700" height="400" class="chart-canvas" />
</template>

<style scoped>
.chart-canvas { width: 100%; height: 100%; background: rgba(255,255,255,0.02); border-radius: 0.4rem; }
</style>
