import * as THREE from 'three';

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!];
}

function tex(canvas: HTMLCanvasElement): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  t.needsUpdate = true;
  return t;
}

function scleraTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(1024, 512);
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = `rgba(${180 + Math.random() * 40},${60 + Math.random() * 40},${50 + Math.random() * 30},${0.08 + Math.random() * 0.12})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.5;
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      const a = Math.random() * Math.PI * 2;
      const l = 20 + Math.random() * 60;
      ctx.lineTo(x + Math.cos(a) * l * (s + 1), y + Math.sin(a) * l * (s + 1));
    }
    ctx.stroke();
  }
  return tex(c);
}

function irisTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(512, 512);
  const cx = 256, cy = 256, pR = 55, iR = 245;
  const g = ctx.createRadialGradient(cx, cy, pR, cx, cy, iR);
  g.addColorStop(0, '#2a6ba8');
  g.addColorStop(0.2, '#1f5a90');
  g.addColorStop(0.5, '#154a78');
  g.addColorStop(0.8, '#0d3550');
  g.addColorStop(1, '#082030');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, iR, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 160; i++) {
    const a = (i / 160) * Math.PI * 2;
    ctx.strokeStyle = `rgba(${180 + Math.random() * 50},${200 + Math.random() * 40},${230 + Math.random() * 25},${0.08 + Math.random() * 0.12})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (pR + 3), cy + Math.sin(a) * (pR + 3));
    ctx.lineTo(cx + Math.cos(a) * (iR - 5), cy + Math.sin(a) * (iR - 5));
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(200,220,250,0.25)';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(cx, cy, iR * 0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#080812';
  ctx.beginPath(); ctx.arc(cx, cy, pR, 0, Math.PI * 2); ctx.fill();
  return tex(c);
}

function retinaTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(1024, 512);
  ctx.fillStyle = '#b83a2a';
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 80; i++) {
    ctx.strokeStyle = `rgba(${200 + Math.random() * 30},${80 + Math.random() * 30},${60 + Math.random() * 20},${0.15 + Math.random() * 0.2})`;
    ctx.lineWidth = 0.5 + Math.random() * 2;
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 5; s++) {
      const a = Math.random() * Math.PI * 2;
      ctx.lineTo(x + Math.cos(a) * 30 * (s + 1), y + Math.sin(a) * 30 * (s + 1));
    }
    ctx.stroke();
  }
  const g = ctx.createRadialGradient(512, 256, 20, 512, 256, 120);
  g.addColorStop(0, '#5a2010');
  g.addColorStop(1, 'rgba(90,32,16,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);
  return tex(c);
}

function choroidTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(1024, 512);
  ctx.fillStyle = '#6a2810';
  ctx.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 100; i++) {
    ctx.strokeStyle = `rgba(${120 + Math.random() * 40},${40 + Math.random() * 20},${20 + Math.random() * 15},${0.2 + Math.random() * 0.3})`;
    ctx.lineWidth = 0.5 + Math.random() * 2;
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      const a = Math.random() * Math.PI * 2;
      ctx.lineTo(x + Math.cos(a) * 25 * (s + 1), y + Math.sin(a) * 25 * (s + 1));
    }
    ctx.stroke();
  }
  return tex(c);
}

function lensTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 30, 128, 128, 128);
  g.addColorStop(0, 'rgba(220,240,250,0.7)');
  g.addColorStop(0.7, 'rgba(200,225,240,0.5)');
  g.addColorStop(1, 'rgba(180,210,230,0.3)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return tex(c);
}

function opticDiscTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 100);
  g.addColorStop(0, '#e8c0a0');
  g.addColorStop(0.5, '#d0a080');
  g.addColorStop(1, '#b08060');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 30; i++) {
    ctx.strokeStyle = `rgba(${150 + Math.random() * 40},${100 + Math.random() * 30},${80 + Math.random() * 20},0.3)`;
    ctx.lineWidth = 0.5 + Math.random();
    const a = (i / 30) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100);
    ctx.stroke();
  }
  return tex(c);
}

