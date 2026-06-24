export interface MetaballConfig {
  canvas: HTMLCanvasElement;
  volume: number;
  maxVolume: number;
  color: string;
  tiltAngle: number;
}

export interface FluidParticle {
  x: number; y: number;
  vx: number; vy: number;
  density: number;
}

export const W = 140;
export const H = 200;
export const GRAVITY_Y = 0.25;
export const RADIAN_FACTOR = Math.PI / 180;
export const WALL_LEFT = 42;
export const WALL_RIGHT = 98;
export const WALL_BOTTOM = 165;
export const WALL_TOP = 25;
