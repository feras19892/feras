import * as THREE from 'three';

/**
 * نبتة كاملة بمجموعات مسمّاة تتوافق مع خرائط أجزاء GLBExperiment:
 * الجذر (الجذير + الجذور الجانبية)، الساق، الأوراق، الزهرة، البرعم القمي.
 */
export function buildPlantStructureModel(): THREE.Object3D {
  const root = new THREE.Group();

  // ── الساق: عمود أخضر حامل الأوراق والزهرة ──
  const stem = new THREE.Group();
  stem.name = 'stem';
  const stipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.24, 3.2, 16),
    new THREE.MeshPhysicalMaterial({ color: 0x22c55e, roughness: 0.5 })
  );
  stipe.position.y = 1.6;
  stem.add(stipe);
  root.add(stem);

  // ── الجذر: جذير رئيسي + جذور جانبية ──
  const rootGroup = new THREE.Group();
  rootGroup.name = 'root';
  const rootMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd9c9a8, roughness: 0.6 });
  const taprootPts = [
    new THREE.Vector3(0, -0.05, 0),
    new THREE.Vector3(0.05, -0.9, 0.05),
    new THREE.Vector3(-0.05, -1.7, -0.05),
    new THREE.Vector3(0, -2.3, 0),
  ];
  rootGroup.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(taprootPts), 40, 0.11, 8, false),
    rootMaterial,
  ));
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    const len = 0.7 + Math.random() * 0.6;
    const y0 = -0.35 - i * 0.32;
    const pts = [
      new THREE.Vector3(0, y0, 0),
      new THREE.Vector3(Math.cos(a) * len * 0.55, y0 - 0.25, Math.sin(a) * len * 0.55),
      new THREE.Vector3(Math.cos(a) * len, y0 - 0.55, Math.sin(a) * len),
    ];
    rootGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.05, 6, false),
      rootMaterial,
    ));
  }
  root.add(rootGroup);

  // ── الأوراق: أربع أوراق متناوبة على الساق ──
  const leaves = new THREE.Group();
  leaves.name = 'leaves';
  const leafGeometry = new THREE.SphereGeometry(0.62, 20, 12);
  const leafColors = [0x16a34a, 0x22c55e, 0x15803d, 0x4ade80];
  const leafSpecs = [
    { y: 1.05, a: 0.2, tilt: 0.5 },
    { y: 1.55, a: Math.PI + 0.2, tilt: 0.5 },
    { y: 2.0, a: 0.9, tilt: 0.45 },
    { y: 2.42, a: Math.PI + 0.9, tilt: 0.42 },
  ];
  leafSpecs.forEach((spec, i) => {
    const leaf = new THREE.Mesh(
      leafGeometry,
      new THREE.MeshPhysicalMaterial({ color: leafColors[i], roughness: 0.45 })
    );
    leaf.scale.set(1.0, 0.14, 0.5);
    leaf.position.set(Math.cos(spec.a) * 0.55, spec.y, Math.sin(spec.a) * 0.55);
    leaf.rotation.y = -spec.a;
    leaf.rotation.z = spec.tilt;
    leaves.add(leaf);
  });
  root.add(leaves);

  // ── الزهرة: مركز أصفر + بتلات وردية ──
  const flower = new THREE.Group();
  flower.name = 'flower';
  const flowerCenter = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 14, 14),
    new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.35 })
  );
  flowerCenter.position.y = 3.28;
  flower.add(flowerCenter);
  const petalGeometry = new THREE.SphereGeometry(0.3, 14, 10);
  const petalMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf472b6, roughness: 0.4 });
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.scale.set(1.0, 0.3, 0.55);
    petal.position.set(Math.cos(a) * 0.34, 3.28, Math.sin(a) * 0.34);
    petal.rotation.y = -a;
    petal.rotation.z = -0.25;
    flower.add(petal);
  }
  root.add(flower);

  // ── البرعم القمي: فرع جانبي صغير ببرعم غير متفتح ──
  const bud = new THREE.Group();
  bud.name = 'bud';
  const branchPts = [
    new THREE.Vector3(0.14, 2.55, 0),
    new THREE.Vector3(0.55, 2.85, 0.1),
    new THREE.Vector3(0.85, 3.05, 0.15),
  ];
  bud.add(new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(branchPts), 20, 0.05, 6, false),
    new THREE.MeshPhysicalMaterial({ color: 0x22c55e, roughness: 0.5 })
  ));
  const budTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 14, 12),
    new THREE.MeshPhysicalMaterial({ color: 0x86efac, roughness: 0.45 })
  );
  budTip.scale.set(1.0, 1.25, 1.0);
  budTip.position.set(0.92, 3.16, 0.16);
  bud.add(budTip);
  root.add(bud);

  return root;
}
