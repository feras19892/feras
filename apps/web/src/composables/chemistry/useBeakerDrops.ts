import { watch, onMounted, onUnmounted } from 'vue';

interface Drop { x: number; y: number; vx: number; vy: number; size: number }

export function useBeakerDrops(
  canvasRef: { value: HTMLCanvasElement | null },
  getTiltAngle: () => number,
  getVolume: () => number,
  getMaxVolume: () => number,
  getLiquidColor: () => string,
  getItemX: () => number,
  getItemY: () => number,
  emit: (event: 'spill' | 'dropExited', ...args: any[]) => void
) {
  const activeDrops: Drop[] = [];
  let dropTimer = 0;
  let animId = 0;
  let running = false;

  function startDrops() {
    if (running) return;
    running = true;
    const ctx = canvasRef.value?.getContext('2d');
    if (!ctx) { setTimeout(startDrops, 50); return; }

    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, 140, 300);
      const tilt = getTiltAngle();
      const absTilt = Math.abs(tilt);
      const fillH = Math.min(getVolume() / getMaxVolume(), 1) * 125;
      const threshold = 55 - (fillH / 125) * 45;

      const rad = tilt * Math.PI / 180;
      const mouthX = Math.max(10, Math.min(130, 70 + 75 * Math.sin(rad)));
      const mouthY = Math.max(10, Math.min(200, 100 - 75 * Math.cos(rad)));
      let isSpilling = false;
      if (absTilt > threshold && getVolume() > 2) isSpilling = true;

      if (isSpilling) {
        dropTimer++;
        let interval = 25; if (absTilt > 20) interval = 12; if (absTilt > 40) interval = 5; if (absTilt > 55) interval = 2;
        if (dropTimer >= interval) {
          activeDrops.push({
            x: mouthX + (Math.random() - 0.5) * 4,
            y: mouthY + 5 + (Math.random() - 0.5) * 3,
            vx: (tilt > 0 ? 0.8 : -0.8) + (Math.random() - 0.5) * 0.4,
            vy: 0.5,
            size: 3.5 + Math.random() * 2
          });
          dropTimer = 0;
          emit('spill', 0.15);
        }
      } else { dropTimer = 0; }

      for (let i = activeDrops.length - 1; i >= 0; i--) {
        const d = activeDrops[i];
        d.vy += 0.4;
        d.x += d.vx;
        d.y += d.vy;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = getLiquidColor(); ctx.globalAlpha = 0.95; ctx.fill(); ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(d.x - d.size*0.25, d.y - d.size*0.25, d.size*0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fill();

        if (d.y > 200) {
          activeDrops.splice(i, 1);
          emit('dropExited', getItemX() + d.x, getItemY() + d.y, getLiquidColor());
        }
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
  }
  function stopDrops() { running = false; if (animId) cancelAnimationFrame(animId); }

  watch(getTiltAngle, () => { if (!running && getVolume() > 0) startDrops(); });
  watch(getVolume, () => { if (!running && getVolume() > 0 && getTiltAngle() !== 0) startDrops(); });
  onMounted(() => { if (getVolume() > 0 && getTiltAngle() !== 0) startDrops(); });
  onUnmounted(() => { stopDrops(); });

  return { startDrops, stopDrops };
}
