import type { Ref } from 'vue'
import type { WorkshopComponent, WorkshopWire } from '../shared/types'
import type { useWorkshop } from '../shared/useWorkshop'

export interface DCCanvasState {
  canvasRef: Ref<HTMLCanvasElement | null>
  zoom: Ref<number>
  panX: Ref<number>
  panY: Ref<number>
  renderMode: Ref<'3d' | '2d'>
  workshop: ReturnType<typeof useWorkshop>
  t: (key: string, vars?: Record<string, string>) => string
  editingWire: Ref<WorkshopWire | null>
  editWireColor: Ref<string>
  editWireThickness: Ref<number>
  showWireEditor: Ref<boolean>
  toggleRun: () => void
  worldToScreen: (wx: number, wy: number) => [number, number]
  screenToWorld: (sx: number, sy: number) => [number, number]
  hitTestComponent: (sx: number, sy: number) => WorkshopComponent | null
  hitTestTerminal: (sx: number, sy: number) => { comp: WorkshopComponent; termIndex: number } | null
  hitTestWire: (sx: number, sy: number) => WorkshopWire | null
  hitTestWireJunction: (sx: number, sy: number) => { wire: WorkshopWire; pointIndex: number; worldX: number; worldY: number } | null
  hitTestWireSegment: (sx: number, sy: number) => { wire: WorkshopWire; segIndex: number } | null
  hitTestProbe: (sx: number, sy: number) => { comp: WorkshopComponent; probe: 'black' | 'red' } | null
  hitTestClamp: (sx: number, sy: number) => { comp: WorkshopComponent } | null
  draw: (canvas: HTMLCanvasElement, selectedCompId: number | null, selectedWireId: number | null, tempW: { fromX: number; fromY: number; toX: number; toY: number } | null) => void
  redraw: () => void
  getMousePos: (e: MouseEvent) => [number, number]
  isPanning: boolean
  isDraggingComp: boolean
  isDraggingWire: boolean
  isDraggingWirePoint: boolean
  draggingWireId: number
  draggingPointIndex: number
  isDraggingWireSegment: boolean
  dragSegWireId: number
  dragSegIndex: number
  dragSegLastWX: number
  dragSegLastWY: number
  lastMouseX: number
  lastMouseY: number
  dragOffsetX: number
  dragOffsetY: number
  wireStart: { comp: WorkshopComponent; termIndex: number } | null
  junctionStart: { wireId: number; pointIndex: number; worldX: number; worldY: number } | null
  tempWireEnd: { x: number; y: number }
  draggedCompType: string | null
  hoverWireId: number | null
  isDraggingProbe: boolean
  draggingProbeCompId: number | null
  draggingProbeType: 'black' | 'red' | null
  isDraggingClamp: boolean
  draggingClampCompId: number | null
}

export function createDCCanvasState(): Pick<DCCanvasState, 
  'isPanning' | 'isDraggingComp' | 'isDraggingWire' | 'isDraggingWirePoint' | 'draggingWireId' | 'draggingPointIndex' | 'isDraggingWireSegment' | 'dragSegWireId' | 'dragSegIndex' | 'dragSegLastWX' | 'dragSegLastWY' | 'lastMouseX' | 'lastMouseY' | 'dragOffsetX' | 'dragOffsetY' | 'wireStart' | 'junctionStart' | 'tempWireEnd' | 'draggedCompType' | 'hoverWireId' | 'isDraggingProbe' | 'draggingProbeCompId' | 'draggingProbeType' | 'isDraggingClamp' | 'draggingClampCompId'
> {
  return {
    isPanning: false,
    isDraggingComp: false,
    isDraggingWire: false,
    isDraggingWirePoint: false,
    draggingWireId: 0,
    draggingPointIndex: 0,
    isDraggingWireSegment: false,
    dragSegWireId: 0,
    dragSegIndex: 0,
    dragSegLastWX: 0,
    dragSegLastWY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    wireStart: null,
    junctionStart: null,
    tempWireEnd: { x: 0, y: 0 },
    draggedCompType: null,
    hoverWireId: null,
    isDraggingProbe: false,
    draggingProbeCompId: null,
    draggingProbeType: null,
    isDraggingClamp: false,
    draggingClampCompId: null,
  }
}
