import * as THREE from 'three';

export interface FlowParticle {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  speed: number;
  offset: number;
}

const createSystemicCurve = (): THREE.CatmullRomCurve3 => {
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
  return new THREE.CatmullRomCurve3(systemicPoints, true);
};

const createPulmonaryCurve = (): THREE.CatmullRomCurve3 => {
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
  return new THREE.CatmullRomCurve3(pulmonaryPoints, true);
};

export const createFlowVisualization = (): { group: THREE.Group; particles: FlowParticle[] } => {
  const group = new THREE.Group();

  const systemicCurve = createSystemicCurve();
  const pulmonaryCurve = createPulmonaryCurve();

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

  group.add(new THREE.Mesh(new THREE.TubeGeometry(systemicCurve, 140, 0.07, 10, true), systemicMaterial));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(pulmonaryCurve, 140, 0.06, 10, true), pulmonaryMaterial));

  const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6666 });
  const particleGeometry = new THREE.SphereGeometry(0.09, 12, 12);

  const particles: FlowParticle[] = [];
  for (let i = 0; i < 16; i += 1) {
    const mesh = new THREE.Mesh(particleGeometry, particleMaterial.clone());
    const isSystemic = i % 2 === 0;
    (mesh.material as THREE.MeshBasicMaterial).color.setHex(isSystemic ? 0xff6666 : 0x60a5fa);
    group.add(mesh);
    particles.push({
      mesh,
      curve: isSystemic ? systemicCurve : pulmonaryCurve,
      speed: isSystemic ? 0.12 : 0.1,
      offset: (i / 16) * 0.9,
    });
  }

  return { group, particles };
};

export const updateFlowParticles = (particles: FlowParticle[], elapsed: number): void => {
  for (const particle of particles) {
    const t = (elapsed * particle.speed + particle.offset) % 1;
    particle.mesh.position.copy(particle.curve.getPointAt(t));
  }
};
