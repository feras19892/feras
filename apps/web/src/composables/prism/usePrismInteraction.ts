import { ref, reactive } from 'vue'

export type ActiveTool = 'select' | 'move'

export interface ViewOptions {
  showNormals: boolean
  showAllWavelengths: boolean
  showAngleArcs: boolean
  showScreen: boolean
  showGrid: boolean
}

export interface DrawResult {
  pA: { x: number; y: number }
  pB: { x: number; y: number }
  pC: { x: number; y: number }
  p1: { x: number; y: number }
  normal1Angle: number
  srcX: number
  srcY: number
}

export function usePrismInteraction() {
  const activeTool = ref<ActiveTool>('move')
  const prismOffset = reactive({ x: 0, y: 0 })
  const options = reactive<ViewOptions>({
    showNormals: true,
    showAllWavelengths: true,
    showAngleArcs: true,
    showScreen: true,
    showGrid: true,
  })

  function setTool(t: ActiveTool) { activeTool.value = t }
  function toggleOption(key: keyof ViewOptions) { options[key] = !options[key] }
  function resetOffset() { prismOffset.x = 0; prismOffset.y = 0 }

  return { activeTool, prismOffset, options, setTool, toggleOption, resetOffset }
}
