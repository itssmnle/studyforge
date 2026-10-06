import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mathLessonGroups } from "../src/data/mathLessonGroups.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "content", "math-lessons");
const dryRun = !process.argv.includes("--write");
const shortSummary = title => "A visual, step-by-step guide to " + title.toLocaleLowerCase("en-GB") + ".";
const lessonSection = (lesson, index) => {
  const withoutTitle = lesson.source.replace(/^#\s+.*(?:\n|$)/, "").trim();
  const title = lesson.source.match(/^#\s+(.+)$/m)?.[1] || "Worked skill";
  return "### Part " + (index + 1) + ": " + title + "\n\n" + withoutTitle.replace(/^##\s+/gm, "#### ");
};

for (const [year, groups] of Object.entries(mathLessonGroups)) {
  const directory = path.join(root, year);
  const files = await readdir(directory);
  const sourceLessons = await Promise.all(files.filter(file => file.endsWith(".md")).map(async file => ({
    file, number: Number(file.slice(0, 3)), source: await readFile(path.join(directory, file), "utf8"),
  })));
  if (sourceLessons.some(lesson => lesson.source.startsWith("---\ntitle:"))) throw new Error(`${year} is already consolidated. This script will not run twice.`);
  const expected = new Set();
  for (const [id, title, start, end, visual] of groups) {
    const lessons = sourceLessons.filter(lesson => lesson.number >= start && lesson.number <= end).sort((a, b) => a.number - b.number);
    if (!lessons.length) throw new Error("No lessons found for " + year + "/" + id + ".");
    lessons.forEach(lesson => expected.add(lesson.file));
    const overviewRows = lessons.map(lesson => "| " + String(lesson.number).padStart(3, "0") + " | " + (lesson.source.match(/^#\s+(.+)$/m)?.[1] || lesson.file) + " |").join("\n");
    const content = "---\ntitle: " + title + "\nyear: " + year + "\nstart: " + start + "\nend: " + end + "\n---\n\n# " + title + "\n\n" + shortSummary(title) + "\n\n![" + title + " visual](/maths-images/" + visual + ")\n\n## At a glance\n\n| Part | What you will learn |\n| --- | --- |\n" + overviewRows + "\n\n> **Think of it like this:** Learn one small skill at a time, then use the examples to see how the pieces fit together.\n\n" + lessons.map(lessonSection).join("\n\n---\n\n") + "\n";
    const target = path.join(directory, String(start).padStart(3, "0") + "-" + id + ".md");
    if (!dryRun) await writeFile(target, content);
    console.log((dryRun ? "Would create " : "Created ") + path.relative(root, target) + " from " + lessons.length + " lessons.");
  }
  const unmatched = sourceLessons.filter(lesson => !expected.has(lesson.file));
  if (unmatched.length) throw new Error("Unmatched lessons in " + year + ": " + unmatched.map(item => item.file).join(", "));
  if (!dryRun) await Promise.all(sourceLessons.map(lesson => rm(path.join(directory, lesson.file))));
  console.log((dryRun ? "Would remove " : "Removed ") + sourceLessons.length + " original files in " + year + ".");
}
