import { reactive, ref } from 'vue';
import type { RunnerState } from '../types';

export interface RunnerOptions {
  /** called every frame with current simulation time */
  onTick: (dt: number) => void;
  /** called every frame for rendering */
  onRender: () => void;
}

export function useExperimentRunner(options: RunnerOptions) {
  const state = reactive<RunnerState>({
    running: false,
    paused: false,
    t: 0,
    speedMultiplier: 1,
    signalSeries: [],
    trail: [],
  });

  const rafId = ref<number | null>(null);

  function start() {
    if (rafId.value) cancelAnimationFrame(rafId.value);
    state.running = true;
    state.paused = false;
    state.t = 0;
    state.signalSeries = [];
    state.trail = [];
    rafId.value = requestAnimationFrame(loop);
  }

  function pause() {
    state.paused = !state.paused;
    if (!state.paused) {
      rafId.value = requestAnimationFrame(loop);
    }
  }

  function stop() {
    if (rafId.value) cancelAnimationFrame(rafId.value);
    rafId.value = null;
    state.running = false;
    state.paused = false;
  }

  function reset() {
    stop();
    state.t = 0;
    state.signalSeries = [];
    state.trail = [];
  }

  let lastFrameTime = 0;
  function loop(time: number) {
    if (!state.running || state.paused) return;

    const dt = lastFrameTime ? (time - lastFrameTime) / 1000 : 0;
    lastFrameTime = time;

    if (dt > 0 && dt < 0.1) {
      state.t += dt * state.speedMultiplier;
      options.onTick(dt * state.speedMultiplier);
    }

    options.onRender();
    rafId.value = requestAnimationFrame(loop);
  }

  return {
    state,
    start,
    pause,
    stop,
    reset,
  };
}
