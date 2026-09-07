import * as THREE from 'three';

/**
 * زهرة كاملة بأجزائها التناسلية، بمجموعات مسمّاة لخرائط GLBExperiment:
 * البتلات، السبلات، الأسدية (ذكورية)، المدقة (أنثوية)، المبيض ببويضاته، حبوب اللقاح.
 */
export function buildFlowerModel(): THREE.Object3D {
  const root = new THREE.Group();

  // ── قاعدة الزهرة: ساق قصير أخضر ──
  const pedicel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 1.0, 14),
    new THREE.MeshPhysicalMaterial({ color: 0x22c55e, roughness: 0.5 })
  );
  pedicel.position.y = -1.55;
  root.add(pedicel);

  const receptacle = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 16, 12),
    new THREE.MeshPhysicalMaterial({ color: 0x16a34a, roughness: 0.5 })
  );
  receptacle.scale.y = 0.7;
  receptacle.position.y = -1.02;
  root.add(receptacle);

  // ── السبلات: خمس أوراق خضراء صغيرة تحت البتلات ──
  const sepals = new THREE.Group();
  sepals.name = 'sepals';
  const sepalGeometry = new THREE.SphereGeometry(0.3, 12, 8);
  const sepalMaterial = new THREE.MeshPhysicalMaterial({ color: 0x16a34a, roughness: 0.5 });
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 + 0.3;
    const sepal = new THREE.Mesh(sepalGeometry, sepalMaterial);
    sepal.scale.set(1.0, 0.22, 0.45);
    sepal.position.set(Math.cos(a) * 0.42, -0.88, Math.sin(a) * 0.42);
    sepal.rotation.y = -a;
    sepal.rotation.z = -0.5;
    sepals.add(sepal);
  }
  root.add(sepals);

  // ── البتلات: ثماني بتلات وردية مفتوحة ──
  const petals = new THREE.Group();
  petals.name = 'petals';
  const petalGeometry = new THREE.SphereGeometry(0.42, 16, 10);
  const petalMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf472b6, roughness: 0.4 });
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeometry, petalMaterial);
    petal.scale.set(1.0, 0.16, 0.5);
    petal.position.set(Math.cos(a) * 0.78, 0.02, Math.sin(a) * 0.78);
    petal.rotation.y = -a;
    petal.rotation.z = -0.42;
    petals.add(petal);
  }
  root.add(petals);

  // ── الأسدية: ستة خيوط ببلاعات صفراء (الجزء الذكري) ──
  const stamens = new THREE.Group();
  stamens.name = 'stamens';
  const filamentMaterial = new THREE.MeshPhysicalMaterial({ color: 0xf1f5f9, roughness: 0.4 });
  const antherGeometry = new THREE.SphereGeometry(0.11, 12, 10);
  const antherMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfacc15, roughness: 0.35 });
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    const tilt = 0.22;
    const holder = new THREE.Group();
    const filament = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 1.15, 8),
      filamentMaterial
    );
    filament.position.y = 0.575;
    holder.add(filament);
    const anther = new THREE.Mesh(antherGeometry, antherMaterial);
    anther.scale.set(1.0, 1.5, 0.8);
    anther.position.y = 1.22;
    holder.add(anther);
    holder.rotation.z = Math.cos(a) * tilt;
    holder.rotation.x = Math.sin(a) * tilt;
    stamens.add(holder);
  }
  root.add(stamens);

  // ── حبوب اللقاح: نقاط ذهبية فوق البلاعات ──
  const pollen = new THREE.Group();
  pollen.name = 'pollen';
  const pollenGeometry = new THREE.SphereGeometry(0.045, 8, 8);
  const pollenMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfde047, roughness: 0.3, emissive: 0x713f12, emissiveIntensity: 0.2 });
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    for (let j = 0; j < 3; j += 1) {
      const grain = new THREE.Mesh(pollenGeometry, pollenMaterial);
      grain.position.set(
        Math.cos(a) * (0.28 + j * 0.06) + (Math.random() - 0.5) * 0.06,
        1.28 + (Math.random() - 0.5) * 0.08,
        Math.sin(a) * (0.28 + j * 0.06) + (Math.random() - 0.5) * 0.06,
      );
      pollen.add(grain);
    }
  }
  root.add(pollen);

  // ── المدقة: عمود مركزي + ميسم لزج في القمة ──
  const pistil = new THREE.Group();
  pistil.name = 'pistil';
  const style = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.075, 1.5, 10),
    new THREE.MeshPhysicalMaterial({ color: 0xa7f3d0, roughness: 0.4 })
  );
  style.position.y = 0.45;
  pistil.add(style);
  const stigma = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 14, 12),
    new THREE.MeshPhysicalMaterial({ color: 0x6ee7b7, roughness: 0.25 })
  );
  stigma.scale.y = 0.75;
  stigma.position.y = 1.25;
  pistil.add(stigma);
  root.add(pistil);

  // ── المبيض: قاعدة منتفخة شبه شفافة ببويضات داخله ──
  const ovary = new THREE.Group();
  ovary.name = 'ovary';
  const ovaryWall = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 20, 16),
    new THREE.MeshPhysicalMaterial({ color: 0x34d399, roughness: 0.35, transparent: true, opacity: 0.55 })
  );
  ovaryWall.scale.y = 0.85;
  ovaryWall.position.y = -0.72;
  ovary.add(ovaryWall);
  const ovuleGeometry = new THREE.SphereGeometry(0.055, 8, 8);
  const ovuleMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfff7ed, roughness: 0.3 });
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    const ovule = new THREE.Mesh(ovuleGeometry, ovuleMaterial);
    ovule.position.set(Math.cos(a) * 0.14, -0.72 + (i % 2 ? 0.1 : -0.08), Math.sin(a) * 0.14);
    ovary.add(ovule);
  }
  root.add(ovary);

  return root;
}
