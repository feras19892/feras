import json, codecs
with codecs.open('lint-json.json', 'r', 'utf-16') as f:
    data = json.load(f)
for item in data:
    fp = item['filePath']
    for msg in item['messages']:
        if msg['severity'] == 2:
            print(f"{fp}:{msg['line']} {msg['message']}")
