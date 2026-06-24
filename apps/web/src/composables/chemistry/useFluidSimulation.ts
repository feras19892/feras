interface Particle {
  x: number; // 0-140 (beaker width)
  y: number; // 0-200 (beaker height)
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

interface FluidSimConfig {
  width: number;
  height: number;
  wallLeft: number;
  wallRight: number;
  bottomY: number;
  topY: number;
  tiltAngle: number; // degrees
  volume: number; // 0-100 percentage
}

const GRAVITY = 0.3;
const DAMPING = 0.85;
const PARTICLE_RADIUS = 2.5;
const NUM_PARTICLES = 80;

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

  private draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Clip to beaker shape so particles never leak outside
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(38, 25);
    ctx.lineTo(38, 158);
    ctx.quadraticCurveTo(38, 172, 70, 172);
    ctx.quadraticCurveTo(102, 172, 102, 158);
    ctx.lineTo(102, 25);
    ctx.closePath();
    ctx.clip();

    // Draw liquid body as gradient from particles
    const { bottomY, volume } = this.config;
    if (volume > 0) {
      // Find surface particles
      const surfaceY = Math.min(...this.particles.map(p => p.y));
      
      // Draw liquid body
      ctx.save();
      ctx.beginPath();
      
      // Build surface path from particle positions
      const sorted = [...this.particles].sort((a, b) => a.x - b.x);
      if (sorted.length > 0) {
        ctx.moveTo(sorted[0].x, sorted[0].y);
        for (let i = 1; i < sorted.length; i++) {
          ctx.lineTo(sorted[i].x, sorted[i].y);
        }
        ctx.lineTo(sorted[sorted.length - 1].x, bottomY);
        ctx.lineTo(sorted[0].x, bottomY);
      }
      ctx.closePath();
      
      // Gradient fill
      const grad = ctx.createLinearGradient(0, surfaceY, 0, bottomY);
      grad.addColorStop(0, 'rgba(96, 165, 250, 0.35)');
      grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)');
      grad.addColorStop(1, 'rgba(37, 99, 235, 0.6)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147, 197, 253, ${p.opacity})`;
      ctx.fill();
      
      // Highlight
      ctx.beginPath();
      ctx.arc(p.x - 0.5, p.y - 0.5, p.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
      ctx.fill();
    }

    // Draw surface line
    if (this.particles.length > 0) {
      const surfaceParticles = this.particles.filter(p => p.y < this.getLiquidLevelAt(p.x) + 10);
      if (surfaceParticles.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        const sorted = surfaceParticles.sort((a, b) => a.x - b.x);
        ctx.moveTo(sorted[0].x, sorted[0].y);
        for (let i = 1; i < sorted.length; i++) {
          ctx.lineTo(sorted[i].x, sorted[i].y);
        }
        ctx.stroke();
      }
    }
    ctx.restore(); // close clip
  }

  private loop = () => {
    this.update();
    this.draw();
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
