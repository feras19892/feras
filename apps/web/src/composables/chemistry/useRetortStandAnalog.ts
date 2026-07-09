import { ref } from 'vue'
import type { Ref } from 'vue'

export interface RetortStandAnalogState {
  topAnalogDragging: Ref<boolean>
  topAnalogOffset: Ref<number>
  bottomAnalogDragging: Ref<boolean>
  bottomAnalogOffsetX: Ref<number>
  bottomAnalogOffsetY: Ref<number>
  onTopAnalogDown: (e: MouseEvent) => void
  onBottomAnalogDown: (e: MouseEvent) => void
  cleanupAnalog: () => void
}

export function useRetortStandAnalog(
  moveTopClamp: (dy: number) => void,
  moveBottomClamp: (dx: number, dy: number) => void,
  topClampLocked: () => boolean,
  bottomClampLocked: () => boolean,
): RetortStandAnalogState {
  /* ---- Top analog (vertical) ---- */
  const topAnalogDragging = ref(false)
  const topAnalogOffset = ref(0)
  const topAnalogStartY = ref(0)
  let topAnalogRafId: number | null = null

  function runTopAnalogLoop() {
    if (!topAnalogDragging.value) return
    const sign = topAnalogOffset.value > 0.5 ? 1 : topAnalogOffset.value < -0.5 ? -1 : 0
    if (sign !== 0 && !topClampLocked()) {
      moveTopClamp(sign * 0.15)
    }
    topAnalogRafId = requestAnimationFrame(runTopAnalogLoop)
  }

  function onTopAnalogDown(e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    topAnalogDragging.value = true
    topAnalogStartY.value = e.clientY
    window.addEventListener('mousemove', onTopAnalogMove)
    window.addEventListener('mouseup', onTopAnalogUp)
    runTopAnalogLoop()
  }

  function onTopAnalogMove(e: MouseEvent) {
    if (!topAnalogDragging.value) return
    const dy = e.clientY - topAnalogStartY.value
    topAnalogOffset.value = Math.max(-6, Math.min(6, dy))
  }

  function onTopAnalogUp() {
    topAnalogDragging.value = false
    topAnalogOffset.value = 0
    if (topAnalogRafId) { cancelAnimationFrame(topAnalogRafId); topAnalogRafId = null }
    window.removeEventListener('mousemove', onTopAnalogMove)
    window.removeEventListener('mouseup', onTopAnalogUp)
  }

  /* ---- Bottom analog (2D) ---- */
  const bottomAnalogDragging = ref(false)
  const bottomAnalogOffsetX = ref(0)
  const bottomAnalogOffsetY = ref(0)
  const bottomAnalogStartX = ref(0)
  const bottomAnalogStartY = ref(0)
  let bottomAnalogRafId: number | null = null

  function runBottomAnalogLoop() {
    if (!bottomAnalogDragging.value) return
    const dead = 2
    const signX = bottomAnalogOffsetX.value > dead ? 1 : bottomAnalogOffsetX.value < -dead ? -1 : 0
    const signY = bottomAnalogOffsetY.value > dead ? 1 : bottomAnalogOffsetY.value < -dead ? -1 : 0
    let moveX = 0
    let moveY = 0
    if (signX !== 0 || signY !== 0) {
      if (Math.abs(bottomAnalogOffsetX.value) > Math.abs(bottomAnalogOffsetY.value)) {
        moveX = signX
      } else {
        moveY = signY
      }
    }
    if ((moveX !== 0 || moveY !== 0) && !bottomClampLocked()) {
      moveBottomClamp(moveX * 0.15, moveY * 0.15)
    }
    bottomAnalogRafId = requestAnimationFrame(runBottomAnalogLoop)
  }

  function onBottomAnalogDown(e: MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    bottomAnalogDragging.value = true
    bottomAnalogStartX.value = e.clientX
    bottomAnalogStartY.value = e.clientY
    window.addEventListener('mousemove', onBottomAnalogMove)
    window.addEventListener('mouseup', onBottomAnalogUp)
    runBottomAnalogLoop()
  }

  function onBottomAnalogMove(e: MouseEvent) {
    if (!bottomAnalogDragging.value) return
    const dx = e.clientX - bottomAnalogStartX.value
    const dy = e.clientY - bottomAnalogStartY.value
    bottomAnalogOffsetX.value = Math.max(-6, Math.min(6, dx))
    bottomAnalogOffsetY.value = Math.max(-6, Math.min(6, dy))
  }

  function onBottomAnalogUp() {
    bottomAnalogDragging.value = false
    bottomAnalogOffsetX.value = 0
    bottomAnalogOffsetY.value = 0
    if (bottomAnalogRafId) { cancelAnimationFrame(bottomAnalogRafId); bottomAnalogRafId = null }
    window.removeEventListener('mousemove', onBottomAnalogMove)
    window.removeEventListener('mouseup', onBottomAnalogUp)
  }

  function cleanupAnalog() {
    window.removeEventListener('mousemove', onTopAnalogMove)
    window.removeEventListener('mouseup', onTopAnalogUp)
    window.removeEventListener('mousemove', onBottomAnalogMove)
    window.removeEventListener('mouseup', onBottomAnalogUp)
    if (topAnalogRafId) cancelAnimationFrame(topAnalogRafId)
    if (bottomAnalogRafId) cancelAnimationFrame(bottomAnalogRafId)
  }

  return {
    topAnalogDragging,
    topAnalogOffset,
    bottomAnalogDragging,
    bottomAnalogOffsetX,
    bottomAnalogOffsetY,
    onTopAnalogDown,
    onBottomAnalogDown,
    cleanupAnalog,
  }
}
