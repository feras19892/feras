import json, struct, os

path = r'c:\Users\feras\Desktop\feras\apps\web\public\models\animal-cell.glb'
print('Size:', os.path.getsize(path))
with open(path, 'rb') as f:
    header = f.read(12)
    magic, version, length = struct.unpack('<4sII', header)
    print('Magic:', magic, 'Version:', version, 'Length:', length)
    chunk_length, chunk_type = struct.unpack('<II', f.read(8))
    json_data = f.read(chunk_length)
    gltf = json.loads(json_data)

    accessors = gltf.get('accessors', [])
    for i, acc in enumerate(accessors[:5]):
        min_val = acc.get('min', [])
        max_val = acc.get('max', [])
        print(f'Accessor {i} min: {min_val}, max: {max_val}')
