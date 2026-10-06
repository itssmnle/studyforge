import fs from 'node:fs/promises';

const root = new URL('../content/math-lessons/', import.meta.url);
const omit = {
  'year-7': [26, 32, 36, 37, 51, 60, 65, 73, 78, 86],
  'year-9': [6, 13, 14, 15],
};
const replace = {
  'year-7': {
    118: ['prime-factors-venn.svg', 'Prime factor Venn diagram for HCF and LCM'],
  },
  'year-9': {
    33: ['inverse-proportion-graph.svg', 'Inverse proportion graph'],
    55: ['enlargement-grid.svg', 'Shape enlargement on a coordinate grid'],
    56: ['enlargement-grid.svg', 'Shape enlargement on a coordinate grid'],
    57: ['enlargement-grid.svg', 'Shape enlargement on a coordinate grid'],
  },
};

for (const year of ['year-7', 'year-8', 'year-9']) {
  const dir = new URL(`${year}/`, root);
  for (const name of (await fs.readdir(dir)).filter(item => /^\d{3}-.*\.md$/.test(item))) {
    const number = Number(name.slice(0, 3));
    if (!omit[year]?.includes(number) && !replace[year]?.[number]) continue;
    const file = new URL(name, dir);
    const original = await fs.readFile(file, 'utf8');
    const withoutOld = original.replace(/\n!\[[^\]]*\]\(\/maths-images\/[^)]+\)\n\n\[Image source: Wikimedia Commons\]\(https:\/\/commons\.wikimedia\.org\/wiki\/File:[^)]+\)\n?/g, '\n');
    const asset = replace[year]?.[number];
    const updated = asset ? `${withoutOld.trimEnd()}\n\n![${asset[1]}](/maths-images/${asset[0]})\n` : `${withoutOld.trimEnd()}\n`;
    if (updated !== original) await fs.writeFile(file, updated);
  }
}

console.log('Removed misleading diagrams and assigned topic-specific local diagrams.');
