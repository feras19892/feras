import type { BiologyTrackingState, PartExploration } from './types.js';

/** ينشئ حالة تتبع فارغة جديدة. */
export function createTrackingState(): BiologyTrackingState {
  return {
    exploredParts: [],
    toolsUsed: [],
    stagesVisited: [],
    startedAt: null,
    durationMs: 0,
    sequence: [],
  };
}

/** يسجل زيارة جزء في التجربة. */
export function trackPart(
  state: BiologyTrackingState,
  partId: string,
  label: string,
  now = Date.now(),
): BiologyTrackingState {
  const existing = state.exploredParts.find((p) => p.partId === partId);
  let exploredParts: PartExploration[];
  if (existing) {
    exploredParts = state.exploredParts.map((p) =>
      p.partId === partId
        ? { ...p, visits: p.visits + 1, lastAt: now }
        : p,
    );
  } else {
    exploredParts = [
      ...state.exploredParts,
      { partId, label, visits: 1, firstAt: now, lastAt: now },
    ];
  }
  const sequence = state.sequence.includes(partId)
    ? state.sequence
    : [...state.sequence, partId];
  return {
    ...state,
    exploredParts,
    sequence,
    startedAt: state.startedAt ?? now,
  };
}

/** يسجل استخدام أداة. */
export function trackTool(
  state: BiologyTrackingState,
  toolId: string,
): BiologyTrackingState {
  if (state.toolsUsed.includes(toolId)) return state;
  return {
    ...state,
    toolsUsed: [...state.toolsUsed, toolId],
  };
}

/** يسجل زيارة مرحلة. */
export function trackStage(
  state: BiologyTrackingState,
  stageId: string,
): BiologyTrackingState {
  if (state.stagesVisited.includes(stageId)) return state;
  return {
    ...state,
    stagesVisited: [...state.stagesVisited, stageId],
  };
}

/** يحسب مدة الجلسة. */
export function finalizeDuration(
  state: BiologyTrackingState,
  now = Date.now(),
): BiologyTrackingState {
  if (state.startedAt === null) return state;
  return { ...state, durationMs: now - state.startedAt };
}
