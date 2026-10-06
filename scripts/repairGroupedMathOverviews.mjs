import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "math-lessons");

for (const year of ["year-7", "year-8", "year-9"]) {
  const directory = path.join(root, year);
  for (const file of (await readdir(directory)).filter(file => file.endsWith(".md"))) {
    const target = path.join(directory, file);
    const source = await readFile(target, "utf8");
    const updated = source.replace(/## At a glance\n\n\| Part \| What you will learn \|\n\| --- \| --- \|\n((?:\| [^\n]+\n?)+)/, (_, rows) => "## This topic contains\n\n" + rows.trim().split("\n").map(row => {
      const [, number, title] = row.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|$/) || [];
      return "- **" + number + ":** " + title;
    }).join("\n"));
    if (updated === source) throw new Error("No overview table found in " + year + "/" + file);
    await writeFile(target, updated);
    console.log("Repaired " + year + "/" + file);
  }
}
