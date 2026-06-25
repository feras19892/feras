import type { SolidFluidConfig, Drop } from './solidFluidTypes';
import {
  W, H, BEAKER_LEFT, BEAKER_RIGHT, BEAKER_BOTTOM_CURVE_Y,
  BEAKER_TOP_Y, BEAKER_CENTER_X, BEAKER_WIDTH
} from './solidFluidTypes';
import { hexToRgb } from '@my-modern-app/chemistry-engine';

export class SolidFluid {
  private ctx: CanvasRenderingContext2D;
  private running = true;
  private animId = 0;
  private color: string;
  private volume = 0;
  private maxVolume = 250;
  public tiltAngle = 0;
  private onSpill?: (amount: number) => void;

  // Wobble physics
  private waterWobble = 0; // current surface angle
  private wobbleVelocity = 0;

  // Spilling
  private spillingDrops: Drop[] = [];

  constructor(config: SolidFluidConfig) {
    const ctx = config.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not available');
    this.ctx = ctx;
    this.color = config.color;
    this.volume = config.volume;
    this.maxVolume = config.maxVolume;
    this.tiltAngle = config.tiltAngle;
    this.onSpill = config.onSpill;
  }

  init() {
    if (!this.running) this.running = true;
    this.loop();
  }

  destroy() {
    this.running = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  private getLiquidLevel(): number {
    // Map volume (0-maxVolume) to pixel height (0 ~ 120)
    return Math.min(this.volume / this.maxVolume, 1) * 120;
  }

  private update() {
    const rad = this.tiltAngle * (Math.PI / 180);

    // Wobble physics: surface tilts with the beaker
    const targetWobble = rad * 1.5;
    const force = (targetWobble - this.waterWobble) * 0.12;
    this.wobbleVelocity += force;
    this.wobbleVelocity *= 0.88; // damping
    this.waterWobble += this.wobbleVelocity;

    // Update drops
    for (let i = this.spillingDrops.length - 1; i >= 0; i--) {
      const d = this.spillingDrops[i];
      d.vy += 0.3;
      d.y += d.vy;
      if (d.y > H) this.spillingDrops.splice(i, 1);
    }
  }

  private draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);

    const liquidLevel = this.getLiquidLevel();
    const rgb = hexToRgb(this.color);

    // Draw liquid body only if volume > 0
    if (liquidLevel >= 2) {
      const surfaceTilt = this.waterWobble;
      const halfW = BEAKER_WIDTH / 2;
      const bottomY = BEAKER_BOTTOM_CURVE_Y - 8;

      let topLeftY = (BEAKER_TOP_Y + BEAKER_BOTTOM_CURVE_Y) / 2 + 40 - liquidLevel + Math.sin(surfaceTilt) * halfW * 0.6;
      let topRightY = (BEAKER_TOP_Y + BEAKER_BOTTOM_CURVE_Y) / 2 + 40 - liquidLevel - Math.sin(surfaceTilt) * halfW * 0.6;

      const maxTopY = BEAKER_TOP_Y + 10;
      let isSpilling = false;
      let spillSide: 'left' | 'right' | null = null;

      if (topLeftY < maxTopY) { topLeftY = maxTopY; isSpilling = true; spillSide = 'left'; }
      if (topRightY < maxTopY) { topRightY = maxTopY; isSpilling = true; spillSide = 'right'; }

      // Liquid body polygon
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`;
      ctx.beginPath();
      ctx.moveTo(BEAKER_LEFT + 2, bottomY - 5);
      ctx.quadraticCurveTo(BEAKER_CENTER_X, BEAKER_BOTTOM_CURVE_Y + 2, BEAKER_RIGHT - 2, bottomY - 5);
      ctx.lineTo(BEAKER_RIGHT - 1, topRightY);
      ctx.lineTo(BEAKER_LEFT + 1, topLeftY);
      ctx.closePath();
      ctx.fill();

      // Surface highlight
      ctx.beginPath();
      ctx.moveTo(BEAKER_LEFT + 2, topLeftY);
      ctx.lineTo(BEAKER_RIGHT - 2, topRightY);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Spawn drops when spilling
      if (isSpilling && spillSide && liquidLevel > 5) {
        // Threshold depends on liquid level:
        // Full (120px) → spill at 10°, Empty (20px) → spill at 50°
        const levelPct = liquidLevel / 120; // 0.0 ~ 1.0
        const spillThreshold = 55 - levelPct * 45; // 55° down to 10°
        const tiltAbs = Math.abs(this.tiltAngle);

        if (tiltAbs > spillThreshold) {
          const spillX = spillSide === 'left' ? BEAKER_LEFT : BEAKER_RIGHT;
          const spillY = maxTopY;
          const streamDir = spillSide === 'left' ? -1 : 1;

          // Stream line
          ctx.strokeStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(spillX, spillY);
          ctx.quadraticCurveTo(
            spillX + streamDir * 15, spillY + 40,
            spillX + streamDir * 8, BEAKER_BOTTOM_CURVE_Y + 30
          );
          ctx.stroke();

          // Spill rate: faster as tilt increases beyond threshold
          const excessTilt = tiltAbs - spillThreshold;
          const spillRate = Math.min(excessTilt * 0.08, 0.9); // 0 → fast

          if (Math.random() < spillRate) {
            this.spillingDrops.push({
              x: spillX + streamDir * 8 + (Math.random() - 0.5) * 6,
              y: spillY + 30,
              vy: 1.5 + Math.random(),
            });
            // Each drop = 0.2mL (rounded)
            const dropAmount = 0.2;
            this.volume = Math.max(0, +(this.volume - dropAmount).toFixed(1));
            if (this.onSpill) this.onSpill(dropAmount);
          }
        }
      }
    }

    // Draw falling drops — larger and more visible
    for (const d of this.spillingDrops) {
      // Main drop (darker = more visible)
      ctx.beginPath();
      ctx.arc(d.x, d.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1.0)`;
      ctx.fill();
      // Highlight
      ctx.beginPath();
      ctx.arc(d.x - 1.2, d.y - 1.2, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
      // Shadow for depth
      ctx.beginPath();
      ctx.arc(d.x + 0.5, d.y + 0.5, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fill();
    }
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
  }

  updateColor(color: string) {
    this.color = color;
  }

  updateTilt(angle: number) {
    this.tiltAngle = angle;
  }
}
