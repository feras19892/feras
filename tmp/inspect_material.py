import json, struct

path = r'c:\Users\feras\Desktop\feras\apps\web\public\models\animal-cell.glb'
with open(path, 'rb') as f:
    header = f.read(12)
    magic, version, length = struct.unpack('<4sII', header)
    chunk_length, chunk_type = struct.unpack('<II', f.read(8))
    json_data = f.read(chunk_length)
    gltf = json.loads(json_data)

    print('Materials:')
    for i, mat in enumerate(gltf.get('materials', [])):
        print(f'  [{i}] {mat}')

    print('\nTextures:')
    for i, tex in enumerate(gltf.get('textures', [])):
        print(f'  [{i}] {tex}')

    print('\nImages:')
    for i, img in enumerate(gltf.get('images', [])):
        print(f'  [{i}] {img}')
