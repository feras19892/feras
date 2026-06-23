export interface FluidConfig {
  canvas: HTMLCanvasElement;
  volume: number;
  maxVolume: number;
  color: string;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
}

const W = 140;
const H = 200;
const GRAVITY = 0.4;
const FRICTION = 0.95;
const BOUNCE = 0.3;
const COHESION_RANGE = 14;
const COHESION_STRENGTH = 0.003;
const WALL_LEFT = 42;
const WALL_RIGHT = 98;
const WALL_BOTTOM = 165;
const WALL_TOP = 25;

function hexToRgb(hex: string) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.substring(0, 2), 16) || 59,
    g: parseInt(c.substring(2, 4), 16) || 130,
    b: parseInt(c.substring(4, 6), 16) || 246,
  };
}

export class SimpleFluid {
  private canvas: HTMLCanvasElement;
  private particles: Particle[] = [];
  private animId = 0;
  private color: string;
  private running = false;
  private volume = 0;
  private maxVolume = 250;

  constructor(config: FluidConfig) {
    this.canvas = config.canvas;
    this.color = config.color;
    this.volume = config.volume;
    this.maxVolume = config.maxVolume;
  }

  init() {
    this.spawnParticles();
    if (!this.running) {
      this.running = true;
      this.loop();
    }
  }

  private spawnParticles() {
    const count = Math.floor(80 * Math.min(this.volume / this.maxVolume, 1));
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: 45 + Math.random() * 50,
        y: 155 - Math.random() * 25,
        vx: (Math.random() - 0.5) * 0.5,
        vy: 0,
      });
    }
  }

  private update() {
    for (const p of this.particles) {
      p.vy += GRAVITY;
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < WALL_LEFT) { p.x = WALL_LEFT; p.vx = Math.abs(p.vx) * BOUNCE; }
      if (p.x > WALL_RIGHT) { p.x = WALL_RIGHT; p.vx = -Math.abs(p.vx) * BOUNCE; }
      if (p.y > WALL_BOTTOM) { p.y = WALL_BOTTOM; p.vy = -Math.abs(p.vy) * BOUNCE; }
      if (p.y < WALL_TOP) { p.y = WALL_TOP; p.vy = Math.abs(p.vy) * BOUNCE; }
    }

    // Cohesion
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i], p2 = this.particles[j];
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < COHESION_RANGE && dist > 0.1) {
          const force = (COHESION_RANGE - dist) * COHESION_STRENGTH;
          p1.vx += (dx / dist) * force; p1.vy += (dy / dist) * force;
          p2.vx -= (dx / dist) * force; p2.vy -= (dy / dist) * force;
        }
      }
    }
  }

  private draw() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(38, 25); ctx.lineTo(38, 158);
    ctx.quadraticCurveTo(38, 172, 70, 172);
    ctx.quadraticCurveTo(102, 172, 102, 158);
    ctx.lineTo(102, 25); ctx.closePath();
    ctx.clip();

    const rgb = hexToRgb(this.color);

    if (this.particles.length > 0) {
      const avgX = this.particles.reduce((s, p) => s + p.x, 0) / this.particles.length;
      const avgY = this.particles.reduce((s, p) => s + p.y, 0) / this.particles.length;
      ctx.beginPath(); ctx.arc(avgX, avgY, 36, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
      ctx.fill();
    }

    for (const p of this.particles) {
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
      ctx.fill();
      ctx.beginPath(); ctx.arc(p.x - 1, p.y - 1, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }

    if (this.particles.length > 0) {
      const surface = this.particles.slice().sort((a, b) => a.y - b.y).slice(0, 8);
      const sX = surface.reduce((s, p) => s + p.x, 0) / surface.length;
      const sY = surface.reduce((s, p) => s + p.y, 0) / surface.length;
      ctx.beginPath(); ctx.moveTo(sX - 20, sY);
      ctx.quadraticCurveTo(sX, sY - 2, sX + 20, sY);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
    }

    ctx.restore();
  }

  private loop = () => {
    if (!this.running) return;
    this.update();
    this.draw();
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

  destroy() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}
