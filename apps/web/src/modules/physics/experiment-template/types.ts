/**
 * قالب موحد لكل تجربة فيزيائية.
 * كل تجربة معينة (spring, pendulum...) تُعيد تعريف ExperimentConfig + المعادلات فقط.
 */

export interface ExperimentConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  /** params that user can change (sliders/inputs) */
  params: Record<string, number | string | boolean>;
  /** read-only constants for this experiment */
  constants?: Record<string, number>;
}

/** Single recorded measurement / trial */
export interface Trial {
  id: number;
  timestamp: number;
  params: Record<string, number>;
  measured: Record<string, number | null>;
}

/** State maintained by the unified runner */
export interface RunnerState {
  running: boolean;
  paused: boolean;
  t: number;
  speedMultiplier: number;
  signalSeries: { t: number; value: number }[];
  trail: { x: number; y: number }[];
}

/** Physics engine returns this every frame */
export interface FrameResult {
  /** Simulation time (s) */
  t: number;
  /** Values to plot on canvas */
  drawables: Drawable[];
  /** Values to record */
  readings: Record<string, number>;
}

export type Drawable =
  | { type: 'circle'; x: number; y: number; r: number; color: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; color: string; width: number }
  | { type: 'rect'; x: number; y: number; w: number; h: number; color: string }
  | { type: 'text'; x: number; y: number; text: string; color: string; size: number };

/** Panel visibility toggles (used by ExperimentShell) */
export interface PanelState {
  table: boolean;
  scatter: boolean;
  equations: boolean;
  signal: boolean;
  fft: boolean;
  params: boolean;
  guide: boolean;
  stats: boolean;
}
