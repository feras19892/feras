import type { WorkshopComponent, WorkshopWire } from './types'
import { buildNodeGraph } from './nodeGraph'
import { getDef } from './componentDefs'

export interface MNAStep {
  title: string
  description: string
  matrix?: string
  formula?: string
}

export function explainMNA(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
): MNAStep[] {
  const steps: MNAStep[] = []

  if (components.length === 0) {
    steps.push({
      title: 'Empty Circuit',
      description: 'No components to analyze. Add components and wires to build a circuit.',
    })
    return steps
  }

  // Step 1: Identify nodes
  const { terminalNodeIndex, numNodes } = buildNodeGraph(
    components,
    wires,
    components.find(c => c.type === 'battery' || c.type === 'solarcell') ? 'battery' : 'acsource',
  )

  const nodeSet = new Set<number>()
  for (const idx of terminalNodeIndex.values()) {
    if (idx > 0) nodeSet.add(idx)
  }

  steps.push({
    title: 'Step 1: Node Identification',
    description: `The circuit has ${numNodes} unique nodes (excluding ground). Each node is a point where two or more components connect. The ground node (node 0) is the reference — all voltages are measured relative to it.`,
    formula: `Nodes: N = ${numNodes}`,
  })

  // Step 2: Identify voltage sources
  const batteries = components.filter(c => c.type === 'battery' || c.type === 'solarcell')
  const opamps = components.filter(c => c.type === 'opamp')
  const numVS = batteries.length + opamps.length

  steps.push({
    title: 'Step 2: Voltage Sources',
    description: `Voltage sources (batteries, solar cells) and op-amps require additional equations in MNA. Each adds one unknown (the current through the source) and one equation (the voltage constraint).\n\nFound: ${batteries.length} voltage source(s), ${opamps.length} op-amp(s).`,
    formula: `Total unknowns = N + M = ${numNodes} + ${numVS} = ${numNodes + numVS}`,
  })

  // Step 3: Build the G matrix
  const resistors = components.filter(c =>
    c.type === 'resistor' || c.type === 'lamp' || c.type === 'thermistor' ||
    c.type === 'buzzer' || c.type === 'motor'
  )

  let conductanceDesc = 'Each resistor contributes a conductance G = 1/R to the matrix:\n'
  for (const r of resistors.slice(0, 5)) {
    const def = getDef(r.type)
    const R = r.value || 1
    conductanceDesc += `  ${def?.label || r.type}: R = ${R}Ω → G = ${(1/R).toFixed(6)} S\n`
  }
  if (resistors.length > 5) {
    conductanceDesc += `  ... and ${resistors.length - 5} more\n`
  }

  const size = numNodes + numVS
  steps.push({
    title: 'Step 3: Conductance Matrix (G)',
    description: conductanceDesc + `\nThe G matrix is ${size}×${size}. Diagonal elements G[i][i] = sum of conductances connected to node i. Off-diagonal G[i][j] = -sum of conductances between nodes i and j.`,
    matrix: `G is ${size}×${size} matrix`,
  })

  // Step 4: RHS vector
  steps.push({
    title: 'Step 4: Right-Hand Side (RHS) Vector',
    description: `The RHS vector contains known values: current sources (positive = flowing into node) and voltage source constraints.\n\nFor each battery: RHS[vs_row] = V_battery\nFor each node: RHS[node] = 0 (KCL — no external current injection)`,
    formula: `RHS = [0, 0, ..., V₁, V₂, ...]ᵀ (length ${size})`,
  })

  // Step 5: Solve
  steps.push({
    title: 'Step 5: Solve G·x = RHS',
    description: `The system of ${size} linear equations is solved using LU decomposition. The solution vector x contains:\n  • x[0..N-1] = node voltages (V)\n  • x[N..N+M-1] = currents through voltage sources (A)`,
    formula: `x = G⁻¹ · RHS`,
  })

  // Step 6: Extract results
  steps.push({
    title: 'Step 6: Extract Component Values',
    description: 'From the solution vector:\n  • Node voltages → voltage across each component (V = V_node1 - V_node2)\n  • Current through resistors: I = V/R (Ohm\'s Law)\n  • Current through voltage sources: directly from x[N+i]\n  • Power dissipation: P = V × I',
  })

  // Step 7: Newton-Raphson (if nonlinear)
  const hasNonlinear = components.some(c => c.type === 'diode' || c.type === 'led' || c.type === 'zener' || c.type === 'npn' || c.type === 'pnp')
  if (hasNonlinear) {
    steps.push({
      title: 'Step 7: Newton-Raphson Iteration',
      description: 'Nonlinear components (diodes, LEDs, transistors) require iterative solving. The solver uses Newton-Raphson method:\n  1. Start with initial guess (x₀ = 0)\n  2. Linearize nonlinear devices around current operating point\n  3. Solve linearized system\n  4. Update solution: x_{n+1} = x_n + Δx\n  5. Repeat until convergence (|Δx| < tolerance)\n\nTypically converges in 3-10 iterations.',
      formula: 'x_{n+1} = x_n - J⁻¹·F(x_n)',
    })
  }

  return steps
}

export function mnaStepsToHTML(steps: MNAStep[]): string {
  const parts: string[] = []
  parts.push('<div class="mna-explanation">')
  parts.push('<h3>📐 Modified Nodal Analysis (MNA)</h3>')
  parts.push('<p>MNA is the method used by this simulator to solve circuits. Here\'s how it works:</p>')

  for (const step of steps) {
    parts.push(`<div class="mna-step">`)
    parts.push(`<h4>${step.title}</h4>`)
    parts.push(`<p>${step.description.replace(/\n/g, '<br>')}</p>`)
    if (step.formula) {
      parts.push(`<div class="mna-formula"><code>${step.formula}</code></div>`)
    }
    if (step.matrix) {
      parts.push(`<div class="mna-matrix"><code>${step.matrix}</code></div>`)
    }
    parts.push(`</div>`)
  }

  parts.push('</div>')
  return parts.join('\n')
}
