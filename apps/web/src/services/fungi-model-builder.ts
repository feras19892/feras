import * as THREE from 'three';

/**
 * تركيب الفطر (النموذج الثمري): قبعة + خياطات + أبواغ + حلقة + ساق
 * + الغزل الفطري الأرضي (الجسم الحقيقي للفطر).
 */
export function buildFungiModel(): THREE.Object3D {
  const root = new THREE.Group();

  // ── الساق (Stipe): عمود إسفنجي يرفع القبعة ──
  const stem = new THREE.Group();
  stem.name = 'stem';
  const stipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.55, 2.7, 24),
    new THREE.MeshPhysicalMaterial({ color: 0xfde8d0, roughness: 0.6 })
  );
  stipe.position.y = 0.25;
  stem.add(stipe);
  root.add(stem);

  // ── الحلقة (Annulus): بقايا الغشاء الواقي ──
  const ring = new THREE.Group();
  ring.name = 'ring';
  const annulus = new THREE.Mesh(
    new THREE.TorusGeometry(0.5, 0.085, 10, 28),
    new THREE.MeshPhysicalMaterial({ color: 0xf5e0c8, roughness: 0.55 })
  );
  annulus.rotation.x = Math.PI / 2;
  annulus.position.y = 0.95;
  ring.add(annulus);
  root.add(ring);

  // ── القبعة (Pileus): قبة تحمي الخياطات ──
  const cap = new THREE.Group();
  cap.name = 'cap';
  const pileus = new THREE.Mesh(
    new THREE.SphereGeometry(1.75, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2.15),
    new THREE.MeshPhysicalMaterial({ color: 0xb45309, roughness: 0.55, side: THREE.DoubleSide })
  );
  pileus.position.y = 1.42;
  cap.add(pileus);
  root.add(cap);

  // ── الخياطات: صفائح شعاعية تصنع الأبواغ ──
  const gills = new THREE.Group();
  gills.name = 'gills';
  const gillGeometry = new THREE.BoxGeometry(0.045, 0.6, 1.1);
  const gillMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfcd9b8, roughness: 0.6 });
  for (let i = 0; i < 26; i += 1) {
    const a = (i / 26) * Math.PI * 2;
    const holder = new THREE.Group();
    const gill = new THREE.Mesh(gillGeometry, gillMaterial);
    gill.position.z = 0.78;
    gill.rotation.x = 0.3;
    holder.rotation.y = a;
    holder.add(gill);
    gills.add(holder);
  }
  root.add(gills);

  // ── الأبواغ: وحدات التكاثر الدقيقة ──
  const spores = new THREE.Group();
  spores.name = 'spores';
  const sporeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
  const sporeMaterial = new THREE.MeshPhysicalMaterial({ color: 0xd97706, roughness: 0.4 });
  for (let i = 0; i < 34; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.35 + Math.random() * 1.0;
    const spore = new THREE.Mesh(sporeGeometry, sporeMaterial);
    spore.position.set(Math.cos(a) * r, 1.0 + Math.random() * 0.22, Math.sin(a) * r);
    spores.add(spore);
  }
  root.add(spores);

  // ── الغزل الفطري: شبكة الجسم الحقيقي تحت الأرض ──
  const mycelium = new THREE.Group();
  mycelium.name = 'mycelium';
  const mycMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfff1d6, roughness: 0.5 });
  const baseY = -1.15;
  for (let i = 0; i < 7; i += 1) {
    const a = (i / 7) * Math.PI * 2 + 0.2;
    const spread = 1.4 + Math.random() * 1.1;
    const depth = 0.7 + Math.random() * 0.8;
    const pts = [
      new THREE.Vector3(Math.cos(a) * 0.3, baseY + 0.05, Math.sin(a) * 0.3),
      new THREE.Vector3(Math.cos(a) * spread * 0.5, baseY - depth * 0.4, Math.sin(a) * spread * 0.5),
      new THREE.Vector3(Math.cos(a) * spread, baseY - depth, Math.sin(a) * spread),
    ];
    mycelium.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, 0.055, 6, false),
      mycMaterial,
    ));
    // فرع ثانوي من منتصف الخيط الرئيسي
    const mid = pts[1];
    const branch = [
      mid.clone(),
      new THREE.Vector3(mid.x * 1.5 + 0.2, mid.y - 0.25, mid.z * 1.5 - 0.15),
      new THREE.Vector3(mid.x * 1.9, mid.y - 0.55, mid.z * 1.9),
    ];
    mycelium.add(new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(branch), 30, 0.035, 6, false),
      mycMaterial,
    ));
  }
  root.add(mycelium);

  return root;
}