const materialMap: Record<string, () => THREE.MeshPhysicalMaterial> = {
  sclera: () => new THREE.MeshPhysicalMaterial({ map: scleraTexture(), color: 0xf5f0e8, roughness: 0.6, clearcoat: 0.15, side: THREE.DoubleSide }),
  bulbar_conjunctiva: () => new THREE.MeshPhysicalMaterial({ color: 0xeec0a0, transparent: true, opacity: 0.4, roughness: 0.3, transmission: 0.5, side: THREE.DoubleSide }),
  cornea: () => new THREE.MeshPhysicalMaterial({ color: 0xaaddff, transparent: true, opacity: 0.3, roughness: 0.02, transmission: 0.85, thickness: 0.3, ior: 1.376, clearcoat: 1.0, side: THREE.DoubleSide }),
  iris: () => new THREE.MeshPhysicalMaterial({ map: irisTexture(), roughness: 0.4, clearcoat: 0.3, side: THREE.DoubleSide }),
  pupil: () => new THREE.MeshPhysicalMaterial({ color: 0x080812, roughness: 0.2, side: THREE.DoubleSide }),
  retina: () => new THREE.MeshPhysicalMaterial({ map: retinaTexture(), color: 0xc23a2a, roughness: 0.85, side: THREE.BackSide, emissive: 0x220000, emissiveIntensity: 0.08 }),
  fovea: () => new THREE.MeshPhysicalMaterial({ color: 0x4a1a08, roughness: 0.9, side: THREE.BackSide }),
  macula: () => new THREE.MeshPhysicalMaterial({ color: 0x6a2810, roughness: 0.88, side: THREE.BackSide }),
  optic_disc: () => new THREE.MeshPhysicalMaterial({ map: opticDiscTexture(), color: 0xd0a080, roughness: 0.7 }),
  optic_choroid: () => new THREE.MeshPhysicalMaterial({ map: choroidTexture(), color: 0x7a3818, roughness: 0.9, side: THREE.BackSide }),
  lens: () => new THREE.MeshPhysicalMaterial({ map: lensTexture(), color: 0xc8e0ee, transparent: true, opacity: 0.5, roughness: 0.05, transmission: 0.65, ior: 1.42, clearcoat: 0.8, side: THREE.DoubleSide }),
  suspensory_ligament: () => new THREE.MeshPhysicalMaterial({ color: 0xddeeff, transparent: true, opacity: 0.3, roughness: 0.3, side: THREE.DoubleSide }),
  vitreous_humor: () => new THREE.MeshPhysicalMaterial({ color: 0xeef6ff, transparent: true, opacity: 0.1, roughness: 0.05, transmission: 0.9, ior: 1.336, side: THREE.DoubleSide }),
  aqueous_humor: () => new THREE.MeshPhysicalMaterial({ color: 0xe0f0ff, transparent: true, opacity: 0.08, roughness: 0.05, transmission: 0.9, ior: 1.333, side: THREE.DoubleSide }),
  ciliary: () => new THREE.MeshPhysicalMaterial({ color: 0xc8a080, roughness: 0.7, side: THREE.DoubleSide }),
  trabecular: () => new THREE.MeshPhysicalMaterial({ color: 0xb09080, roughness: 0.8, side: THREE.DoubleSide }),
  schlemm: () => new THREE.MeshPhysicalMaterial({ color: 0x88aabb, roughness: 0.5, side: THREE.DoubleSide }),
  ora_serrata: () => new THREE.MeshPhysicalMaterial({ color: 0x8a6040, roughness: 0.85, side: THREE.BackSide }),
  corneo_scleral: () => new THREE.MeshPhysicalMaterial({ color: 0xa0c0d0, transparent: true, opacity: 0.5, roughness: 0.2, side: THREE.DoubleSide }),
  palpebral: () => new THREE.MeshPhysicalMaterial({ color: 0xe8a0a0, transparent: true, opacity: 0.35, roughness: 0.5, side: THREE.DoubleSide }),
};

function getMaterialForName(name: string): THREE.MeshPhysicalMaterial | null {
  const lower = name.toLowerCase();
  for (const key of Object.keys(materialMap)) {
    if (lower.includes(key)) return materialMap[key]();
  }
  return null;
}

export function enhanceEyeModel(model: THREE.Object3D): void {
  model.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      const mat = getMaterialForName(obj.name);
      if (mat) {
        const oldMat = obj.material;
        obj.material = mat;
        if (Array.isArray(oldMat)) oldMat.forEach((m) => m.dispose());
        else if (oldMat) (oldMat as THREE.Material).dispose();
      }
    }
  });
}
