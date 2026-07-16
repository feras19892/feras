import trimesh
import os

path = r'c:\Users\feras\Desktop\feras\tmp\nih-heart\heart-female.glb'
print('size', os.path.getsize(path))
m = trimesh.load(path)
print(type(m))
if isinstance(m, trimesh.Scene):
    print('nodes:', list(m.graph.nodes))
    print('geometries:')
    for name, geom in m.geometry.items():
        print(' ', name, getattr(geom, 'vertices', None).shape if hasattr(geom, 'vertices') else '')
else:
    print('vertices:', m.vertices.shape)
