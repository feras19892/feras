import * as THREE from 'three';
import type { Organelle3D } from '../../types/biology.types';
import { buildGeometry, createMaterial } from './biology-geometry';

export interface OrganelleMesh {
  id: string;
  mesh: THREE.Object3D;
  basePosition: THREE.Vector3;
  explodeVector: THREE.Vector3;
  hotspotPosition: THREE.Vector3;
}

const PARTICLE_COUNT = 24;

const createParticleMesh = (geometry: THREE.BufferGeometry, material: THREE.Material): THREE.InstancedMesh => {
  const mesh = new THREE.InstancedMesh(geometry, material as THREE.MeshStandardMaterial, PARTICLE_COUNT);
  const dummy = new THREE.Object3D();
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    dummy.position.set(
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5,
      (Math.random() - 0.5) * 5
    );
    dummy.scale.setScalar(0.8 + Math.random() * 0.4);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  return mesh;
};

export const createOrganelleMeshes = (
  scene: THREE.Scene,
  organelles: Organelle3D[]
): Map<string, OrganelleMesh> => {
  const meshMap = new Map<string, OrganelleMesh>();

  for (const organelle of organelles) {
    const geometry = buildGeometry(organelle.geometry, organelle.size, organelle.path);
    const material = createMaterial(organelle.color, organelle.opacity, organelle.renderMode);
    const mesh: THREE.Object3D =
      organelle.geometry === 'particles'
        ? createParticleMesh(geometry, material)
        : new THREE.Mesh(geometry, material);

    const [x, y, z] = organelle.position;
    mesh.position.set(x, y, z);
    if (organelle.rotation) {
      mesh.rotation.set(...organelle.rotation);
    }
    if (organelle.selectable !== false) {
      mesh.userData.organelleId = organelle.id;
    }
    mesh.userData.blocksRaycast = organelle.blocksRaycast ?? false;
    scene.add(mesh);

    meshMap.set(organelle.id, {
      id: organelle.id,
      mesh,
      basePosition: new THREE.Vector3(x, y, z),
      explodeVector: new THREE.Vector3(...organelle.explodeVector),
      hotspotPosition: new THREE.Vector3(...organelle.hotspotPosition),
    });
  }

  return meshMap;
};

export const setExplodeProgress = (
  meshMap: Map<string, OrganelleMesh>,
  progress: number
): void => {
  const clamped = Math.max(0, Math.min(1, progress));
  for (const item of meshMap.values()) {
    item.mesh.position.copy(item.basePosition).add(
      item.explodeVector.clone().multiplyScalar(clamped * 2.5)
    );
  }
};

export const highlightOrganelle = (
  meshMap: Map<string, OrganelleMesh>,
  id: string | null
): void => {
  for (const item of meshMap.values()) {
    const mesh = item.mesh as THREE.Mesh | THREE.InstancedMesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (material instanceof THREE.MeshPhysicalMaterial) {
        material.emissive.setHex(item.id === id ? 0x444444 : 0x000000);
      }
    }
  }
};

export const getOrganelleWorldPosition = (
  meshMap: Map<string, OrganelleMesh>,
  id: string
): THREE.Vector3 | null => {
  const item = meshMap.get(id);
  return item ? item.mesh.position.clone() : null;
};
