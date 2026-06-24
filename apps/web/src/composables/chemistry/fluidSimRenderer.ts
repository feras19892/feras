import type { Particle, FluidSimConfig } from './fluidSimTypes';

export function renderFluidSimulation(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  config: FluidSimConfig,
  getLiquidLevelAt: (x: number) => number
) {
  const w = config.width;
  const h = config.height;
  const bottomY = config.bottomY;
  const volume = config.volume;

  ctx.clearRect(0, 0, w, h);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(38, 25);
  ctx.lineTo(38, 158);
  ctx.quadraticCurveTo(38, 172, 70, 172);
  ctx.quadraticCurveTo(102, 172, 102, 158);
  ctx.lineTo(102, 25);
  ctx.closePath();
  ctx.clip();

  if (volume > 0) {
    const surfaceY = Math.min(...particles.map(p => p.y));
    ctx.save();
    ctx.beginPath();
    const sorted = [...particles].sort((a, b) => a.x - b.x);
    if (sorted.length > 0) {
      ctx.moveTo(sorted[0].x, sorted[0].y);
      for (let i = 1; i < sorted.length; i++) {
        ctx.lineTo(sorted[i].x, sorted[i].y);
      }
      ctx.lineTo(sorted[sorted.length - 1].x, bottomY);
      ctx.lineTo(sorted[0].x, bottomY);
    }
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, surfaceY, 0, bottomY);
    grad.addColorStop(0, 'rgba(96, 165, 250, 0.35)');
    grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.5)');
    grad.addColorStop(1, 'rgba(37, 99, 235, 0.6)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
  }

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(147, 197, 253, ${p.opacity})`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x - 0.5, p.y - 0.5, p.radius * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.5})`;
    ctx.fill();
  }

  if (particles.length > 0) {
    const surfaceParticles = particles.filter(p => p.y < getLiquidLevelAt(p.x) + 10);
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
  ctx.restore();
}
