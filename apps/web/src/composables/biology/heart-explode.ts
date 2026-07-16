import * as THREE from 'three';

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

export const applyExplode = (heartMeshes: THREE.Mesh[], factor: number): void => {
  for (const mesh of heartMeshes) {
    const original = mesh.userData.originalPosition as THREE.Vector3 | undefined;
    if (!original) continue;
    const vector = explodeVectors[mesh.name] ?? (mesh.userData.explodeCenter as THREE.Vector3 | undefined);
    if (!vector) continue;
    mesh.position.copy(original).add(vector.clone().multiplyScalar(factor));
  }
};
