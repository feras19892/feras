export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

export interface FluidSimConfig {
  width: number;
  height: number;
  wallLeft: number;
  wallRight: number;
  bottomY: number;
  topY: number;
  tiltAngle: number;
  volume: number;
}

export const GRAVITY = 0.3;
export const DAMPING = 0.85;
export const PARTICLE_RADIUS = 2.5;
export const NUM_PARTICLES = 80;
