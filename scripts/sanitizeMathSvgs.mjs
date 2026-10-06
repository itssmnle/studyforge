import fs from 'node:fs/promises';

const dir = new URL('../public/maths-images/', import.meta.url);
let cleaned = 0;
for (const name of (await fs.readdir(dir)).filter(name => name.endsWith('.svg'))) {
  const file = new URL(name, dir);
  const source = await fs.readFile(file, 'utf8');
  const result = source
    .replace(/<!DOCTYPE[\s\S]*?\]>/gi, '')
    .replace(/<!DOCTYPE[\s\S]*?>/gi, '')
    .replaceAll('&ns_svg;', 'http://www.w3.org/2000/svg')
    .replaceAll('&ns_xlink;', 'http://www.w3.org/1999/xlink');
  if (result !== source) {
    await fs.writeFile(file, result);
    cleaned += 1;
  }
  if (/<script\b|<foreignObject\b|\bon[a-z]+\s*=|javascript:|<iframe\b|<!DOCTYPE|https?:\/\/[^"']+\.(?:svg|png|jpg)/i.test(result)) {
    throw new Error(`Review external or active content in ${name}`);
  }
}
console.log(`Removed external DTDs and XML entities from ${cleaned} local SVGs.`);
