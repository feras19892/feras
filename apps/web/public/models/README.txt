Place the human heart model here as heart.fbx.

The HeartExperiment component loads this file from /models/heart.fbx.

Current model downloaded from:
- VirtX Resources (CC licensed): https://github.com/usydtechlab/VirtX_Resources/blob/master/3D_Models/anatomical-heart.fbx

If you want to replace it, download another FBX or GLB heart model and update the loader path in useHeartGLB.ts.

── Model size optimization (important) ─────────────────────────────
Current GLB sizes are large for mobile networks. Target: < 3 MB per model.
The loaders already use DRACO compression (decoder served from /draco/).

Re-compress large models (eye 19.7MB, lungs 10.7MB, skeleton 7.9MB,
digestive 7.1MB, kidney 7MB) with gltf-transform:

  pnpm dlx @gltf-transform/cli optimize input.glb output.glb \
    --compress draco --texture-compress webp

Notes:
- Keep node/group names intact (eyeParts/lungsParts/etc. reference them).
- Verify the experiment still highlights parts after re-export.
- eye-hubmap-realistic.glb textures are the main weight — webp usually
  cuts it to a fraction without visible loss.

