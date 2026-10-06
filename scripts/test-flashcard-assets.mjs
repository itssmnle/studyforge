import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { build } from 'vite';
import { parseCards } from '../src/utils/flashcardReview.js';

// Use the real production transform: raw CSV parsing alone misses broken glob guards.
const result = await build({
  configFile: false,
  logLevel: 'silent',
  build: {
    write: false,
    minify: false,
    lib: { entry: 'src/data/flashcardDecks.js', formats: ['es'], fileName: 'decks' },
  },
});
const chunk = (Array.isArray(result) ? result[0] : result).output.find(item => item.type === 'chunk' && item.isEntry);
const { default: subjects } = await import(`data:text/javascript,${encodeURIComponent(chunk.code)}`);
let count = 0;
for (const decks of Object.values(subjects)) {
  for (const deck of decks) {
    assert.ok(deck.content, `${deck.id}: missing bundled CSV`);
    assert.equal(deck.file, null, `${deck.id}: must not fetch a legacy URL`);
    const cards = parseCards(deck.content);
    assert.equal(cards.length, deck.cards, `${deck.id}: card count`);
    count++;
  }
}
const metadata = JSON.parse(await readFile('src/data/flashcardDecks.json', 'utf8'));
assert.equal(count, Object.values(metadata).flat().length);
assert.equal(parseCards(Object.values(subjects).flat().find(deck => deck.id === 'chapter-1-cells-and-organisms').content)[0].back, 'Cells.');
console.log(`Passed: ${count} production-bundled flashcard decks, including Biology Chapter 1.`);
