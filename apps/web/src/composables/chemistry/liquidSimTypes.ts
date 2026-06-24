export interface LiquidSimConfig {
  canvas: HTMLCanvasElement | null;
  volume: number;
  maxVolume: number;
  color: string;
  itemUid?: string;
}

export const W = 140;
export const H = 200;
export const NUM_PARTICLES = 100;
export const PARTICLE_RADIUS = 4;
