import fs from 'node:fs/promises';

const root = new URL('../content/math-lessons/', import.meta.url);
const imageRoot = new URL('../public/maths-images/', import.meta.url);
const years = ['year-7', 'year-8', 'year-9'];
const expected = [120, 17, 77];
let errors = 0;

for (const [index, year] of years.entries()) {
  const dir = new URL(`${year}/`, root);
  const files = (await fs.readdir(dir)).filter(name => /^\d{3}-.*\.md$/.test(name)).sort();
  if (files.length !== expected[index]) {
    console.error(`${year}: expected ${expected[index]} lessons, found ${files.length}`);
    errors += 1;
  }
  let examples = 0;
  let images = 0;
  for (const [position, name] of files.entries()) {
    if (Number(name.slice(0, 3)) !== position + 1) {
      console.error(`${year}: sequence gap at ${name}`);
      errors += 1;
    }
    const source = await fs.readFile(new URL(name, dir), 'utf8');
    if (!source.startsWith('# ') || !source.includes('## Notes') || !/^## (Worked example|More worked examples)/m.test(source)) {
      console.error(`${year}/${name}: missing title, notes or worked example`);
      errors += 1;
    }
    if (/!\[[^\]]*\]\(https?:\/\//i.test(source)) {
      console.error(`${year}/${name}: remotely loaded image`);
      errors += 1;
    }
    examples += (source.match(/^## (?:Worked example|Another worked example|More worked examples)/gm) || []).length;
    for (const match of source.matchAll(/!\[[^\]]*\]\(\/maths-images\/([^)]*)\)/g)) {
      images += 1;
      try { await fs.access(new URL(match[1], imageRoot)); } catch {
        console.error(`${year}/${name}: missing local image ${match[1]}`);
        errors += 1;
      }
    }
  }
  console.log(`${year}: ${files.length} lessons, ${examples} worked-example sections, ${images} local image placements`);
}
if (errors) process.exitCode = 1;
