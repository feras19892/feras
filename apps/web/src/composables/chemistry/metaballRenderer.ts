import type { FluidParticle } from './metaballTypes';
import { W, H } from './metaballTypes';

export function renderMetaballFluid(
  ctx: CanvasRenderingContext2D,
  particles: FluidParticle[],
  color: string
) {
  ctx.clearRect(0, 0, W, H);

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(38, 25); ctx.lineTo(38, 158);
  ctx.quadraticCurveTo(38, 172, 70, 172);
  ctx.quadraticCurveTo(102, 172, 102, 158);
  ctx.lineTo(102, 25); ctx.closePath();
  ctx.clip();

  ctx.save();
  ctx.filter = 'blur(5px) contrast(8)';
  ctx.fillStyle = color;
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x - 1, p.y - 1, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
  }

  if (particles.length > 0) {
    const surface = particles.slice().sort((a, b) => a.y - b.y).slice(0, 8);
    const sX = surface.reduce((s, p) => s + p.x, 0) / surface.length;
    const sY = surface.reduce((s, p) => s + p.y, 0) / surface.length;
    ctx.beginPath(); ctx.moveTo(sX - 20, sY);
    ctx.quadraticCurveTo(sX, sY - 2, sX + 20, sY);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.2; ctx.stroke();
  }

  ctx.restore();
}
