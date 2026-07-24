import type { WorkshopComponent } from './types'

export function updateRelayStates(components: WorkshopComponent[]): boolean {
  let changed = false
  for (const comp of components) {
    if (comp.type === 'relay' && !comp.relayManualOverride) {
      const coilCurrent = comp.current
      const threshold = Math.max(comp.value * 1e-3, 1e-6)
      const newState = Math.abs(coilCurrent) > threshold
      if (newState !== comp.relayState) {
        comp.relayState = newState
        changed = true
      }
    }
    if (comp.type === 'breaker') {
      if (Math.abs(comp.current) > (comp.breakerRating ?? comp.value) && !comp.breakerTripped) {
        comp.breakerTripped = true
        changed = true
      }
    }
    if (comp.type === 'fuse') {
      if (Math.abs(comp.current) > comp.value && !comp.fuseBlown) {
        comp.fuseBlown = true
        changed = true
      }
    }
  }
  return changed
}
