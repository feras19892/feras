import { watch, onMounted, onUnmounted } from 'vue';
import type { Ref } from 'vue';

export interface DropPhysicsOptions {
  canvasRef: Ref<HTMLCanvasElement | null>;
  tiltAngle: Ref<number> | (() => number);
  volume: Ref<number> | (() => number);
  maxVolume: Ref<number> | (() => number);
  liquidColor: Ref<string> | (() => string);
  itemX: Ref<number> | (() => number);
  itemY: Ref<number> | (() => number);
  mouthPosition: (tilt: number) => { x: number; y: number };
  canvasW: number;
  canvasH: number;
  mouthBounds?: { minX: number; maxX: number; minY: number; maxY: number };
  exitY?: number;
  onSpill: (amount: number) => void;
  onDropExited: (wx: number, wy: number, color: string) => void;
}

export function useSpillDrops(opts: DropPhysicsOptions) {
  let activeDrops: { x: number; y: number; vx: number; vy: number; size: number; born: number }[] = [];
  let dropTimer = 0;
  let animId = 0;
  let retryTimeout = 0;
  let running = false;

  const getVal = <T>(v: Ref<T> | (() => T)): T => (typeof v === 'function' ? (v as () => T)() : v.value);

  function startDrops() {
    if (running) return;
    running = true;
    const ctx = opts.canvasRef.value?.getContext('2d');
    if (!ctx) { retryTimeout = window.setTimeout(startDrops, 50); return; }

    const loop = () => {
      if (!running) return;
      ctx.clearRect(0, 0, opts.canvasW, opts.canvasH);
      const tilt = getVal(opts.tiltAngle);
      const absTilt = Math.abs(tilt);
      const volume = getVal(opts.volume);
      const maxVolume = getVal(opts.maxVolume);
      const fillH = Math.min(volume / maxVolume, 1) * (opts.canvasH * 0.4);
      const threshold = 55 - (fillH / (opts.canvasH * 0.4)) * 45;

      const mouth = opts.mouthPosition(tilt);
      const minX = opts.mouthBounds?.minX ?? 10;
      const maxX = opts.mouthBounds?.maxX ?? opts.canvasW - 10;
      const minY = opts.mouthBounds?.minY ?? 10;
      const maxY = opts.mouthBounds?.maxY ?? opts.canvasH - 10;
      const mouthX = Math.max(minX, Math.min(maxX, mouth.x));
      const mouthY = Math.max(minY, Math.min(maxY, mouth.y));

      let isSpilling = false;
      if (absTilt > threshold && volume > 2) isSpilling = true;

      if (isSpilling) {
        dropTimer++;
        let interval = 15; if (absTilt > 20) interval = 8; if (absTilt > 40) interval = 4; if (absTilt > 55) interval = 2;
        if (dropTimer >= interval) {
          activeDrops.push({
            x: mouthX + (Math.random() - 0.5) * 3,
            y: mouthY + 2 + (Math.random() - 0.5) * 2,
            vx: (tilt > 0 ? 0.6 : -0.6) + (Math.random() - 0.5) * 0.3,
            vy: 0.3,
            size: 1.8 + Math.random() * 1.2,
            born: performance.now(),
          });
          dropTimer = 0;
          opts.onSpill(0.05);
        }
      } else { dropTimer = 0; }

      // Draw stream: connect nearby drops with thin lines
      const drops = activeDrops;
      for (let i = 0; i < drops.length; i++) {
        for (let j = i + 1; j < drops.length; j++) {
          const dx = drops[j].x - drops[i].x;
          const dy = drops[j].y - drops[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 18) {
            ctx.beginPath();
            ctx.moveTo(drops[i].x, drops[i].y);
            ctx.lineTo(drops[j].x, drops[j].y);
            ctx.strokeStyle = getVal(opts.liquidColor);
            ctx.globalAlpha = 0.35 * (1 - dist / 18);
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Gravity and draw each drop
      for (let i = activeDrops.length - 1; i >= 0; i--) {
        const d = activeDrops[i];
        d.vy += 0.35;
        d.vx *= 0.99; // slight air resistance
        d.x += d.vx;
        d.y += d.vy;

        // Main drop body
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fillStyle = getVal(opts.liquidColor);
        ctx.globalAlpha = 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Highlight
        ctx.beginPath();
        ctx.arc(d.x - d.size * 0.25, d.y - d.size * 0.3, d.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fill();

        const exitY = opts.exitY ?? opts.canvasH;
        if (d.y > exitY) {
          activeDrops.splice(i, 1);
          opts.onDropExited(getVal(opts.itemX) + d.x, getVal(opts.itemY) + d.y, getVal(opts.liquidColor));
        }
      }
      animId = requestAnimationFrame(loop);
    };
    loop();
  }

  function stopDrops() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    if (retryTimeout) clearTimeout(retryTimeout);
    activeDrops = [];
    dropTimer = 0;
  }

  const ta = opts.tiltAngle;
  const vol = opts.volume;
  watch(() => getVal(ta), () => { if (!running && getVal(vol) > 0) startDrops(); });
  watch(() => getVal(vol), () => { if (!running && getVal(vol) > 0 && getVal(ta) !== 0) startDrops(); });

  onMounted(() => { if (getVal(vol) > 0 && getVal(ta) !== 0) startDrops(); });
  onUnmounted(() => { stopDrops(); });

  return { startDrops, stopDrops };
}
