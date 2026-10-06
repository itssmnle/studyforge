import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { firestore } from './firebase';
import { parseCards } from './flashcardReview';

const deckLoads = new Map();
export function loadDeckCards(deck) {
  const key = `${deck.id}:${deck.file}`;
  const existing = deckLoads.get(key);
  if (existing && Date.now() - existing.started < 30000) return existing.promise;
  const staticCards = deck.content
    ? Promise.resolve(parseCards(deck.content))
    : fetch(deck.file).then(async response => {
      if (!response.ok) throw new Error('Could not load this deck. Please try again.');
      return parseCards(await response.text());
    });
  // Attach a rejection handler immediately even when a cloud override is available.
  const fallback = staticCards.then(cards => ({ cards }), error => ({ error }));
  const promise = getDoc(doc(firestore, 'flashcardDecks', deck.id)).then(async override => {
    if (override.exists()) return override.data().cards;
    const result = await fallback;
    if (result.error) throw result.error;
    return result.cards;
  }).catch(error => { deckLoads.delete(key); throw error; });
  deckLoads.set(key, { started: Date.now(), promise });
  return promise;
}

export async function saveDeckCards(deck, cards, user) {
  if (user?.role !== 'teacher') throw new Error('Teacher access required.');
  if (!cards.length || cards.some(card => !card.front.trim() || !card.back.trim())) throw new Error('Every flashcard needs a question and answer.');
  deckLoads.delete(`${deck.id}:${deck.file}`);
  await setDoc(doc(firestore, 'flashcardDecks', deck.id), { title: deck.title, cards, updatedBy: user.uid, updatedAt: new Date().toISOString() });
}

export const cardsToQuestions = (cards, packId) => cards.map((card, index) => ({
  id: `${packId}-${index + 1}`, prompt: card.front, answer: card.back,
  type: 'short-answer', difficulty: 'Recall', marks: 1, subtopic: 'Study pack', provenance: 'Teacher study pack',
}));

export async function listStudyPacks(user) {
  if (!user?.uid) return [];
  const snapshot = await getDocs(query(collection(firestore, 'studyPacks'), where('ownerUid', '==', user.uid)));
  return snapshot.docs.map(item => ({ ...item.data(), id: item.id }));
}

export async function saveStudyPack(pack, user) {
  if (user?.role !== 'teacher') throw new Error('Teacher access required.');
  const result = { ...pack, id: pack.id || crypto.randomUUID(), ownerUid: user.uid, updatedAt: new Date().toISOString() };
  if (!result.title.trim() || !result.cards.length || result.cards.some(card => !card.front.trim() || !card.back.trim())) throw new Error('Add a title and complete every question and answer.');
  await setDoc(doc(firestore, 'studyPacks', result.id), result);
  return result;
}
