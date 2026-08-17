import { reactive, ref } from 'vue'
import { useAnomalyWatcher } from '../../../../composables/experiment/useAnomalyWatcher'

export interface FreeFallParams {
  h: number
  g: number
  mass: number
  airResistance: boolean
  dragCoeff: number
}

export interface FreeFallState {
  running: boolean
  paused: boolean
  t: number
  y: number
  vy: number
  landed: boolean
}

export interface FreeFallMeasured {
  flightTime: number | null
  impactVelocity: number | null
}

export function useFreeFallPhysics(params: FreeFallParams) {
  const watcher = useAnomalyWatcher('freefall')
  const sim = reactive<FreeFallState>({
    running: false,
    paused: false,
    t: 0,
    y: params.h,
    vy: 0,
    landed: false,
  })

  const measured = ref<FreeFallMeasured>({ flightTime: null, impactVelocity: null })

  function step(dt: number, speed: number = 1) {
    if (!sim.running || sim.paused || sim.landed) return
    const sDt = dt * speed
    sim.t += sDt

    if (!params.airResistance) {
      sim.y = params.h - 0.5 * params.g * sim.t * sim.t
      sim.vy = -params.g * sim.t
    } else {
      const area = 0.01
      const vMag = Math.abs(sim.vy)
      const drag = 0.5 * 1.225 * area * params.dragCoeff * vMag * vMag
      const netForce = params.g * params.mass - drag
      const a = netForce / Math.max(params.mass, 1e-9)
      sim.vy -= a * sDt
      sim.y += sim.vy * sDt
    }

    if (sim.y <= 0) {
      sim.y = 0
      sim.landed = true
      measured.value = {
        flightTime: sim.t,
        impactVelocity: Math.abs(sim.vy),
      }
    }

    watcher.inspect({ t: sim.t, y: sim.y, vy: sim.vy, mass: params.mass })
  }

  function start() {
    sim.running = true
    sim.paused = false
    sim.t = 0
    sim.y = params.h
    sim.vy = 0
    sim.landed = false
    measured.value = { flightTime: null, impactVelocity: null }
  }

  function stop() {
    sim.running = false
  }

  function togglePause() {
    sim.paused = !sim.paused
  }

  function reset() {
    sim.running = false
    sim.paused = false
    sim.t = 0
    sim.y = params.h
    sim.vy = 0
    sim.landed = false
    measured.value = { flightTime: null, impactVelocity: null }
  }

  return { sim, step, start, stop, togglePause, reset, measured }
}
