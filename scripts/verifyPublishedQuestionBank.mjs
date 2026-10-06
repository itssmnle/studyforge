import { listFirestoreDocuments, writeFirestoreDocuments } from "./firestoreImport.mjs";
import { loadQuestionBank } from "./questionBank.mjs";

const localQuestions = await loadQuestionBank();
const credentials = await writeFirestoreDocuments([]);
const remoteDocuments = await listFirestoreDocuments("questions", credentials);
const remoteIds = new Set(remoteDocuments.map((document) => decodeURIComponent(document.name.split("/").pop())));
const missingIds = localQuestions.map((question) => question.id).filter((id) => !remoteIds.has(id));

if (missingIds.length) {
  throw new Error(`Firestore is missing ${missingIds.length} CSV question IDs: ${missingIds.slice(0, 10).join(", ")}`);
}

const csvManagedCount = remoteDocuments.filter((document) => document.fields?.managedBy?.stringValue === "question-bank-csv").length;
console.log(`Verified ${localQuestions.length} local question IDs in ${credentials.projectId}. Firestore contains ${csvManagedCount} CSV-managed questions.`);
