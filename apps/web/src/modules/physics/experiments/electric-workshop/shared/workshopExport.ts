import type { Ref } from 'vue'
import type { useWorkshop } from './useWorkshop'

type Workshop = ReturnType<typeof useWorkshop>

export function exportPNG(canvasRef: Ref<HTMLCanvasElement | null>) {
  if (!canvasRef.value) return
  const link = document.createElement('a')
  link.download = 'circuit-' + Date.now() + '.png'
  link.href = canvasRef.value.toDataURL('image/png')
  link.click()
}

export function openCanvasFullscreen(
  canvasRef: Ref<HTMLCanvasElement | null>,
  canvasSnapshot: Ref<string>,
  canvasFullscreen: Ref<boolean>,
) {
  if (!canvasRef.value) return
  canvasSnapshot.value = canvasRef.value.toDataURL('image/png')
  canvasFullscreen.value = true
}

export function printCircuit(
  canvasRef: Ref<HTMLCanvasElement | null>,
  workshop: Workshop,
  t: (key: string, vars?: Record<string, string>) => string,
) {
  if (!canvasRef.value) return
  const w = window.open('', '_blank')
  if (!w) return
  const img = canvasRef.value.toDataURL('image/png')
  w.document.write(`
    <html dir="rtl"><head><title>${t('ew.printCircuitTitle')}</title>
    <style>body{margin:0;display:flex;flex-direction:column;align-items:center;padding:20px;font-family:Arial}
    h2{color:#333}img{max-width:90%;border:1px solid #ccc}
    .info{margin-top:10px;font-size:14px;color:#666}</style></head>
    <body><h2>${t('ew.printCircuitHeader')}</h2>
    <img src="${img}"/>
    <div class="info">V=${workshop.totalVoltage.value}V | I=${workshop.totalCurrent.value.toFixed(3)}A | P=${workshop.totalPower.value.toFixed(2)}W</div>
    </body></html>`)
  w.document.close()
  w.print()
}
