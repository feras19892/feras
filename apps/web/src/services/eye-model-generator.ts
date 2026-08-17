import * as THREE from 'three';

function createIrisTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cx = 256, cy = 256;
  const pupilR = 60;
  const irisR = 240;

  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
  ctx.fill();

  const gradient = ctx.createRadialGradient(cx, cy, pupilR, cx, cy, irisR);
  gradient.addColorStop(0, '#3a6ea0');
  gradient.addColorStop(0.3, '#2a5a8a');
  gradient.addColorStop(0.6, '#1a4a70');
  gradient.addColorStop(0.85, '#103050');
  gradient.addColorStop(1, '#0a2030');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, irisR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(200,220,255,0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 120; i++) {
    const angle = (i / 120) * Math.PI * 2;
    const r1 = pupilR + 5;
    const r2 = irisR - 10;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(150,180,220,0.2)';
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * Math.PI * 2 + 0.05;
    const r1 = pupilR + 20;
    const r2 = irisR - 30;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r1, cy + Math.sin(angle) * r1);
    ctx.lineTo(cx + Math.cos(angle + 0.02) * r2, cy + Math.sin(angle + 0.02) * r2);
    ctx.stroke();
  }

  ctx.fillStyle = '#0a0a14';
  ctx.beginPath();
  ctx.arc(cx, cy, pupilR, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(180,200,230,0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, pupilR + 3, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(220,230,255,0.3)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, irisR * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createScleraTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8f6f0';
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = 'rgba(200,100,80,0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const len = 20 + Math.random() * 80;
    const angle = Math.random() * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const cx = x + Math.cos(angle) * len * 0.5;
    const cy = y + Math.sin(angle) * len * 0.5;
    ctx.quadraticCurveTo(cx, cy, x + Math.cos(angle) * len, y + Math.sin(angle) * len);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(180,80,60,0.1)';
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 512;
    const len = 40 + Math.random() * 120;
    const angle = Math.random() * Math.PI * 2;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * len * 0.3,
      y + Math.sin(angle) * len * 0.3 + (Math.random() - 0.5) * 20,
      x + Math.cos(angle) * len,
      y + Math.sin(angle) * len,
    );
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function generateEyeModel(): THREE.Object3D {
  const group = new THREE.Group();
  group.name = 'EyeModel';

  const irisTex = createIrisTexture();
  const scleraTex = createScleraTexture();

  const R = 1.0;

  const scleraGeo = new THREE.SphereGeometry(R, 128, 128, 0, Math.PI * 2, 0, Math.PI * 0.72);
  const scleraMat = new THREE.MeshPhysicalMaterial({
    map: scleraTex,
    color: 0xf8f6f0,
    roughness: 0.55,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.8,
    side: THREE.DoubleSide,
  });
  const sclera = new THREE.Mesh(scleraGeo, scleraMat);
  sclera.name = 'sclera';
  group.add(sclera);

  const corneaR = R * 0.53;
  const corneaGeo = new THREE.SphereGeometry(corneaR, 96, 96, 0, Math.PI * 2, 0, Math.PI * 0.42);
  const corneaMat = new THREE.MeshPhysicalMaterial({
    color: 0xaaddff,
    transparent: true,
    opacity: 0.25,
    roughness: 0.02,
    metalness: 0.0,
    transmission: 0.9,
    thickness: 0.3,
    ior: 1.376,
    clearcoat: 1.0,
    clearcoatRoughness: 0.0,
    side: THREE.DoubleSide,
  });
  const cornea = new THREE.Mesh(corneaGeo, corneaMat);
  cornea.name = 'cornea';
  cornea.position.set(0, 0, R * 0.78);
  cornea.rotation.x = Math.PI;
  group.add(cornea);

  const irisGeo = new THREE.CircleGeometry(R * 0.38, 64);
  const irisMat = new THREE.MeshPhysicalMaterial({
    map: irisTex,
    roughness: 0.35,
    metalness: 0.05,
    clearcoat: 0.3,
    side: THREE.DoubleSide,
  });
  const iris = new THREE.Mesh(irisGeo, irisMat);
  iris.name = 'iris';
  iris.position.set(0, 0, R * 0.60);
  group.add(iris);

  const lensGeo = new THREE.SphereGeometry(R * 0.36, 64, 32, 0, Math.PI * 2, 0, Math.PI);
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: 0xc8e0ee,
    transparent: true,
    opacity: 0.55,
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.7,
    thickness: 0.2,
    ior: 1.42,
    clearcoat: 0.8,
    side: THREE.DoubleSide,
  });
  const lens = new THREE.Mesh(lensGeo, lensMat);
  lens.name = 'lens';
  lens.position.set(0, 0, R * 0.42);
  lens.scale.set(1, 1, 0.38);
  group.add(lens);

  const retinaGeo = new THREE.SphereGeometry(R * 0.93, 128, 128, 0, Math.PI * 2, 0, Math.PI * 0.72);
  const retinaMat = new THREE.MeshPhysicalMaterial({
    color: 0xc23a3a,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.BackSide,
    emissive: 0x330000,
    emissiveIntensity: 0.1,
  });
  const retina = new THREE.Mesh(retinaGeo, retinaMat);
  retina.name = 'retina';
  group.add(retina);

  const nerveGeo = new THREE.CylinderGeometry(R * 0.07, R * 0.11, R * 0.7, 32);
  const nerveMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8d8c0,
    roughness: 0.65,
    metalness: 0.0,
    clearcoat: 0.1,
  });
  const nerve = new THREE.Mesh(nerveGeo, nerveMat);
  nerve.name = 'opticNerve';
  nerve.position.set(0, 0, -R * 1.15);
  nerve.rotation.x = Math.PI / 2;
  group.add(nerve);

  const vitrGeo = new THREE.SphereGeometry(R * 0.82, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.68);
  const vitrMat = new THREE.MeshPhysicalMaterial({
    color: 0xeef6ff,
    transparent: true,
    opacity: 0.12,
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.95,
    thickness: 0.5,
    ior: 1.336,
    side: THREE.DoubleSide,
  });
  const vitr = new THREE.Mesh(vitrGeo, vitrMat);
  vitr.name = 'vitreous';
  vitr.position.set(0, 0, -R * 0.08);
  group.add(vitr);

  const chorGeo = new THREE.SphereGeometry(R * 0.97, 96, 96, 0, Math.PI * 2, 0, Math.PI * 0.72);
  const chorMat = new THREE.MeshPhysicalMaterial({
    color: 0x7a3818,
    roughness: 0.92,
    metalness: 0.0,
    side: THREE.BackSide,
    emissive: 0x1a0800,
    emissiveIntensity: 0.08,
  });
  const choroid = new THREE.Mesh(chorGeo, chorMat);
  choroid.name = 'choroid';
  group.add(choroid);

  return group;
}
