import type { WorkshopComponent, WorkshopWire, SolveResult, FaultInfo } from './types'

const VT = 0.02585
const IS = 1e-12
const ETA = 1.5

export function solveCircuit(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
): SolveResult {
  const nodeVoltages = new Map<number, number>()
  const componentCurrents = new Map<number, number>()
  const componentVoltages = new Map<number, number>()

  if (components.length === 0) {
    return { nodeVoltages, componentCurrents, componentVoltages, converged: true, iterations: 0, faults: [] }
  }

  // 1. Build node assignment from wires (union-find)
  const parent = new Map<number, number>()
  function find(x: number): number {
    if (!parent.has(x)) parent.set(x, x)
    const p = parent.get(x)!
    if (p === x) return x
    const root = find(p)
    parent.set(x, root)
    return root
  }
  function union(a: number, b: number) {
    const ra = find(a), rb = find(b)
    if (ra !== rb) parent.set(ra, rb)
  }

  // Assign temporary node IDs to all terminals
  let nodeCounter = 0
  const terminalNodeMap = new Map<string, number>()
  for (const comp of components) {
    for (const t of comp.terminals) {
      const key = `${comp.id}:${t.index}`
      terminalNodeMap.set(key, nodeCounter++)
    }
  }

  // Union terminals connected by wires
  for (const wire of wires) {
    const fromKey = `${wire.fromCompId}:${wire.fromTerminalIndex}`
    const toKey = `${wire.toCompId}:${wire.toTerminalIndex}`
    const fromNode = terminalNodeMap.get(fromKey)
    const toNode = terminalNodeMap.get(toKey)
    if (fromNode !== undefined && toNode !== undefined) {
      union(fromNode, toNode)
    }
  }

  // Ground components force their terminal node to be node 0
  let groundNode: number | null = null
  for (const comp of components) {
    if (comp.type === 'ground') {
      const key = `${comp.id}:0`
      const n = terminalNodeMap.get(key)
      if (n !== undefined) {
        const root = find(n)
        if (groundNode === null) {
          groundNode = root
        } else {
          union(groundNode, root)
        }
      }
    }
  }

  // Collect unique nodes
  const uniqueRoots = new Set<number>()
  const nodeToIndex = new Map<number, number>()
  let nodeIndex = 0

  // Ground first
  if (groundNode !== null) {
    const root = find(groundNode)
    uniqueRoots.add(root)
    nodeToIndex.set(root, 0)
    nodeIndex = 1
  }

  for (const n of terminalNodeMap.values()) {
    const root = find(n)
    if (!uniqueRoots.has(root)) {
      uniqueRoots.add(root)
      nodeToIndex.set(root, nodeIndex++)
    }
  }

  // Map each terminal to its node index
  const terminalNodeIndex = new Map<string, number>()
  for (const comp of components) {
    for (const t of comp.terminals) {
      const key = `${comp.id}:${t.index}`
      const tempNode = terminalNodeMap.get(key)!
      const root = find(tempNode)
      terminalNodeIndex.set(key, nodeToIndex.get(root)!)
    }
  }

  const numNodes = nodeIndex
  if (numNodes === 0) {
    return { nodeVoltages, componentCurrents, componentVoltages, converged: true, iterations: 0, faults: [] }
  }

  // 2. Build MNA matrix
  // Unknowns: [V0, V1, ..., V(n-1), I_battery1, I_battery2, ...]
  const batteries = components.filter(c => c.type === 'battery')
  const numVS = batteries.length
  const size = numNodes + numVS

  // Newton-Raphson iterations for nonlinear elements (diodes)
  const maxIter = 20
  let converged = false

  // Previous solution for Newton-Raphson
  let prevX: number[] = new Array(size).fill(0)

  for (let iter = 0; iter < maxIter; iter++) {
    const G = new Array(size * size).fill(0) // conductance matrix
    const RHS = new Array(size).fill(0)

    // Helper to add conductance between two nodes
    const addConductance = (n1: number, n2: number, g: number) => {
      if (n1 === n2) return
      G[n1 * size + n1] += g
      G[n2 * size + n2] += g
      G[n1 * size + n2] -= g
      G[n2 * size + n1] -= g
    }

    const getTerminalNode = (compId: number, termIndex: number): number => {
      return terminalNodeIndex.get(`${compId}:${termIndex}`) ?? 0
    }

    // Stamp each component
    for (const comp of components) {
      const n0 = getTerminalNode(comp.id, 0)
      const n1 = getTerminalNode(comp.id, 1)

      if (comp.type === 'resistor' || comp.type === 'lamp') {
        const R = comp.value || 1
        addConductance(n0, n1, 1 / R)
      } else if (comp.type === 'ammeter') {
        addConductance(n0, n1, 1e6) // very low resistance
      } else if (comp.type === 'voltmeter') {
        addConductance(n0, n1, 1e-8) // very high resistance
      } else if (comp.type === 'multimeter') {
        const mode = comp.multimeterMode || 'voltage'
        if (mode === 'voltage') {
          addConductance(n0, n1, 1e-8) // high impedance (parallel)
        } else if (mode === 'current') {
          addConductance(n0, n1, 1e6) // low impedance (series)
        } else if (mode === 'resistance') {
          // Apply small test current and measure voltage
          addConductance(n0, n1, 1e-8)
          RHS[n0] += 1e-6 // 1µA test current
        }
      } else if (comp.type === 'switch') {
        if (comp.closed) {
          addConductance(n0, n1, 1e6) // closed = low resistance
        } else {
          addConductance(n0, n1, 1e-12) // open = very high resistance
        }
      } else if (comp.type === 'breaker') {
        if (comp.breakerTripped) {
          addConductance(n0, n1, 1e-12)
        } else {
          addConductance(n0, n1, 1e6)
        }
      } else if (comp.type === 'fuse') {
        if (comp.fuseBlown) {
          addConductance(n0, n1, 1e-12)
        } else {
          addConductance(n0, n1, 1e6)
        }
      } else if (comp.type === 'ground') {
        // Ground is already node 0
      } else if (comp.type === 'capacitor') {
        // DC steady state: open circuit
        addConductance(n0, n1, 1e-12)
      } else if (comp.type === 'inductor') {
        // DC steady state: short circuit
        addConductance(n0, n1, 1e6)
      } else if (comp.type === 'battery') {
        const vsIdx = batteries.indexOf(comp)
        const row = numNodes + vsIdx
        // Voltage source: V(n0) - V(n1) = value
        G[n0 * size + row] += 1
        G[n1 * size + row] -= 1
        G[row * size + n0] += 1
        G[row * size + n1] -= 1
        RHS[row] = comp.value
      } else if (comp.type === 'diode') {
        // Newton-Raphson linearization
        const Vd = prevX[n0] - prevX[n1]
        const Id = IS * (Math.exp(Vd / (ETA * VT)) - 1)
        const Gd = (IS / (ETA * VT)) * Math.exp(Vd / (ETA * VT))
        const Ieq = Id - Gd * Vd
        addConductance(n0, n1, Gd)
        RHS[n0] -= Ieq
        RHS[n1] += Ieq
      } else if (comp.type === 'relay') {
        // Coil acts as resistor, switch acts based on relay state
        const cn0 = getTerminalNode(comp.id, 2)
        const cn1 = getTerminalNode(comp.id, 3)
        const coilR = 100
        addConductance(cn0, cn1, 1 / coilR)
        // Switch terminals (0, 1)
        if (comp.relayState) {
          addConductance(n0, n1, 1e6) // energized = closed
        } else {
          addConductance(n0, n1, 1e-12) // de-energized = open
        }
      }
    }

    // 3. Solve G * X = RHS using Gaussian elimination
    const X = solveLinear(G, RHS, size)
    if (!X) {
      return { nodeVoltages, componentCurrents, componentVoltages, converged: false, iterations: iter, faults: [] }
    }
    const XArr: number[] = Array.from(X)

    // Check convergence
    let maxDiff = 0
    for (let i = 0; i < size; i++) {
      maxDiff = Math.max(maxDiff, Math.abs(XArr[i] - prevX[i]))
    }
    prevX = XArr

    if (maxDiff < 1e-9 && iter > 0) {
      converged = true
      break
    }
  }

  // 4. Extract results
  const X = prevX
  for (const [, idx] of nodeToIndex) {
    nodeVoltages.set(idx, X[idx] ?? 0)
  }

  // Calculate component voltages and currents
  for (const comp of components) {
    const n0 = terminalNodeIndex.get(`${comp.id}:0`) ?? 0
    const n1 = terminalNodeIndex.get(`${comp.id}:1`) ?? 0
    const v0 = X[n0]
    const v1 = X[n1]
    const V = v0 - v1
    componentVoltages.set(comp.id, V)

    if (comp.type === 'battery') {
      const vsIdx = batteries.indexOf(comp)
      componentCurrents.set(comp.id, X[numNodes + vsIdx])
    } else if (comp.type === 'resistor' || comp.type === 'lamp') {
      componentCurrents.set(comp.id, V / (comp.value || 1))
    } else if (comp.type === 'ammeter') {
      componentCurrents.set(comp.id, V * 1e6)
    } else if (comp.type === 'switch') {
      componentCurrents.set(comp.id, comp.closed ? V * 1e6 : 0)
    } else if (comp.type === 'breaker') {
      componentCurrents.set(comp.id, comp.breakerTripped ? 0 : V * 1e6)
    } else if (comp.type === 'fuse') {
      componentCurrents.set(comp.id, comp.fuseBlown ? 0 : V * 1e6)
    } else if (comp.type === 'capacitor') {
      componentCurrents.set(comp.id, 0) // DC steady state
    } else if (comp.type === 'inductor') {
      componentCurrents.set(comp.id, V * 1e6) // short circuit
    } else if (comp.type === 'diode') {
      componentCurrents.set(comp.id, IS * (Math.exp(V / (ETA * VT)) - 1))
    } else if (comp.type === 'voltmeter') {
      componentCurrents.set(comp.id, V * 1e-8)
    } else if (comp.type === 'relay') {
      const cn0 = terminalNodeIndex.get(`${comp.id}:2`) ?? 0
      const cn1 = terminalNodeIndex.get(`${comp.id}:3`) ?? 0
      const coilV = X[cn0] - X[cn1]
      componentCurrents.set(comp.id, coilV / 100)
    } else {
      componentCurrents.set(comp.id, 0)
    }
  }

  // 5. Detect faults
  const faults: FaultInfo[] = []
  for (const comp of components) {
    const I = Math.abs(componentCurrents.get(comp.id) ?? 0)
    const V = Math.abs(componentVoltages.get(comp.id) ?? 0)
    const P = V * I

    if (comp.type === 'battery' && I > 50) {
      faults.push({ type: 'short-circuit', componentId: comp.id, message: `تيار مرتفع جداً ${I.toFixed(1)}A — احتمال قصر`, severity: 'danger' })
    }
    if (comp.type === 'resistor' && P > 5) {
      faults.push({ type: 'overheating', componentId: comp.id, message: `حمل زائد ${P.toFixed(2)}W — سخونة`, severity: 'warning' })
    }
    if (comp.type === 'breaker' && comp.breakerTripped) {
      faults.push({ type: 'overcurrent', componentId: comp.id, message: `القاطع فصل — تجاوز التيار المسموح`, severity: 'danger' })
    }
    if (comp.type === 'fuse' && comp.fuseBlown) {
      faults.push({ type: 'overcurrent', componentId: comp.id, message: `المصهر احترق — تجاوز التيار`, severity: 'danger' })
    }
    if (comp.type === 'lamp' && V > comp.value * 1.5) {
      faults.push({ type: 'overheating', componentId: comp.id, message: `جهد زائد على المصباح ${V.toFixed(1)}V`, severity: 'warning' })
    }
    if (comp.type === 'diode' && V > 50) {
      faults.push({ type: 'overheating', componentId: comp.id, message: `جهد عكسي مرتفع على الدايود`, severity: 'warning' })
    }
  }

  // Check for open circuit (battery with no current)
  for (const comp of components) {
    if (comp.type === 'battery') {
      const I = Math.abs(componentCurrents.get(comp.id) ?? 0)
      if (I < 1e-10) {
        const hasPath = wires.some(w =>
          w.fromCompId === comp.id || w.toCompId === comp.id
        )
        if (hasPath) {
          faults.push({ type: 'open-circuit', componentId: comp.id, message: 'دائرة مفتوحة — لا يوجد مسار كامل للتيار', severity: 'warning' })
        }
      }
    }
  }

  // Check for parallel batteries with different voltages
  const allBatteries = components.filter(c => c.type === 'battery')
  for (let i = 0; i < allBatteries.length; i++) {
    for (let j = i + 1; j < allBatteries.length; j++) {
      const b1 = allBatteries[i]
      const b2 = allBatteries[j]
      const b1pNode = b1.terminals[0].nodeId != null ? find(b1.terminals[0].nodeId) : -1
      const b1nNode = b1.terminals[1].nodeId != null ? find(b1.terminals[1].nodeId) : -2
      const b2pNode = b2.terminals[0].nodeId != null ? find(b2.terminals[0].nodeId) : -3
      const b2nNode = b2.terminals[1].nodeId != null ? find(b2.terminals[1].nodeId) : -4
      // Same polarity parallel (both + connected, both - connected)
      if (b1pNode === b2pNode && b1nNode === b2nNode && b1.value !== b2.value) {
        faults.push({ type: 'voltage-mismatch', componentId: b2.id, message: `بطاريتان على التفرع بجهود مختلفة (${b1.value}V و ${b2.value}V) — تيار عالي جداً بينهما!`, severity: 'danger' })
      }
      // Anti-parallel (b1+ connected to b2- and b1- to b2+)
      if (b1pNode === b2nNode && b1nNode === b2pNode) {
        faults.push({ type: 'polarity-mismatch', componentId: b2.id, message: `بطاريتان متصلتان بالعكس على التفرع — جهد كلي ${(b1.value + b2.value).toFixed(1)}V عبر مقاومة صفر!`, severity: 'danger' })
      }
    }
  }

  // Check for direct short across battery (battery + and - connected directly)
  for (const bat of allBatteries) {
    const bpNode = bat.terminals[0].nodeId != null ? find(bat.terminals[0].nodeId) : -1
    const bnNode = bat.terminals[1].nodeId != null ? find(bat.terminals[1].nodeId) : -2
    if (bpNode === bnNode) {
      faults.push({ type: 'direct-short', componentId: bat.id, message: `قصر مباشر على البطارية ${bat.value}V — تيار لا نهائي!`, severity: 'danger' })
    }
  }

  return { nodeVoltages, componentCurrents, componentVoltages, converged, iterations: maxIter, faults }
}

