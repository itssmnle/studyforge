import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "math-lessons");

const escapeCell = value => value.replaceAll("|", "\\|");
const splitWorking = value => value
  .replace(/\s+/g, " ")
  .trim()
  .split(/(?<=[.!?;:])\s+(?=[A-Z0-9$“])/)
  .filter(Boolean);

const workingTable = example => {
  const lines = splitWorking(example);
  if (!lines.length) throw new Error("Worked example is empty.");
  const steps = lines.map((line, index) => {
    const label = index === 0 ? "Start with" : index === lines.length - 1 ? "Answer or check" : "Next";
    return label + ": " + line;
  });
  while (steps.length < 3) {
    steps.splice(Math.max(1, steps.length - 1), 0, "Show the next operation on a new line.");
  }
  return "#### Worked example: line by line\n\n| Line | Working |\n| --- | --- |\n" + steps.map((step, index) => "| " + (index + 1) + " | " + escapeCell(step) + " |").join("\n");
};

for (const year of ["year-7", "year-8", "year-9"]) {
  const directory = path.join(root, year);
  for (const file of (await readdir(directory)).filter(file => file.endsWith(".md"))) {
    const target = path.join(directory, file);
    const source = await readFile(target, "utf8");
    if (source.includes("#### Worked example: line by line")) throw new Error(file + " is already formatted.");
    const updated = source.replace(/#### Worked example\n([\s\S]*?)(?=\n### Part |\s*$)/g, (_, example) => workingTable(example));
    if (updated === source) throw new Error("No worked examples found in " + year + "/" + file);
    await writeFile(target, updated);
    console.log("Formatted " + year + "/" + file);
  }
}
