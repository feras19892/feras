import type { WorkshopComponent, WorkshopWire, SolveResult, FaultInfo, TransientResult } from './types'
import { solveCircuit, solveCircuitAC, solveCircuitTransient, solveCircuitTransientDC, updateRelayStates } from './solver'
import type { ComputedRef } from 'vue'

export interface SolverContext {
  components: WorkshopComponent[]
  wires: WorkshopWire[]
  solveResult: { value: SolveResult | null }
  error: { value: string }
  faults: { value: FaultInfo[] }
  isACMode: ComputedRef<boolean>
}

export function solve(ctx: SolverContext) {
  if (ctx.isACMode.value) {
    solveAC(ctx)
    solveTransient(ctx)
    return
  }
  let maxIter = 10
  let changed = true
  let stabilized = false
  while (changed && maxIter > 0) {
    const result = solveCircuit(ctx.components, ctx.wires)
    ctx.solveResult.value = result
    for (const comp of ctx.components) {
      comp.voltage = result.componentVoltages.get(comp.id) ?? 0
      comp.current = result.componentCurrents.get(comp.id) ?? 0
    }
    changed = updateRelayStates(ctx.components)
    if (!changed) stabilized = true
    maxIter--
  }
  const finalResult = solveCircuit(ctx.components, ctx.wires)
  ctx.solveResult.value = finalResult
  ctx.faults.value = finalResult.faults
  for (const comp of ctx.components) {
    comp.voltage = finalResult.componentVoltages.get(comp.id) ?? 0
    comp.current = finalResult.componentCurrents.get(comp.id) ?? 0
  }
  if (!stabilized) {
    ctx.error.value = 'ew.fault.relayChattering'
  } else if (!finalResult.converged) {
    ctx.error.value = 'ew.solverNotConverged'
  } else {
    ctx.error.value = ''
  }
}

export function solveAC(ctx: SolverContext) {
  if (!ctx.isACMode.value) return
  const result = solveCircuitAC(ctx.components, ctx.wires)
  if (!result.converged) {
    ctx.error.value = 'ew.solverNotConverged'
    return
  }
  for (const comp of ctx.components) {
    const v = result.componentVoltagePhasors.get(comp.id)
    const i = result.componentCurrentPhasors.get(comp.id)
    if (v) {
      comp.voltageRe = v.re
      comp.voltageIm = v.im
      comp.voltage = Math.sqrt(v.re * v.re + v.im * v.im)
    } else {
      comp.voltageRe = 0; comp.voltageIm = 0; comp.voltage = 0
    }
    if (i) {
      comp.currentRe = i.re
      comp.currentIm = i.im
      comp.current = Math.sqrt(i.re * i.re + i.im * i.im)
    } else {
      comp.currentRe = 0; comp.currentIm = 0; comp.current = 0
    }
  }
  ctx.error.value = ''
  ctx.faults.value = result.faults ?? []
}

export function solveTransient(ctx: SolverContext): TransientResult | null {
  if (!ctx.isACMode.value) return null
  const result = solveCircuitTransient(ctx.components, ctx.wires, 3, 50)
  if (!result.converged) return null
  for (const comp of ctx.components) {
    if (comp.type === 'oscilloscope') {
      const compIdx = ctx.components.indexOf(comp)
      const trace: { t: number; v: number }[] = []
      for (let step = 0; step < result.timePoints.length; step++) {
        trace.push({
          t: result.timePoints[step],
          v: result.componentVoltages[step]?.[compIdx] ?? 0,
        })
      }
      comp.oscilloscopeTrace = trace
    }
  }
  return result
}

export function solveTransientDC(ctx: SolverContext): TransientResult | null {
  if (ctx.isACMode.value) return null
  const result = solveCircuitTransientDC(ctx.components, ctx.wires)
  if (!result.converged) return null
  for (const comp of ctx.components) {
    if (comp.type === 'oscilloscope') {
      const compIdx = ctx.components.indexOf(comp)
      const trace: { t: number; v: number }[] = []
      for (let step = 0; step < result.timePoints.length; step++) {
        trace.push({
          t: result.timePoints[step],
          v: result.componentVoltages[step]?.[compIdx] ?? 0,
        })
      }
      comp.oscilloscopeTrace = trace
    }
  }
  return result
}

export function getPower(comp: WorkshopComponent): number {
  if (comp.voltageRe !== undefined && comp.voltageIm !== undefined &&
      comp.currentRe !== undefined && comp.currentIm !== undefined) {
    return comp.voltageRe * comp.currentRe + comp.voltageIm * comp.currentIm
  }
  return Math.abs(comp.voltage * comp.current)
}
