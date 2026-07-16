import json, struct, sys, os

paths = sys.argv[1:] or [r'c:\Users\feras\Desktop\feras\apps\web\public\models\animal-cell.glb']

for path in paths:
    print(f'\n=== {os.path.basename(path)} ===')
    with open(path, 'rb') as f:
        header = f.read(12)
        magic, version, length = struct.unpack('<4sII', header)
        print(f'Magic: {magic}, Version: {version}, Length: {length}')
        chunk_length, chunk_type = struct.unpack('<II', f.read(8))
        json_data = f.read(chunk_length)
        gltf = json.loads(json_data)

        print('\nMeshes:')
        for i, mesh in enumerate(gltf.get('meshes', [])):
            print(f'  [{i}] {mesh.get("name", "<no name>")}')

        print('\nNodes:')
        for i, node in enumerate(gltf.get('nodes', [])):
            mesh_idx = node.get('mesh')
            name = node.get('name', '<no name>')
            print(f'  [{i}] {name}' + (f' -> mesh {mesh_idx}' if mesh_idx is not None else ''))

        print('\nMaterials:')
        for i, mat in enumerate(gltf.get('materials', [])):
            print(f'  [{i}] {mat.get("name", "<no name>")}')
