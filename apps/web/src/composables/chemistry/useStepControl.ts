import { undoMicro, redoMicro } from './useChemistryHistory';

/** Revert one drop step (0.05 mL) using micro history */
export function stepUndo(): boolean {
  const ok = undoMicro();
  if (ok) console.log('[stepUndo] Reverted one micro drop step');
  return ok;
}

/** Forward one drop step using micro history */
export function stepRedo(): boolean {
  const ok = redoMicro();
  if (ok) console.log('[stepRedo] Forwarded one micro drop step');
  return ok;
}
