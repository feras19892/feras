import type { WorkshopComponent, WorkshopWire } from './types'

export interface NodeGraph {
  terminalNodeIndex: Map<string, number>
  nodeToIndex: Map<number, number>
  numNodes: number
  find: (x: number) => number
}

export function buildNodeGraph(
  components: WorkshopComponent[],
  wires: WorkshopWire[],
  autoGroundType: 'battery' | 'acsource',
): NodeGraph {
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

  let nodeCounter = 0
  const terminalNodeMap = new Map<string, number>()
  for (const comp of components) {
    for (const t of comp.terminals) {
      const key = `${comp.id}:${t.index}`
      terminalNodeMap.set(key, nodeCounter++)
    }
  }

  for (const wire of wires) {
    const fromKey = `${wire.fromCompId}:${wire.fromTerminalIndex}`
    const toKey = `${wire.toCompId}:${wire.toTerminalIndex}`
    const fromNode = terminalNodeMap.get(fromKey)
    const toNode = terminalNodeMap.get(toKey)
    if (fromNode !== undefined && toNode !== undefined) {
      union(fromNode, toNode)
    }
  }

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

  const uniqueRoots = new Set<number>()
  const nodeToIndex = new Map<number, number>()
  let nodeIndex = 0

  if (groundNode !== null) {
    const root = find(groundNode)
    uniqueRoots.add(root)
    nodeToIndex.set(root, 0)
    nodeIndex = 1
  } else {
    const firstSource = components.find(c => c.type === autoGroundType)
    if (firstSource) {
      const negKey = `${firstSource.id}:1`
      const negNode = terminalNodeMap.get(negKey)
      if (negNode !== undefined) {
        groundNode = find(negNode)
        uniqueRoots.add(groundNode)
        nodeToIndex.set(groundNode, 0)
        nodeIndex = 1
      }
    }
  }

  for (const n of terminalNodeMap.values()) {
    const root = find(n)
    if (!uniqueRoots.has(root)) {
      uniqueRoots.add(root)
      nodeToIndex.set(root, nodeIndex++)
    }
  }

  const terminalNodeIndex = new Map<string, number>()
  for (const comp of components) {
    for (const t of comp.terminals) {
      const key = `${comp.id}:${t.index}`
      const tempNode = terminalNodeMap.get(key)!
      const root = find(tempNode)
      const idx = nodeToIndex.get(root)!
      terminalNodeIndex.set(key, idx)
      t.nodeId = idx
    }
  }

  return { terminalNodeIndex, nodeToIndex, numNodes: nodeIndex, find }
}
