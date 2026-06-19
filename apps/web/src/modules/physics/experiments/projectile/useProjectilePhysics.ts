import { computed, reactive } from 'vue'

export interface ProjectileParams {
  v0: number
  angleDeg: number
  g: number
  x0: number
  y0: number
}

export interface ProjectilePoint {
  x: number
  y: number
}

export interface ProjectileState {
  running: boolean
  paused: boolean
  t: number
  x: number
  y: number
  vx: number
  vy: number
  landed: boolean
  trail: ProjectilePoint[]
  signalSeries: { t: number; vx: number; vy: number }[]
}

export function useProjectilePhysics(params: ProjectileParams) {
  const state = reactive<ProjectileState>({
    running: false,
    paused: false,
    t: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    landed: false,
    trail: [],
    signalSeries: [],
  })

  // Cache initial velocity components
  let initVx = 0
  let initVy = 0
  let initTime = 0

  function toRad(deg: number) { return (deg * Math.PI) / 180 }

  function computePosition(elapsed: number) {
    const x = params.x0 + initVx * elapsed
    const y = params.y0 + initVy * elapsed - 0.5 * params.g * elapsed * elapsed
    const vy = initVy - params.g * elapsed
    return { x, y, vy }
  }

  function step(dt: number, speedMultiplier: number = 1) {
    if (state.landed) return

    const sdt = dt * speedMultiplier
    state.t += sdt

    const elapsed = state.t - initTime
    const pos = computePosition(elapsed)

    // Ground collision: freeze at landing point
    if (pos.y <= 0) {
      state.landed = true
      state.y = 0
      // Interpolate exact landing x
      const prevElapsed = elapsed - sdt
      const prevPos = computePosition(prevElapsed)
      if (prevPos.y > 0 && pos.y <= 0) {
        const ratio = prevPos.y / (prevPos.y - pos.y)
        state.x = prevPos.x + (pos.x - prevPos.x) * ratio
      } else {
        state.x = pos.x
      }
      state.vy = 0
      state.vx = initVx
      stop()
      return
    }

    state.x = pos.x
    state.y = pos.y
    state.vx = initVx
    state.vy = pos.vy

    state.trail.push({ x: state.x, y: state.y })
    if (state.trail.length > 2000) state.trail.shift()

    state.signalSeries = [...state.signalSeries.slice(-1499), { t: state.t, vx: state.vx, vy: state.vy }]
  }

  function start() {
    const rad = toRad(params.angleDeg)
    initVx = params.v0 * Math.cos(rad)
    initVy = params.v0 * Math.sin(rad)
    initTime = 0

    state.running = true
    state.paused = false
    state.landed = false
    state.t = 0
    state.x = params.x0
    state.y = params.y0
    state.vx = initVx
    state.vy = initVy
    state.trail = [{ x: params.x0, y: params.y0 }]
    state.signalSeries = []
  }

  function togglePause() {
    if (!state.running) return start()
    state.paused = !state.paused
  }

  function stop() {
    state.running = false
    state.paused = false
  }

  function reset() {
    stop()
    state.t = 0
    state.x = params.x0
    state.y = params.y0
    state.vx = 0
    state.vy = 0
    state.landed = false
    state.trail = []
    state.signalSeries = []
  }

  const theoreticalFlightTime = computed(() => {
    if (params.v0 <= 0 || params.g <= 0) return null
    const rad = toRad(params.angleDeg)
    return (2 * params.v0 * Math.sin(rad)) / params.g
  })

  const theoreticalMaxHeight = computed(() => {
    if (params.v0 <= 0 || params.g <= 0) return null
    const rad = toRad(params.angleDeg)
    return (Math.pow(params.v0 * Math.sin(rad), 2)) / (2 * params.g)
  })

  const theoreticalRange = computed(() => {
    if (params.v0 <= 0 || params.g <= 0) return null
    const rad = toRad(params.angleDeg)
    return (Math.pow(params.v0, 2) * Math.sin(2 * rad)) / params.g
  })

  const measured = computed(() => {
    const rad = toRad(params.angleDeg)
    const sin = Math.sin(rad)
    const sin2 = Math.sin(2 * rad)
    const v0 = params.v0
    const g = params.g

    const flightTime = g > 0 && v0 > 0 ? (2 * v0 * sin) / g : null
    const maxHeight = g > 0 && v0 > 0 ? (Math.pow(v0 * sin, 2)) / (2 * g) : null
    const range = g > 0 && v0 > 0 ? (Math.pow(v0, 2) * sin2) / g : null

    return { flightTime, maxHeight, range }
  })

  return {
    state,
    step,
    start,
    stop,
    togglePause,
    reset,
    theoreticalFlightTime,
    theoreticalMaxHeight,
    theoreticalRange,
    measured,
  }
}
