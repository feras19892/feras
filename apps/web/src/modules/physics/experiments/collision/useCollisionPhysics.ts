import { reactive } from 'vue'
import {
  detectCollision,
  separateBalls,
  computeFinalVelocities,
  computeMomentum,
  computeTotalKE,
  computeEnergyLoss,
} from '../../../../composables/collision/collisionUtils'

export interface CollisionParams {
  m1: number
  m2: number
  v1i: number
  v2i: number
  r1: number
  r2: number
  e: number
}

export interface CollisionState {
  running: boolean
  paused: boolean
  t: number
  collided: boolean
  x1: number
  x2: number
  v1: number
  v2: number
  v1f: number | null
  v2f: number | null
  Pi: number | null
  Pf: number | null
  KEi: number | null
  KEf: number | null
  lossPercent: number | null
}

export function useCollisionPhysics(params: CollisionParams) {
  const sim = reactive<CollisionState>({
    running: false,
    paused: false,
    t: 0,
    collided: false,
    x1: -2,
    x2: 2,
    v1: params.v1i,
    v2: params.v2i,
    v1f: null,
    v2f: null,
    Pi: null,
    Pf: null,
    KEi: null,
    KEf: null,
    lossPercent: null,
  })

  function step(dt: number, speed: number = 1) {
    if (!sim.running || sim.paused) return
    const sDt = dt * speed
    sim.t += sDt
    sim.x1 += sim.v1 * sDt
    sim.x2 += sim.v2 * sDt

    if (!sim.collided && detectCollision(sim.x1, sim.x2, params.r1, params.r2)) {
      const sep = separateBalls(sim.x1, sim.x2, params.r1, params.r2)
      sim.x1 = sep.x1
      sim.x2 = sep.x2

      const { v1f, v2f } = computeFinalVelocities(params.m1, params.m2, sim.v1, sim.v2, params.e)
      sim.v1f = v1f
      sim.v2f = v2f
      sim.v1 = v1f
      sim.v2 = v2f
      sim.collided = true

      sim.Pi = computeMomentum(params.m1, params.v1i) + computeMomentum(params.m2, params.v2i)
      sim.Pf = computeMomentum(params.m1, v1f) + computeMomentum(params.m2, v2f)
      sim.KEi = computeTotalKE(params.m1, params.v1i, params.m2, params.v2i)
      sim.KEf = computeTotalKE(params.m1, v1f, params.m2, v2f)
      sim.lossPercent = computeEnergyLoss(sim.KEi, sim.KEf)
    }
  }

  function start() {
    sim.running = true
    sim.paused = false
    sim.t = 0
    sim.collided = false
    sim.x1 = -2
    sim.x2 = 2
    sim.v1 = params.v1i
    sim.v2 = params.v2i
    sim.v1f = null
    sim.v2f = null
    sim.Pi = null
    sim.Pf = null
    sim.KEi = null
    sim.KEf = null
    sim.lossPercent = null
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
    sim.collided = false
    sim.x1 = -2
    sim.x2 = 2
    sim.v1 = params.v1i
    sim.v2 = params.v2i
    sim.v1f = null
    sim.v2f = null
    sim.Pi = null
    sim.Pf = null
    sim.KEi = null
    sim.KEf = null
    sim.lossPercent = null
  }

  return { sim, step, start, stop, togglePause, reset }
}
