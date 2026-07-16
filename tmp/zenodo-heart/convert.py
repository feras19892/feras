import os
import trimesh

BASE = r'c:\Users\feras\Desktop\feras\tmp\zenodo-heart\Surfaces\Surfaces'
OUT = r'c:\Users\feras\Desktop\feras\apps\web\public\models\heart-zenodo.glb'

PARTS = {
    'left_atrium': 'cavityLA.stl',
    'right_atrium': 'cavityRA.stl',
    'left_ventricle': 'cavityLV.stl',
    'right_ventricle': 'cavityRV.stl',
    'epicardium': 'epicard.stl',
}

scene = trimesh.Scene()
for node_name, filename in PARTS.items():
    path = os.path.join(BASE, filename)
    if not os.path.exists(path):
        print(f'Missing {path}')
        continue
    mesh = trimesh.load(path)
    if isinstance(mesh, trimesh.Scene):
        geoms = list(mesh.geometry.values())
        if geoms:
            mesh = trimesh.util.concatenate(geoms)
    if not hasattr(mesh, 'vertices') or len(mesh.vertices) == 0:
        print(f'Empty {filename}')
        continue
    print(f'{node_name}: {mesh.vertices.shape}')
    scene.add_geometry(mesh, node_name=node_name, geom_name=node_name)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
scene.export(file_obj=OUT, file_type='glb')
print(f'Exported to {OUT}')
