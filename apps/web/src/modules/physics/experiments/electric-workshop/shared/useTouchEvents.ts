export function createTouchHandlers(
  onMouseDown: (e: MouseEvent) => void,
  onMouseMove: (e: MouseEvent) => void,
  onMouseUp: (e: MouseEvent) => void,
  getLastMouse: () => { lastMouseX: number; lastMouseY: number },
) {
  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      onMouseDown({ clientX: t.clientX, clientY: t.clientY } as MouseEvent)
    }
  }
  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 1) {
      const t = e.touches[0]
      onMouseMove({ clientX: t.clientX, clientY: t.clientY } as MouseEvent)
    }
  }
  function onTouchEnd(_e: TouchEvent) {
    const { lastMouseX, lastMouseY } = getLastMouse()
    onMouseUp({ clientX: lastMouseX, clientY: lastMouseY } as MouseEvent)
  }

  return { onTouchStart, onTouchMove, onTouchEnd }
}
