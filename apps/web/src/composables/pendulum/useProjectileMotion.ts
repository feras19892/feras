import { reactive } from 'vue'

export interface ProjectileState {
  running: boolean
  t: number
  x: number
  y: number
  vx: number
  vy: number
  trail: { x: number; y: number }[]
}

export interface ProjectileParams {
  g: number
}

export function useProjectileMotion(params: ProjectileParams) {
  const state = reactive<ProjectileState>({
    running: false, t: 0, x: 0, y: 0, vx: 0, vy: 0, trail: [],
  })

  function deriv(vx: number, vy: number) {
    return { dvx: 0, dvy: -params.g, dx: vx, dy: vy }
  }

  function rk4Step(x: number, y: number, vx: number, vy: number, dt: number) {
    const k1 = deriv(vx, vy)
    const k2 = deriv(vx + 0.5 * dt * k1.dvx, vy + 0.5 * dt * k1.dvy)
    const k3 = deriv(vx + 0.5 * dt * k2.dvx, vy + 0.5 * dt * k2.dvy)
    const k4 = deriv(vx + dt * k3.dvx, vy + dt * k3.dvy)
    return {
      x: x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx),
      y: y + (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy),
      vx: vx + (dt / 6) * (k1.dvx + 2 * k2.dvx + 2 * k3.dvx + k4.dvx),
      vy: vy + (dt / 6) * (k1.dvy + 2 * k2.dvy + 2 * k3.dvy + k4.dvy),
    }
  }

  function step(dt: number) {
    const safeDt = Math.min(dt, 1 / 120)
    const next = rk4Step(state.x, state.y, state.vx, state.vy, safeDt)
    state.x = next.x; state.y = next.y; state.vx = next.vx; state.vy = next.vy; state.t += safeDt
    state.trail.push({ x: state.x, y: state.y })
    if (state.trail.length > 400) state.trail.shift()
    if (state.y < -0.01 && state.vy < 0) stop()
  }

  function start(x0: number, y0: number, vx0: number, vy0: number) {
    state.running = true; state.t = 0; state.x = x0; state.y = y0; state.vx = vx0; state.vy = vy0; state.trail = []
  }
  function stop() { state.running = false }
  function reset() { stop(); state.t = 0; state.x = 0; state.y = 0; state.vx = 0; state.vy = 0; state.trail = [] }

  return { state, step, start, stop, reset }
}
