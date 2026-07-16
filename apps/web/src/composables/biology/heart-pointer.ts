import * as THREE from 'three';

export const createPointerHandlers = (
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  heartMeshes: THREE.Mesh[],
  callbacks: {
    onHover: (name: string | null) => void;
    onSelect: (name: string | null) => void;
  }
): {
  onPointerMove: (event: PointerEvent) => void;
  onClick: (event: PointerEvent) => void;
} => {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const updatePointer = (event: PointerEvent): void => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  const onPointerMove = (event: PointerEvent): void => {
    updatePointer(event);
    if (heartMeshes.length === 0) return;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(heartMeshes, false);
    const hit = intersects[0]?.object as THREE.Mesh | undefined;
    callbacks.onHover(hit?.name ?? null);
  };

  const onClick = (event: PointerEvent): void => {
    updatePointer(event);
    if (heartMeshes.length === 0) return;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(heartMeshes, false);
    const hit = intersects[0]?.object as THREE.Mesh | undefined;
    callbacks.onSelect(hit?.name ?? null);
  };

  return { onPointerMove, onClick };
};
