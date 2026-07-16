import os
import trimesh

BASE_DIR = r'c:\Users\feras\Desktop\feras\tmp\bodyparts3d'
OBJ_DIR = os.path.join(BASE_DIR, 'partof_obj', 'partof_BP3D_4.0_obj_99')
PARTS_FILE = os.path.join(BASE_DIR, 'partof_element_parts.txt')
OUT_PATH = r'c:\Users\feras\Desktop\feras\apps\web\public\models\heart-bodyparts3d.glb'

DESIRED = {
    'heart',
    'right atrium',
    'left atrium',
    'right ventricle',
    'left ventricle',
    'aorta',
    'pulmonary trunk',
    'tricuspid valve',
    'mitral valve',
    'aortic valve',
    'pulmonary valve',
}

def parse_parts(path):
    mapping = {name: [] for name in DESIRED}
    with open(path, 'r', encoding='utf-8') as f:
        next(f)  # skip header
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) < 3:
                continue
            name = parts[1].strip().lower()
            if name in DESIRED:
                mapping[name].append(parts[2].strip())
    return mapping

def load_mesh(element_id):
    path = os.path.join(OBJ_DIR, f'{element_id}.obj')
    if not os.path.exists(path):
        return None
    try:
        m = trimesh.load(path)
        if isinstance(m, trimesh.Scene):
            geoms = list(m.geometry.values())
            if not geoms:
                return None
            return trimesh.util.concatenate(geoms)
        return m
    except Exception as e:
        print(f'Failed to load {element_id}: {e}')
        return None

def main():
    mapping = parse_parts(PARTS_FILE)
    scene = trimesh.Scene()
    for name, element_ids in mapping.items():
        meshes = []
        for eid in element_ids:
            m = load_mesh(eid)
            if m is not None and len(m.vertices) > 0:
                meshes.append(m)
        if not meshes or name == 'heart':
            if not meshes:
                print(f'No meshes for {name}')
            else:
                print(f'Skipping whole-heart node to avoid duplicate geometry')
            continue
        combined = trimesh.util.concatenate(meshes)
        # Ensure unique name for node
        node_name = name.replace(' ', '_')
        scene.add_geometry(combined, node_name=node_name, geom_name=node_name)
        print(f'{name}: {len(meshes)} meshes, {len(combined.vertices)} vertices')

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    scene.export(file_obj=OUT_PATH, file_type='glb')
    print(f'Exported to {OUT_PATH}')

if __name__ == '__main__':
    main()
