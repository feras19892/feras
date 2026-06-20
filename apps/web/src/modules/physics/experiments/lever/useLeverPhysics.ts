import { reactive, computed } from 'vue'
import {
  calculateNetTorque,
  calculateTilt,
  snapPosition,
  isBalanced,
  maxReferenceTorque,
  ballColor,
  forceColor,
  createLeverBall,
  createLeverForce,
  resetLeverIdCounter,
  type LeverBall,
  type LeverForce,
} from '../../../../composables/lever/leverUtils'

export interface LeverParams {
  beamLength: number
  g: number
  maxTiltDeg: number
  snapStep: number
}

export interface LeverState {
  running: boolean
  paused: boolean
  tiltDeg: number
  netTorque: number
  isBalanced: boolean
  balls: LeverBall[]
  forces: LeverForce[]
  nextId: number
}

export function useLeverPhysics(params: LeverParams) {
  const state = reactive<LeverState>({
    running: false,
    paused: false,
    tiltDeg: 0,
    netTorque: 0,
    isBalanced: true,
    balls: [],
    forces: [],
    nextId: 1,
  })

  const maxTorque = computed(() => maxReferenceTorque(params.beamLength, params.g))

  function recalc() {
    state.netTorque = calculateNetTorque(state.balls, state.forces, params.g)
    state.tiltDeg = calculateTilt(state.netTorque, maxTorque.value, params.maxTiltDeg)
    state.isBalanced = isBalanced(state.netTorque)
  }

  function addBall(mass: number, x: number, isUnknown = false): number {
    const snapped = snapPosition(x, params.snapStep, params.beamLength)
    const lb = createLeverBall(mass, snapped, state.nextId++, isUnknown)
    state.balls.push(lb)
    recalc()
    return lb.id
  }

  function removeBall(id: number) {
    state.balls = state.balls.filter(b => b.id !== id)
    recalc()
  }

  function moveBall(id: number, x: number) {
    const b = state.balls.find(ball => ball.id === id)
    if (!b) return
    b.x = snapPosition(x, params.snapStep, params.beamLength)
    recalc()
  }

  function setBallMass(id: number, mass: number) {
    const b = state.balls.find(ball => ball.id === id)
    if (!b) return
    b.mass = Math.max(0.1, mass)
    b.color = ballColor(b.mass)
    recalc()
  }

  // === Force methods ===
  function addForce(force: number, x: number, direction: 1 | -1 = -1, isUnknown = false): number {
    const snapped = snapPosition(x, params.snapStep, params.beamLength)
    const lf = createLeverForce(force, snapped, direction, state.nextId++, isUnknown)
    state.forces.push(lf)
    recalc()
    return lf.id
  }

  function removeForce(id: number) {
    state.forces = state.forces.filter(f => f.id !== id)
    recalc()
  }

  function moveForce(id: number, x: number) {
    const f = state.forces.find(force => force.id === id)
    if (!f) return
    f.x = snapPosition(x, params.snapStep, params.beamLength)
    recalc()
  }

  function setForceValue(id: number, force: number) {
    const f = state.forces.find(item => item.id === id)
    if (!f) return
    f.force = Math.max(0, Math.min(100, force))
    f.color = forceColor(f.force, f.direction)
    recalc()
  }

  function setForceDirection(id: number, direction: 1 | -1) {
    const f = state.forces.find(item => item.id === id)
    if (!f) return
    f.direction = direction
    f.color = forceColor(f.force, direction)
    recalc()
  }

  function toggleForceDirection(id: number) {
    const f = state.forces.find(item => item.id === id)
    if (!f) return
    f.direction = f.direction === 1 ? -1 : 1
    f.color = forceColor(f.force, f.direction)
    recalc()
  }

  function togglePause() {
    if (!state.running) {
      state.running = true
      state.paused = false
    } else {
      state.paused = !state.paused
    }
  }

  function stop() {
    state.running = false
    state.paused = false
  }

  function reset() {
    stop()
    state.balls = []
    state.forces = []
    state.tiltDeg = 0
    state.netTorque = 0
    state.isBalanced = true
    state.nextId = 1
    resetLeverIdCounter()
  }

  function step() {
    recalc()
  }

  return {
    state,
    addBall,
    removeBall,
    moveBall,
    setBallMass,
    addForce,
    removeForce,
    moveForce,
    setForceValue,
    setForceDirection,
    toggleForceDirection,
    togglePause,
    stop,
    reset,
    step,
  }
}
