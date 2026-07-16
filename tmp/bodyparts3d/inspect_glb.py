import trimesh

path = r'c:\Users\feras\Desktop\feras\apps\web\public\models\heart-bodyparts3d.glb'
scene = trimesh.load(path)
print(type(scene))
if isinstance(scene, trimesh.Scene):
    print('graph nodes:')
    for node in scene.graph.nodes:
        print(' ', node)
    print('geometries:')
    for name, geom in scene.geometry.items():
        print(' ', name, type(geom), getattr(geom, 'vertices', None).shape if hasattr(geom, 'vertices') else '')
else:
    print('not scene')
