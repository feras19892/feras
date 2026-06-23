<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as PIXI from 'pixi.js';
import Matter from 'matter-js';

interface Props {
  volume?: number;
  maxVolume?: number;
  liquidColor?: string;
  tiltAngle?: number;
  isHovered?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  volume: 0,
  maxVolume: 250,
  liquidColor: '#3b82f6',
  tiltAngle: 0,
  isHovered: false,
});

const containerRef = ref<HTMLDivElement | null>(null);
let pixiApp: PIXI.Application | null = null;
let engine: Matter.Engine | null = null;
let world: Matter.World | null = null;
let liquidGraphics: PIXI.Graphics | null = null;
let beakerGraphics: PIXI.Graphics | null = null;
let particles: Matter.Body[] = [];
let beakerComposite: Matter.Composite | null = null;
let animId = 0;

const W = 140;
const H = 200;
const WALL_THICK = 4;
const PARTICLE_RADIUS = 3.5;
const NUM_PARTICLES = 120;

// Convert hex color string to number for Pixi
function hexToPixi(hex: string): number {
  const c = hex.replace('#', '');
  return parseInt(c, 16);
}

async function initPhysics() {
  if (!containerRef.value) return;

  // 1. PixiJS
  pixiApp = new PIXI.Application();
  await pixiApp.init({
    width: W,
    height: H,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
  });
  containerRef.value.appendChild(pixiApp.canvas as HTMLCanvasElement);

  // 2. Matter.js engine
  engine = Matter.Engine.create({
    gravity: { x: 0, y: 1, scale: 0.001 },
  });
  world = engine.world;

  // 3. Beaker walls (invisible physics bodies)
  beakerComposite = Matter.Composite.create();
  const cx = W / 2;
  const cy = H / 2 + 10;
  const bw = 64; // inner width
  const bh = 130; // inner height

  const bottom = Matter.Bodies.rectangle(cx, cy + bh / 2, bw + WALL_THICK * 2, WALL_THICK, {
    isStatic: true, friction: 0.5, restitution: 0.1,
  });
  const leftWall = Matter.Bodies.rectangle(cx - bw / 2 - WALL_THICK / 2, cy, WALL_THICK, bh, {
    isStatic: true, friction: 0.5, restitution: 0.1,
  });
  const rightWall = Matter.Bodies.rectangle(cx + bw / 2 + WALL_THICK / 2, cy, WALL_THICK, bh, {
    isStatic: true, friction: 0.5, restitution: 0.1,
  });

  Matter.Composite.add(beakerComposite, [bottom, leftWall, rightWall]);
  Matter.Composite.add(world, beakerComposite);

  // 4. Liquid particles
  liquidGraphics = new PIXI.Graphics();
  pixiApp.stage.addChild(liquidGraphics);

  // 5. Glass beaker visual overlay
  beakerGraphics = new PIXI.Graphics();
  drawBeakerGlass(beakerGraphics);
  pixiApp.stage.addChild(beakerGraphics);

  // 6. Create liquid particles based on volume
  createParticles();

  // 7. Game loop
  loop();
}

function createParticles() {
  if (!world || !liquidGraphics) return;
  // Remove old particles
  particles.forEach(p => Matter.Composite.remove(world!, p));
  particles = [];

  if (props.volume <= 0) return;

  const count = Math.floor(NUM_PARTICLES * Math.min(props.volume / props.maxVolume, 1));
  const cx = W / 2;
  const baseY = H / 2 + 10 + 55; // bottom area
  const cols = 10;

  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const px = cx - 25 + col * 5.5 + (Math.random() - 0.5) * 2;
    const py = baseY - row * 5.5 + (Math.random() - 0.5) * 2;

    const p = Matter.Bodies.circle(px, py, PARTICLE_RADIUS, {
      friction: 0.05,
      frictionAir: 0.02,
      restitution: 0.15,
      density: 0.001,
    });
    particles.push(p);
    Matter.Composite.add(world, p);
  }
}

