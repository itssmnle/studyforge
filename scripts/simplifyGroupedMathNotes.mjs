import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mathLessonGroups } from "../src/data/mathLessonGroups.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "math-lessons");
const write = process.argv.includes("--write");

const section = (source, heading) => {
  const match = source.match(new RegExp("^#### " + heading + "\\n([\\s\\S]*?)(?=^#### |(?![\\s\\S]))", "m"));
  return match ? match[1].trim() : "";
};

const bullets = source => source.split("\n").filter(line => line.startsWith("- ")).slice(0, 2).join("\n") || "- Focus on one small idea at a time.\n- Check your answer before moving on.";

const steps = source => source.split("\n")
  .map(line => line.match(/^\d+\.\s+(.+)$/)?.[1])
  .filter(Boolean)
  .slice(0, 4);

const stepTable = source => {
  const rows = steps(source);
  if (!rows.length) return "| Step | What to do |\n| --- | --- |\n| 1 | Read the question carefully. |\n| 2 | Show one calculation at a time. |\n| 3 | Check the result makes sense. |";
  return "| Step | What to do |\n| --- | --- |\n" + rows.map((row, index) => "| " + (index + 1) + " | " + row + " |").join("\n");
};

const conciseExample = source => source.replace(/^!\[.*\]\([^)]*\)\s*$/gm, "").replace(/^Image:.*$/gm, "").trim();

const visualFor = (year, id) => mathLessonGroups[year].find(group => group[0] === id)?.[4];

for (const year of Object.keys(mathLessonGroups)) {
  const directory = path.join(root, year);
  const files = (await readdir(directory)).filter(file => file.endsWith(".md"));
  for (const file of files) {
    const id = file.replace(/^\d+-/, "").replace(/\.md$/, "");
    const visual = visualFor(year, id);
    if (!visual) throw new Error("No visual configured for " + year + "/" + id);
    const source = await readFile(path.join(directory, file), "utf8");
    if (source.includes("#### Work it out step by step")) throw new Error(file + " is already simplified.");
    const chunks = source.split(/(?=^### Part \d+: )/m);
    if (chunks.length < 2) throw new Error("No parts found in " + file);
    const intro = chunks.shift()
      .replace(/\n> \*\*Think of it like this:\*\*[\s\S]*$/, "")
      .replace(/## At a glance\n\n\| Part \| What you will learn \|\n\| --- \| --- \|\n((?:\| [^\n]+\n?)+)/, (_, rows) => "## This topic contains\n\n" + rows.trim().split("\n").map(row => {
        const [, number, title] = row.match(/^\|\s*(\d+)\s*\|\s*(.*?)\s*\|$/) || [];
        return "- **" + number + ":** " + title;
      }).join("\n"))
      .trim();
    const parts = chunks.map(chunk => {
      const title = chunk.match(/^### Part \d+: .+$/m)?.[0];
      if (!title) throw new Error("Missing part title in " + file);
      const notes = bullets(section(chunk, "Notes"));
      const method = stepTable(section(chunk, "Method"));
      const example = conciseExample(section(chunk, "Worked example"));
      return [
        title,
        "",
        "![Diagram for this part](/maths-images/" + visual + ")",
        "",
        "#### Tiny idea",
        notes,
        "",
        "#### Work it out step by step",
        method,
        "",
        "#### Worked example",
        example || "Use the steps above with a simple number, then check your answer.",
      ].join("\n");
    });
    const output = intro + "\n\n> **Think of it like this:** read the tiny idea, follow the numbered steps, then copy the worked example one line at a time.\n\n" + parts.join("\n\n") + "\n";
    if (write) await writeFile(path.join(directory, file), output);
    console.log((write ? "Simplified " : "Would simplify ") + year + "/" + file);
  }
}
