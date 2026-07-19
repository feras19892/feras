import type { WorkshopComponent, WorkshopWire } from '../shared/types'
import type { Ref } from 'vue'
import type { useWorkshop } from '../shared/useWorkshop'
import type { useWorkshopCanvas } from '../shared/useWorkshopCanvas'

export interface ACCanvasState {
  workshop: ReturnType<typeof useWorkshop>
  zoom: Ref<number>
  panX: Ref<number>
  panY: Ref<number>
  canvasRef: Ref<HTMLCanvasElement | null>
  editingWire: Ref<WorkshopWire | null>
  editWireColor: Ref<string>
  editWireThickness: Ref<number>
  showWireEditor: Ref<boolean>
  getMousePos: (e: MouseEvent) => [number, number]
  worldToScreen: ReturnType<typeof useWorkshopCanvas>['worldToScreen']
  screenToWorld: ReturnType<typeof useWorkshopCanvas>['screenToWorld']
  hitTestComponent: ReturnType<typeof useWorkshopCanvas>['hitTestComponent']
  hitTestTerminal: ReturnType<typeof useWorkshopCanvas>['hitTestTerminal']
  hitTestWire: ReturnType<typeof useWorkshopCanvas>['hitTestWire']
  hitTestWireJunction: ReturnType<typeof useWorkshopCanvas>['hitTestWireJunction']
  hitTestWireSegment: ReturnType<typeof useWorkshopCanvas>['hitTestWireSegment']
  hitTestProbe: ReturnType<typeof useWorkshopCanvas>['hitTestProbe']
  hitTestClamp: ReturnType<typeof useWorkshopCanvas>['hitTestClamp']
  draw: ReturnType<typeof useWorkshopCanvas>['draw']
  redraw: () => void
  toggleRun: () => void

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
  _dragStartX: number
  _dragStartY: number
  hoverWireId: number | null
  isDraggingProbe: boolean
  draggingProbeCompId: number | null
  draggingProbeType: 'black' | 'red' | null
  isDraggingClamp: boolean
  draggingClampCompId: number | null
}

export function createACCanvasState(
  workshop: ReturnType<typeof useWorkshop>,
  zoom: Ref<number>,
  panX: Ref<number>,
  panY: Ref<number>,
  canvasRef: Ref<HTMLCanvasElement | null>,
  wcanvas: ReturnType<typeof useWorkshopCanvas>,
  redraw: () => void,
  toggleRun: () => void,
  editingWire: Ref<WorkshopWire | null>,
  editWireColor: Ref<string>,
  editWireThickness: Ref<number>,
  showWireEditor: Ref<boolean>,
): ACCanvasState {
  function getMousePos(e: MouseEvent): [number, number] {
    const c = canvasRef.value; if (!c) return [0, 0]
    const rect = c.getBoundingClientRect()
    return [e.clientX - rect.left, e.clientY - rect.top]
  }
  return {
    workshop,
    zoom,
    panX,
    panY,
    canvasRef,
    editingWire,
    editWireColor,
    editWireThickness,
    showWireEditor,
    getMousePos,
    worldToScreen: wcanvas.worldToScreen,
    screenToWorld: wcanvas.screenToWorld,
    hitTestComponent: wcanvas.hitTestComponent,
    hitTestTerminal: wcanvas.hitTestTerminal,
    hitTestWire: wcanvas.hitTestWire,
    hitTestWireJunction: wcanvas.hitTestWireJunction,
    hitTestWireSegment: wcanvas.hitTestWireSegment,
    hitTestProbe: wcanvas.hitTestProbe,
    hitTestClamp: wcanvas.hitTestClamp,
    draw: wcanvas.draw,
    redraw,
    toggleRun,

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
    _dragStartX: 0,
    _dragStartY: 0,
    hoverWireId: null,
    isDraggingProbe: false,
    draggingProbeCompId: null,
    draggingProbeType: null,
    isDraggingClamp: false,
    draggingClampCompId: null,
  }
}
