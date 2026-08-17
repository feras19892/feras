import { onMounted, onUnmounted, type Ref } from 'vue';

/**
 * Sets up DPR (Device Pixel Ratio) scaling for a fixed-size canvas.
 * Call setupFixed() in onMounted, and it handles resize + cleanup.
 *
 * @param canvasRef - Ref to the HTMLCanvasElement
 * @param logicalW - Logical (CSS) width, e.g. 800
 * @param logicalH - Logical (CSS) height, e.g. 400
 * @param onResize - Optional callback after canvas is scaled (e.g. redraw)
 */
export function useCanvasDPR(
  canvasRef: Ref<HTMLCanvasElement | null>,
  logicalW: number,
  logicalH: number,
  onResize?: () => void,
) {
  let resizeObs: ResizeObserver | null = null;

  function setupFixed() {
    const cvs = canvasRef.value;
    if (!cvs) return;
    const dpr = window.devicePixelRatio || 1;
    cvs.width = logicalW * dpr;
    cvs.height = logicalH * dpr;
    cvs.style.width = '100%';
    cvs.style.height = '100%';
    const ctx = cvs.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
    if (onResize) onResize();

    resizeObs = new ResizeObserver(() => {
      if (onResize) onResize();
    });
    if (cvs.parentElement) resizeObs.observe(cvs.parentElement);
  }

  function teardown() {
    if (resizeObs) { resizeObs.disconnect(); resizeObs = null; }
  }

  onMounted(setupFixed);
  onUnmounted(teardown);

  return { setupFixed, teardown };
}

/**
 * One-shot DPR setup for a canvas element (no lifecycle hooks).
 * Useful inside composables that don't use onMounted/onUnmounted.
 */
export function applyDPR(cvs: HTMLCanvasElement, logicalW: number, logicalH: number): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  cvs.width = logicalW * dpr;
  cvs.height = logicalH * dpr;
  cvs.style.width = '100%';
  cvs.style.height = '100%';
  const ctx = cvs.getContext('2d');
  if (ctx) ctx.scale(dpr, dpr);
  return ctx;
}
