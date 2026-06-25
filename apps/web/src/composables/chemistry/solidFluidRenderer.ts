import type { Drop } from './solidFluidTypes';
import {
  W, H, BEAKER_LEFT, BEAKER_RIGHT, BEAKER_BOTTOM_CURVE_Y,
  BEAKER_TOP_Y, BEAKER_CENTER_X, BEAKER_WIDTH
} from './solidFluidTypes';
import { hexToRgb } from '@my-modern-app/chemistry-engine';

export function renderSolidFluid(
  ctx: CanvasRenderingContext2D,
  volume: number,
  maxVolume: number,
  color: string,
  tiltAngle: number,
  waterWobble: number,
  spillingDrops: Drop[]
) {
  ctx.clearRect(0, 0, W, H);

  const liquidLevel = Math.min(volume / maxVolume, 1) * 120;
  const rgb = hexToRgb(color);

  if (liquidLevel >= 2) {
    const surfaceTilt = waterWobble;
    const halfW = BEAKER_WIDTH / 2;
    const bottomY = BEAKER_BOTTOM_CURVE_Y - 8;

    let topLeftY = (BEAKER_TOP_Y + BEAKER_BOTTOM_CURVE_Y) / 2 + 40 - liquidLevel + Math.sin(surfaceTilt) * halfW * 0.6;
    let topRightY = (BEAKER_TOP_Y + BEAKER_BOTTOM_CURVE_Y) / 2 + 40 - liquidLevel - Math.sin(surfaceTilt) * halfW * 0.6;

    const maxTopY = BEAKER_TOP_Y + 10;
    let isSpilling = false;
    let spillSide: 'left' | 'right' | null = null;

    if (topLeftY < maxTopY) { topLeftY = maxTopY; isSpilling = true; spillSide = 'left'; }
    if (topRightY < maxTopY) { topRightY = maxTopY; isSpilling = true; spillSide = 'right'; }

    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`;
    ctx.beginPath();
    ctx.moveTo(BEAKER_LEFT + 2, bottomY - 5);
    ctx.quadraticCurveTo(BEAKER_CENTER_X, BEAKER_BOTTOM_CURVE_Y + 2, BEAKER_RIGHT - 2, bottomY - 5);
    ctx.lineTo(BEAKER_RIGHT - 1, topRightY);
    ctx.lineTo(BEAKER_LEFT + 1, topLeftY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(BEAKER_LEFT + 2, topLeftY);
    ctx.lineTo(BEAKER_RIGHT - 2, topRightY);
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (isSpilling && spillSide && liquidLevel > 5) {
      const levelPct = liquidLevel / 120;
      const spillThreshold = 55 - levelPct * 45;
      const tiltAbs = Math.abs(tiltAngle);
      if (tiltAbs > spillThreshold) {
        const spillX = spillSide === 'left' ? BEAKER_LEFT : BEAKER_RIGHT;
        const spillY = maxTopY;
        const streamDir = spillSide === 'left' ? -1 : 1;
        ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(spillX, spillY);
        ctx.quadraticCurveTo(
          spillX + streamDir * 15, spillY + 40,
          spillX + streamDir * 8, BEAKER_BOTTOM_CURVE_Y + 30
        );
        ctx.stroke();
      }
    }
  }

  for (const d of spillingDrops) {
    ctx.beginPath();
    ctx.arc(d.x, d.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(d.x - 1.2, d.y - 1.2, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(d.x + 0.5, d.y + 0.5, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();
  }
}
