import { reactive, ref } from 'vue'
import { calculateInclinedSummary, inclinedStep, inclinedStepWithDrag, toRad } from '../../../../composables/inclined/inclinedUtils'

export interface InclinedParams {
  thetaDeg: number
  length: number
  mass: number
  g: number
  mu: number
  airResistance: boolean
  bodyTypeId: string
  cd: number
  area: number
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
  dragForce: number | null
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
    dragForce: null,
  })

  let _a = 0

  function step(dt: number, speed: number = 1) {
    if (!sim.running || sim.paused || sim.arrived) return
    const sDt = dt * speed
    sim.t += sDt

    if (!params.airResistance) {
      const next = inclinedStep(sim.s, sim.v, sDt, _a)
      sim.s = next.s
      sim.v = next.v
    } else {
      const thetaRad = toRad(params.thetaDeg)
      const sin = Math.sin(thetaRad)
      const cos = Math.cos(thetaRad)
      const next = inclinedStepWithDrag(sim.s, sim.v, sDt, params.g, sin, params.mu, cos, params.mass, params.cd, params.area)
      sim.s = next.s
      sim.v = next.v
    }

    if (sim.s >= params.length) {
      sim.s = params.length
      sim.arrived = true
      const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
      measured.value = {
        acceleration: summary.acceleration,
        timeOfArrival: sim.t,
        finalVelocity: sim.v,
        normalForce: summary.normalForce,
        parallelForce: summary.parallelForce,
        frictionForce: summary.frictionForce,
        dragForce: summary.dragForce,
      }
    }
  }

  function start() {
    const summary = calculateInclinedSummary(params.thetaDeg, params.length, params.mass, params.g, params.mu, params.airResistance, params.cd, params.area)
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
      dragForce: null,
    }
  }

  function stop() { sim.running = false }
  function togglePause() { sim.paused = !sim.paused }

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
      dragForce: null,
    }
  }

  return { sim, step, start, stop, togglePause, reset, measured }
}
