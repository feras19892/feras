import { computed, reactive } from 'vue'
import { useAnomalyWatcher } from '../../../../composables/experiment/useAnomalyWatcher'
import { calcFlightTime, calcMaxHeight, calcRange } from './projectileTheoretical'

export interface ProjectileParams {
  v0: number
  angleDeg: number
  g: number
  x0: number
  y0: number
  targetX: number
  targetY: number
  targetRadius: number
  targetVisible: boolean
  targetMode: boolean
  dragCoeff: number
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
  targetHit: boolean
  distanceToTarget: number | null
  maxHeightReached: number
  landingSpeed: number
}

export function useProjectilePhysics(params: ProjectileParams) {
  const watcher = useAnomalyWatcher('projectile')
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
    targetHit: false,
    distanceToTarget: null,
    maxHeightReached: 0,
    landingSpeed: 0,
  })

  function toRad(deg: number) { return (deg * Math.PI) / 180 }

  function step(dt: number, speedMultiplier: number = 1) {
    if (state.landed) return

    const sdt = dt * speedMultiplier

    // Linear air drag: a_drag = -k * v
    const ax = -params.dragCoeff * state.vx
    const ay = -params.g - params.dragCoeff * state.vy

    // Euler integration
    const prevX = state.x
    const prevY = state.y
    state.vx += ax * sdt
    state.vy += ay * sdt
    state.x += state.vx * sdt
    state.y += state.vy * sdt
    state.t += sdt

    // Ground collision: interpolate exact landing point
    if (state.y <= 0) {
      state.landed = true
      state.y = 0
      if (prevY > 0) {
        const ratio = prevY / (prevY - state.y)
        state.x = prevX + (state.x - prevX) * ratio
      }
      state.landingSpeed = Math.sqrt(state.vx * state.vx + state.vy * state.vy)
      state.vy = 0
      stop()
      return
    }

    if (state.y > state.maxHeightReached) state.maxHeightReached = state.y

    // Target collision detection
    if (params.targetMode && params.targetVisible) {
      const dx = state.x - params.targetX
      const dy = state.y - params.targetY
      state.distanceToTarget = Math.sqrt(dx * dx + dy * dy)
      state.targetHit = state.distanceToTarget <= params.targetRadius
      if (state.targetHit) {
        state.landed = true
        state.running = false
        state.landingSpeed = Math.sqrt(state.vx * state.vx + state.vy * state.vy)
        return
      }
    }

    state.trail.push({ x: state.x, y: state.y })
    if (state.trail.length > 2000) state.trail.shift()

    state.signalSeries = [...state.signalSeries.slice(-1499), { t: state.t, vx: state.vx, vy: state.vy }]

    watcher.inspect({ t: state.t, x: state.x, y: state.y, vx: state.vx, vy: state.vy })
  }

  function start() {
    const rad = toRad(params.angleDeg)
    const v0x = params.v0 * Math.cos(rad)
    const v0y = params.v0 * Math.sin(rad)

    state.running = true
    state.paused = false
    state.landed = false
    state.t = 0
    state.x = params.x0
    state.y = params.y0
    state.vx = v0x
    state.vy = v0y
    state.landingSpeed = 0
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
    state.targetHit = false
    state.distanceToTarget = null
    state.maxHeightReached = 0
    state.landingSpeed = 0
  }

  const measured = computed(() => {
    const rad = toRad(params.angleDeg)
    const g = params.g
    const v0 = params.v0
    const flightTime = g > 0 && v0 > 0 ? calcFlightTime(v0, rad, g) : null
    const maxHeight = g > 0 && v0 > 0 ? calcMaxHeight(v0, rad, g) : null
    const range = g > 0 && v0 > 0 ? calcRange(v0, rad, g) : null
    return { flightTime, maxHeight, range }
  })

  return {
    state,
    step,
    start,
    stop,
    togglePause,
    reset,
    measured,
  }
}
