export interface SolidFluidConfig {
  canvas: HTMLCanvasElement;
  volume: number;
  maxVolume: number;
  color: string;
  tiltAngle: number;
  onSpill?: (amount: number) => void;
}

export interface Drop { x: number; y: number; vy: number; }

export const W = 140;
export const H = 300;
export const BEAKER_LEFT = 38;
export const BEAKER_RIGHT = 102;
export const BEAKER_BOTTOM_CURVE_Y = 172;
export const BEAKER_TOP_Y = 25;
export const BEAKER_CENTER_X = 70;
export const BEAKER_WIDTH = BEAKER_RIGHT - BEAKER_LEFT;
