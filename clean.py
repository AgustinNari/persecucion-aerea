import re
import os
import glob

files = glob.glob('src/**/*.tsx', recursive=True) + glob.glob('src/**/*.ts', recursive=True) + ['src/index.css']

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    content = re.sub(r'[─═]+', '', content)
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
