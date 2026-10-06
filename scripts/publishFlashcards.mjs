import fs from "node:fs/promises";
import path from "node:path";
import { writeFirestoreDocuments } from "./firestoreImport.mjs";
import metadata from "../src/data/flashcardDecks.json" with { type: "json" };
import { parseCards } from "../src/utils/flashcardReview.js";

const root = new URL("../content/flashcards/", import.meta.url);
const documents = [];
for (const decks of Object.values(metadata)) {
  for (const deck of decks) {
    const fileName = path.basename(deck.file);
    const csv = await fs.readFile(new URL(fileName, root), "utf8");
    const cards = parseCards(csv);
    if (cards.length !== deck.cards) throw new Error(`${deck.id}: expected ${deck.cards} cards, found ${cards.length}`);
    documents.push({ collection: "flashcardDecks", id: deck.id, data: {
      title: deck.title,
      cards,
      managedBy: "flashcard-csv",
      sourceFile: fileName,
      updatedAt: new Date().toISOString(),
    }});
  }
}

const credentials = await writeFirestoreDocuments(documents);
console.log(`Published ${documents.length} flashcard decks to ${credentials.projectId}.`);
