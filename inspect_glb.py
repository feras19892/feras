from pygltflib import GLTF2
import sys
path = sys.argv[1]
g = GLTF2().load_binary(path)
print("Meshes:", len(g.meshes))
for i, m in enumerate(g.meshes):
    print(i, m.name or f"mesh_{i}")
print("\nNodes:")
for i, n in enumerate(g.nodes):
    print(i, n.name, "mesh:", n.mesh)
