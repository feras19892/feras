import { ref, onMounted, onUnmounted } from 'vue';

/* ───────────── types ───────────── */
export interface MonitorSnapshot {
  fps: number;
  memoryUsed: number;
  memoryLimit: number;
  consoleErrors: number;
  consoleWarns: number;
  canvasErrors: number;
  physicsHealth: 'ok' | 'warn' | 'fail';
  chemistryHealth: 'ok' | 'warn' | 'fail';
  hasNaN: boolean;
  hasInfinity: boolean;
  time: string;
}

/* ───────────── reactive state ───────────── */
const fps = ref(0);
const memoryUsed = ref(0);
const memoryLimit = ref(0);
const consoleErrors = ref(0);
const consoleWarns = ref(0);
const canvasErrors = ref(0);
const physicsHealth = ref<'ok' | 'warn' | 'fail'>('ok');
const chemistryHealth = ref<'ok' | 'warn' | 'fail'>('ok');
const logs = ref<{ type: 'error' | 'warn' | 'info'; text: string; time: string }[]>([]);
const history = ref<MonitorSnapshot[]>([]);

let frameCount = 0;
let lastTime = performance.now();
let rafId = 0;
let memTimer = 0;
let historyTimer = 0;
let windowErrorHandler: ((e: ErrorEvent) => void) | null = null;

/* ── intercept console ── */
const origErr = console.error;
const origWarn = console.warn;
let consoleHookCount = 0;

function addLog(type: 'error' | 'warn' | 'info', args: unknown[]) {
  const text = args.map((a) => (typeof a === 'string' ? a : String(a))).join(' ');
  logs.value.unshift({ type, text, time: new Date().toLocaleTimeString('en-GB') });
  if (logs.value.length > 50) logs.value.pop();
}

function hookConsole() {
  if (consoleHookCount++ > 0) return;
  console.error = (...args: unknown[]) => {
    consoleErrors.value++;
    addLog('error', args);
    origErr.apply(console, args);
  };
  console.warn = (...args: unknown[]) => {
    consoleWarns.value++;
    addLog('warn', args);
    origWarn.apply(console, args);
  };
}

function unhookConsole() {
  if (--consoleHookCount > 0) return;
  consoleHookCount = 0;
  console.error = origErr;
  console.warn = origWarn;
}

/* ── hook window.onerror ── */
function onWindowError(e: ErrorEvent) {
  consoleErrors.value++;
  addLog('error', [e.message]);
}

/* ── hook Canvas & WebGL ── */
let canvasHookInstalled = false;
const wrapped2dContexts = new WeakSet<CanvasRenderingContext2D>();
const wrappedGlContexts = new WeakSet<WebGLRenderingContext>();

function hookCanvas() {
  if (canvasHookInstalled) return;
  canvasHookInstalled = true;
  const origGetContext = HTMLCanvasElement.prototype.getContext;
  (HTMLCanvasElement.prototype as any).getContext = function (
    contextId: string,
    options?: unknown
  ) {
    const ctx = (origGetContext as any).call(this, contextId, options);
    if (!ctx) return null;
    if (contextId === '2d') {
      const c2d = ctx as CanvasRenderingContext2D;
      if (wrapped2dContexts.has(c2d)) return ctx;
      wrapped2dContexts.add(c2d);
      const origFill = c2d.fillRect;
      c2d.fillRect = function (x: number, y: number, w: number, h: number) {
        try { return origFill.call(this, x, y, w, h); }
        catch (e) { canvasErrors.value++; throw e; }
      };
    }
    if (contextId === 'webgl' || contextId === 'webgl2') {
      const gl = ctx as WebGLRenderingContext;
      if (wrappedGlContexts.has(gl)) return ctx;
      wrappedGlContexts.add(gl);
      const origDraw = gl.drawArrays;
      gl.drawArrays = function (mode: number, first: number, count: number) {
        try { return origDraw.call(this, mode, first, count); }
        catch (e) { canvasErrors.value++; throw e; }
      };
    }
    return ctx;
  };
}

/* ── FPS loop ── */
function tick() {
  const t = performance.now();
  frameCount++;
  if (t - lastTime >= 1000) {
    fps.value = frameCount;
    frameCount = 0;
    lastTime = t;
    checkPhysicsHealth();
  }
  rafId = requestAnimationFrame(tick);
}

/* ── memory ── */
function readMemory() {
  const p = performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } }
  if (p.memory) {
    memoryUsed.value = Math.round(p.memory.usedJSHeapSize / 1024 / 1024);
    memoryLimit.value = Math.round(p.memory.jsHeapSizeLimit / 1024 / 1024);
  }
}

/* ── physics sanity checks ── */
function checkPhysicsHealth() {
  const w = window as Window & { __PHYSICS_VALUES__?: number[] }
  if (w.__PHYSICS_VALUES__) {
    const vals = w.__PHYSICS_VALUES__;
    const hasNaN = vals.some((v) => Number.isNaN(v));
    const hasInf = vals.some((v) => !Number.isFinite(v));
    if (hasNaN || hasInf) {
      physicsHealth.value = 'fail';
      addLog('error', ['Physics value became NaN or Infinity']);
    } else {
      physicsHealth.value = 'ok';
    }
  }
}

/* ── push snapshot ── */
function pushSnapshot() {
  history.value.push({
    fps: fps.value,
    memoryUsed: memoryUsed.value,
    memoryLimit: memoryLimit.value,
    consoleErrors: consoleErrors.value,
    consoleWarns: consoleWarns.value,
    canvasErrors: canvasErrors.value,
    physicsHealth: physicsHealth.value,
    chemistryHealth: chemistryHealth.value,
    hasNaN: false,
    hasInfinity: false,
    time: new Date().toLocaleTimeString('en-GB'),
  });
  if (history.value.length > 60) history.value.shift();
}

/* ── public API ── */
export function useExperimentMonitor() {
  onMounted(() => {
    hookConsole();
    windowErrorHandler = (e: ErrorEvent) => onWindowError(e);
    window.addEventListener('error', windowErrorHandler);
    hookCanvas();
    rafId = requestAnimationFrame(tick);
    memTimer = window.setInterval(readMemory, 2000);
    historyTimer = window.setInterval(pushSnapshot, 5000);
  });

  onUnmounted(() => {
    cancelAnimationFrame(rafId);
    clearInterval(memTimer);
    clearInterval(historyTimer);
    unhookConsole();
    if (windowErrorHandler) {
      window.removeEventListener('error', windowErrorHandler);
      windowErrorHandler = null;
    }
  });

  return {
    fps,
    memoryUsed,
    memoryLimit,
    consoleErrors,
    consoleWarns,
    canvasErrors,
    physicsHealth,
    chemistryHealth,
    logs,
    history,
  };
}

/* ── helper for experiment code to push values ── */
export function pushPhysicsValues(values: number[]) {
  (window as Window & { __PHYSICS_VALUES__?: number[] }).__PHYSICS_VALUES__ = values;
}
