import { writeFile } from 'node:fs/promises';

const root = '1_nTL8EWkfL-uzGQRGDFH_GZokf1Kt1lK';
async function list(id) {
  const response = await fetch(`https://drive.google.com/drive/folders/${id}`);
  if (!response.ok) throw new Error(`Folder ${id}: HTTP ${response.status}`);
  const html = await response.text();
  const encoded = html.match(/_DRIVE_ivd'\]\s*=\s*'([^\n]*?)';/);
  if (!encoded) throw new Error(`Could not read shared folder ${id}`);
  const decoded = encoded[1].replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))).replace(/\\'/g, "'");
  return (JSON.parse(decoded)[0] || []).map(row => ({ id: row[0], name: row[2], type: row[3] }));
}

const subjects = [];
for (const folder of await list(root)) {
  if (folder.type !== 'application/vnd.google-apps.folder') continue;
  const match = folder.name.match(/^\d+\. (.*?) \((\d+)\)$/);
  if (!match) throw new Error(`Unknown subject ${folder.name}`);
  const [, name, code] = match;
  const papers = [];
  const paperFolders = await list(folder.id);
  for (const paperFolder of paperFolders) {
    const paperMatch = paperFolder.name.match(/Paper (\d+)(?: \((.*?)\))?/);
    if (!paperMatch) throw new Error(`Unknown paper ${paperFolder.name}`);
    const files = (await list(paperFolder.id)).filter(f => f.type === 'application/pdf').map(file => ({
      ...file, kind: /Answers|Asnwers/i.test(file.name) ? 'answers' : 'questions',
      variant: file.name.match(/\b(TA|TB)\b/)?.[1] || '',
      url: `https://drive.google.com/file/d/${file.id}/view`,
    }));
    if (!files.length) throw new Error(`No PDFs in ${paperFolder.name}`);
    papers.push({ number: Number(paperMatch[1]), tier: paperMatch[2] || '', folderUrl: `https://drive.google.com/drive/folders/${paperFolder.id}`, files });
    console.log(`${name} Paper ${paperMatch[1]}: ${files.length} PDFs`);
  }
  subjects.push({ name, code, folderUrl: `https://drive.google.com/drive/folders/${folder.id}`, papers: papers.sort((a,b) => a.number-b.number) });
}
await writeFile(new URL('../src/data/pastPapers.json', import.meta.url), JSON.stringify({ folderUrl: `https://drive.google.com/drive/folders/${root}`, subjects }, null, 2) + '\n');
console.log('Imported', subjects.flatMap(s => s.papers.flatMap(p => p.files)).length, 'PDFs');
