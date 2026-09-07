import * as THREE from 'three';

/** ينشئ نموذجاً إجرائياً للخلية الحيوانية — أجزاؤه تتوافق مع groupNames في ModelPart. */
export function buildAnimalCellModel(): THREE.Object3D {
  const root = new THREE.Group();

  // ── الغشاء البلازمي ──
  const membrane = new THREE.Group();
  membrane.name = 'membrane';
  membrane.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.4, 48, 48),
    new THREE.MeshPhysicalMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.22, roughness: 0.3, side: THREE.DoubleSide }),
  ));
  root.add(membrane);

  // ── السيتوبلازم ──
  const cytoplasm = new THREE.Group();
  cytoplasm.name = 'cytoplasm';
  cytoplasm.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 48, 48),
    new THREE.MeshPhysicalMaterial({ color: 0xbfdbfe, transparent: true, opacity: 0.12, roughness: 0.5, side: THREE.DoubleSide }),
  ));
  root.add(cytoplasm);

  // ── النواة والنويد ──
  const nucleus = new THREE.Group();
  nucleus.name = 'nucleus';
  const nucleusMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 40, 40),
    new THREE.MeshPhysicalMaterial({ color: 0xfef08a, roughness: 0.4 }),
  );
  const nucleolus = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 20, 20),
    new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, roughness: 0.35 }),
  );
  nucleolus.position.set(0.18, 0.12, 0.05);
  nucleus.add(nucleusMesh, nucleolus);
  nucleus.position.set(-0.5, 0.35, 0.2);
  root.add(nucleus);

  // ── المتقدرات (عدة أجسام فولية الشكل) ──
  const mitochondria = new THREE.Group();
  mitochondria.name = 'mitochondria';
  const mitoMat = new THREE.MeshPhysicalMaterial({ color: 0xf87171, roughness: 0.35 });
  const mitoPositions: Array<[number, number, number, number, number, number]> = [
    [0.9, -0.4, 0.6, 0.22, 0.5, 0.22],
    [0.4, 1.0, -0.7, 0.2, 0.45, 0.2],
    [-0.2, -1.0, -0.8, 0.24, 0.55, 0.24],
    [1.2, 0.5, -0.5, 0.2, 0.48, 0.2],
    [-1.3, -0.2, 0.4, 0.22, 0.52, 0.22],
  ];
  for (const [x, y, z, sx, sy, sz] of mitoPositions) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), mitoMat);
    m.scale.set(sx, sy, sz);
    m.position.set(x, y, z);
    m.rotation.z = Math.random() * Math.PI;
    m.rotation.y = Math.random() * Math.PI;
    mitochondria.add(m);
  }
  root.add(mitochondria);

  // ── شبكة السيتوبلازم الداخلية (ER) أنابيب حول النواة ──
  const er = new THREE.Group();
  er.name = 'endoplasmicReticulum';
  const erCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0.6, -0.4),
    new THREE.Vector3(0.9, 0.4, -0.2),
    new THREE.Vector3(1.0, -0.3, 0.4),
    new THREE.Vector3(0.3, -0.6, 0.7),
    new THREE.Vector3(-0.5, -0.3, 0.5),
    new THREE.Vector3(-0.8, 0.2, 0.1),
    new THREE.Vector3(-0.6, 0.65, -0.35),
  ], true);
  er.add(new THREE.Mesh(
    new THREE.TubeGeometry(erCurve, 120, 0.09, 8, true),
    new THREE.MeshPhysicalMaterial({ color: 0xa78bfa, roughness: 0.4 }),
  ));
  root.add(er);

  // ── جهاز غولجي (أكياس مسطحة مكدسة) ──
  const golgi = new THREE.Group();
  golgi.name = 'golgi';
  const golgiMat = new THREE.MeshPhysicalMaterial({ color: 0xf472b6, roughness: 0.35 });
  for (let i = 0; i < 4; i += 1) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 16), golgiMat);
    s.scale.set(0.75, 0.18, 0.42);
    s.position.set(0.65 - i * 0.08, 0.15 - i * 0.14, -0.6 + i * 0.04);
    s.rotation.z = -0.25;
    golgi.add(s);
  }
  root.add(golgi);

  // ── الريبوسومات (حبيبات صغيرة) ──
  const ribosomes = new THREE.Group();
  ribosomes.name = 'ribosomes';
  const riboMat = new THREE.MeshPhysicalMaterial({ color: 0x8b5cf6, roughness: 0.3 });
  const riboGeo = new THREE.SphereGeometry(0.04, 6, 6);
  for (let i = 0; i < 90; i += 1) {
    const r = new THREE.Mesh(riboGeo, riboMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const rad = 1.0 + Math.random() * 0.8;
    r.position.set(
      rad * Math.sin(phi) * Math.cos(theta),
      rad * Math.sin(phi) * Math.sin(theta),
      rad * Math.cos(phi),
    );
    ribosomes.add(r);
  }
  root.add(ribosomes);

  // ── الجسيمات الحالة (كرات صغيرة برتقالية) ──
  const lysosomes = new THREE.Group();
  lysosomes.name = 'lysosomes';
  const lysoMat = new THREE.MeshPhysicalMaterial({ color: 0xfb923c, roughness: 0.35 });
  for (let i = 0; i < 6; i += 1) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), lysoMat);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const rad = 1.2 + Math.random() * 0.5;
    l.position.set(
      rad * Math.sin(phi) * Math.cos(theta),
      rad * Math.sin(phi) * Math.sin(theta),
      rad * Math.cos(phi),
    );
    lysosomes.add(l);
  }
  root.add(lysosomes);

  // ── السنتروسوم (زوج من الأنيبات المركزية) ──
  const centrosome = new THREE.Group();
  centrosome.name = 'centrosome';
  const centrioleMat = new THREE.MeshPhysicalMaterial({ color: 0x3b82f6, roughness: 0.35 });
  const centrioleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 12);
  const c1 = new THREE.Mesh(centrioleGeo, centrioleMat);
  const c2 = new THREE.Mesh(centrioleGeo, centrioleMat);
  c1.rotation.z = Math.PI / 2;
  c1.rotation.y = 0.25;
  c1.position.set(-0.1, 0, 0);
  c2.rotation.x = Math.PI / 2;
  c2.rotation.z = 0.25;
  c2.position.set(0.1, 0, 0);
  centrosome.add(c1, c2);
  centrosome.position.set(-0.15, -0.85, 0.45);
  root.add(centrosome);

  return root;
}
