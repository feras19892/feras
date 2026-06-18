import { reactive } from 'vue'
import { computeCouplingTorque } from '../../modules/physics/experiments/pendulum/PendulumSpringBridge'

export interface CoupledParams {
  length: number
  g: number
  mass: number
  damping: number
  springK: number
  springRestLength: number
  theta10: number
  theta20: number
}

export interface CoupledState {
  running: boolean
  paused: boolean
  t: number
  theta1: number; omega1: number
  theta2: number; omega2: number
  signalSeries: { t: number; theta1: number; theta2: number }[]
}

export function useCoupledPendulum(params: CoupledParams) {
  const state = reactive<CoupledState>({
    running: false, paused: false, t: 0,
    theta1: params.theta10, omega1: 0,
    theta2: params.theta20, omega2: 0,
    signalSeries: [],
  })

  function deriv(s: { th1: number; w1: number; th2: number; w2: number }) {
    const { torque1, torque2 } = computeCouplingTorque(s.th1, s.th2, params.length, params.mass, {
      springK: params.springK, restLength: params.springRestLength,
    })
    return {
      dth1: s.w1,
      dw1: -(params.g / params.length) * Math.sin(s.th1) - params.damping * s.w1 + torque1,
      dth2: s.w2,
      dw2: -(params.g / params.length) * Math.sin(s.th2) - params.damping * s.w2 + torque2,
    }
  }

  function rk4Step(th1: number, w1: number, th2: number, w2: number, dt: number) {
    const k1 = deriv({ th1, w1, th2, w2 })
    const k2 = deriv({ th1: th1 + 0.5 * dt * k1.dth1, w1: w1 + 0.5 * dt * k1.dw1, th2: th2 + 0.5 * dt * k1.dth2, w2: w2 + 0.5 * dt * k1.dw2 })
    const k3 = deriv({ th1: th1 + 0.5 * dt * k2.dth1, w1: w1 + 0.5 * dt * k2.dw1, th2: th2 + 0.5 * dt * k2.dth2, w2: w2 + 0.5 * dt * k2.dw2 })
    const k4 = deriv({ th1: th1 + dt * k3.dth1, w1: w1 + dt * k3.dw1, th2: th2 + dt * k3.dth2, w2: w2 + dt * k3.dw2 })
    return {
      th1: th1 + (dt / 6) * (k1.dth1 + 2 * k2.dth1 + 2 * k3.dth1 + k4.dth1),
      w1: w1 + (dt / 6) * (k1.dw1 + 2 * k2.dw1 + 2 * k3.dw1 + k4.dw1),
      th2: th2 + (dt / 6) * (k1.dth2 + 2 * k2.dth2 + 2 * k3.dth2 + k4.dth2),
      w2: w2 + (dt / 6) * (k1.dw2 + 2 * k2.dw2 + 2 * k3.dw2 + k4.dw2),
    }
  }

  function step(dt: number, speedMultiplier: number = 1) {
    const omega0 = Math.sqrt(params.g / Math.max(params.length, 1e-9))
    const safeDt = Math.min(1 / 240, 0.15 / omega0)
    let accum = dt, steps = 0
    while (accum > 1e-12 && steps < 300) {
      steps++
      const sdt = Math.min(safeDt, accum)
      const next = rk4Step(state.theta1, state.omega1, state.theta2, state.omega2, sdt * speedMultiplier)
      state.theta1 = next.th1; state.omega1 = next.w1; state.theta2 = next.th2; state.omega2 = next.w2
      state.t += sdt * speedMultiplier; accum -= sdt
    }
    state.signalSeries = [...state.signalSeries.slice(-1499), { t: state.t, theta1: state.theta1, theta2: state.theta2 }]
    if (params.damping > 0.001 && state.t > 0.3 && Math.abs(state.theta1) < 0.01 && Math.abs(state.omega1) < 0.005 && Math.abs(state.theta2) < 0.01 && Math.abs(state.omega2) < 0.005) stop()
  }

  function start() {
    state.running = true; state.paused = false
    state.theta1 = params.theta10; state.omega1 = 0; state.theta2 = params.theta20; state.omega2 = 0; state.t = 0; state.signalSeries = []
  }
  function togglePause() { if (!state.running) return start(); state.paused = !state.paused }
  function stop() { state.running = false; state.paused = false }
  function reset() { stop(); state.t = 0; state.theta1 = params.theta10; state.omega1 = 0; state.theta2 = params.theta20; state.omega2 = 0; state.signalSeries = [] }

  return { state, step, start, stop, togglePause, reset }
}
