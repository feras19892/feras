import { computed, onMounted, onUnmounted } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { LabItem } from './useChemistryTools'
import type { RetortStandState } from './useChemistryLab'
import { items, retortStandMap } from './useChemistryLab'
import { bottomClampSnapUid, retortStandSnapUid } from './workspaceDragSnap'
import { useRetortStandAnalog } from './useRetortStandAnalog'
import { useRetortStandDrag } from './useRetortStandDrag'

export interface RetortStandAssemblyState {
  st: ComputedRef<RetortStandState | undefined>
  clampY: ComputedRef<number>
  bottomClampX: ComputedRef<number>
  bottomClampY: ComputedRef<number>
  isSnapTarget: ComputedRef<boolean>
  isTopSnapTarget: ComputedRef<boolean>
  topClampLocked: ComputedRef<boolean>
  bottomClampLocked: ComputedRef<boolean>
  baseLocked: ComputedRef<boolean>
  attachedItems: ComputedRef<Array<{ uid: string; slotOffset: number; slotIndex: number; item: LabItem }>>
  clampDragging: Ref<boolean>
  bottomClampDragging: Ref<boolean>
  topAnalogDragging: Ref<boolean>
  topAnalogOffset: Ref<number>
  bottomAnalogDragging: Ref<boolean>
  bottomAnalogOffsetX: Ref<number>
  bottomAnalogOffsetY: Ref<number>
  onClampMouseDown: (e: MouseEvent) => void
  onBottomClampMouseDown: (e: MouseEvent) => void
  onTopAnalogDown: (e: MouseEvent) => void
  onBottomAnalogDown: (e: MouseEvent) => void
  onBaseOrRodMouseDown: (e: MouseEvent) => void
  onRetortStandMouseDown: (e: MouseEvent) => void
  onAttachedMouseDown: (e: MouseEvent, uid: string) => void
  toggleTopClampLock: () => void
  toggleBottomClampLock: () => void
  toggleBaseLock: () => void
  getAttachedStyle: (id: string, slotOffset: number) => Record<string, string>
}

