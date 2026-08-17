import type { SolverRequest, SolverResponse } from './solverWorkerClient'
import { solveCircuit } from './solver-dc'
import { solveCircuitAC } from './solver-ac'
import { solveCircuitTransient } from './solver-transient'
import { solveCircuitTransientDC } from './solver-transient-dc'

self.onmessage = (e: MessageEvent<SolverRequest>) => {
  const { id, type, components, wires, numCycles, steps } = e.data
  const response: SolverResponse = { id, result: null }

  try {
    switch (type) {
      case 'dc':
        response.result = solveCircuit(components, wires)
        break
      case 'ac':
        response.result = solveCircuitAC(components, wires)
        break
      case 'transient':
        response.result = solveCircuitTransient(components, wires, numCycles ?? 3, steps ?? 50)
        break
      case 'transient-dc':
        response.result = solveCircuitTransientDC(components, wires)
        break
    }
  } catch (err) {
    response.error = err instanceof Error ? err.message : String(err)
  }

  self.postMessage(response)
}
