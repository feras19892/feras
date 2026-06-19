import { ref } from 'vue'

export function useProjectileReport() {
  const canvasSnapshot = ref<string | null>(null)

  function captureSnapshot(canvasRef: any) {
    if (!canvasRef) return
    try {
      const dataUrl = canvasRef.captureSnapshot?.()
      if (dataUrl) canvasSnapshot.value = dataUrl
    } catch { /* ignore */ }
  }

  function onSnapshot(dataUrl: string) {
    canvasSnapshot.value = dataUrl
  }

  function openFullReport(ex: any) {
    // placeholder for future report generation
  }

  return { canvasSnapshot, captureSnapshot, onSnapshot, openFullReport }
}
