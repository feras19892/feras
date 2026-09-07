import * as THREE from 'three';

/**
 * فيروس العاثية T4 — النموذج الكلاسيكي لتركيب الفيروس وميكانيكية الحقن:
 * رأس قفيصي عشروني + ذيل أنبوبي + قاعدة سداسية + 6 ألياف استشعار.
 */
export function buildVirusModel(): THREE.Object3D {
  const root = new THREE.Group();

  // ── الرأس: القفيصة البروتينية عشرونية الوجوه ──
  const head = new THREE.Group();
  head.name = 'headCapsid';
  const capsid = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 0),
    new THREE.MeshPhysicalMaterial({ color: 0x818cf8, roughness: 0.4, transparent: true, opacity: 0.82, flatShading: true })
  );
  capsid.position.y = 0.55;
  capsid.scale.y = 1.12;
  head.add(capsid);
  root.add(head);

  // ── الحمض النووي: حلقة مضغوطة داخل الرأس ──
  const dna = new THREE.Group();
  dna.name = 'dna';
  const dnaPoints: THREE.Vector3[] = [];
  for (let i = 0; i < 10; i += 1) {
    const a = (i / 10) * Math.PI * 2;
    dnaPoints.push(new THREE.Vector3(
      Math.cos(a) * 0.5,
      0.55 + Math.sin(a * 2) * 0.4,
      Math.sin(a) * 0.5,
    ));
  }
  dna.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dnaPoints, true, 'catmullrom', 0.9), 160, 0.07, 8, true),
    new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.3, emissive: 0x713f12, emissiveIntensity: 0.3 }),
  ));
  root.add(dna);

  // ── الذيل: الياقة + الغلاف الانقباضي + الأنبوب الداخلي ──
  const tail = new THREE.Group();
  tail.name = 'tailSheath';
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.34, 0.055, 10, 24),
    new THREE.MeshPhysicalMaterial({ color: 0x94a3b8, roughness: 0.4 })
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.y = -0.62;
  tail.add(collar);

  const sheath = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 1.7, 20),
    new THREE.MeshPhysicalMaterial({ color: 0x64748b, roughness: 0.45 })
  );
  sheath.position.y = -1.47;
  tail.add(sheath);

  const innerTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 1.78, 10),
    new THREE.MeshPhysicalMaterial({ color: 0xe2e8f0, roughness: 0.3 })
  );
  innerTube.position.y = -1.51;
  tail.add(innerTube);
  root.add(tail);

  // ── القاعدة السداسية ──
  const basePlate = new THREE.Group();
  basePlate.name = 'basePlate';
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.62, 0.2, 6),
    new THREE.MeshPhysicalMaterial({ color: 0x64748b, roughness: 0.45 })
  );
  plate.position.y = -2.42;
  basePlate.add(plate);
  root.add(basePlate);

  // ── الألياف الذيلية الست: أجهزة الاستشعار والالتصاق ──
  const fibers = new THREE.Group();
  fibers.name = 'tailFibers';
  const fiberMaterial = new THREE.MeshPhysicalMaterial({ color: 0xcbd5e1, roughness: 0.4 });
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    const pts = [
      new THREE.Vector3(Math.cos(a) * 0.3, -2.48, Math.sin(a) * 0.3),
      new THREE.Vector3(Math.cos(a) * 0.78, -2.92, Math.sin(a) * 0.78),
      new THREE.Vector3(Math.cos(a) * 1.18, -3.62, Math.sin(a) * 1.18),
    ];
    fibers.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.045, 6, false),
      fiberMaterial,
    ));
  }
  root.add(fibers);

  return root;
}
