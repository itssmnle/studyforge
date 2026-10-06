import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "math-lessons");

const renderNumbers = value => value.split(/(\$[^$]+\$)/g).map(part => {
  if (part.startsWith("$") && part.endsWith("$")) return part;
  return part.replace(/£?(\d[\d,.]*)/g, (match, number) => match.startsWith("£") ? "$\\pounds " + number + "$" : "$" + number + "$");
}).join("");

const lineList = table => {
  const rows = table.trim().split("\n").slice(2);
  const working = rows.map(row => {
    const cells = row.trim().replace(/^\||\|$/g, "").split("|");
    if (cells.length !== 2) throw new Error("Invalid working row: " + row);
    return cells[1].trim();
  });
  return working.map((value, index) => (index + 1) + ". " + renderNumbers(value)).join("\n");
};

for (const year of ["year-7", "year-8", "year-9"]) {
  const directory = path.join(root, year);
  for (const file of (await readdir(directory)).filter(file => file.endsWith(".md"))) {
    const target = path.join(directory, file);
    const source = await readFile(target, "utf8");
    const updated = source.replace(/(#### Worked example: line by line\n\n)\| Line \| Working \|\n\| --- \| --- \|\n((?:\| \d+ \|.*\|\n?)+)/g, (_, heading, table) => heading + lineList("| Line | Working |\n| --- | --- |\n" + table));
    if (updated === source) throw new Error("No working table found in " + year + "/" + file);
    await writeFile(target, updated);
    console.log("Converted " + year + "/" + file);
  }
}
