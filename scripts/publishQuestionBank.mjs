import { deleteFirestoreDocuments, listFirestoreDocuments, writeFirestoreDocuments } from "./firestoreImport.mjs";
import { loadQuestionBank } from "./questionBank.mjs";

const argumentsList = process.argv.slice(2);
const prune = argumentsList.includes("--prune");
const dryRun = argumentsList.includes("--dry-run");
const projectIndex = argumentsList.indexOf("--project");
const projectId = projectIndex >= 0 ? argumentsList[projectIndex + 1] : undefined;
if (projectIndex >= 0 && !projectId) throw new Error("--project requires a Firebase project ID.");

const questions = await loadQuestionBank();
if (dryRun) {
  console.log(`Dry run passed. ${questions.length} questions are ready to publish.`);
  process.exit(0);
}
const credentials = await writeFirestoreDocuments(questions.map((question) => ({ collection: "questions", id: question.id, data: question })), { projectId });
let deleted = 0;
if (prune) {
  const current = await listFirestoreDocuments("questions", credentials);
  const csvIds = new Set(questions.map((question) => question.id));
  const obsolete = current.filter((document) => document.fields?.managedBy?.stringValue === "question-bank-csv" && !csvIds.has(decodeURIComponent(document.name.split("/").pop())));
  await deleteFirestoreDocuments(obsolete.map((document) => document.name), credentials);
  deleted = obsolete.length;
}
console.log(`Published ${questions.length} CSV-managed questions to ${credentials.projectId}.${prune ? ` Removed ${deleted} obsolete CSV-managed questions.` : ""}`);
