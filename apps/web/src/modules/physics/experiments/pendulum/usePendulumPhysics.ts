import { computed, reactive } from 'vue'
import { useAnomalyWatcher } from '../../../../composables/experiment/useAnomalyWatcher'
import { computeDragAcceleration } from '../../../../composables/pendulum/usePendulumDrag'

export interface PendulumParams {
  length: number
  g: number
  theta0: number
  theta0Deg: number
  mass: number
  damping: number
  measureCycles: number
  bobRadius: number
  airDensity: number
  springK: number
  springRestLength: number
}

export interface PendulumState {
  running: boolean
  paused: boolean
  t: number
  theta: number
  omega: number
  zeroCrossings: number[]
  measurementPeriod: number | null
  signalSeries: { t: number; theta: number }[]
}

export function usePendulumPhysics(params: PendulumParams) {
  const watcher = useAnomalyWatcher('pendulum')
  const state = reactive<PendulumState>({
    running: false, paused: false, t: 0,
    theta: params.theta0, omega: 0,
    zeroCrossings: [], measurementPeriod: null, signalSeries: [],
  })

  function deriv(theta: number, omega: number) {
    const v = omega * params.length
    const dragAlpha = computeDragAcceleration(v, params.mass, params.length, { bobRadius: params.bobRadius, airDensity: params.airDensity })
    return {
      dtheta: omega,
      domega: -(params.g / params.length) * Math.sin(theta) - params.damping * omega + dragAlpha,
    }
  }

  function rk4Step(theta: number, omega: number, dt: number) {
    const k1 = deriv(theta, omega)
    const k2 = deriv(theta + 0.5 * dt * k1.dtheta, omega + 0.5 * dt * k1.domega)
    const k3 = deriv(theta + 0.5 * dt * k2.dtheta, omega + 0.5 * dt * k2.domega)
    const k4 = deriv(theta + dt * k3.dtheta, omega + dt * k3.domega)
    return {
      theta: theta + (dt / 6) * (k1.dtheta + 2 * k2.dtheta + 2 * k3.dtheta + k4.dtheta),
      omega: omega + (dt / 6) * (k1.domega + 2 * k2.domega + 2 * k3.domega + k4.domega),
    }
  }

  function trackCrossings(prevTheta: number, newTheta: number, prevTime: number, newTime: number) {
    if ((prevTheta > 0 && newTheta <= 0) || (prevTheta < 0 && newTheta >= 0)) {
      const ratio = Math.abs(prevTheta - newTheta) < 1e-12 ? 0.5 : prevTheta / (prevTheta - newTheta)
      const ct = prevTime + (newTime - prevTime) * ratio
      state.zeroCrossings.push(ct)
      if (state.zeroCrossings.length > 30) state.zeroCrossings.shift()
      const cycles = Math.min(20, Math.max(1, params.measureCycles || 5))
      if (state.zeroCrossings.length >= cycles + 2) {
        const start = Math.max(0, state.zeroCrossings.length - (cycles + 2))
        const periods: number[] = []
        for (let i = start; i < state.zeroCrossings.length - 2; i++) {
          periods.push(state.zeroCrossings[i + 2] - state.zeroCrossings[i])
        }
        state.measurementPeriod = periods.reduce((a, b) => a + b, 0) / periods.length
      }
    }
  }

  function step(dt: number, speedMultiplier: number = 1) {
    const omega0 = Math.sqrt(params.g / Math.max(params.length, 1e-9))
    const safeDt = Math.min(1 / 240, 0.15 / omega0)
    let accum = dt, steps = 0
    while (accum > 1e-12 && steps < 300) {
      steps++
      const sdt = Math.min(safeDt, accum)
      const prevTheta = state.theta, prevTime = state.t
      const next = rk4Step(state.theta, state.omega, sdt * speedMultiplier)
      state.theta = next.theta; state.omega = next.omega; state.t += sdt * speedMultiplier
      trackCrossings(prevTheta, state.theta, prevTime, state.t)
      accum -= sdt
    }
    state.signalSeries.push({ t: state.t, theta: state.theta })
    if (state.signalSeries.length > 1500) state.signalSeries.shift()
    if (params.damping > 0.001 && state.t > 0.3 && Math.abs(state.theta) < 0.01 && Math.abs(state.omega) < 0.005) stop()

    watcher.inspect({ t: state.t, theta: state.theta, omega: state.omega, mass: params.mass })
  }

  function start() {
    state.running = true; state.paused = false
    state.theta = params.theta0; state.omega = 0; state.t = 0
    state.zeroCrossings = []; state.measurementPeriod = null; state.signalSeries = []
  }

  function togglePause() { if (!state.running) return start(); state.paused = !state.paused }
  function stop() { state.running = false; state.paused = false }
  function reset() { stop(); state.t = 0; state.theta = params.theta0; state.omega = 0; state.zeroCrossings = []; state.measurementPeriod = null; state.signalSeries = [] }

  const theoreticalPeriod = computed(() => {
    if (params.length <= 1e-9 || params.g <= 1e-9) return null
    return 2 * Math.PI * Math.sqrt(params.length / params.g)
  })

  const measured = computed(() => {
    const T = state.measurementPeriod
    if (!T) return { T: null as number|null, f: null as number|null, omega: null as number|null, gCalc: null as number|null }
    return { T, f: 1 / T, omega: (2 * Math.PI) / T, gCalc: (4 * Math.PI * Math.PI * params.length) / (T * T) }
  })

  function getCutState() {
    const L = params.length
    const theta = state.theta
    const omega = state.omega
    const px = L * Math.sin(theta)
    const py = -L * Math.cos(theta)
    const vx = L * omega * Math.cos(theta)
    const vy = L * omega * Math.sin(theta)
    return { x: px, y: py, vx, vy }
  }

  return { state, step, start, stop, togglePause, reset, theoreticalPeriod, measured, getCutState }
}
