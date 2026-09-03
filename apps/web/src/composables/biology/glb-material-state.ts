import * as THREE from 'three';
import type { ModelPart } from './useGLBModel';

export interface MaterialStateDeps {
  partMeshes: Map<string, THREE.Mesh[]>;
  parts: ModelPart[];
  selectedPartId: { value: string | null };
  hoveredPartId: { value: string | null };
  xRayMode: { value: boolean };
  crossSectionMode: { value: boolean };
  clipPlane: THREE.Plane | null;
}

export function applyMaterialState(deps: MaterialStateDeps): void {
  const { partMeshes, parts, selectedPartId, hoveredPartId, xRayMode, crossSectionMode, clipPlane } = deps;

  partMeshes.forEach((meshes, partId) => {
    const isSelected = partId === selectedPartId.value;
    const isHovered = partId === hoveredPartId.value;
    const def = parts.find((p) => p.id === partId);
    const dimOpacity = def?.dimOpacity ?? 0.25;

    for (const mesh of meshes) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const mat of materials) {
        const material = mat as THREE.MeshStandardMaterial;
        if (xRayMode.value) {
          material.transparent = true;
          material.side = THREE.DoubleSide;
          if (isSelected) {
            material.opacity = 1;
            material.depthWrite = true;
            mesh.renderOrder = 2;
          } else if (isHovered) {
            material.opacity = 0.5;
            material.depthWrite = false;
            mesh.renderOrder = 1;
          } else {
            material.opacity = Math.min(dimOpacity * 0.5, 0.08);
            material.depthWrite = false;
            mesh.renderOrder = 0;
          }
        } else {
          if (isSelected) {
            material.transparent = false;
            material.opacity = 1;
            material.depthWrite = true;
            material.side = THREE.DoubleSide;
            mesh.renderOrder = 2;
          } else if (isHovered) {
            material.transparent = true;
            material.opacity = 0.85;
            material.depthWrite = true;
            material.side = THREE.FrontSide;
            mesh.renderOrder = 1;
          } else if (selectedPartId.value) {
            material.transparent = true;
            material.opacity = dimOpacity;
            material.depthWrite = false;
            material.side = THREE.DoubleSide;
            mesh.renderOrder = 0;
          } else {
            const baseOpacity = def?.dimOpacity ?? 1;
            if (baseOpacity < 1) {
              material.transparent = true;
              material.opacity = baseOpacity;
              material.depthWrite = false;
              material.side = THREE.DoubleSide;
            } else {
              material.transparent = false;
              material.opacity = 1;
              material.depthWrite = true;
              material.side = THREE.FrontSide;
            }
            mesh.renderOrder = 0;
          }
        }
        material.clippingPlanes = crossSectionMode.value && clipPlane ? [clipPlane] : [];
      }
    }
  });
}
