import Matter from 'matter-js';
import { getLiquid } from './useChemistryLab';
import type { LiquidSimConfig } from './liquidSimTypes';
import { W, H, NUM_PARTICLES, PARTICLE_RADIUS } from './liquidSimTypes';
import { drawParticles } from './liquidSimRenderer';

export class LiquidSimulation {
  private engine: Matter.Engine | null = null;
  private world: Matter.World | null = null;
  private particles: Matter.Body[] = [];
  private animId = 0;
  private config: LiquidSimConfig;

  constructor(config: LiquidSimConfig) {
    this.config = config;
    console.log('[LiquidSim] constructor called, canvas:', !!config.canvas, 'volume:', config.volume);
  }

  init() {
    console.log('[LiquidSim] init() called, canvas:', !!this.config.canvas);
    if (!this.config.canvas) {
      console.warn('[LiquidSim] canvas not ready, retrying in 100ms...');
      setTimeout(() => this.init(), 100);
      return;
    }

    if (this.engine) {
      console.log('[LiquidSim] engine already exists, skipping init');
      return;
    }

    this.engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });
    this.world = this.engine.world;
    console.log('[LiquidSim] Matter engine created');

    this.createWalls();
    this.createParticles();
    console.log('[LiquidSim] starting loop...');
    this.loop();
    console.log('[LiquidSim] init complete, particles:', this.particles.length);
  }

  private createWalls() {
    if (!this.world) return;
    const cx = 70, cy = 100, bw = 60, bh = 120, wt = 3;

    const bottom = Matter.Bodies.rectangle(cx, cy + bh / 2, bw + wt * 2, wt, {
      isStatic: true, friction: 0.5, restitution: 0.1,
    });
    const leftWall = Matter.Bodies.rectangle(cx - bw / 2 - wt / 2, cy, wt, bh, {
      isStatic: true, friction: 0.5, restitution: 0.1,
    });
    const rightWall = Matter.Bodies.rectangle(cx + bw / 2 + wt / 2, cy, wt, bh, {
      isStatic: true, friction: 0.5, restitution: 0.1,
    });

    Matter.Composite.add(this.world, [bottom, leftWall, rightWall]);
    console.log('[LiquidSim] walls created at bottom y:', cy + bh / 2);
  }

  private createParticles() {
    if (!this.world) return;
    console.log('[LiquidSim] createParticles called, volume:', this.config.volume);

    // Remove old particles
    this.particles.forEach(p => Matter.Composite.remove(this.world!, p));
    this.particles = [];

    if (this.config.volume <= 0) {
      console.log('[LiquidSim] volume <= 0, no particles');
      return;
    }

    const count = Math.floor(NUM_PARTICLES * Math.min(this.config.volume / this.config.maxVolume, 1));
    console.log('[LiquidSim] creating', count, 'particles');

    const liq = this.config.itemUid ? getLiquid(this.config.itemUid) : null;
    const visc = liq ? Math.max(0.001, liq.viscosity * 0.15) : 0.02;
    const dens = liq ? liq.density * 0.001 : 0.001;

    const cx = 70, baseY = 148, cols = 8;
    for (let i = 0; i < count; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const px = cx - 20 + col * 5 + (Math.random() - 0.5) * 2;
      const py = baseY - row * 5 - (Math.random() - 0.5) * 2;

      const p = Matter.Bodies.circle(px, py, PARTICLE_RADIUS, {
        friction: 0.05, frictionAir: visc, restitution: 0.15, density: dens,
      });
      this.particles.push(p);
      Matter.Composite.add(this.world, p);
    }
    console.log('[LiquidSim] particles created:', this.particles.length);
  }

  private applySurfaceTension(strength: number) {
    const attractRange = 12, forceMult = strength * 0.0003;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i], p2 = this.particles[j];
        const dx = p2.position.x - p1.position.x;
        const dy = p2.position.y - p1.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < attractRange && dist > 0.1) {
          const force = (attractRange - dist) * forceMult;
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          Matter.Body.applyForce(p1, p1.position, { x: fx, y: fy });
          Matter.Body.applyForce(p2, p2.position, { x: -fx, y: -fy });
        }
      }
    }
  }

  private loop = () => {
    if (!this.engine || !this.config.canvas) { console.log('[LiquidSim] loop skipped'); return; }
    Matter.Engine.update(this.engine, 1000 / 60);

    const liq = this.config.itemUid ? getLiquid(this.config.itemUid) : null;
    if (liq && liq.surfaceTension > 0) this.applySurfaceTension(liq.surfaceTension);

    if (this.config.canvas && this.engine) {
      const ctx = this.config.canvas.getContext('2d');
      if (ctx) drawParticles(ctx, this.particles, this.config);
    }
    this.animId = requestAnimationFrame(this.loop);
  };

  updateVolume(volume: number) {
    console.log('[LiquidSim] updateVolume:', volume);
    this.config.volume = volume;
    if (volume > 0 && !this.engine) {
      setTimeout(() => this.init(), 100);
    } else if (this.world) {
      this.createParticles();
    }
  }

  updateColor(color: string) {
    this.config.color = color;
  }

  destroy() {
    console.log('[LiquidSim] destroy called');
    if (this.animId) cancelAnimationFrame(this.animId);
    if (this.engine) { Matter.Engine.clear(this.engine); this.engine = null; }
    this.world = null; this.particles = [];
  }
}
