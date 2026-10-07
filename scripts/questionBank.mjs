import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { scienceSubjects } from "../src/data/scienceCurriculum.js";

export const QUESTION_BANK_DIR = fileURLToPath(new URL("../content/question-bank", import.meta.url));
export const GENERATED_QUESTION_BANK = fileURLToPath(new URL("../src/data/scienceQuestions.generated.json", import.meta.url));

export const QUESTION_COLUMNS = [
  "id", "subtopic", "difficulty", "marks", "type", "prompt",
  "optionA", "optionB", "optionC", "optionD", "answer",
  "acceptableAnswers", "tolerance", "unit", "explanation", "provenance", "specificationTags",
];

const allowedDifficulties = new Set(["Easy", "Medium", "Hard", "Foundation", "Higher"]);
const allowedTypes = new Set(["multiple-choice", "short-answer", "numerical"]);

const parseCsv = (text, sourceFile) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += character;
  }
  if (quoted) throw new Error(`${sourceFile}: unclosed quoted field`);
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
};

const splitList = (value) => value.split("|").map((item) => item.trim()).filter(Boolean);
const topicFiles = () => scienceSubjects.flatMap((subject) => subject.topics.map((topic) => ({
  subject,
  topic,
  relativePath: path.join(subject.id, `${topic.id}.csv`),
})));

export const loadQuestionBank = async () => {
  const questions = [];
  const errors = [];
  const ids = new Map();
  const prompts = new Map();

  for (const { subject, topic, relativePath } of topicFiles()) {
    const absolutePath = path.join(QUESTION_BANK_DIR, relativePath);
    let text;
    try {
      text = await fs.readFile(absolutePath, "utf8");
    } catch (error) {
      errors.push(error.code === "ENOENT" ? `${relativePath}: missing topic CSV` : `${relativePath}: ${error.message}`);
      continue;
    }

    const rows = parseCsv(text.replace(/^\uFEFF/, ""), relativePath);
    const headers = rows.shift() || [];
    if (headers.join(",") !== QUESTION_COLUMNS.join(",")) {
      errors.push(`${relativePath}: headers must be exactly ${QUESTION_COLUMNS.join(",")}`);
      continue;
    }

    rows.forEach((values, rowIndex) => {
      const line = rowIndex + 2;
      if (values.every((value) => !value.trim())) return;
      if (values.length !== QUESTION_COLUMNS.length) {
        errors.push(`${relativePath}:${line}: expected ${QUESTION_COLUMNS.length} columns, found ${values.length}`);
        return;
      }

      const record = Object.fromEntries(QUESTION_COLUMNS.map((column, index) => [column, values[index].trim()]));
      const label = `${relativePath}:${line}`;
      ["id", "subtopic", "difficulty", "marks", "type", "prompt", "answer", "explanation"].forEach((column) => {
        if (!record[column]) errors.push(`${label}: ${column} is required`);
      });
      if (ids.has(record.id)) errors.push(`${label}: duplicate id ${record.id} (first used in ${ids.get(record.id)})`);
      else if (record.id) ids.set(record.id, label);
      const normalizedPrompt = record.prompt.toLocaleLowerCase("en-GB");
      if (normalizedPrompt && prompts.has(normalizedPrompt)) errors.push(`${label}: duplicate prompt (first used in ${prompts.get(normalizedPrompt)})`);
      else if (normalizedPrompt) prompts.set(normalizedPrompt, label);
      if (!topic.id.startsWith("year-9-") && !topic.subtopics.includes(record.subtopic)) {
        errors.push(`${label}: subtopic must be one of ${topic.subtopics.join(", ")}`);
      }
      if (!allowedDifficulties.has(record.difficulty)) errors.push(`${label}: invalid difficulty ${record.difficulty}`);
      if (!allowedTypes.has(record.type)) errors.push(`${label}: invalid type ${record.type}`);

      const marks = Number(record.marks);
      if (!Number.isInteger(marks) || marks < 1) errors.push(`${label}: marks must be a positive integer`);
      const options = [record.optionA, record.optionB, record.optionC, record.optionD].filter(Boolean);
      if (record.type === "multiple-choice") {
        if (options.length !== 4) errors.push(`${label}: multiple-choice questions require four options`);
        if (record.answer && !options.includes(record.answer)) errors.push(`${label}: answer must exactly match one option`);
      } else if (options.length) errors.push(`${label}: option columns are only valid for multiple-choice questions`);

      let answer = record.answer;
      if (record.type === "numerical") {
        answer = Number(record.answer);
        if (!Number.isFinite(answer)) errors.push(`${label}: numerical answer must be a number`);
      }
      const tolerance = record.tolerance ? Number(record.tolerance) : 0;
      if (record.tolerance && (!Number.isFinite(tolerance) || tolerance < 0)) errors.push(`${label}: tolerance must be zero or greater`);
      if (record.type !== "numerical" && record.tolerance) errors.push(`${label}: tolerance is only valid for numerical questions`);

      questions.push({
        id: record.id,
        subject: subject.id,
        topic: topic.id,
        subtopic: record.subtopic,
        difficulty: record.difficulty,
        marks,
        type: record.type,
        prompt: record.prompt,
        ...(record.type === "multiple-choice" ? { options } : {}),
        answer,
        ...(record.type === "short-answer" ? { acceptableAnswers: splitList(record.acceptableAnswers || record.answer) } : {}),
        ...(record.type === "numerical" ? { tolerance, ...(record.unit ? { unit: record.unit } : {}) } : {}),
        explanation: record.explanation,
        provenance: record.provenance || "StudyForge original",
        specificationTags: splitList(record.specificationTags),
        managedBy: "question-bank-csv",
        sourceFile: relativePath.split(path.sep).join("/"),
      });
    });
  }

  if (errors.length) throw new Error(`Question bank validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  return questions;
};

export const listQuestionBankFiles = () => topicFiles().map(({ relativePath }) => relativePath.split(path.sep).join("/"));
