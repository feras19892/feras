export function createTouchHandlers(
  onMouseDown: (e: MouseEvent) => void,
  onMouseMove: (e: MouseEvent) => void,
  onMouseUp: (e: MouseEvent) => void,
  getLastMouse: () => { lastMouseX: number; lastMouseY: number },
  pinchZoom?: {
    zoom: { value: number }
    panX: { value: number }
    panY: { value: number }
    minZoom?: number
    maxZoom?: number
  },
) {
  let pinchStartDist = 0
  let pinchStartZoom = 1
  let pinchCenterX = 0
  let pinchCenterY = 0
  let pinchStartPanX = 0
  let pinchStartPanY = 0
  let isPinching = false

  function getDist(t1: Touch, t2: Touch): number {
    return Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2)
  }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 2 && pinchZoom) {
      isPinching = true
      pinchStartDist = getDist(e.touches[0], e.touches[1])
      pinchStartZoom = pinchZoom.zoom.value
      pinchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2
      pinchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2
      pinchStartPanX = pinchZoom.panX.value
      pinchStartPanY = pinchZoom.panY.value
    } else if (e.touches.length === 1) {
      const t = e.touches[0]
      onMouseDown({ clientX: t.clientX, clientY: t.clientY } as MouseEvent)
    }
  }
  function onTouchMove(e: TouchEvent) {
    if (isPinching && e.touches.length === 2 && pinchZoom) {
      e.preventDefault()
      const dist = getDist(e.touches[0], e.touches[1])
      if (pinchStartDist > 0) {
        const scale = dist / pinchStartDist
        const minZ = pinchZoom.minZoom ?? 0.3
        const maxZ = pinchZoom.maxZoom ?? 5
        const newZoom = Math.max(minZ, Math.min(maxZ, pinchStartZoom * scale))
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
        const worldX = (pinchCenterX - pinchStartPanX) / pinchStartZoom
        const worldY = (pinchCenterY - pinchStartPanY) / pinchStartZoom
        pinchZoom.zoom.value = newZoom
        pinchZoom.panX.value = cx - worldX * newZoom
        pinchZoom.panY.value = cy - worldY * newZoom
      }
    } else if (e.touches.length === 1 && !isPinching) {
      const t = e.touches[0]
      onMouseMove({ clientX: t.clientX, clientY: t.clientY } as MouseEvent)
    }
  }
  function onTouchEnd(e: TouchEvent) {
    if (isPinching && e.touches.length < 2) {
      isPinching = false
      if (e.touches.length === 1) {
        const t = e.touches[0]
        onMouseDown({ clientX: t.clientX, clientY: t.clientY } as MouseEvent)
      }
    } else if (e.changedTouches.length > 0) {
      const t = e.changedTouches[0]
      onMouseUp({ clientX: t.clientX, clientY: t.clientY } as MouseEvent)
    } else {
      const { lastMouseX, lastMouseY } = getLastMouse()
      onMouseUp({ clientX: lastMouseX, clientY: lastMouseY } as MouseEvent)
    }
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}
