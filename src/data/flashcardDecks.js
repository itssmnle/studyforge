import metadata from "./flashcardDecks.json";

// Vite expands this macro at build time; it is not a runtime function.
const csvAssets = import.meta.glob("../../content/flashcards/*.csv", { query: "?raw", import: "default", eager: true });
const csvContents = Object.fromEntries(Object.entries(csvAssets).map(([path, content]) => [path.split("/").pop(), content]));

const flashcardDecks = Object.fromEntries(Object.entries(metadata).map(([subject, decks]) => [subject, decks.map((deck) => {
  const fileName = deck.file.split("/").pop();
  const content = csvContents[fileName];
  return { ...deck, ...(content ? { content } : {}), file: content ? null : deck.file };
})]));

export default flashcardDecks;
