import * as THREE from 'three';
import { explodeVectors } from './heart-flow';

export interface HeartMaterialDeps {
  heartMeshes: THREE.Mesh[];
  selectedPartId: { value: string | null };
  hoveredPartId: { value: string | null };
  xRayMode: { value: boolean };
  crossSectionMode: { value: boolean };
  clipPlane: THREE.Plane | null;
}

export function applyHeartMaterialState(deps: HeartMaterialDeps): void {
  const { heartMeshes, selectedPartId, hoveredPartId, xRayMode, crossSectionMode, clipPlane } = deps;
  for (const mesh of heartMeshes) {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      const material = mat as THREE.MeshPhysicalMaterial;
      const isSelected = mesh.name === selectedPartId.value;
      const isHovered = mesh.name === hoveredPartId.value;
      if (isSelected) {
        material.emissive.setHex(0xff6600);
        material.emissiveIntensity = 0.5;
      } else if (isHovered) {
        material.emissive.setHex(0x444444);
        material.emissiveIntensity = 0.25;
      } else {
        material.emissive.setHex(0x000000);
        material.emissiveIntensity = 0;
      }
      if (xRayMode.value) {
        material.transparent = true;
        material.opacity = 0.35;
        material.depthWrite = false;
      } else {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
      }
      material.clippingPlanes = crossSectionMode.value && clipPlane ? [clipPlane] : [];
    }
  }
}

export function applyHeartExplode(heartMeshes: THREE.Mesh[], explodeFactor: number): void {
  for (const mesh of heartMeshes) {
    const original = mesh.userData.originalPosition as THREE.Vector3 | undefined;
    if (!original) continue;
    const vector = explodeVectors[mesh.name] ?? (mesh.userData.explodeCenter as THREE.Vector3 | undefined);
    if (!vector) continue;
    mesh.position.copy(original).add(vector.clone().multiplyScalar(explodeFactor));
  }
}
