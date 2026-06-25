import type { MetaballConfig, FluidParticle } from './metaballTypes';
import { H, GRAVITY_Y, RADIAN_FACTOR, WALL_LEFT, WALL_RIGHT, WALL_BOTTOM, WALL_TOP } from './metaballTypes';
import { renderMetaballFluid } from './metaballRenderer';

export class MetaballFluid {
  private ctx: CanvasRenderingContext2D;
  private particles: FluidParticle[] = [];
  private running = true;
  private animId = 0;
  private color: string;
  private volume = 0;
  private maxVolume = 250;
  public tiltAngle = 0;

  // SPH-like fluid properties
  private interactionRadius = 12;
  private stiffness = 0.15;
  private restDensity = 4.0;
  private friction = 0.96;

  constructor(config: MetaballConfig) {
    const ctx = config.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not available');
    this.ctx = ctx;
    this.color = config.color;
    this.volume = config.volume;
    this.maxVolume = config.maxVolume;
    this.tiltAngle = config.tiltAngle;
    this.spawnParticles();
  }

  private spawnParticles() {
    const count = Math.floor(120 * Math.min(this.volume / this.maxVolume, 1));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: 45 + Math.random() * 50,
        y: 150 - Math.random() * 30,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0,
        density: 0,
      });
    }
  }

  init() {
    if (!this.running) { this.running = true; }
    this.loop();
  }

  destroy() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  private update() {
    const pCount = this.particles.length;
    const rad = this.tiltAngle * RADIAN_FACTOR;
    const currentGravityX = GRAVITY_Y * Math.sin(rad);
    const currentGravityY = GRAVITY_Y * Math.cos(rad);

    // 1. Density field
    for (let i = 0; i < pCount; i++) {
      let density = 0;
      const pi = this.particles[i];
      for (let j = 0; j < pCount; j++) {
        const pj = this.particles[j];
        const dx = pj.x - pi.x;
        const dy = pj.y - pi.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < this.interactionRadius * this.interactionRadius) {
          density += 1.0 - Math.sqrt(distSq) / this.interactionRadius;
        }
      }
      pi.density = density;
    }

    // 2. Pressure & cohesion forces
    for (let i = 0; i < pCount; i++) {
      const pi = this.particles[i];
      const pressure = this.stiffness * (pi.density - this.restDensity);
      let forceX = 0, forceY = 0;

      for (let j = 0; j < pCount; j++) {
        if (i === j) continue;
        const pj = this.particles[j];
        const dx = pj.x - pi.x;
        const dy = pj.y - pi.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.interactionRadius && dist > 0.1) {
          const dirX = dx / dist;
          const dirY = dy / dist;
          const weight = 1.0 - dist / this.interactionRadius;
          const totalForce = (pressure + this.stiffness * (pj.density - this.restDensity)) * weight;
          forceX -= dirX * totalForce;
          forceY -= dirY * totalForce;
        }
      }

      pi.vx += forceX + currentGravityX;
      pi.vy += forceY + currentGravityY;
      pi.vx *= this.friction;
      pi.vy *= this.friction;
      pi.x += pi.vx;
      pi.y += pi.vy;

      this.handleBoundaries(pi, rad);
    }
  }

  private handleBoundaries(p: FluidParticle, _rad: number) {
    // Simple beaker walls (ignoring tilt for wall collision — particles stay inside rotated beaker)
    if (p.x < WALL_LEFT) { p.x = WALL_LEFT; p.vx = Math.abs(p.vx) * 0.2; }
    if (p.x > WALL_RIGHT) { p.x = WALL_RIGHT; p.vx = -Math.abs(p.vx) * 0.2; }
    if (p.y > WALL_BOTTOM) { p.y = WALL_BOTTOM; p.vy = -Math.abs(p.vy) * 0.2; }

    // Spill: if tilted enough and near top, particles can escape
    const spillThreshold = Math.abs(this.tiltAngle) > 30;
    if (spillThreshold && p.y < WALL_TOP && p.x > WALL_LEFT && p.x < WALL_RIGHT) {
      // Particle escaped — apply extra gravity and floor
      p.vy += GRAVITY_Y;
      if (p.y > H - 5) {
        p.y = H - 5;
        p.vy = 0;
        p.vx *= 0.5;
      }
    } else if (p.y < WALL_TOP) {
      p.y = WALL_TOP;
      p.vy = Math.abs(p.vy) * 0.2;
    }
  }

  private loop = () => {
    if (!this.running) return;
    this.update();
    renderMetaballFluid(this.ctx, this.particles, this.color);
    this.animId = requestAnimationFrame(this.loop);
  };

  updateVolume(volume: number, maxVolume: number) {
    this.volume = volume;
    this.maxVolume = maxVolume;
    this.spawnParticles();
  }

  updateColor(color: string) {
    this.color = color;
  }

  updateTilt(angle: number) {
    this.tiltAngle = angle;
  }
}
