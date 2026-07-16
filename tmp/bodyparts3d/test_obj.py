import trimesh

path = r'c:\Users\feras\Desktop\feras\tmp\bodyparts3d\partof_obj\partof_BP3D_4.0_obj_99\FJ2421.obj'
m = trimesh.load(path)
print(type(m))
if hasattr(m, 'vertices'):
    print('vertices', m.vertices.shape)
if hasattr(m, 'geometry'):
    print('scene geometries', list(m.geometry.keys()))
