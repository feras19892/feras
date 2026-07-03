import { computed, reactive } from 'vue';
import { useAnomalyWatcher } from '../../../../composables/experiment/useAnomalyWatcher';

export interface SpringParams {
  mass: number;
  k: number;
  amplitude: number;
  damping: number;
  measureCycles: number;
  dampingModel?: 'linear' | 'quadratic';
  forcingEnabled?: boolean;
  F0?: number;
  omegaDrive?: number;
  springMass?: number; // كتلة النابض الفعلية (لحساب m_eff ≈ m_spring/3)
}

export interface SpringState {
  running: boolean;
  paused: boolean;
  t: number;
  x: number;
  v: number;
  zeroCrossings: number[];
  measurementPeriod: number | null;
  signalSeries: { t: number; x: number }[];
  trail: number[];
}

export function useSpringPhysics(params: SpringParams) {
  const watcher = useAnomalyWatcher('spring');
  const state = reactive<SpringState>({
    running: false,
    paused: false,
    t: 0,
    x: 0,
    v: 0,
    zeroCrossings: [],
    measurementPeriod: null,
    signalSeries: [],
    trail: [],
  });

  function derivatives(x: number, v: number, tLocal: number) {
    const m = effectiveMass.value;
    const k = params.k;
    const c = params.damping;
    const model = params.dampingModel ?? 'linear';
    const dampingForce = model === 'quadratic' ? -c * Math.abs(v) * v : -c * v;
    const springForce = -k * x;
    const forcingForce = params.forcingEnabled
      ? (params.F0 ?? 0) * Math.sin((params.omegaDrive ?? 0) * tLocal)
      : 0;
    return {
      dx: v,
      dv: (springForce + dampingForce + forcingForce) / m,
    };
  }

  function rk4Step(x: number, v: number, t: number, dt: number): { x: number; v: number } {
    const k1 = derivatives(x, v, t);
    const k2 = derivatives(x + 0.5 * dt * k1.dx, v + 0.5 * dt * k1.dv, t + 0.5 * dt);
    const k3 = derivatives(x + 0.5 * dt * k2.dx, v + 0.5 * dt * k2.dv, t + 0.5 * dt);
    const k4 = derivatives(x + dt * k3.dx, v + dt * k3.dv, t + dt);
    return {
      x: x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx),
      v: v + (dt / 6) * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv),
    };
  }

  function trackCrossings(prevX: number, newX: number, prevTime: number, newTime: number) {
    if ((prevX > 0 && newX <= 0) || (prevX < 0 && newX >= 0)) {
      const ratio = Math.abs(prevX - newX) < 1e-12 ? 0.5 : prevX / (prevX - newX);
      const crossingTime = prevTime + (newTime - prevTime) * ratio;
      state.zeroCrossings.push(crossingTime);
      if (state.zeroCrossings.length > 30) state.zeroCrossings.shift();
      const cycles = Math.min(20, Math.max(1, params.measureCycles || 5));
      if (state.zeroCrossings.length >= cycles + 2) {
        const start = Math.max(0, state.zeroCrossings.length - (cycles + 2));
        const periods: number[] = [];
        for (let i = start; i < state.zeroCrossings.length - 2; i++) {
          periods.push(state.zeroCrossings[i + 2] - state.zeroCrossings[i]);
        }
        state.measurementPeriod = periods.reduce((a, b) => a + b, 0) / periods.length;
      }
    }
  }

  function step(dt: number, speedMultiplier: number = 1) {
    const omega0 = Math.sqrt(params.k / Math.max(params.mass, 1e-9));
    const safeDt = Math.min(1 / 240, 0.15 / omega0);
    let accum = dt;
    let steps = 0;
    while (accum > 1e-12 && steps < 300) {
      steps++;
      const sdt = Math.min(safeDt, accum);
      const prevX = state.x;
      const prevTime = state.t;
      const next = rk4Step(state.x, state.v, state.t, sdt * speedMultiplier);
      state.x = next.x;
      state.v = next.v;
      state.t += sdt * speedMultiplier;
      trackCrossings(prevX, state.x, prevTime, state.t);
      accum -= sdt;
    }

    state.signalSeries = [...state.signalSeries.slice(-1499), { t: state.t, x: state.x }];

    state.trail.push(state.x);
    if (state.trail.length > 400) state.trail.shift();

    // Auto-stop when damping is active and no forcing
    const stillDriven = !!params.forcingEnabled && (params.F0 ?? 0) > 1e-6;
    const fr = Math.abs(params.k * state.x);
    if (!stillDriven && params.damping > 0.001 && state.t > 0.3 && fr < 0.01 && Math.abs(state.v) < 0.005) {
      stop();
    }

    watcher.inspect({ t: state.t, x: state.x, v: state.v, mass: params.mass });
  }

  function start() {
    state.running = true;
    state.paused = false;
    // Keep current displacement (set by pull/push), only reset if no mass
    if (params.mass <= 1e-6) state.x = 0;
    state.v = 0;
    state.t = 0;
    state.trail = [];
    state.zeroCrossings = [];
    state.measurementPeriod = null;
    state.signalSeries = [];
  }

  function togglePause() {
    if (!state.running) return start();
    state.paused = !state.paused;
  }

  function stop() {
    state.running = false;
    state.paused = false;
  }

  function reset() {
    stop();
    state.t = 0;
    state.x = 0;  // equilibrium position (not stretched)
    state.v = 0;
    state.trail = [];
    state.zeroCrossings = [];
    state.measurementPeriod = null;
    state.signalSeries = [];
  }

  const effectiveMass = computed(() => {
    const mEff = (params.springMass ?? 0) / 3;
    return params.mass + mEff;
  });

  const theoreticalPeriod = computed(() => {
    const mTotal = effectiveMass.value;
    if (mTotal <= 1e-9 || params.k <= 1e-9) return null;
    return 2 * Math.PI * Math.sqrt(mTotal / params.k);
  });

  const measured = computed(() => {
    const T = state.measurementPeriod;
    if (!T) return { T: null, f: null, omega: null, kCalc: null, kCalcEff: null };
    const mTotal = effectiveMass.value;
    return {
      T,
      f: 1 / T,
      omega: (2 * Math.PI) / T,
      kCalc: (4 * Math.PI * Math.PI * params.mass) / (T * T),
      kCalcEff: (4 * Math.PI * Math.PI * mTotal) / (T * T),
    };
  });

  return { state, step, start, stop, togglePause, reset, theoreticalPeriod, measured, effectiveMass };
}
