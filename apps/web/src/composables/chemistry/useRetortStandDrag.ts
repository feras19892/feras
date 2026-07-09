import { ref } from 'vue'
import type { Ref } from 'vue'

export interface RetortStandDragState {
  clampDragging: Ref<boolean>
  bottomClampDragging: Ref<boolean>
  onClampMouseDown: (e: MouseEvent) => void
  onBottomClampMouseDown: (e: MouseEvent) => void
  cleanupDrag: () => void
}

export function useRetortStandDrag(
  clampY: () => number,
  bottomClampX: () => number,
  bottomClampY: () => number,
  topClampLocked: () => boolean,
  bottomClampLocked: () => boolean,
  onTopMoved: (deltaY: number) => void,
  onBottomMoved: (deltaX: number, deltaY: number) => void,
): RetortStandDragState {
  const clampDragging = ref(false)
  const clampStartY = ref(0)
  const clampStartTop = ref(0)
  const clampPrevY = ref(60)

  const bottomClampDragging = ref(false)
  const bottomClampStartX = ref(0)
  const bottomClampStartLeft = ref(0)
  const bottomClampStartY = ref(0)
  const bottomClampStartTop = ref(0)
  const bottomClampPrevX = ref(0)
  const bottomClampPrevY = ref(160)

  /* ---- Top clamp drag ---- */
  function onClampMouseDown(e: MouseEvent) {
    e.stopPropagation()
    e.stopImmediatePropagation()
    e.preventDefault()
    if (topClampLocked()) return
    clampDragging.value = true
    clampStartY.value = e.clientY
    clampStartTop.value = clampY()
    clampPrevY.value = clampY()
    window.addEventListener('mousemove', onClampMove)
    window.addEventListener('mouseup', onClampUp)
  }

  function onClampMove(e: MouseEvent) {
    if (!clampDragging.value) return
    const dy = e.clientY - clampStartY.value
    const newY = Math.max(20, Math.min(280, clampStartTop.value + dy))
    const clampDeltaY = newY - clampPrevY.value
    clampPrevY.value = newY
    onTopMoved(clampDeltaY)
  }

  function onClampUp() {
    clampDragging.value = false
    window.removeEventListener('mousemove', onClampMove)
    window.removeEventListener('mouseup', onClampUp)
  }

  /* ---- Bottom clamp drag ---- */
  function onBottomClampMouseDown(e: MouseEvent) {
    e.stopPropagation()
    e.stopImmediatePropagation()
    e.preventDefault()
    if (bottomClampLocked()) return
    bottomClampDragging.value = true
    bottomClampStartX.value = e.clientX
    bottomClampStartLeft.value = bottomClampX()
    bottomClampStartY.value = e.clientY
    bottomClampStartTop.value = bottomClampY()
    bottomClampPrevX.value = bottomClampX()
    bottomClampPrevY.value = bottomClampY()
    window.addEventListener('mousemove', onBottomClampMove)
    window.addEventListener('mouseup', onBottomClampUp)
  }

  function onBottomClampMove(e: MouseEvent) {
    if (!bottomClampDragging.value) return
    const dx = e.clientX - bottomClampStartX.value
    const newX = Math.max(-100, Math.min(35, bottomClampStartLeft.value + dx))
    const clampDeltaX = newX - bottomClampPrevX.value
    bottomClampPrevX.value = newX
    const dy = e.clientY - bottomClampStartY.value
    const newY = Math.max(90, Math.min(300, bottomClampStartTop.value + dy))
    const clampDeltaY = newY - bottomClampPrevY.value
    bottomClampPrevY.value = newY
    onBottomMoved(clampDeltaX, clampDeltaY)
  }

  function onBottomClampUp() {
    bottomClampDragging.value = false
    window.removeEventListener('mousemove', onBottomClampMove)
    window.removeEventListener('mouseup', onBottomClampUp)
  }

  function cleanupDrag() {
    window.removeEventListener('mousemove', onClampMove)
    window.removeEventListener('mouseup', onClampUp)
    window.removeEventListener('mousemove', onBottomClampMove)
    window.removeEventListener('mouseup', onBottomClampUp)
  }

  return {
    clampDragging,
    bottomClampDragging,
    onClampMouseDown,
    onBottomClampMouseDown,
    cleanupDrag,
  }
}
