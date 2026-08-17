import { reactive, ref } from 'vue'
import { useAnomalyWatcher } from '../../../../composables/experiment/useAnomalyWatcher'
import {
  toRad,
  calcCentripetal,
  calcEquilibrium,
  type NetForceResult,
  type CentripetalResult,
} from '../../../../composables/netforce/netforceUtils'

export interface CustomForce {
  id: number
  magnitude: number
  angle: number
  label: string
}

export interface NetForceParams {
  mode: 'equilibrium' | 'centripetal'
  mass: number
  g: number
  appliedForce: number
  appliedAngle: number
  mu: number
  surfaceAngle: number
  tension: number
  tensionAngle: number
  radius: number
  angularVelocity: number
  customForces: CustomForce[]
}

export interface NetForceState {
  running: boolean
  paused: boolean
  t: number
  angle: number
  position: number
  velocity: number
  settled: boolean
  motionState: 'rest' | 'sliding' | 'equilibrium'
}

export interface NetForceMeasured {
  netForceX: number | null
  netForceY: number | null
  netForceMag: number | null
  netForceDir: number | null
  normalForce: number | null
  frictionForce: number | null
  maxStaticFriction: number | null
  centripetalForce: number | null
  centripetalAcc: number | null
  tensionForce: number | null
  isBalanced: boolean | null
  isStatic: boolean | null
  isSliding: boolean | null
  motionState: 'rest' | 'sliding' | 'equilibrium' | null
  linearVelocity: number | null
  period: number | null
}

export function useNetForcePhysics(params: NetForceParams) {
  const watcher = useAnomalyWatcher('netforce')
  const sim = reactive<NetForceState>({
    running: false,
    paused: false,
    t: 0,
    angle: 0,
    position: 0,
    velocity: 0,
    settled: false,
    motionState: 'rest',
  })

  const measured = ref<NetForceMeasured>({
    netForceX: null, netForceY: null, netForceMag: null, netForceDir: null,
    normalForce: null, frictionForce: null, maxStaticFriction: null,
    centripetalForce: null, centripetalAcc: null, tensionForce: null,
    isBalanced: null, isStatic: null, isSliding: null, motionState: null,
    linearVelocity: null, period: null,
  })

  function computeEquilibrium(): NetForceResult {
    const eq = calcEquilibrium(
      params.mass, params.g, params.appliedForce, params.appliedAngle,
      params.mu, params.surfaceAngle, params.tension, params.tensionAngle,
      params.customForces,
    )
    measured.value = {
      netForceX: Number(eq.netForce.fx.toFixed(4)),
      netForceY: Number(eq.netForce.fy.toFixed(4)),
      netForceMag: Number(eq.netForce.mag.toFixed(4)),
      netForceDir: Number(eq.netForce.dir.toFixed(2)),
      normalForce: Number(eq.normalForce.toFixed(3)),
      frictionForce: Number(eq.frictionForce.toFixed(3)),
      maxStaticFriction: Number(eq.maxStaticFriction.toFixed(3)),
      centripetalForce: null,
      centripetalAcc: null,
      tensionForce: params.tension > 0 ? params.tension : null,
      isBalanced: eq.isBalanced,
      isStatic: eq.isStatic,
      isSliding: eq.isSliding,
      motionState: eq.isBalanced ? 'equilibrium' : eq.isStatic ? 'rest' : 'sliding',
      linearVelocity: null,
      period: null,
    }
    return eq.netForce
  }

  function computeCentripetal(): CentripetalResult {
    const c = calcCentripetal(params.mass, params.angularVelocity, params.radius)
    measured.value = {
      netForceX: null, netForceY: null,
      netForceMag: Number(c.fc.toFixed(4)),
      netForceDir: null,
      normalForce: null, frictionForce: null, maxStaticFriction: null,
      centripetalForce: Number(c.fc.toFixed(4)),
      centripetalAcc: Number(c.ac.toFixed(4)),
      tensionForce: Number(c.fc.toFixed(4)),
      isBalanced: false,
      isStatic: null, isSliding: null, motionState: null,
      linearVelocity: Number(c.v.toFixed(4)),
      period: Number(c.period.toFixed(4)),
    }
    return c
  }

  function step(dt: number, speed: number = 1) {
    if (!sim.running || sim.paused) return
    const sDt = dt * speed
    sim.t += sDt

    if (params.mode === 'equilibrium') {
      const eq = calcEquilibrium(
        params.mass, params.g, params.appliedForce, params.appliedAngle,
        params.mu, params.surfaceAngle, params.tension, params.tensionAngle,
        params.customForces,
      )
      const surfRad = toRad(params.surfaceAngle)
      const tx = Math.cos(surfRad), ty = Math.sin(surfRad)
      // Parallel net force (excluding friction) = totalParallel
      // If static friction holds → object stays at rest
      // If sliding → kinetic friction applies, object accelerates
      if (eq.isStatic && Math.abs(sim.velocity) < 0.001) {
        // Object at rest, static friction balances all forces
        sim.velocity = 0
        sim.motionState = eq.isBalanced ? 'equilibrium' : 'rest'
        sim.settled = eq.isBalanced
      } else {
        // Object is sliding — use net force including kinetic friction
        const parallelNet = eq.netForce.fx * tx + eq.netForce.fy * ty
        const a = parallelNet / params.mass
        sim.velocity += a * sDt
        sim.position += sim.velocity * sDt
        sim.motionState = 'sliding'
        // Settle if velocity drops to ~0 and forces are balanced
        if (Math.abs(sim.velocity) < 0.001 && eq.isBalanced) {
          sim.velocity = 0
          sim.settled = true
          sim.motionState = 'equilibrium'
        }
      }
      // Update measured with motion state
      measured.value = {
        ...measured.value,
        motionState: sim.motionState,
        isStatic: eq.isStatic,
        isSliding: eq.isSliding,
        isBalanced: eq.isBalanced,
      }
      // Safety: if running too long without settling, force settle
      if (sim.t > 15) sim.settled = true
    } else {
      computeCentripetal()
      sim.angle += params.angularVelocity * sDt
      if (sim.angle > Math.PI * 2) sim.angle -= Math.PI * 2
    }

    watcher.inspect({ t: sim.t, angle: sim.angle, pos: sim.position, vel: sim.velocity, mass: params.mass })
  }

  function start() {
    sim.running = true
    sim.paused = false
    sim.t = 0
    sim.angle = 0
    sim.position = 0
    sim.velocity = 0
    sim.settled = false
    sim.motionState = 'rest'
    if (params.mode === 'equilibrium') computeEquilibrium()
    else computeCentripetal()
  }

  function stop() { sim.running = false }
  function togglePause() { sim.paused = !sim.paused }

  function reset() {
    sim.running = false
    sim.paused = false
    sim.t = 0
    sim.angle = 0
    sim.position = 0
    sim.velocity = 0
    sim.settled = false
    sim.motionState = 'rest'
    measured.value = {
      netForceX: null, netForceY: null, netForceMag: null, netForceDir: null,
      normalForce: null, frictionForce: null, maxStaticFriction: null,
      centripetalForce: null, centripetalAcc: null, tensionForce: null,
      isBalanced: null, isStatic: null, isSliding: null, motionState: null,
      linearVelocity: null, period: null,
    }
  }

  function updateMeasurements() {
    if (params.mode === 'equilibrium') computeEquilibrium()
    else computeCentripetal()
  }

  return { sim, measured, step, start, stop, togglePause, reset, updateMeasurements }
}
