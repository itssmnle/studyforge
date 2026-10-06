import fs from 'node:fs/promises';
import path from 'node:path';

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error('Pass the source maths lesson folder as the first argument.');
const force = process.argv.includes('--force');

const outputRoot = new URL('../content/math-lessons/', import.meta.url);
const imageRoot = new URL('../public/maths-images/', import.meta.url);
const years = ['year-7', 'year-8', 'year-9'];
const imagePattern = /!\[([^\]]*)\]\((https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\/([^)]*\.svg))\)/g;
const sources = new Map();
let copied = 0;

for (const year of years) {
  const sourceDir = path.join(sourceRoot, year);
  const targetDir = new URL(`${year}/`, outputRoot);
  await fs.mkdir(targetDir, { recursive: true });
  const names = (await fs.readdir(sourceDir)).filter(name => /^\d{3}-.*\.md$/.test(name)).sort();
  for (const name of names) {
    const target = new URL(name, targetDir);
    if (!force) {
      try { await fs.access(target); continue; } catch { /* Import only new lessons. */ }
    }
    const source = await fs.readFile(path.join(sourceDir, name), 'utf8');
    const updated = source.replace(imagePattern, (_, alt, url, fileName) => {
      const assetName = decodeURIComponent(fileName).replace(/[^a-zA-Z0-9._-]+/g, '-');
      sources.set(assetName, url);
      return `![${alt}](/maths-images/${assetName})`;
    });
    await fs.writeFile(target, updated);
    copied += 1;
  }
}

await fs.mkdir(imageRoot, { recursive: true });
for (const [name, url] of sources) {
  const target = new URL(name, imageRoot);
  try { await fs.access(target); continue; } catch { /* Fetch a missing local asset. */ }
  let response;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    response = await fetch(url);
    if (response.status !== 429) break;
    await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
  }
  if (!response.ok) throw new Error(`Could not download ${name}: ${response.status}`);
  const svg = (await response.text())
    .replace(/<!DOCTYPE[\s\S]*?\]>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replaceAll('&ns_svg;', 'http://www.w3.org/2000/svg')
    .replaceAll('&ns_xlink;', 'http://www.w3.org/1999/xlink');
  if (!svg.includes('<svg') || svg.length > 2_000_000 || /<script\b|<foreignObject\b|\bon[a-z]+\s*=|javascript:|<iframe\b/i.test(svg)) {
    throw new Error(`SVG requires manual review before publishing: ${name}`);
  }
  await fs.writeFile(target, svg);
}

console.log(`Imported ${copied} new maths lessons and ${sources.size} distinct local SVG diagrams. Pass --force only if you intend to overwrite edited lessons.`);
