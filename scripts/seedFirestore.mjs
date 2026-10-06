import fs from "node:fs/promises";
import { writeFirestoreDocuments } from "./firestoreImport.mjs";
import { loadQuestionBank } from "./questionBank.mjs";

const profilePath = new URL("../.firebase-import/profiles.json", import.meta.url);

const profiles = JSON.parse(await fs.readFile(profilePath, "utf8"));
const questions = await loadQuestionBank();

const documents = [
  ...profiles.map(({ uid, ...profile }) => ({ collection: "users", id: uid, data: profile })),
  ...questions.map((question) => ({ collection: "questions", id: question.id, data: question })),
];

await writeFirestoreDocuments(documents);

console.log(`Imported ${profiles.length} profiles and ${questions.length} questions into Firestore.`);
