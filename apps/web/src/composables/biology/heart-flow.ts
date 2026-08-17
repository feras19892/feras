import * as THREE from 'three';

export interface FlowParticle {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  speed: number;
  offset: number;
}

export const explodeVectors: Record<string, THREE.Vector3> = {
  left_atrium: new THREE.Vector3(-1.6, 1.2, 0.5),
  right_atrium: new THREE.Vector3(1.6, 1.2, 0.5),
  left_ventricle: new THREE.Vector3(-1.4, -1.4, 0.6),
  right_ventricle: new THREE.Vector3(1.4, -1.4, 0.6),
  septum: new THREE.Vector3(0, 0, 1.6),
  aortic_valve: new THREE.Vector3(-0.4, 2.0, 0.2),
  mitral_valve: new THREE.Vector3(-0.7, 0.2, 1.1),
  pulmonary_valve: new THREE.Vector3(0.4, 2.0, 0.2),
  tricuspid_valve: new THREE.Vector3(0.7, 0.2, 1.1),
};

export const partColors: Record<string, number> = {
  left_atrium: 0xcc2222,
  left_ventricle: 0xb91c1c,
  right_atrium: 0x3b5bdb,
  right_ventricle: 0x2563eb,
  septum: 0x9f2b2b,
  aortic_valve: 0xfca5a5,
  mitral_valve: 0xfca5a5,
  pulmonary_valve: 0x93c3fd,
  tricuspid_valve: 0x93c3fd,
};

export function createFlowVisualization(): { group: THREE.Group; flowParticles: FlowParticle[] } {
  const group = new THREE.Group();

  const systemicPoints = [
    new THREE.Vector3(-1.2, 0.2, 0.5),
    new THREE.Vector3(-1.6, 2.0, 0),
    new THREE.Vector3(-1.3, 4.0, -1.0),
    new THREE.Vector3(0.0, 4.5, -1.5),
    new THREE.Vector3(1.5, 3.8, -0.5),
    new THREE.Vector3(2.2, 2.0, 0.5),
    new THREE.Vector3(2.0, 0.0, 0.5),
    new THREE.Vector3(1.5, -1.5, 0),
    new THREE.Vector3(0.0, -2.0, -0.5),
    new THREE.Vector3(-1.0, -1.0, 0),
  ];

  const pulmonaryPoints = [
    new THREE.Vector3(1.2, 0.2, 0.5),
    new THREE.Vector3(1.6, 2.0, 0),
    new THREE.Vector3(1.3, 4.0, -1.0),
    new THREE.Vector3(0.0, 4.5, -1.5),
    new THREE.Vector3(-1.5, 3.8, -0.5),
    new THREE.Vector3(-2.2, 2.0, 0.5),
    new THREE.Vector3(-2.0, 0.0, 0.5),
    new THREE.Vector3(-1.5, -1.5, 0),
    new THREE.Vector3(0.0, -2.0, -0.5),
    new THREE.Vector3(1.0, -1.0, 0),
  ];

  const systemicCurve = new THREE.CatmullRomCurve3(systemicPoints, true);
  const pulmonaryCurve = new THREE.CatmullRomCurve3(pulmonaryPoints, true);

  const systemicMaterial = new THREE.MeshBasicMaterial({
    color: 0xef4444,
    transparent: true,
    opacity: 0.35,
  });
  const pulmonaryMaterial = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.35,
  });

  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(systemicCurve, 140, 0.07, 10, true), systemicMaterial)
  );
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(pulmonaryCurve, 140, 0.06, 10, true), pulmonaryMaterial)
  );

  const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6666 });
  const particleGeometry = new THREE.SphereGeometry(0.09, 12, 12);

  const flowParticles: FlowParticle[] = [];
  for (let i = 0; i < 16; i += 1) {
    const mesh = new THREE.Mesh(particleGeometry, particleMaterial.clone());
    const isSystemic = i % 2 === 0;
    (mesh.material as THREE.MeshBasicMaterial).color.setHex(isSystemic ? 0xff6666 : 0x60a5fa);
    group.add(mesh);
    flowParticles.push({
      mesh,
      curve: isSystemic ? systemicCurve : pulmonaryCurve,
      speed: isSystemic ? 0.12 : 0.1,
      offset: (i / 16) * 0.9,
    });
  }

  return { group, flowParticles };
}