function solveLinear(A: number[], b: number[], n: number): number[] | null {
  const M = [...A]
  const x = [...b]

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col
    let maxVal = Math.abs(M[col * n + col])
    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(M[row * n + col])
      if (val > maxVal) {
        maxVal = val
        maxRow = row
      }
    }
    if (maxVal < 1e-15) continue // singular column, skip

    // Swap rows
    if (maxRow !== col) {
      for (let j = 0; j < n; j++) {
        const tmp = M[col * n + j]
        M[col * n + j] = M[maxRow * n + j]
        M[maxRow * n + j] = tmp
      }
      const tmp = x[col]; x[col] = x[maxRow]; x[maxRow] = tmp
    }

    // Eliminate
    const pivot = M[col * n + col]
    for (let row = col + 1; row < n; row++) {
      const factor = M[row * n + col] / pivot
      for (let j = col; j < n; j++) {
        M[row * n + j] -= factor * M[col * n + j]
      }
      x[row] -= factor * x[col]
    }
  }

  // Back substitution
  for (let row = n - 1; row >= 0; row--) {
    let sum = x[row]
    for (let j = row + 1; j < n; j++) {
      sum -= M[row * n + j] * x[j]
    }
    const diag = M[row * n + row]
    if (Math.abs(diag) < 1e-15) {
      x[row] = 0
    } else {
      x[row] = sum / diag
    }
  }

  return x
}

export function updateRelayStates(components: WorkshopComponent[]): boolean {
  let changed = false
  for (const comp of components) {
    if (comp.type === 'relay') {
      const coilCurrent = comp.current
      const threshold = comp.value * 1e-3 // value in mA
      const newState = Math.abs(coilCurrent) > threshold
      if (newState !== comp.relayState) {
        comp.relayState = newState
        changed = true
      }
    }
    if (comp.type === 'breaker') {
      if (Math.abs(comp.current) > (comp.breakerRating ?? comp.value) && !comp.breakerTripped) {
        comp.breakerTripped = true
        changed = true
      }
    }
    if (comp.type === 'fuse') {
      if (Math.abs(comp.current) > comp.value && !comp.fuseBlown) {
        comp.fuseBlown = true
        changed = true
      }
    }
  }
  return changed
}
