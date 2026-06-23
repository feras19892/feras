import Matter from 'matter-js';
import { getLiquid } from './useChemistryLab';

export interface LiquidSimConfig {
  canvas: HTMLCanvasElement | null;
  volume: number;
  maxVolume: number;
  color: string;
  itemUid?: string;
}

const W = 140;
const H = 200;
const NUM_PARTICLES = 100;
const PARTICLE_RADIUS = 4;

function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return { r: isNaN(r) ? 59 : r, g: isNaN(g) ? 130 : g, b: isNaN(b) ? 246 : b };
}

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

  private drawParticles() {
    console.log('[LiquidSim] drawParticles called, particles:', this.particles.length);
    const canvas = this.config.canvas;
    if (!canvas || !this.engine) { console.log('[LiquidSim] drawParticles skipped: no canvas/engine'); return; }
    const ctx = canvas.getContext('2d');
    if (!ctx) { console.log('[LiquidSim] drawParticles skipped: no ctx'); return; }

    ctx.clearRect(0, 0, W, H);

    // Debug: draw a faint border so we know canvas is alive
    ctx.strokeStyle = 'rgba(255,0,0,0.1)';
    ctx.strokeRect(0, 0, W, H);

    ctx.save();
    // Clip to beaker shape
    ctx.beginPath();
    ctx.moveTo(38, 25); ctx.lineTo(38, 158);
    ctx.quadraticCurveTo(38, 172, 70, 172);
    ctx.quadraticCurveTo(102, 172, 102, 158);
    ctx.lineTo(102, 25); ctx.closePath();
    ctx.clip();

    // Blob background
    if (this.particles.length > 0) {
      const rgb = hexToRgb(this.config.color);
      ctx.beginPath();
      const avgX = this.particles.reduce((s, p) => s + p.position.x, 0) / this.particles.length;
      const avgY = this.particles.reduce((s, p) => s + p.position.y, 0) / this.particles.length;
      ctx.arc(avgX, avgY, 38, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
      ctx.fill();
    }

    // Particles
    for (const p of this.particles) {
      const rgb = hexToRgb(this.config.color);
      ctx.beginPath();
      ctx.arc(p.position.x, p.position.y, PARTICLE_RADIUS + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`;
      ctx.fill();
      // Highlight
      ctx.beginPath();
      ctx.arc(p.position.x - 1, p.position.y - 1, PARTICLE_RADIUS * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fill();
    }

    // Meniscus
    if (this.particles.length > 0) {
      const surface = this.particles.filter(p => p.velocity.y < 0.3)
        .sort((a, b) => a.position.y - b.position.y).slice(0, 8);
      if (surface.length > 2) {
        const sX = surface.reduce((s, p) => s + p.position.x, 0) / surface.length;
        const sY = surface.reduce((s, p) => s + p.position.y, 0) / surface.length;
        ctx.beginPath(); ctx.moveTo(sX - 20, sY);
        ctx.quadraticCurveTo(sX, sY - 2, sX + 20, sY);
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
      }
    }

    ctx.restore();
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

    this.drawParticles();
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
