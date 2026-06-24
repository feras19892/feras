import type { LiquidSimConfig } from './liquidSimTypes';
import { W, H, PARTICLE_RADIUS } from './liquidSimTypes';
import { hexToRgb } from './chemColorUtils';
import type Matter from 'matter-js';

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Matter.Body[],
  config: LiquidSimConfig
) {
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(255,0,0,0.1)';
  ctx.strokeRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(38, 25); ctx.lineTo(38, 158);
  ctx.quadraticCurveTo(38, 172, 70, 172);
  ctx.quadraticCurveTo(102, 172, 102, 158);
  ctx.lineTo(102, 25); ctx.closePath();
  ctx.clip();

  if (particles.length > 0) {
    const rgb = hexToRgb(config.color);
    ctx.beginPath();
    const avgX = particles.reduce((s, p) => s + p.position.x, 0) / particles.length;
    const avgY = particles.reduce((s, p) => s + p.position.y, 0) / particles.length;
    ctx.arc(avgX, avgY, 38, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`;
    ctx.fill();
  }

  for (const p of particles) {
    const rgb = hexToRgb(config.color);
    ctx.beginPath();
    ctx.arc(p.position.x, p.position.y, PARTICLE_RADIUS + 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.position.x - 1, p.position.y - 1, PARTICLE_RADIUS * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }

  if (particles.length > 0) {
    const surface = particles.filter(p => p.velocity.y < 0.3)
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
