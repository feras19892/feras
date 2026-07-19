import { ref, type Ref } from 'vue'
import type { WorkshopComponent, WorkshopWire } from './types'

export interface HistorySnapshot {
  components: WorkshopComponent[]
  wires: WorkshopWire[]
  idCounter: number
}

export class WorkshopHistory {
  private undoStack: HistorySnapshot[] = []
  private redoStack: HistorySnapshot[] = []
  private maxHistory = 50
  canUndo: Ref<boolean> = ref(false)
  canRedo: Ref<boolean> = ref(false)

  constructor(
    private getComponents: () => WorkshopComponent[],
    private getWires: () => WorkshopWire[],
    private getIdCounter: () => number,
    private setIdCounter: (n: number) => void,
  ) {}

  snapshot(): HistorySnapshot {
    const components = this.getComponents()
    const wires = this.getWires()
    return {
      components: components.map(c => ({ ...c, terminals: c.terminals.map(t => ({ ...t })) })),
      wires: wires.map(w => ({ ...w, points: [...w.points] })),
      idCounter: this.getIdCounter(),
    }
  }

  pushUndo() {
    this.undoStack.push(this.snapshot())
    if (this.undoStack.length > this.maxHistory) this.undoStack.shift()
    this.redoStack.length = 0
    this.canUndo.value = this.undoStack.length > 0
    this.canRedo.value = this.redoStack.length > 0
  }

  restoreSnapshot(s: HistorySnapshot, components: WorkshopComponent[], wires: WorkshopWire[]) {
    components.splice(0, components.length)
    for (const c of s.components) components.push({ ...c, terminals: c.terminals.map(t => ({ ...t })) })
    wires.splice(0, wires.length)
    for (const w of s.wires) wires.push({ ...w, points: [...w.points] })
    this.setIdCounter(s.idCounter)
  }

  undo(components: WorkshopComponent[], wires: WorkshopWire[]): HistorySnapshot | null {
    if (this.undoStack.length === 0) return null
    this.redoStack.push(this.snapshot())
    const s = this.undoStack.pop()!
    this.restoreSnapshot(s, components, wires)
    this.canUndo.value = this.undoStack.length > 0
    this.canRedo.value = this.redoStack.length > 0
    return s
  }

  redo(components: WorkshopComponent[], wires: WorkshopWire[]): HistorySnapshot | null {
    if (this.redoStack.length === 0) return null
    this.undoStack.push(this.snapshot())
    const s = this.redoStack.pop()!
    this.restoreSnapshot(s, components, wires)
    this.canUndo.value = this.undoStack.length > 0
    this.canRedo.value = this.redoStack.length > 0
    return s
  }
}
