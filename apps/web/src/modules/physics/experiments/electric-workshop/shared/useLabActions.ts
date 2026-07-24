import { explainMNA, mnaStepsToHTML } from './mnaExplainer'
import { exportCircuitSVG, downloadSVG } from './exportSVG'
import type { useWorkshop } from './useWorkshop'
import type { Ref } from 'vue'

type Workshop = ReturnType<typeof useWorkshop>

export function useLabActions(
  workshop: Workshop,
  canvasRef: Ref<HTMLCanvasElement | null>,
  canvasSnapshot: Ref<string>,
  calcExplanationHtml: Ref<string>,
  showCalcExplanation: Ref<boolean>,
  redraw: () => void,
  zoom: Ref<number>,
  svgFilename: string,
) {
  function captureSnapshot() {
    if (canvasRef.value) {
      canvasSnapshot.value = canvasRef.value.toDataURL('image/png')
    }
  }

  function showMNAExplanation() {
    if (workshop.running.value) workshop.solve()
    redraw()
    captureSnapshot()
    const steps = explainMNA(workshop.components, workshop.wires)
    calcExplanationHtml.value = mnaStepsToHTML(steps)
    showCalcExplanation.value = true
  }

  function showCalcDialog(html: string) {
    if (workshop.running.value) workshop.solve()
    redraw()
    captureSnapshot()
    calcExplanationHtml.value = html
    showCalcExplanation.value = true
  }

  function doExportSVG() {
    const svg = exportCircuitSVG(workshop.components, workshop.wires, zoom.value)
    downloadSVG(svg, svgFilename)
  }

  return { showMNAExplanation, showCalcDialog, doExportSVG }
}
