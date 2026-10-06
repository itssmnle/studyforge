"""Attach local PDF metadata to matching Drive filenames without modifying PDFs."""
import json
from pathlib import Path
from pypdf import PdfReader

project = Path(__file__).resolve().parent.parent
source = project.parent.parent / 'Examinent - All IGCSE Core & Extended'
manifest = project / 'src/data/pastPapers.json'
data = json.loads(manifest.read_text())
files = {p.name: p for p in source.rglob('*.pdf')}
count = 0
for subject in data['subjects']:
    for paper in subject['papers']:
        for item in paper['files']:
            path = files.get(item['name'])
            if path is None:
                raise ValueError(f"No local match: {item['name']}")
            item['bytes'] = path.stat().st_size
            item['pages'] = len(PdfReader(path).pages)
            count += 1
manifest.write_text(json.dumps(data, indent=2) + '\n')
print(f'Validated {count} Drive files against local PDFs and added page counts and sizes.')