export function useRetortStandAssembly(itemUid: string, emitMousedown: (e: MouseEvent) => void, emitBuretteClick: (e: MouseEvent, uid: string) => void): RetortStandAssemblyState {
  const clampY = computed(() => retortStandMap[itemUid]?.topClampY ?? 60)
  const bottomClampX = computed(() => retortStandMap[itemUid]?.bottomClampX ?? 0)
  const bottomClampY = computed(() => retortStandMap[itemUid]?.bottomClampY ?? 160)
  const isSnapTarget = computed(() => bottomClampSnapUid.value === itemUid)

  const isTopSnapTarget = computed(() => {
    if (!retortStandSnapUid.value) return false
    const [standUid] = retortStandSnapUid.value.split('|')
    return standUid === itemUid
  })

  const st = computed(() => retortStandMap[itemUid])

  const topClampLocked = computed(() => retortStandMap[itemUid]?.topClampLocked ?? false)
  const bottomClampLocked = computed(() => retortStandMap[itemUid]?.bottomClampLocked ?? false)
  const baseLocked = computed(() => retortStandMap[itemUid]?.baseLocked ?? false)

  const {
    topAnalogDragging,
    topAnalogOffset,
    bottomAnalogDragging,
    bottomAnalogOffsetX,
    bottomAnalogOffsetY,
    onTopAnalogDown,
    onBottomAnalogDown,
    cleanupAnalog,
  } = useRetortStandAnalog(
    (dy) => moveTopClamp(dy),
    (dx, dy) => moveBottomClamp(dx, dy),
    () => topClampLocked.value,
    () => bottomClampLocked.value,
  )

  function toggleTopClampLock() {
    if (!retortStandMap[itemUid]) return
    retortStandMap[itemUid].topClampLocked = !retortStandMap[itemUid].topClampLocked
  }
  function toggleBottomClampLock() {
    if (!retortStandMap[itemUid]) return
    retortStandMap[itemUid].bottomClampLocked = !retortStandMap[itemUid].bottomClampLocked
  }
  function toggleBaseLock() {
    if (!retortStandMap[itemUid]) return
    retortStandMap[itemUid].baseLocked = !retortStandMap[itemUid].baseLocked
  }

  function moveTopClamp(dy: number) {
    if (!retortStandMap[itemUid]) return
    if (topClampLocked.value) return
    const current = retortStandMap[itemUid].topClampY
    const newY = Math.max(20, Math.min(280, current + dy))
    const delta = newY - current
    retortStandMap[itemUid].topClampY = newY
    for (const uid of retortStandMap[itemUid].slotOccupants.filter(Boolean) as string[]) {
      const burette = items.value.find(i => i.uid === uid)
      if (burette) burette.y += delta
    }
  }

  function moveBottomClamp(dx: number, dy: number) {
    if (!retortStandMap[itemUid]) return
    if (bottomClampLocked.value) return
    const currentX = retortStandMap[itemUid].bottomClampX
    const currentY = retortStandMap[itemUid].bottomClampY
    const newX = Math.max(-100, Math.min(35, currentX + dx))
    const newY = Math.max(90, Math.min(300, currentY + dy))
    const deltaX = newX - currentX
    const deltaY = newY - currentY
    retortStandMap[itemUid].bottomClampX = newX
    retortStandMap[itemUid].bottomClampY = newY
    const beaker = items.value.find(i => i.uid === retortStandMap[itemUid].bottomSlotOccupant)
    if (beaker) {
      beaker.x += deltaX
      beaker.y += deltaY
    }
  }

  const attachedItems = computed(() => {
    const stand = st.value
    if (!stand) return []
    const result: { uid: string; slotOffset: number; slotIndex: number; item: LabItem }[] = []
    for (let i = 0; i < stand.slotOffsets.length; i++) {
      const uid = stand.slotOccupants[i]
      if (uid) {
        const item = items.value.find((i: LabItem) => i.uid === uid)
        if (item) result.push({ uid, slotOffset: stand.slotOffsets[i], slotIndex: i, item })
      }
    }
    return result
  })

  function getAttachedStyle(id: string, slotOffset: number) {
    if (id.startsWith('burette')) {
      return {
        left: (54 + slotOffset - 28.5) + 'px',
        top: (clampY.value + 14 - 52) + 'px',
        width: '57px',
        height: '198px',
      }
    }
    if (id.startsWith('pipette')) {
      return {
        left: (54 + slotOffset - 16.75) + 'px',
        top: (clampY.value + 14 - 55) + 'px',
        width: '34px',
        height: '154px',
      }
    }
    if (id.startsWith('grad-cylinder')) {
      return {
        left: (54 + slotOffset - 25.1) + 'px',
        top: (clampY.value + 14 - 36.9) + 'px',
        width: '50px',
        height: '106px',
      }
    }
    return { left: '0px', top: '0px', width: '50px', height: '150px' }
  }

  function onAttachedMouseDown(e: MouseEvent, uid: string) {
    e.stopPropagation()
    emitBuretteClick(e, uid)
  }

  function onBaseOrRodMouseDown(e: MouseEvent) {
    if (baseLocked.value) {
      e.stopPropagation()
      return
    }
    emitMousedown(e)
  }

  function onRetortStandMouseDown(e: MouseEvent) {
    if (baseLocked.value) {
      e.stopPropagation()
      return
    }
    emitMousedown(e)
  }

  onMounted(() => {
    if (!retortStandMap[itemUid]) {
      retortStandMap[itemUid] = { leftBuretteUid: null, rightBuretteUid: null, leftContainerUid: null, rightContainerUid: null, heatingDeviceUid: null, topClampY: 60, bottomClampY: 160, bottomClampX: 0, slotOffsets: [30, 79, 128], slotOccupants: [null, null, null], bottomSlotOccupant: null, topClampLocked: true, bottomClampLocked: true, baseLocked: false }
    }
  })

  const {
    clampDragging,
    bottomClampDragging,
    onClampMouseDown,
    onBottomClampMouseDown,
    cleanupDrag,
  } = useRetortStandDrag(
    () => clampY.value,
    () => bottomClampX.value,
    () => bottomClampY.value,
    () => topClampLocked.value,
    () => bottomClampLocked.value,
    (deltaY) => {
      if (!retortStandMap[itemUid]) return
      retortStandMap[itemUid].topClampY += deltaY
      const s = retortStandMap[itemUid]
      for (const uid of s.slotOccupants.filter(Boolean) as string[]) {
        const burette = items.value.find((i: LabItem) => i.uid === uid)
        if (burette) burette.y += deltaY
      }
    },
    (deltaX, deltaY) => {
      if (!retortStandMap[itemUid]) return
      retortStandMap[itemUid].bottomClampX += deltaX
      retortStandMap[itemUid].bottomClampY += deltaY
      const s = retortStandMap[itemUid]
      if (s.bottomSlotOccupant) {
        const beaker = items.value.find((i: LabItem) => i.uid === s.bottomSlotOccupant)
        if (beaker) { beaker.x += deltaX; beaker.y += deltaY }
      }
    },
  )

  onUnmounted(() => {
    cleanupDrag()
    cleanupAnalog()
  })

  return {
    st,
    clampY,
    bottomClampX,
    bottomClampY,
    isSnapTarget,
    isTopSnapTarget,
    topClampLocked,
    bottomClampLocked,
    baseLocked,
    attachedItems,
    clampDragging,
    bottomClampDragging,
    topAnalogDragging,
    topAnalogOffset,
    bottomAnalogDragging,
    bottomAnalogOffsetX,
    bottomAnalogOffsetY,
    onClampMouseDown,
    onBottomClampMouseDown,
    onTopAnalogDown,
    onBottomAnalogDown,
    onBaseOrRodMouseDown,
    onRetortStandMouseDown,
    onAttachedMouseDown,
    toggleTopClampLock,
    toggleBottomClampLock,
    toggleBaseLock,
    getAttachedStyle,
  }
}