function drawBeakerGlass(g: PIXI.Graphics) {
  g.clear();
  // Glass outline
  g.lineStyle(1.5, 0x94a3b8, 0.8);
  g.moveTo(38, 25);
  g.lineTo(38, 158);
  g.quadraticCurveTo(38, 172, 70, 172);
  g.quadraticCurveTo(102, 172, 102, 158);
  g.lineTo(102, 25);
  // Rim
  g.drawEllipse(70, 25, 32, 5);
  // Spout
  g.moveTo(100, 23);
  g.quadraticCurveTo(106, 21, 110, 18);
  // Graduations
  g.lineStyle(0.8, 0x64748b, 0.5);
  for (let v = 25; v <= 250; v += 25) {
    const y = 160 - (v / 250) * 125;
    g.moveTo(102, y);
    g.lineTo(86, y);
    // Label
    // (skip text for now to keep simple)
  }
  // Highlights
  g.lineStyle(3, 0xffffff, 0.35);
  g.moveTo(42, 28);
  g.lineTo(42, 155);
}

function loop() {
  if (!engine || !liquidGraphics || !pixiApp) return;

  // Update physics (walls stay upright, gravity tilts)
  Matter.Engine.update(engine, 1000 / 60);

  // Tilt gravity so liquid flows to the "low" side
  const tiltRad = ((props.tiltAngle || 0) * Math.PI) / 180;
  if (engine.gravity) {
    engine.gravity.x = Math.sin(tiltRad) * 1;
    engine.gravity.y = Math.cos(tiltRad) * 1;
  }

  // Rotate entire Pixi stage to match beaker tilt visually
  pixiApp.stage.pivot.set(W / 2, H / 2 + 10);
  pixiApp.stage.position.set(W / 2, H / 2 + 10);
  pixiApp.stage.rotation = tiltRad;

  // Draw liquid particles (overlapping circles for metaball look)
  const color = hexToPixi(props.liquidColor);
  liquidGraphics.clear();

  // Base liquid blob
  if (particles.length > 0) {
    liquidGraphics.beginFill(color, 0.25);
    const avgX = particles.reduce((s, p) => s + p.position.x, 0) / particles.length;
    const avgY = particles.reduce((s, p) => s + p.position.y, 0) / particles.length;
    liquidGraphics.drawCircle(avgX, avgY, 38);
    liquidGraphics.endFill();
  }

  // Individual particles (larger radius so they merge visually)
  for (const p of particles) {
    liquidGraphics.beginFill(color, 0.55);
    liquidGraphics.drawCircle(p.position.x, p.position.y, PARTICLE_RADIUS + 2);
    liquidGraphics.endFill();
    // Highlight
    liquidGraphics.beginFill(0xffffff, 0.15);
    liquidGraphics.drawCircle(p.position.x - 0.8, p.position.y - 0.8, PARTICLE_RADIUS * 0.5);
    liquidGraphics.endFill();
  }

  // Surface meniscus line
  if (particles.length > 0) {
    const surface = particles.filter(p => p.velocity.y < 0.3)
      .sort((a, b) => a.position.y - b.position.y).slice(0, 12);
    if (surface.length > 2) {
      const sX = surface.reduce((s, p) => s + p.position.x, 0) / surface.length;
      const sY = surface.reduce((s, p) => s + p.position.y, 0) / surface.length;
      liquidGraphics.lineStyle(1.5, 0xffffff, 0.35);
      liquidGraphics.moveTo(sX - 22, sY);
      liquidGraphics.quadraticCurveTo(sX, sY - 3, sX + 22, sY);
    }
  }

  animId = requestAnimationFrame(loop);
}

function cleanup() {
  if (animId) cancelAnimationFrame(animId);
  if (pixiApp) {
    pixiApp.destroy(true, { children: true, texture: true });
    pixiApp = null;
  }
  if (engine) {
    Matter.Engine.clear(engine);
    engine = null;
  }
  world = null;
  particles = [];
  beakerComposite = null;
  liquidGraphics = null;
  beakerGraphics = null;
}

watch(() => props.volume, () => {
  if (world) createParticles();
});
watch(() => props.liquidColor, () => {
  // color updates automatically in draw loop
});

onMounted(() => {
  nextTick().then(() => initPhysics());
});
onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div ref="containerRef" class="physics-beaker" :class="{ hovered: isHovered }"></div>
</template>

<style scoped>
.physics-beaker {
  width: 140px;
  height: 200px;
  position: relative;
  transition: transform 0.2s;
}
.physics-beaker.hovered {
  transform: scale(1.04);
}
.physics-beaker :deep(canvas) {
  display: block;
}
</style>
