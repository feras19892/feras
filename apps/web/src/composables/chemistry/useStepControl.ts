import { undoMicro, redoMicro } from './useChemistryHistory';

/** Revert one drop step (0.05 mL) using micro history */
export function stepUndo(): boolean {
  return undoMicro();
}

/** Forward one drop step using micro history */
export function stepRedo(): boolean {
  return redoMicro();
}
