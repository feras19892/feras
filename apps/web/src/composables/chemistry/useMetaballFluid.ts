export interface MetaballConfig {
  canvas: HTMLCanvasElement;
  volume: number;
  maxVolume: number;
  color: string;
  tiltAngle: number;
}

interface FluidParticle {
  x: number; y: number;
  vx: number; vy: number;
  density: number;
}

const W = 140;
const H = 200;
const GRAVITY_Y = 0.25;
const RADIAN_FACTOR = Math.PI / 180;

// Beaker walls (matching SVG beaker)
const WALL_LEFT = 42;
const WALL_RIGHT = 98;
const WALL_BOTTOM = 165;
const WALL_TOP = 25;

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

  private draw() {
    this.ctx.clearRect(0, 0, W, H);

    // Clip to beaker shape
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(38, 25); this.ctx.lineTo(38, 158);
    this.ctx.quadraticCurveTo(38, 172, 70, 172);
    this.ctx.quadraticCurveTo(102, 172, 102, 158);
    this.ctx.lineTo(102, 25); this.ctx.closePath();
    this.ctx.clip();

    // Metaball effect: blur + contrast
    this.ctx.save();
    this.ctx.filter = 'blur(5px) contrast(8)';
    this.ctx.fillStyle = this.color;

    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();

    // Highlights on surface particles
    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x - 1, p.y - 1, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
      this.ctx.fill();
    }

    // Meniscus line
    if (this.particles.length > 0) {
      const surface = this.particles.slice().sort((a, b) => a.y - b.y).slice(0, 8);
      const sX = surface.reduce((s, p) => s + p.x, 0) / surface.length;
      const sY = surface.reduce((s, p) => s + p.y, 0) / surface.length;
      this.ctx.beginPath(); this.ctx.moveTo(sX - 20, sY);
      this.ctx.quadraticCurveTo(sX, sY - 2, sX + 20, sY);
      this.ctx.strokeStyle = 'rgba(255,255,255,0.4)'; this.ctx.lineWidth = 1.2; this.ctx.stroke();
    }

    this.ctx.restore();
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

  updateTilt(angle: number) {
    this.tiltAngle = angle;
  }
}
