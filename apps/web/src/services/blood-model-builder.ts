import * as THREE from 'three';

/**
 * مكونات الدم الثلاثة في تيار البلازما:
 * كريات حمراء (أقراص مقعرة الوجهين) + كريات بيضاء (كرات مفصصة) + صفائح دموية (شظايا).
 */
export function buildBloodModel(): THREE.Object3D {
  const root = new THREE.Group();

  // ── كريات الدم الحمراء: أقراص مقعرة الوجهين بلا نواة ──
  const redCells = new THREE.Group();
  redCells.name = 'redCells';
  const rbcGeometry = new THREE.TorusGeometry(0.24, 0.15, 12, 24);
  const rbcMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe11d48, roughness: 0.35 });
  for (let i = 0; i < 14; i += 1) {
    const cell = new THREE.Mesh(rbcGeometry, rbcMaterial);
    cell.position.set(
      (Math.random() * 2 - 1) * 2.3,
      (Math.random() * 2 - 1) * 1.5,
      (Math.random() * 2 - 1) * 1.6,
    );
    cell.scale.y = 0.55;
    cell.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    redCells.add(cell);
  }
  root.add(redCells);

  // ── كريات الدم البيضاء: كرات كبيرة مفصصة (بلعمية) ──
  const whiteCells = new THREE.Group();
  whiteCells.name = 'whiteCells';
  const wbcMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe9d5ff, roughness: 0.3 });
  const wbcPositions: THREE.Vector3[] = [
    new THREE.Vector3(-1.5, 0.7, 0.4),
    new THREE.Vector3(1.4, -0.5, -0.6),
    new THREE.Vector3(0.2, 1.3, -1.0),
  ];
  for (const pos of wbcPositions) {
    const wbc = new THREE.Group();
    for (let i = 0; i < 6; i += 1) {
      const lobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.3 + Math.random() * 0.12, 16, 16),
        wbcMaterial,
      );
      lobe.position.set(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
      );
      wbc.add(lobe);
    }
    wbc.position.copy(pos);
    whiteCells.add(wbc);
  }
  root.add(whiteCells);

  // ── الصفائح الدموية: شظايا خلوية صغيرة ──
  const platelets = new THREE.Group();
  platelets.name = 'platelets';
  const pltGeometry = new THREE.TetrahedronGeometry(0.11, 0);
  const pltMaterial = new THREE.MeshPhysicalMaterial({ color: 0xfcd34d, roughness: 0.4, flatShading: true });
  for (let i = 0; i < 12; i += 1) {
    const plt = new THREE.Mesh(pltGeometry, pltMaterial);
    plt.position.set(
      (Math.random() * 2 - 1) * 2.4,
      (Math.random() * 2 - 1) * 1.6,
      (Math.random() * 2 - 1) * 1.7,
    );
    plt.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    plt.scale.set(1, 0.5, 0.8);
    platelets.add(plt);
  }
  root.add(platelets);

  return root;
}
