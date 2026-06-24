import type { Particle, FluidSimConfig } from './fluidSimTypes';
import { GRAVITY, DAMPING, PARTICLE_RADIUS, NUM_PARTICLES } from './fluidSimTypes';
import { renderFluidSimulation } from './fluidSimRenderer';

export class FluidSimulation {
  private particles: Particle[] = [];
  private config: FluidSimConfig;
  private animId = 0;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, config: FluidSimConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    this.initParticles();
    this.start();
  }

  private initParticles() {
    this.particles = [];
    const count = Math.floor(NUM_PARTICLES * (this.config.volume / 100));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.config.wallLeft + 10 + Math.random() * (this.config.wallRight - this.config.wallLeft - 20),
        y: this.config.bottomY - 10 - Math.random() * (this.config.bottomY - this.config.topY - 20) * (this.config.volume / 100),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: PARTICLE_RADIUS + Math.random() * 1.5,
        color: '#60a5fa',
        opacity: 0.4 + Math.random() * 0.3,
      });
    }
  }

  updateConfig(config: FluidSimConfig) {
    const oldVolume = this.config.volume;
    this.config = config;
    if (Math.abs(config.volume - oldVolume) > 5) {
      this.initParticles();
    }
  }

  private update() {
    const { wallLeft, wallRight, tiltAngle } = this.config;
    const bottomY = 168; // tighter to stay inside beaker curve
    const tiltRad = (tiltAngle * Math.PI) / 180;
    const gravityX = Math.sin(tiltRad) * GRAVITY;
    const gravityY = Math.cos(tiltRad) * GRAVITY;

    for (const p of this.particles) {
      // Apply gravity based on tilt
      p.vx += gravityX;
      p.vy += gravityY;

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wall collisions (left curved wall approximation)
      const wallL = wallLeft + (p.y < 100 ? (100 - p.y) * 0.15 : 0);
      const wallR = wallRight - (p.y < 100 ? (100 - p.y) * 0.15 : 0);

      if (p.x - p.radius < wallL) {
        p.x = wallL + p.radius;
        p.vx *= -DAMPING;
      }
      if (p.x + p.radius > wallR) {
        p.x = wallR - p.radius;
        p.vx *= -DAMPING;
      }

      // Bottom collision
      if (p.y + p.radius > bottomY) {
        p.y = bottomY - p.radius;
        p.vy *= -DAMPING;
      }

      // Surface collision (keep particles below liquid level)
      const liquidLevel = this.getLiquidLevelAt(p.x);
      if (p.y - p.radius < liquidLevel) {
        p.y = liquidLevel + p.radius;
        p.vy *= -DAMPING;
      }

      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;

      // Hard constraint: keep particles inside beaker
      if (!this.isInsideBeaker(p.x, p.y)) {
        // Push toward center
        const dx = p.x - 70;
        const dy = p.y - 100;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        p.x -= (dx / dist) * 2;
        p.y -= (dy / dist) * 2;
        p.vx *= 0.5;
        p.vy *= 0.5;
      }
    }

    // Simple collision between particles
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = p1.radius + p2.radius;
        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          p1.x -= nx * overlap * 0.5;
          p1.y -= ny * overlap * 0.5;
          p2.x += nx * overlap * 0.5;
          p2.y += ny * overlap * 0.5;
        }
      }
    }
  }

  private getLiquidLevelAt(x: number): number {
    const { topY, volume, tiltAngle } = this.config;
    const bottomY = 172;
    if (volume <= 0) return bottomY;
    const fillHeight = (volume / 100) * (bottomY - topY - 30);
    const baseLevel = bottomY - fillHeight;
    const tiltOffset = Math.tan((tiltAngle * Math.PI) / 180) * (x - 70);
    return baseLevel + tiltOffset;
  }

  private isInsideBeaker(x: number, y: number): boolean {
    // Beaker: M 38 25 L 38 158 Q 38 172 70 172 Q 102 172 102 158 L 102 25
    if (y < 25 || y > 172) return false;
    if (x < 38 || x > 102) return false;
    if (y > 158) {
      // curved bottom: ellipse (70,158) with rx=32, ry=14
      const dx = (x - 70) / 32;
      const dy = (y - 158) / 14;
      if (dx * dx + dy * dy > 1) return false;
    }
    return true;
  }

  private loop = () => {
    this.update();
    renderFluidSimulation(this.ctx, this.particles, this.config, (x) => this.getLiquidLevelAt(x));
    this.animId = requestAnimationFrame(this.loop);
  };

  start() {
    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.animId);
  }

  destroy() {
    this.stop();
  }
}
