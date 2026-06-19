import { reactive, ref, type Ref } from 'vue'
import { calculateInclinedSummary, inclinedStep } from '../../../../composables/inclined/inclinedUtils'

export interface InclinedParams {
  thetaDeg: number
  length: number
  mass: number
  g: number
  mu: number
}

export interface InclinedState {
  running: boolean
  paused: boolean
  t: number
  s: number
  v: number
  arrived: boolean
}

export interface InclinedMeasured {
  acceleration: number | null
  timeOfArrival: number | null
  finalVelocity: number | null
  normalForce: number | null
  parallelForce: number | null
  frictionForce: number | null
}

export function useInclinedPhysics(params: InclinedParams) {
  const sim = reactive<InclinedState>({
    running: false,
    paused: false,
    t: 0,
    s: 0,
    v: 0,
    arrived: false,
  })

  const measured = ref<InclinedMeasured>({
    acceleration: null,
    timeOfArrival: null,
    finalVelocity: null,
    normalForce: null,
    parallelForce: null,
    frictionForce: null,
  })

  let _a = 0

  function step(dt: number, speed: number = 1) {
    if (!sim.running || sim.paused || sim.arrived) return
    const sDt = dt * speed
    sim.t += sDt

    const next = inclinedStep(sim.s, sim.v, sDt, _a)
    sim.s = next.s
    sim.v = next.v

    if (sim.s >= params.length) {
      sim.s = params.length
      sim.arrived = true
      const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu)
      measured.value = {
        acceleration: summary.acceleration,
        timeOfArrival: sim.t,
        finalVelocity: sim.v,
        normalForce: summary.normalForce,
        parallelForce: summary.parallelForce,
        frictionForce: summary.frictionForce,
      }
    }
  }

  function start() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu)
    _a = summary.acceleration

    sim.running = true
    sim.paused = false
    sim.t = 0
    sim.s = 0
    sim.v = 0
    sim.arrived = false
    measured.value = {
      acceleration: null,
      timeOfArrival: null,
      finalVelocity: null,
      normalForce: null,
      parallelForce: null,
      frictionForce: null,
    }
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
    sim.s = 0
    sim.v = 0
    sim.arrived = false
    measured.value = {
      acceleration: null,
      timeOfArrival: null,
      finalVelocity: null,
      normalForce: null,
      parallelForce: null,
      frictionForce: null,
    }
  }

  return { sim, step, start, stop, togglePause, reset, measured }
}
