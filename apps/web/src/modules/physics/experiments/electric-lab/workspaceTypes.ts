import type { Ref } from 'vue'
import type { CircuitComponent } from './types'

export interface CanvasContext {
  zoom: Ref<number>
  panX: Ref<number>
  panY: Ref<number>
  worldToScreen: (x: number, y: number) => [number, number]
}

export interface WorkspaceProps {
  components: CircuitComponent[]
  running: boolean
  current: number
  voltage: number
  kirchhoffCurrents?: { I1: number; I2: number; I3: number }
  parallelCurrents?: { I1: number; I2: number; Itotal: number }
  isRC?: boolean
  rcReading?: { V: number; I: number; t: number; tau: number; charging: boolean }
  isLamp?: boolean
  lampReading?: { V: number; I: number; P: number; PLight: number; PHeat: number; brightness: number }
  isGalvanometer?: boolean
  galvanometerReading?: { emf: number; IuA: number; sensitivity: number; turns: number; speed: number }
  isInternalResistance?: boolean
  internalResistanceReading?: { emf: number; Vt: number; I: number; r: number; Vdrop: number }
  isSeries?: boolean
  seriesReading?: { V: number; I: number; Req: number; V1: number; V2: number; V3: number }
  isNonOhmic?: boolean
  nonOhmicReading?: { V: number; I_ohmic: number; I_lamp: number; R_dyn: number }
  isCellsParallel?: boolean
  cellsParallelReading?: { EMF: number; Vt: number; I: number; R: number }
}
